import { buildFactSource, nowIso } from "@/lib/antigravity/runtime/utils";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";
import type { CrawlDecision, RobotsPolicy } from "@/lib/antigravity/schemas";

type RobotsRule = {
  directive: "allow" | "disallow";
  value: string;
};

type RobotsSection = {
  userAgents: string[];
  rules: RobotsRule[];
  crawlDelayMs?: number;
};

export const ANTIGRAVITY_ROBOTS_AGENT = "antigravitybot";

function stripComment(line: string) {
  const hashIndex = line.indexOf("#");
  return (hashIndex >= 0 ? line.slice(0, hashIndex) : line).trim();
}

function parseRobotsSections(contents: string) {
  const sections: RobotsSection[] = [];
  let currentSection: RobotsSection | null = null;

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (!line) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "user-agent") {
      if (!currentSection || currentSection.rules.length > 0 || currentSection.crawlDelayMs !== undefined) {
        currentSection = {
          userAgents: [],
          rules: [],
        };
        sections.push(currentSection);
      }

      currentSection.userAgents.push(value.toLowerCase());
      continue;
    }

    if (!currentSection) {
      continue;
    }

    if (key === "allow" || key === "disallow") {
      currentSection.rules.push({
        directive: key,
        value,
      });
      continue;
    }

    if (key === "crawl-delay") {
      const delaySeconds = Number(value);
      if (Number.isFinite(delaySeconds) && delaySeconds >= 0) {
        currentSection.crawlDelayMs = Math.round(delaySeconds * 1_000);
      }
    }
  }

  return sections;
}

function chooseApplicableSection(sections: RobotsSection[]) {
  const exactMatch = sections.find((section) => section.userAgents.includes(ANTIGRAVITY_ROBOTS_AGENT));
  if (exactMatch) {
    return {
      matchedUserAgent: ANTIGRAVITY_ROBOTS_AGENT,
      section: exactMatch,
    };
  }

  const wildcardMatch = sections.find((section) => section.userAgents.includes("*"));
  if (wildcardMatch) {
    return {
      matchedUserAgent: "*",
      section: wildcardMatch,
    };
  }

  return {
    matchedUserAgent: undefined,
    section: undefined,
  };
}

function patternToRegExp(pattern: string) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\\\$/g, "$");

  return new RegExp(`^${escaped || ".*"}`);
}

function matchingRuleLength(pattern: string, pathname: string) {
  if (!pattern) {
    return -1;
  }

  return patternToRegExp(pattern).test(pathname) ? pattern.length : -1;
}

export function isPathAllowedByRobots(args: {
  pathname: string;
  rules: RobotsRule[];
}) {
  let bestMatchLength = -1;
  let bestDirective: RobotsRule["directive"] | null = null;

  for (const rule of args.rules) {
    const matchLength = matchingRuleLength(rule.value, args.pathname);
    if (matchLength < 0) {
      continue;
    }

    if (matchLength > bestMatchLength || (matchLength === bestMatchLength && rule.directive === "allow")) {
      bestMatchLength = matchLength;
      bestDirective = rule.directive;
    }
  }

  if (bestDirective === "disallow") {
    return false;
  }

  return true;
}

export async function fetchRobotsPolicy(args: {
  origin: string;
  logger: AntigravityLogger;
  timeoutMs: number;
  userAgent: string;
}) {
  const robotsUrl = new URL("/robots.txt", args.origin).toString();
  const provenance = [
    buildFactSource({
      sourceType: "website_crawl",
      label: "robots.txt",
      uri: robotsUrl,
    }),
  ];

  try {
    const response = await fetch(robotsUrl, {
      headers: {
        "user-agent": args.userAgent,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(args.timeoutMs),
    });

    if (response.status === 404) {
      return {
        policy: {
          robotsUrl,
          fetchedAt: nowIso(),
          status: "missing",
          allowRules: [],
          disallowRules: [],
          provenance,
        } satisfies RobotsPolicy,
        allowed: true,
      };
    }

    if (!response.ok) {
      return {
        policy: {
          robotsUrl,
          fetchedAt: nowIso(),
          status: "blocked",
          allowRules: [],
          disallowRules: [],
          provenance,
        } satisfies RobotsPolicy,
        allowed: false,
        blockedReason: `robots.txt returned HTTP ${response.status}`,
      };
    }

    const contents = await response.text();
    const sections = parseRobotsSections(contents);
    const { matchedUserAgent, section } = chooseApplicableSection(sections);

    const policy = {
      robotsUrl,
      fetchedAt: nowIso(),
      status: "present",
      matchedUserAgent,
      crawlDelayMs: section?.crawlDelayMs,
      allowRules: section?.rules.filter((rule) => rule.directive === "allow").map((rule) => rule.value).filter(Boolean) ?? [],
      disallowRules: section?.rules.filter((rule) => rule.directive === "disallow").map((rule) => rule.value).filter(Boolean) ?? [],
      provenance,
    } satisfies RobotsPolicy;

    args.logger.info("robots_policy_loaded", {
      robotsUrl,
      matchedUserAgent,
      crawlDelayMs: policy.crawlDelayMs,
      allowRuleCount: policy.allowRules.length,
      disallowRuleCount: policy.disallowRules.length,
    });

    return {
      policy,
      allowed: true,
      rules: section?.rules ?? [],
    };
  } catch (error) {
    args.logger.warn("robots_policy_error", {
      robotsUrl,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      policy: {
        robotsUrl,
        fetchedAt: nowIso(),
        status: "error",
        allowRules: [],
        disallowRules: [],
        provenance,
      } satisfies RobotsPolicy,
      allowed: false,
      blockedReason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function robotsDecision(args: {
  url: string;
  allowed: boolean;
  reason?: string;
}): CrawlDecision {
  return {
    url: args.url,
    action: args.allowed ? "queued" : "blocked_by_robots",
    reason: args.reason,
    timestamp: nowIso(),
  };
}
