import { z } from "zod";
import { DemoLandingPageSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildClinicDemoLandingPage } from "@/lib/antigravity/demo-site/build-clinic-demo-page";

const GenerateDemoLandingPageStageOutputSchema = z.object({
  landingPage: DemoLandingPageSchema,
});

export const generateDemoLandingPageStage: ProspectStage<typeof GenerateDemoLandingPageStageOutputSchema> = {
  name: "generate_demo_landing_page",
  inputSchema: ProspectRunStateSchema,
  outputSchema: GenerateDemoLandingPageStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input, context) {
    if (!input.websiteGrade || !input.knowledgePack || !input.chatbotConfig || !input.contactValidation) {
      throw new StageBlockedError(
        "Website grade, knowledge pack, chatbot config, and contact validation are required before landing page generation.",
      );
    }

    return {
      landingPage: buildClinicDemoLandingPage({
        campaignId: context.campaign.campaignId,
        prospect: input.prospect,
        knowledgePack: input.knowledgePack,
        websiteGrade: input.websiteGrade,
        chatbotConfig: input.chatbotConfig,
        contactValidation: input.contactValidation,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      landingPage: output.landingPage,
    };
  },
};
