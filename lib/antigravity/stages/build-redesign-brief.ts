import { z } from "zod";
import { ProspectRunStateSchema, RedesignBriefSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildAthensClinicRedesignBrief } from "@/lib/antigravity/demo-site/build-redesign-brief";

const BuildRedesignBriefStageOutputSchema = z.object({
  redesignBrief: RedesignBriefSchema,
});

export const buildRedesignBriefStage: ProspectStage<typeof BuildRedesignBriefStageOutputSchema> = {
  name: "build_redesign_brief",
  inputSchema: ProspectRunStateSchema,
  outputSchema: BuildRedesignBriefStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.websiteGrade || !input.knowledgePack) {
      throw new StageBlockedError("Website grade and knowledge pack are required before building the redesign brief.");
    }

    return {
      redesignBrief: buildAthensClinicRedesignBrief({
        prospect: input.prospect,
        crawl: input.crawl,
        websiteGrade: input.websiteGrade,
        knowledgePack: input.knowledgePack,
        contactValidation: input.contactValidation,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      redesignBrief: output.redesignBrief,
    };
  },
};
