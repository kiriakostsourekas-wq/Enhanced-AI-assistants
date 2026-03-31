import path from "node:path";
import type { Browser } from "playwright";
import type { CrawlDecision, SitePageSnapshot } from "@/lib/antigravity/schemas";
import { nowIso, sha256, slugify } from "@/lib/antigravity/runtime/utils";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";

type ScreenshotResult = {
  updatedPages: SitePageSnapshot[];
  status: "captured" | "skipped" | "not_requested";
  reason?: string;
  decisions: CrawlDecision[];
};

let browserAvailability:
  | {
      status: "unknown";
      reason?: string;
    }
  | {
      status: "unavailable";
      reason: string;
    }
  | {
      status: "available";
      reason?: string;
    } = { status: "unknown" };

async function launchBrowser() {
  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: true,
  });
}

export async function captureKeyPageScreenshots(args: {
  pages: SitePageSnapshot[];
  artifactDirectory: string;
  logger: AntigravityLogger;
  timeoutMs: number;
  enabled: boolean;
}): Promise<ScreenshotResult> {
  const targetPages = args.pages.filter((page) => ["homepage", "contact", "booking"].includes(page.pageType));

  if (!args.enabled || targetPages.length === 0) {
    return {
      updatedPages: args.pages,
      status: "not_requested",
      decisions: [],
    };
  }

  if (browserAvailability.status === "unavailable") {
    return {
      updatedPages: args.pages,
      status: "skipped",
      reason: browserAvailability.reason,
      decisions: targetPages.map((page) => ({
        url: page.finalUrl,
        action: "screenshot_skipped",
        reason: browserAvailability.reason,
        pageTypeHint: page.pageType,
        timestamp: nowIso(),
      })),
    };
  }

  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    browserAvailability = { status: "available" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    browserAvailability = {
      status: "unavailable",
      reason,
    };
    args.logger.warn("snapshot_screenshots_unavailable", {
      error: reason,
    });

    return {
      updatedPages: args.pages,
      status: "skipped",
      reason,
      decisions: targetPages.map((page) => ({
        url: page.finalUrl,
        action: "screenshot_skipped",
        reason,
        pageTypeHint: page.pageType,
        timestamp: nowIso(),
      })),
    };
  }

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 960,
      },
    });

    const screenshotMap = new Map<string, string>();
    const decisions: CrawlDecision[] = [];

    for (const pageSnapshot of targetPages) {
      const page = await context.newPage();

      try {
        await page.goto(pageSnapshot.finalUrl, {
          waitUntil: "domcontentloaded",
          timeout: args.timeoutMs,
        });
        await page.waitForTimeout(750);

        const fileName = `${pageSnapshot.pageType}-${slugify(new URL(pageSnapshot.finalUrl).pathname || "home") || "page"}-${sha256(pageSnapshot.finalUrl).slice(0, 8)}.png`;
        const screenshotPath = path.join(args.artifactDirectory, fileName);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        screenshotMap.set(pageSnapshot.finalUrl, screenshotPath);
        decisions.push({
          url: pageSnapshot.finalUrl,
          action: "screenshot_captured",
          pageTypeHint: pageSnapshot.pageType,
          timestamp: nowIso(),
        });
      } catch (error) {
        decisions.push({
          url: pageSnapshot.finalUrl,
          action: "screenshot_skipped",
          reason: error instanceof Error ? error.message : String(error),
          pageTypeHint: pageSnapshot.pageType,
          timestamp: nowIso(),
        });
      } finally {
        await page.close();
      }
    }

    await context.close();

    return {
      updatedPages: args.pages.map((pageSnapshot) =>
        screenshotMap.has(pageSnapshot.finalUrl)
          ? {
              ...pageSnapshot,
              screenshotPath: screenshotMap.get(pageSnapshot.finalUrl),
            }
          : pageSnapshot,
      ),
      status: screenshotMap.size > 0 ? "captured" : "skipped",
      reason: screenshotMap.size > 0 ? undefined : "No screenshots were captured.",
      decisions,
    };
  } finally {
    await browser.close();
  }
}
