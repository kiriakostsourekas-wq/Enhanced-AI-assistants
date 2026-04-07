import { z } from "zod";
import { NormalizedDesignSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { normalizeStitchDesignSchema } from "@/lib/antigravity/demo-site/normalize-design-schema";

const NormalizeDesignSchemaStageOutputSchema = z.object({
  designSchema: NormalizedDesignSchema,
});

export const normalizeDesignSchemaStage: ProspectStage<typeof NormalizeDesignSchemaStageOutputSchema> = {
  name: "normalize_design_schema",
  inputSchema: ProspectRunStateSchema,
  outputSchema: NormalizeDesignSchemaStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.redesignBrief || !input.stitchDesignOutput) {
      throw new StageBlockedError("Redesign brief and Stitch design output are required before schema normalization.");
    }

    return {
      designSchema: normalizeStitchDesignSchema({
        redesignBrief: input.redesignBrief,
        stitchDesignOutput: input.stitchDesignOutput,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      designSchema: output.designSchema,
    };
  },
};
