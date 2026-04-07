import { z } from "zod";
import { ProspectRunStateSchema, StitchDesignOutputSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { generateStitchDesignOutput } from "@/lib/antigravity/demo-site/generate-stitch-design-output";

const GenerateStitchDesignStageOutputSchema = z.object({
  stitchDesignOutput: StitchDesignOutputSchema,
});

export const generateStitchDesignStage: ProspectStage<typeof GenerateStitchDesignStageOutputSchema> = {
  name: "generate_stitch_design",
  inputSchema: ProspectRunStateSchema,
  outputSchema: GenerateStitchDesignStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.redesignBrief) {
      throw new StageBlockedError("Redesign brief is required before generating the Stitch design output.");
    }

    return {
      stitchDesignOutput: generateStitchDesignOutput({
        redesignBrief: input.redesignBrief,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      stitchDesignOutput: output.stitchDesignOutput,
    };
  },
};
