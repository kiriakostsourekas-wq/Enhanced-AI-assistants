import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type {
  CanonicalSitePages,
  CrawlDecision,
  SiteContactCandidate,
  SiteCrawlReport,
  SiteImageReference,
  SiteMetadata,
  SitePageSnapshot,
  SitePageType,
  SiteSnapshot,
  SiteVisibleElements,
} from "@/lib/antigravity/schemas";
import { assertSafeUrl, buildFactSource, nowIso, sha256, slugify } from "@/lib/antigravity/runtime/utils";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { scoreCandidateLink } from "@/lib/antigravity/site-snapshot/classify";
import { extractPageSnapshot } from "@/lib/antigravity/site-snapshot/extract";
import { captureKeyPageScreenshots } from "@/lib/antigravity/site-snapshot/screenshots";
import { fetchRobotsPolicy, isPathAllowedByRobots } from "@/lib/antigravity/site-snapshot/robots";
import { withRetry } from "@/lib/antigravity/runtime/retry";

const DEFAULT_MAX_PAGES = 6;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RATE_LIMIT_MS = 1_500;
const ANTIGRAVITY_CRAWLER_USER_AGENT = "AntigravityBot/1.0 (+https://northline.ai)";
const RATE_LIMIT_STATE = new Map<string, number>();

type CrawlCandidate = {
  url: string;
  pageTypeHint: SitePageType;
  priority: number;
  discoveredFrom: string;
};

type SnapshotResult =
  | {
      status: "success";
      snapshot: SiteSnapshot;
    }
  | {
      status: "blocked";
      requestedUrl: string;
      blockedReason: string;
      crawlReport: SiteCrawlReport;
    };

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function sameSiteHost(left: string, right: string) {
  return normalizeHost(left) === normalizeHost(right);
}

function normalizeComparableUrl(url: string) {
  const parsed = new URL(url);
  parsed.hash = "";
  if (parsed.pathname.endsWith("/") && parsed.pathname !== "/") {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

function maybeWebsiteUrl(input: string) {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  return `https://${input}`;
}

function sanitizePageSlug(url: string) {
  const parsed = new URL(url);
  return slugify(parsed.pathname) || "home";
}

function isHtmlLikeContentType(contentType: string) {
  const normalized = contentType.toLowerCase();
  return normalized.includes("text/html") || normalized.includes("application/xhtml+xml");
}

function looksLikeBinaryUrl(url: string) {
  return /\.(pdf|jpg|jpeg|png|gif|webp|svg|zip|rar|mp4|mp3|docx?|xlsx?)($|\?)/i.test(url);
}

function pickCanonicalPages(pages: SitePageSnapshot[]): CanonicalSitePages {
  const pageTypes: Array<Exclude<SitePageType, "generic">> = [
    "homepage",
    "about",
    "services",
    "contact",
    "booking",
    "team",
    "faq",
  ];

  const canonicalPages: CanonicalSitePages = {};

  for (const pageType of pageTypes) {
    const candidates = pages.filter((page) => page.pageType === pageType);
    if (candidates.length === 0) {
      continue;
    }

    candidates.sort((left, right) => {
      if (right.classificationConfidence !== left.classificationConfidence) {
        return right.classificationConfidence - left.classificationConfidence;
      }

      return left.finalUrl.length - right.finalUrl.length;
    });

    canonicalPages[pageType] = candidates[0];
  }

  if (!canonicalPages.homepage && pages[0]) {
    canonicalPages.homepage = pages[0];
  }

  return canonicalPages;
}

function dedupeBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const results: T[] = [];

  for (const item of items) {
    const candidateKey = key(item);
    if (!candidateKey || seen.has(candidateKey)) {
      continue;
    }
    seen.add(candidateKey);
    results.push(item);
  }

  return results;
}

function aggregateVisibleElements(pages: SitePageSnapshot[]): SiteVisibleElements {
  return {
    phones: dedupeBy(
      pages.flatMap((page) => page.visibleElements.phones),
      (phone) => phone,
    ),
    emails: dedupeBy(
      pages.flatMap((page) => page.visibleElements.emails),
      (email) => email.toLowerCase(),
    ),
    addresses: dedupeBy(
      pages.flatMap((page) => page.visibleElements.addresses),
      (address) => address,
    ),
    socialLinks: dedupeBy(
      pages.flatMap((page) => page.visibleElements.socialLinks),
      (link) => link.href,
    ),
    forms: dedupeBy(
      pages.flatMap((page) => page.forms),
      (form) => `${form.action ?? ""}:${form.method ?? ""}:${form.purposeHint}:${form.fieldNames.join("|")}`,
    ),
  };
}

function aggregateImageReferences(pages: SitePageSnapshot[]): SiteImageReference[] {
  return dedupeBy(
    pages.flatMap((page) => page.imageReferences),
    (image) => image.url,
  );
}

function aggregateContactCandidates(pages: Array<{ page: SitePageSnapshot; candidates: SiteContactCandidate[] }>) {
  return dedupeBy(
    pages.flatMap((entry) => entry.candidates),
    (candidate) => `${candidate.type}:${candidate.value}`,
  );
}

function aggregateMetadata(canonicalPages: CanonicalSitePages): SiteMetadata {
  return canonicalPages.homepage?.metadata ?? {};
}

async function waitForRateLimit(hostname: string, minDelayMs: number) {
  const normalizedHost = normalizeHost(hostname);
  const previousRequestAt = RATE_LIMIT_STATE.get(normalizedHost) ?? 0;
  const waitMs = Math.max(0, previousRequestAt + minDelayMs - Date.now());

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  RATE_LIMIT_STATE.set(normalizedHost, Date.now());
}

async function fetchHtmlPage(args: {
  requestedUrl: string;
  timeoutMs: number;
  userAgent: string;
  logger: AntigravityLogger;
}) {
  return withRetry({
    taskName: `fetch_page:${args.requestedUrl}`,
    retryPolicy: {
      attempts: 2,
      baseDelayMs: 400,
      maxDelayMs: 2_000,
    },
    shouldRetry(error) {
      return !(error instanceof Error && /Unsafe crawl target/.test(error.message));
    },
    run: async () => {
      assertSafeUrl(args.requestedUrl);
      const response = await fetch(args.requestedUrl, {
        headers: {
          "user-agent": args.userAgent,
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(args.timeoutMs),
      });

      return response;
    },
  });
}

function rankCandidateLinks(args: {
  page: SitePageSnapshot;
  allowedHost: string;
  seenUrls: Set<string>;
}) {
  const candidates: CrawlCandidate[] = [];

  for (const link of args.page.internalLinks) {
    if (looksLikeBinaryUrl(link.href)) {
      continue;
    }

    const normalizedUrl = normalizeComparableUrl(link.href);
    const parsed = new URL(normalizedUrl);

    if (!sameSiteHost(parsed.hostname, args.allowedHost) || args.seenUrls.has(normalizedUrl)) {
      continue;
    }

    const classification = scoreCandidateLink({
      href: normalizedUrl,
      label: link.label,
    });

    const pageTypeHint = classification.pageType === "homepage" ? "generic" : classification.pageType;
    const priority = classification.score + (pageTypeHint !== "generic" ? 10 : 0);

    candidates.push({
      url: normalizedUrl,
      pageTypeHint,
      priority,
      discoveredFrom: args.page.finalUrl,
    });
  }

  candidates.sort((left, right) => right.priority - left.priority);
  return dedupeBy(candidates, (candidate) => candidate.url).slice(0, 18);
}

function buildBlockedCrawlReport(args: {
  requestedUrl: string;
  maxPages: number;
  timeoutMs: number;
  rateLimitMs: number;
  robots?: SiteCrawlReport["robots"];
  decisions: CrawlDecision[];
  skippedUrls: CrawlDecision[];
  screenshotStatus?: SiteCrawlReport["screenshotStatus"];
  screenshotReason?: string;
}) {
  return {
    requestedUrl: args.requestedUrl,
    maxPages: args.maxPages,
    fetchTimeoutMs: args.timeoutMs,
    rateLimitMs: args.rateLimitMs,
    robots: args.robots,
    fetchedPageCount: args.decisions.filter((decision) => decision.action === "fetched").length,
    skippedCount: args.skippedUrls.length,
    screenshotStatus: args.screenshotStatus ?? "not_requested",
    screenshotReason: args.screenshotReason,
    decisions: args.decisions,
    skippedUrls: args.skippedUrls,
  } satisfies SiteCrawlReport;
}

export async function createSiteSnapshot(args: {
  websiteUrl: string;
  logger: AntigravityLogger;
  maxPages?: number;
  timeoutMs?: number;
  rateLimitMs?: number;
  captureScreenshots?: boolean;
  artifactRoot?: string;
}): Promise<SnapshotResult> {
  const requestedUrl = normalizeComparableUrl(maybeWebsiteUrl(args.websiteUrl));
  const maxPages = args.maxPages ?? DEFAULT_MAX_PAGES;
  const timeoutMs = args.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const baseRateLimitMs = args.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
  const decisions: CrawlDecision[] = [];
  const skippedUrls: CrawlDecision[] = [];

  assertSafeUrl(requestedUrl);

  const requested = new URL(requestedUrl);
  const artifactDirectory = path.join(
    args.artifactRoot ?? path.join(process.cwd(), "artifacts", "site-snapshots"),
    `${normalizeHost(requested.hostname)}-${sanitizePageSlug(requestedUrl)}-${sha256(requestedUrl).slice(0, 8)}`,
  );
  await mkdir(artifactDirectory, {
    recursive: true,
  });

  const robotsResult = await fetchRobotsPolicy({
    origin: requested.origin,
    logger: args.logger,
    timeoutMs,
    userAgent: ANTIGRAVITY_CRAWLER_USER_AGENT,
  });

  if (!robotsResult.allowed) {
    const decision = {
      url: requestedUrl,
      action: "blocked_by_robots",
      reason: robotsResult.blockedReason,
      pageTypeHint: "homepage",
      timestamp: nowIso(),
    } satisfies CrawlDecision;
    decisions.push(decision);
    skippedUrls.push(decision);

    return {
      status: "blocked",
      requestedUrl,
      blockedReason: robotsResult.blockedReason ?? "robots.txt blocked crawling",
      crawlReport: buildBlockedCrawlReport({
        requestedUrl,
        maxPages,
        timeoutMs,
        rateLimitMs: baseRateLimitMs,
        robots: robotsResult.policy,
        decisions,
        skippedUrls,
      }),
    };
  }

  const crawlDelayMs = "crawlDelayMs" in robotsResult.policy ? (robotsResult.policy.crawlDelayMs ?? 0) : 0;
  const effectiveRateLimitMs = Math.max(baseRateLimitMs, crawlDelayMs);
  const pages: SitePageSnapshot[] = [];
  const pageCandidates: Array<{ page: SitePageSnapshot; candidates: SiteContactCandidate[] }> = [];
  const queue: CrawlCandidate[] = [
    {
      url: requestedUrl,
      pageTypeHint: "homepage",
      priority: 100,
      discoveredFrom: requestedUrl,
    },
  ];
  const seenUrls = new Set<string>();
  let allowedHost = requested.hostname;
  let finalOrigin = requested.origin;

  while (queue.length > 0 && pages.length < maxPages) {
    queue.sort((left, right) => right.priority - left.priority);
    const candidate = queue.shift();
    if (!candidate) {
      break;
    }

    const normalizedUrl = normalizeComparableUrl(candidate.url);
    if (seenUrls.has(normalizedUrl)) {
      continue;
    }
    seenUrls.add(normalizedUrl);

    const candidateUrl = new URL(normalizedUrl);
    if (!sameSiteHost(candidateUrl.hostname, allowedHost)) {
      const decision = {
        url: normalizedUrl,
        action: "skipped",
        reason: `Skipped cross-host URL ${candidateUrl.hostname}`,
        pageTypeHint: candidate.pageTypeHint,
        timestamp: nowIso(),
      } satisfies CrawlDecision;
      decisions.push(decision);
      skippedUrls.push(decision);
      continue;
    }

    const robotsAllowed = isPathAllowedByRobots({
      pathname: `${candidateUrl.pathname}${candidateUrl.search}`,
      rules: robotsResult.rules ?? [],
    });
    if (!robotsAllowed) {
      const decision = {
        url: normalizedUrl,
        action: "blocked_by_robots",
        reason: "Path is disallowed by robots.txt",
        pageTypeHint: candidate.pageTypeHint,
        timestamp: nowIso(),
      } satisfies CrawlDecision;
      decisions.push(decision);
      skippedUrls.push(decision);
      continue;
    }

    await waitForRateLimit(candidateUrl.hostname, effectiveRateLimitMs);
    args.logger.info("snapshot_fetch_page", {
      url: normalizedUrl,
      pageTypeHint: candidate.pageTypeHint,
    });

    try {
      const response = await fetchHtmlPage({
        requestedUrl: normalizedUrl,
        timeoutMs,
        userAgent: ANTIGRAVITY_CRAWLER_USER_AGENT,
        logger: args.logger,
      });

      const finalUrl = normalizeComparableUrl(response.url);
      const finalParsed = new URL(finalUrl);

      if (!sameSiteHost(finalParsed.hostname, allowedHost) && pages.length > 0) {
        const decision = {
          url: normalizedUrl,
          action: "skipped",
          reason: `Redirected off-site to ${finalParsed.hostname}`,
          pageTypeHint: candidate.pageTypeHint,
          statusCode: response.status,
          timestamp: nowIso(),
        } satisfies CrawlDecision;
        decisions.push(decision);
        skippedUrls.push(decision);
        continue;
      }

      if (pages.length === 0) {
        allowedHost = finalParsed.hostname;
        finalOrigin = finalParsed.origin;
      }

      if (!response.ok) {
        const decision = {
          url: normalizedUrl,
          action: "error",
          reason: `HTTP ${response.status}`,
          pageTypeHint: candidate.pageTypeHint,
          statusCode: response.status,
          timestamp: nowIso(),
        } satisfies CrawlDecision;
        decisions.push(decision);
        skippedUrls.push(decision);

        if (pages.length === 0) {
          return {
            status: "blocked",
            requestedUrl,
            blockedReason: `Homepage returned HTTP ${response.status}`,
            crawlReport: buildBlockedCrawlReport({
              requestedUrl,
              maxPages,
              timeoutMs,
              rateLimitMs: effectiveRateLimitMs,
              robots: robotsResult.policy,
              decisions,
              skippedUrls,
            }),
          };
        }

        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!isHtmlLikeContentType(contentType)) {
        const decision = {
          url: normalizedUrl,
          action: "skipped",
          reason: `Unsupported content type ${contentType}`,
          pageTypeHint: candidate.pageTypeHint,
          statusCode: response.status,
          timestamp: nowIso(),
        } satisfies CrawlDecision;
        decisions.push(decision);
        skippedUrls.push(decision);

        if (pages.length === 0) {
          return {
            status: "blocked",
            requestedUrl,
            blockedReason: `Unsupported content type ${contentType}`,
            crawlReport: buildBlockedCrawlReport({
              requestedUrl,
              maxPages,
              timeoutMs,
              rateLimitMs: effectiveRateLimitMs,
              robots: robotsResult.policy,
              decisions,
              skippedUrls,
            }),
          };
        }

        continue;
      }

      const html = await response.text();
      const extracted = await extractPageSnapshot({
        requestedUrl: normalizedUrl,
        finalUrl,
        html,
        pageTypeHint: candidate.pageTypeHint,
        artifactDirectory,
      });

      const pageSnapshot: SitePageSnapshot = {
        ...extracted.pageSnapshot,
        statusCode: response.status,
      };
      pages.push(pageSnapshot);
      pageCandidates.push({
        page: pageSnapshot,
        candidates: extracted.contactCandidates,
      });
      decisions.push({
        url: finalUrl,
        action: "fetched",
        pageTypeHint: pageSnapshot.pageType,
        statusCode: response.status,
        reason: `Fetched from ${candidate.discoveredFrom}`,
        timestamp: nowIso(),
      });

      for (const rankedCandidate of rankCandidateLinks({
        page: pageSnapshot,
        allowedHost,
        seenUrls,
      })) {
        if (queue.some((existing) => normalizeComparableUrl(existing.url) === rankedCandidate.url)) {
          continue;
        }

        queue.push(rankedCandidate);
        decisions.push({
          url: rankedCandidate.url,
          action: "queued",
          pageTypeHint: rankedCandidate.pageTypeHint,
          reason: `Discovered from ${pageSnapshot.finalUrl}`,
          timestamp: nowIso(),
        });
      }
    } catch (error) {
      const decision = {
        url: normalizedUrl,
        action: "error",
        reason: error instanceof Error ? error.message : String(error),
        pageTypeHint: candidate.pageTypeHint,
        timestamp: nowIso(),
      } satisfies CrawlDecision;
      decisions.push(decision);
      skippedUrls.push(decision);

      if (pages.length === 0) {
        return {
          status: "blocked",
          requestedUrl,
          blockedReason: decision.reason ?? "Homepage fetch failed",
          crawlReport: buildBlockedCrawlReport({
            requestedUrl,
            maxPages,
            timeoutMs,
            rateLimitMs: effectiveRateLimitMs,
            robots: robotsResult.policy,
            decisions,
            skippedUrls,
          }),
        };
      }
    }
  }

  const screenshotResult = await captureKeyPageScreenshots({
    pages,
    artifactDirectory,
    logger: args.logger,
    timeoutMs,
    enabled: args.captureScreenshots ?? true,
  });
  const pagesWithScreenshots = screenshotResult.updatedPages;
  decisions.push(...screenshotResult.decisions);

  const canonicalPages = pickCanonicalPages(pagesWithScreenshots);
  const extractedVisibleElements = aggregateVisibleElements(pagesWithScreenshots);
  const imageReferences = aggregateImageReferences(pagesWithScreenshots);
  const contactCandidates = aggregateContactCandidates(
    pageCandidates.map((entry) => ({
      page: entry.page,
      candidates: entry.candidates,
    })),
  );

  if (canonicalPages.contact) {
    contactCandidates.push({
      type: "contact_page",
      value: canonicalPages.contact.finalUrl,
      sourcePageUrl: canonicalPages.contact.finalUrl,
      pageType: "contact",
      confidence: 0.97,
      provenance: [
        buildFactSource({
          sourceType: "website_crawl",
          label: "Canonical contact page",
          uri: canonicalPages.contact.finalUrl,
        }),
      ],
    });
  }

  if (canonicalPages.booking) {
    contactCandidates.push({
      type: "booking_page",
      value: canonicalPages.booking.finalUrl,
      sourcePageUrl: canonicalPages.booking.finalUrl,
      pageType: "booking",
      confidence: 0.97,
      provenance: [
        buildFactSource({
          sourceType: "website_crawl",
          label: "Canonical booking page",
          uri: canonicalPages.booking.finalUrl,
        }),
      ],
    });
  }

  const snapshot: SiteSnapshot = {
    domain: normalizeHost(allowedHost),
    collectedAt: nowIso(),
    artifactDirectory,
    canonicalPages,
    extractedVisibleElements,
    metadata: aggregateMetadata(canonicalPages),
    imageReferences,
    contactCandidates: dedupeBy(contactCandidates, (candidate) => `${candidate.type}:${candidate.value}`),
    crawlReport: {
      requestedUrl,
      finalOrigin,
      maxPages,
      fetchTimeoutMs: timeoutMs,
      rateLimitMs: effectiveRateLimitMs,
      robots: robotsResult.policy,
      fetchedPageCount: pagesWithScreenshots.length,
      skippedCount: skippedUrls.length,
      screenshotStatus: screenshotResult.status,
      screenshotReason: screenshotResult.reason,
      decisions,
      skippedUrls,
    },
  };

  await writeFile(path.join(artifactDirectory, "snapshot.json"), JSON.stringify(snapshot, null, 2), "utf8");
  await writeFile(path.join(artifactDirectory, "crawl-report.json"), JSON.stringify(snapshot.crawlReport, null, 2), "utf8");

  return {
    status: "success",
    snapshot,
  };
}
