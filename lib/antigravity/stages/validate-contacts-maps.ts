import { z } from "zod";
import { ContactValidationSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { verifyAthensClinicContactsAndMap } from "@/lib/antigravity/verification/athens-clinic-contact-map-verifier";

const ValidateContactsAndMapsStageOutputSchema = z.object({
  contactValidation: ContactValidationSchema,
});

export const validateContactsAndMapsStage: ProspectStage<typeof ValidateContactsAndMapsStageOutputSchema> = {
  name: "validate_contacts_and_maps",
  inputSchema: ProspectRunStateSchema,
  outputSchema: ValidateContactsAndMapsStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.businessData) {
      throw new StageBlockedError("Structured business data is required before contact validation.");
    }

    return {
      contactValidation: verifyAthensClinicContactsAndMap({
        prospect: input.prospect,
        businessData: input.businessData,
        snapshot: input.crawl?.siteSnapshot,
        mapsEmbedApiKey: process.env.GOOGLE_MAPS_EMBED_API_KEY,
      }),
    };
  },
  apply(state, output) {
    return {
      ...state,
      contactValidation: output.contactValidation,
    };
  },
};
