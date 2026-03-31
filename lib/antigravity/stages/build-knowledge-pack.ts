import { z } from "zod";
import { KnowledgePackSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildAthensClinicKnowledgePack } from "@/lib/antigravity/extraction/knowledge-pack";

const BuildKnowledgePackStageOutputSchema = z.object({
  knowledgePack: KnowledgePackSchema,
});

export const buildKnowledgePackStage: ProspectStage<typeof BuildKnowledgePackStageOutputSchema> = {
  name: "build_knowledge_pack",
  inputSchema: ProspectRunStateSchema,
  outputSchema: BuildKnowledgePackStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.businessData) {
      throw new StageBlockedError("Structured business data is required before building a knowledge pack.");
    }

    return {
      knowledgePack: buildAthensClinicKnowledgePack({
        businessData: input.businessData,
        provenanceUri: input.prospect.websiteUrl ?? input.prospect.mapsUrl ?? `prospect:${input.prospect.prospectId}`,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      knowledgePack: output.knowledgePack,
    };
  },
};
