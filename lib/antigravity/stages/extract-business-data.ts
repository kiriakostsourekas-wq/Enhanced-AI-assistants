import { z } from "zod";
import { ProspectRunStateSchema, StructuredBusinessDataSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { extractAthensClinicBusinessData } from "@/lib/antigravity/extraction/athens-clinic-extractor";

const ExtractBusinessDataStageOutputSchema = z.object({
  businessData: StructuredBusinessDataSchema,
});

export const extractBusinessDataStage: ProspectStage<typeof ExtractBusinessDataStageOutputSchema> = {
  name: "extract_business_data",
  inputSchema: ProspectRunStateSchema,
  outputSchema: ExtractBusinessDataStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    return {
      businessData: await extractAthensClinicBusinessData({
        prospect: input.prospect,
        snapshot: input.crawl?.siteSnapshot,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      businessData: output.businessData,
    };
  },
};
