import { z } from "zod";
import { DemoChatbotConfigSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildDemoChatbotConfig } from "@/lib/antigravity/chatbot/build-demo-chatbot-config";

const GenerateDemoChatbotConfigStageOutputSchema = z.object({
  chatbotConfig: DemoChatbotConfigSchema,
});

export const generateDemoChatbotConfigStage: ProspectStage<typeof GenerateDemoChatbotConfigStageOutputSchema> = {
  name: "generate_demo_chatbot_config",
  inputSchema: ProspectRunStateSchema,
  outputSchema: GenerateDemoChatbotConfigStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.knowledgePack || !input.businessData) {
      throw new StageBlockedError("Knowledge pack and structured business data are required before chatbot generation.");
    }

    return {
      chatbotConfig: buildDemoChatbotConfig({
        prospect: input.prospect,
        knowledgePack: input.knowledgePack,
        businessData: input.businessData,
        contactValidation: input.contactValidation,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      chatbotConfig: output.chatbotConfig,
    };
  },
};
