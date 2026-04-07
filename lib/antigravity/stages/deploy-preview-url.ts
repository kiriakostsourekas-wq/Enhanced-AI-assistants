import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { PreviewDeploymentSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { SitePageSnapshot } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildFactSource, nowIso, slugify } from "@/lib/antigravity/runtime/utils";

const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

const DeployPreviewUrlStageOutputSchema = z.object({
  previewDeployment: PreviewDeploymentSchema,
});

async function copyReviewScreenshot(args: {
  page?: SitePageSnapshot;
  artifactDirectory: string;
  fileName: string;
}) {
  if (!args.page?.screenshotPath) {
    return;
  }

  try {
    await copyFile(args.page.screenshotPath, `${args.artifactDirectory}/${args.fileName}`);
  } catch {
    // Keep deployment resilient when screenshot capture was skipped or the source file is unavailable.
  }
}

export const deployPreviewUrlStage: ProspectStage<typeof DeployPreviewUrlStageOutputSchema> = {
  name: "deploy_preview_url",
  inputSchema: ProspectRunStateSchema,
  outputSchema: DeployPreviewUrlStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input, context) {
    if (
      !input.landingPage ||
      !input.chatbotConfig ||
      !input.knowledgePack ||
      !input.contactValidation ||
      !input.redesignBrief ||
      !input.stitchDesignOutput ||
      !input.designSchema
    ) {
      throw new StageBlockedError(
        "Landing page, chatbot config, knowledge pack, redesign artifacts, contact validation, and design schema are required before deployment.",
      );
    }

    if (input.landingPage.renderingMode !== input.contactValidation.recommendedRenderMode) {
      throw new StageBlockedError(
        "Landing page rendering mode does not match the contact verification gate. Refusing deployment until the page is downgraded safely.",
      );
    }

    const routePrefix = context.previewRoutePrefix.replace(/\/$/, "");
    const campaignSlug = slugify(context.campaign.campaignId);
    const prospectSlug = slugify(input.prospect.businessName);
    const relativeDir = `${routePrefix}/${campaignSlug}/${prospectSlug}`;
    const artifactDirectory = `${PUBLIC_DIR}${relativeDir}`;

    await mkdir(artifactDirectory, { recursive: true });
    await writeFile(`${artifactDirectory}/landing-page.json`, JSON.stringify(input.landingPage, null, 2), "utf8");
    await writeFile(`${artifactDirectory}/chatbot-config.json`, JSON.stringify(input.chatbotConfig, null, 2), "utf8");
    await writeFile(`${artifactDirectory}/knowledge-pack.json`, JSON.stringify(input.knowledgePack, null, 2), "utf8");
    await writeFile(`${artifactDirectory}/normalized-design-schema.json`, JSON.stringify(input.designSchema, null, 2), "utf8");
    await writeFile(`${artifactDirectory}/contact-validation.json`, JSON.stringify(input.contactValidation, null, 2), "utf8");
    await writeFile(`${artifactDirectory}/prospect.json`, JSON.stringify(input.prospect, null, 2), "utf8");

    if (input.websiteGrade) {
      await writeFile(`${artifactDirectory}/website-grade.json`, JSON.stringify(input.websiteGrade, null, 2), "utf8");
    }

    if (input.businessData) {
      await writeFile(`${artifactDirectory}/business-data.json`, JSON.stringify(input.businessData, null, 2), "utf8");
    }

    if (input.redesignBrief) {
      await writeFile(`${artifactDirectory}/redesign-brief.json`, JSON.stringify(input.redesignBrief, null, 2), "utf8");
    }

    if (input.stitchDesignOutput) {
      await writeFile(`${artifactDirectory}/stitch-design-output.json`, JSON.stringify(input.stitchDesignOutput, null, 2), "utf8");
    }

    if (input.crawl) {
      await writeFile(`${artifactDirectory}/crawl.json`, JSON.stringify(input.crawl, null, 2), "utf8");
      await copyReviewScreenshot({
        page: input.crawl.siteSnapshot?.canonicalPages.homepage,
        artifactDirectory,
        fileName: "current-site-homepage.png",
      });
      await copyReviewScreenshot({
        page: input.crawl.siteSnapshot?.canonicalPages.contact,
        artifactDirectory,
        fileName: "current-site-contact.png",
      });
      await copyReviewScreenshot({
        page: input.crawl.siteSnapshot?.canonicalPages.booking,
        artifactDirectory,
        fileName: "current-site-booking.png",
      });
    }

    const previewPath = `${routePrefix}/${campaignSlug}/${prospectSlug}`;
    const previewUrl = context.previewBaseUrl
      ? `${context.previewBaseUrl.replace(/\/$/, "")}${previewPath}`
      : previewPath;

    return {
      previewDeployment: {
        status: "deployed",
        previewUrl,
        artifactDirectory,
        deployedAt: nowIso(),
        provenance: [
          buildFactSource({
            sourceType: "stage_output",
            label: "deploy_preview_url",
            uri: previewPath,
          }),
        ],
      },
    };
  },
  apply(state, output) {
    return {
      ...state,
      previewDeployment: output.previewDeployment,
    };
  },
};
