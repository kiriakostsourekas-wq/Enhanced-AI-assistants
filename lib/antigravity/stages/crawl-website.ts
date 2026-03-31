import { readFile } from "node:fs/promises";
import { z } from "zod";
import { ProspectRunStateSchema, WebsiteCrawlResultSchema } from "@/lib/antigravity/schemas";
import type { SitePageSnapshot } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { buildFactSource, nowIso, sha256 } from "@/lib/antigravity/runtime/utils";
import { createSiteSnapshot } from "@/lib/antigravity/site-snapshot";

const CrawlWebsiteStageOutputSchema = z.object({
  crawl: WebsiteCrawlResultSchema,
});

function canonicalPagesToList(pages: {
  homepage?: SitePageSnapshot;
  about?: SitePageSnapshot;
  services?: SitePageSnapshot;
  contact?: SitePageSnapshot;
  booking?: SitePageSnapshot;
  team?: SitePageSnapshot;
  faq?: SitePageSnapshot;
}) {
  return [pages.homepage, pages.about, pages.services, pages.contact, pages.booking, pages.team, pages.faq].filter(
    Boolean,
  ) as SitePageSnapshot[];
}

export const crawlWebsiteStage: ProspectStage<typeof CrawlWebsiteStageOutputSchema> = {
  name: "crawl_website",
  inputSchema: ProspectRunStateSchema,
  outputSchema: CrawlWebsiteStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input, context) {
    if (!input.prospect.websiteUrl) {
      return {
        crawl: {
          status: "not_available",
          fetchedAt: nowIso(),
          blockedReason: "No official website was available for this prospect.",
          discoveredLinks: [],
          provenance: [
            buildFactSource({
              sourceType: "stage_output",
              label: "crawl_website",
              uri: input.prospect.mapsUrl ?? `prospect:${input.prospect.prospectId}`,
            }),
          ],
        },
      };
    }

    const snapshotResult = await createSiteSnapshot({
      websiteUrl: input.prospect.websiteUrl,
      logger: context.logger.child({
        stage: "crawl_website",
        prospectId: input.prospect.prospectId,
      }),
      maxPages: 6,
      timeoutMs: 10_000,
      rateLimitMs: 1_500,
      captureScreenshots: true,
    });

    if (snapshotResult.status === "blocked") {
      return {
        crawl: {
          status: "blocked",
          fetchedAt: nowIso(),
          finalUrl: snapshotResult.crawlReport.finalOrigin,
          blockedReason: snapshotResult.blockedReason,
          discoveredLinks: [],
          provenance: [
            buildFactSource({
              sourceType: "website_crawl",
              label: "site snapshot blocked",
              uri: input.prospect.websiteUrl,
              excerpt: snapshotResult.blockedReason,
            }),
          ],
        },
      };
    }

    const snapshot = snapshotResult.snapshot;
    const canonicalPages = canonicalPagesToList(snapshot.canonicalPages);
    const homepage = snapshot.canonicalPages.homepage;
    const homepageHtml = homepage ? await readFile(homepage.rawHtmlPath, "utf8") : "";
    const discoveredLinks = canonicalPages.flatMap((page) => page.internalLinks).slice(0, 80);
    const textContent = canonicalPages
      .map((page) => page.textContent ?? "")
      .join("\n\n")
      .trim()
      .slice(0, 50_000);

    return {
      crawl: {
        status: "success",
        fetchedAt: snapshot.collectedAt,
        finalUrl: homepage?.finalUrl ?? input.prospect.websiteUrl,
        statusCode: homepage?.statusCode,
        title: snapshot.metadata.title,
        metaDescription: snapshot.metadata.metaDescription,
        textContent: textContent || undefined,
        htmlSha256: homepageHtml ? sha256(homepageHtml) : undefined,
        discoveredLinks,
        siteSnapshot: snapshot,
        provenance: [
          buildFactSource({
            sourceType: "website_crawl",
            label: "site snapshot",
            uri: homepage?.finalUrl ?? input.prospect.websiteUrl,
          }),
        ],
      },
    };
  },
  apply(state, output) {
    return {
      ...state,
      crawl: output.crawl,
    };
  },
};
