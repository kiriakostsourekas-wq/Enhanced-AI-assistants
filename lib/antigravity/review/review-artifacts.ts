import path from "node:path";
import { access, readdir, readFile } from "node:fs/promises";
import {
  ContactValidationSchema,
  DemoChatbotConfigSchema,
  DemoLandingPageSchema,
  DiscoveredProspectSchema,
  KnowledgePackSchema,
  NormalizedDesignSchema,
  OutreachDraftSchema,
  RedesignBriefSchema,
  StitchDesignOutputSchema,
  StructuredBusinessDataSchema,
  WebsiteCrawlResultSchema,
  WebsiteGradeSchema,
} from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  DemoChatbotConfig,
  DemoLandingPage,
  DiscoveredProspect,
  KnowledgePack,
  NormalizedDesignSchema as NormalizedDesignSchemaType,
  OutreachDraft,
  RedesignBrief,
  StitchDesignOutput,
  StructuredBusinessData,
  WebsiteCrawlResult,
  WebsiteGrade,
} from "@/lib/antigravity/schemas";
import { getPreviewArtifactsDirectory } from "@/lib/antigravity/demo-site/artifacts";

const PREVIEW_ROOT = path.join(process.cwd(), "public", "antigravity-previews");

async function readJsonFile<T>(filePath: string, parser: { parse: (value: unknown) => T }) {
  const contents = await readFile(filePath, "utf8");
  return parser.parse(JSON.parse(contents));
}

async function readOptionalJsonFile<T>(filePath: string, parser: { parse: (value: unknown) => T }) {
  try {
    return await readJsonFile(filePath, parser);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function publicArtifactPath(args: { campaignSlug: string; prospectSlug: string; fileName: string }) {
  return `/antigravity-previews/${args.campaignSlug}/${args.prospectSlug}/${args.fileName}`;
}

export type ReviewPreviewArtifacts = {
  artifactDirectory: string;
  campaignSlug: string;
  prospectSlug: string;
  prospect: DiscoveredProspect;
  crawl?: WebsiteCrawlResult;
  websiteGrade?: WebsiteGrade;
  businessData?: StructuredBusinessData;
  knowledgePack: KnowledgePack;
  redesignBrief?: RedesignBrief;
  stitchDesignOutput?: StitchDesignOutput;
  designSchema?: NormalizedDesignSchemaType;
  chatbotConfig: DemoChatbotConfig;
  landingPage: DemoLandingPage;
  contactValidation?: ContactValidation;
  outreachDraft?: OutreachDraft;
  screenshotUrls: {
    homepage?: string;
    contact?: string;
    booking?: string;
  };
};

export async function loadReviewPreviewArtifacts(args: {
  campaignSlug: string;
  prospectSlug: string;
}): Promise<ReviewPreviewArtifacts> {
  const artifactDirectory = getPreviewArtifactsDirectory(args.campaignSlug, args.prospectSlug);
  const [
    prospect,
    crawl,
    websiteGrade,
    businessData,
    knowledgePack,
    redesignBrief,
    stitchDesignOutput,
    designSchema,
    chatbotConfig,
    landingPage,
    contactValidation,
    outreachDraft,
  ] =
    await Promise.all([
      readJsonFile(path.join(artifactDirectory, "prospect.json"), DiscoveredProspectSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "crawl.json"), WebsiteCrawlResultSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "website-grade.json"), WebsiteGradeSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "business-data.json"), StructuredBusinessDataSchema),
      readJsonFile(path.join(artifactDirectory, "knowledge-pack.json"), KnowledgePackSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "redesign-brief.json"), RedesignBriefSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "stitch-design-output.json"), StitchDesignOutputSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "normalized-design-schema.json"), NormalizedDesignSchema),
      readJsonFile(path.join(artifactDirectory, "chatbot-config.json"), DemoChatbotConfigSchema),
      readJsonFile(path.join(artifactDirectory, "landing-page.json"), DemoLandingPageSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "contact-validation.json"), ContactValidationSchema),
      readOptionalJsonFile(path.join(artifactDirectory, "outreach-draft.json"), OutreachDraftSchema),
    ]);

  const [hasHomepageShot, hasContactShot, hasBookingShot] = await Promise.all([
    fileExists(path.join(artifactDirectory, "current-site-homepage.png")),
    fileExists(path.join(artifactDirectory, "current-site-contact.png")),
    fileExists(path.join(artifactDirectory, "current-site-booking.png")),
  ]);

  return {
    artifactDirectory,
    campaignSlug: args.campaignSlug,
    prospectSlug: args.prospectSlug,
    prospect,
    crawl,
    websiteGrade,
    businessData,
    knowledgePack,
    redesignBrief,
    stitchDesignOutput,
    designSchema,
    chatbotConfig,
    landingPage,
    contactValidation,
    outreachDraft,
    screenshotUrls: {
      homepage: hasHomepageShot ? publicArtifactPath({ ...args, fileName: "current-site-homepage.png" }) : undefined,
      contact: hasContactShot ? publicArtifactPath({ ...args, fileName: "current-site-contact.png" }) : undefined,
      booking: hasBookingShot ? publicArtifactPath({ ...args, fileName: "current-site-booking.png" }) : undefined,
    },
  };
}

export type ReviewPreviewSummary = {
  campaignSlug: string;
  prospectSlug: string;
  prospect: DiscoveredProspect;
  landingPage: DemoLandingPage;
  designSchema?: NormalizedDesignSchemaType;
  websiteGrade?: WebsiteGrade;
  contactValidation?: ContactValidation;
  outreachDraft?: OutreachDraft;
  screenshotUrl?: string;
};

export async function listReviewPreviewSummaries(): Promise<ReviewPreviewSummary[]> {
  try {
    const campaignEntries = await readdir(PREVIEW_ROOT, { withFileTypes: true });
    const summaries: ReviewPreviewSummary[] = [];

    for (const campaignEntry of campaignEntries) {
      if (!campaignEntry.isDirectory()) {
        continue;
      }

      const campaignSlug = campaignEntry.name;
      const campaignDirectory = path.join(PREVIEW_ROOT, campaignSlug);
      const prospectEntries = await readdir(campaignDirectory, { withFileTypes: true });

      for (const prospectEntry of prospectEntries) {
        if (!prospectEntry.isDirectory()) {
          continue;
        }

        const prospectSlug = prospectEntry.name;
        const artifactDirectory = getPreviewArtifactsDirectory(campaignSlug, prospectSlug);
        const landingPageFile = path.join(artifactDirectory, "landing-page.json");

        if (!(await fileExists(landingPageFile))) {
          continue;
        }

        const [prospect, landingPage, designSchema, websiteGrade, contactValidation, outreachDraft, hasHomepageShot] = await Promise.all([
          readJsonFile(path.join(artifactDirectory, "prospect.json"), DiscoveredProspectSchema),
          readJsonFile(landingPageFile, DemoLandingPageSchema),
          readOptionalJsonFile(path.join(artifactDirectory, "normalized-design-schema.json"), NormalizedDesignSchema),
          readOptionalJsonFile(path.join(artifactDirectory, "website-grade.json"), WebsiteGradeSchema),
          readOptionalJsonFile(path.join(artifactDirectory, "contact-validation.json"), ContactValidationSchema),
          readOptionalJsonFile(path.join(artifactDirectory, "outreach-draft.json"), OutreachDraftSchema),
          fileExists(path.join(artifactDirectory, "current-site-homepage.png")),
        ]);

        summaries.push({
          campaignSlug,
          prospectSlug,
          prospect,
          landingPage,
          designSchema,
          websiteGrade,
          contactValidation,
          outreachDraft,
          screenshotUrl: hasHomepageShot ? publicArtifactPath({ campaignSlug, prospectSlug, fileName: "current-site-homepage.png" }) : undefined,
        });
      }
    }

    return summaries;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
