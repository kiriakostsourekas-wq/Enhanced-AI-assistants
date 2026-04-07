import { RunnableSequence } from "@langchain/core/runnables";
import type { AntigravityDependencies, StageRuntimeContext } from "@/lib/antigravity/stages/interfaces";
import { createProspectStageRunnable } from "@/lib/antigravity/runtime/stage-runner";
import { crawlWebsiteStage } from "@/lib/antigravity/stages/crawl-website";
import { gradeWebsiteStage } from "@/lib/antigravity/stages/grade-website";
import { extractBusinessDataStage } from "@/lib/antigravity/stages/extract-business-data";
import { buildKnowledgePackStage } from "@/lib/antigravity/stages/build-knowledge-pack";
import { buildRedesignBriefStage } from "@/lib/antigravity/stages/build-redesign-brief";
import { generateStitchDesignStage } from "@/lib/antigravity/stages/generate-stitch-design";
import { normalizeDesignSchemaStage } from "@/lib/antigravity/stages/normalize-design-schema";
import { generateDemoChatbotConfigStage } from "@/lib/antigravity/stages/generate-demo-chatbot-config";
import { generateDemoLandingPageStage } from "@/lib/antigravity/stages/generate-demo-landing-page";
import { validateContactsAndMapsStage } from "@/lib/antigravity/stages/validate-contacts-maps";
import { deployPreviewUrlStage } from "@/lib/antigravity/stages/deploy-preview-url";
import { draftOutreachEmailStage } from "@/lib/antigravity/stages/draft-outreach-email";

export function createProspectPipeline(context: StageRuntimeContext & { dependencies: AntigravityDependencies }) {
  // Extension point: insert new vertical-specific stages here. Each stage is a
  // typed LangChain runnable, so adding a new step means registering it once in
  // this sequence and implementing its schema + apply() behavior.
  return RunnableSequence.from([
    createProspectStageRunnable(crawlWebsiteStage, context),
    createProspectStageRunnable(gradeWebsiteStage, context),
    createProspectStageRunnable(extractBusinessDataStage, context),
    createProspectStageRunnable(buildKnowledgePackStage, context),
    createProspectStageRunnable(validateContactsAndMapsStage, context),
    createProspectStageRunnable(buildRedesignBriefStage, context),
    createProspectStageRunnable(generateStitchDesignStage, context),
    createProspectStageRunnable(normalizeDesignSchemaStage, context),
    createProspectStageRunnable(generateDemoChatbotConfigStage, context),
    createProspectStageRunnable(generateDemoLandingPageStage, context),
    createProspectStageRunnable(deployPreviewUrlStage, context),
    createProspectStageRunnable(draftOutreachEmailStage, context),
  ]);
}
