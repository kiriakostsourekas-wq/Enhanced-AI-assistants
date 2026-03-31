import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  DemoChatbotConfigSchema,
  DemoLandingPageSchema,
  KnowledgePackSchema,
} from "@/lib/antigravity/schemas";
import type {
  DemoChatbotConfig,
  DemoLandingPage,
  KnowledgePack,
} from "@/lib/antigravity/schemas";

const PREVIEW_ROUTE_PREFIX = "antigravity-previews";

async function readJsonFile<T>(filePath: string, parser: { parse: (value: unknown) => T }) {
  const contents = await readFile(filePath, "utf8");
  return parser.parse(JSON.parse(contents));
}

export function getPreviewArtifactsDirectory(campaignSlug: string, prospectSlug: string) {
  return path.join(process.cwd(), "public", PREVIEW_ROUTE_PREFIX, campaignSlug, prospectSlug);
}

export async function loadPreviewArtifacts(args: {
  campaignSlug: string;
  prospectSlug: string;
}): Promise<{
  chatbotConfig: DemoChatbotConfig;
  landingPage: DemoLandingPage;
  knowledgePack: KnowledgePack;
}> {
  // Keep artifact loading centralized so the storage backend can move to S3/Supabase later
  // without touching the route components or chat API handlers.
  const artifactDirectory = getPreviewArtifactsDirectory(args.campaignSlug, args.prospectSlug);

  const [landingPage, chatbotConfig, knowledgePack] = await Promise.all([
    readJsonFile(path.join(artifactDirectory, "landing-page.json"), DemoLandingPageSchema),
    readJsonFile(path.join(artifactDirectory, "chatbot-config.json"), DemoChatbotConfigSchema),
    readJsonFile(path.join(artifactDirectory, "knowledge-pack.json"), KnowledgePackSchema),
  ]);

  return {
    chatbotConfig,
    landingPage,
    knowledgePack,
  };
}
