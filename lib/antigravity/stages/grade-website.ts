import { z } from "zod";
import { ProspectRunStateSchema, WebsiteGradeSchema } from "@/lib/antigravity/schemas";
import type { ProspectStage } from "@/lib/antigravity/stages/interfaces";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";
import { gradeAthensClinicWebsite } from "@/lib/antigravity/grading/athens-clinic-grader";

const GradeWebsiteStageOutputSchema = z.object({
  websiteGrade: WebsiteGradeSchema,
});

export const gradeWebsiteStage: ProspectStage<typeof GradeWebsiteStageOutputSchema> = {
  name: "grade_website",
  inputSchema: ProspectRunStateSchema,
  outputSchema: GradeWebsiteStageOutputSchema,
  retryPolicy: {
    attempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
  async execute(input) {
    const crawl = input.crawl;
    const graded = gradeAthensClinicWebsite({
      prospect: input.prospect,
      snapshot: crawl?.siteSnapshot,
      crawlStatus: crawl?.status,
      blockedReason: crawl?.blockedReason,
    });

    return {
      websiteGrade: {
        ...graded,
        provenance:
          crawl?.provenance?.length && crawl.status === "success"
            ? crawl.provenance
            : [
                buildFactSource({
                  sourceType: "stage_output",
                  label: "grade_website",
                  uri: input.prospect.websiteUrl ?? input.prospect.mapsUrl ?? `prospect:${input.prospect.prospectId}`,
                  excerpt: graded.operatorSummary,
                }),
              ],
      },
    };
  },
  apply(state, output) {
    return {
      ...state,
      websiteGrade: output.websiteGrade,
    };
  },
};
