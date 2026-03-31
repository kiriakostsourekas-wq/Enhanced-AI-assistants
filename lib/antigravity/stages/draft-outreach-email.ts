import { writeFile } from "node:fs/promises";
import { z } from "zod";
import { OutreachDraftSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";
import { buildAthensClinicOutreachDraft } from "@/lib/antigravity/outreach/athens-clinic-outreach-drafts";

const DraftOutreachEmailStageOutputSchema = z.object({
  outreachDraft: OutreachDraftSchema,
});

export const draftOutreachEmailStage: ProspectStage<typeof DraftOutreachEmailStageOutputSchema> = {
  name: "draft_outreach_email",
  inputSchema: ProspectRunStateSchema,
  outputSchema: DraftOutreachEmailStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    if (!input.previewDeployment?.previewUrl || !input.websiteGrade || !input.businessData || !input.knowledgePack || !input.landingPage) {
      throw new StageBlockedError(
        "Preview URL, website grade, business data, knowledge pack, and landing page are required before drafting outreach.",
      );
    }

    const draft = buildAthensClinicOutreachDraft({
      prospect: input.prospect,
      knowledgePack: input.knowledgePack,
      websiteGrade: input.websiteGrade,
      landingPage: input.landingPage,
      previewDeployment: input.previewDeployment,
      contactValidation: input.contactValidation,
    });
    const outreachDraft = {
      ...draft,
      status: "awaiting_review" as const,
      reviewRequired: true,
      autoSendAllowed: false,
      provenance: [
        buildFactSource({
          sourceType: "stage_output",
          label: "draft_outreach_email",
          uri: input.previewDeployment.previewUrl,
        }),
      ],
    };

    if (input.previewDeployment.artifactDirectory) {
      await writeFile(
        `${input.previewDeployment.artifactDirectory}/outreach-draft.json`,
        JSON.stringify(outreachDraft, null, 2),
        "utf8",
      );
    }

    return {
      outreachDraft,
    };
  },
  apply(state, output) {
    return {
      ...state,
      outreachDraft: output.outreachDraft,
      status: "awaiting_review",
    };
  },
};
