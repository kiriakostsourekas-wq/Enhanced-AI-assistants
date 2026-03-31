import { DemoChatbotConfigSchema } from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  DemoChatbotConfig,
  DiscoveredProspect,
  KnowledgePack,
  StructuredBusinessData,
} from "@/lib/antigravity/schemas";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";

export function buildDemoChatbotConfig(args: {
  prospect: DiscoveredProspect;
  knowledgePack: KnowledgePack;
  businessData: StructuredBusinessData;
  contactValidation?: ContactValidation;
}): DemoChatbotConfig {
  const businessName = String(args.businessData.canonicalName.value);
  const services = args.businessData.services.map((fact) => fact.label);
  const liveDemoEligibility = args.contactValidation
    ? {
        eligible: args.contactValidation.liveDemoEligibility,
        blockers: args.contactValidation.blockers,
        rationale: args.contactValidation.operatorSummary,
      }
    : args.knowledgePack.liveDemoEligibility;
  const unresolvedClaims = args.knowledgePack.unresolvedFieldsReport
    .slice(0, 8)
    .map((field) => `${field.label}: ${field.englishSummary ?? "unresolved"}`);

  return DemoChatbotConfigSchema.parse({
    assistantName: `${businessName} demo assistant`,
    systemPrompt: [
      `You are a demo website assistant for ${businessName}.`,
      "Default to Greek unless the visitor clearly speaks English.",
      "Use only verified facts from the knowledge pack.",
      "If a question goes beyond verified facts, say that the demo needs human review rather than inventing details.",
      `Verified services: ${services.length > 0 ? services.join(", ") : "none verified yet"}.`,
      `Live demo eligibility: ${liveDemoEligibility.eligible ? "eligible" : "not eligible"} (${liveDemoEligibility.rationale})`,
      liveDemoEligibility.blockers.length > 0
        ? `Live demo blockers: ${liveDemoEligibility.blockers.join(" | ")}.`
        : "No live demo blockers were detected.",
      unresolvedClaims.length > 0
        ? `Do not claim unresolved items: ${unresolvedClaims.join(" | ")}.`
        : "No major unresolved fields were reported.",
      "Knowledge pack markdown follows.",
      args.knowledgePack.markdown,
    ].join("\n"),
    leadCaptureFields: ["name", "phone", "email", "preferred_time"],
    escalationRules: [
      "Escalate pricing, insurance, medical outcome, and treatment suitability questions.",
      "Escalate any question that is not directly supported by a verified fact.",
      "Offer a human callback when the visitor is ready to book.",
    ],
    prohibitedClaims: [
      "Do not claim treatment outcomes.",
      "Do not invent services, pricing, opening hours, or clinicians.",
      "Do not claim the chatbot can diagnose or replace staff.",
    ],
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "generate_demo_chatbot_config",
        uri: args.prospect.websiteUrl ?? args.prospect.mapsUrl ?? `prospect:${args.prospect.prospectId}`,
      }),
    ],
  });
}
