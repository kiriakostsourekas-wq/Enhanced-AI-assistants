import { KnowledgePackSchema } from "@/lib/antigravity/schemas";
import type {
  ExtractedFact,
  FactSource,
  KnowledgePack,
  StructuredBusinessData,
  StructuredClinicField,
} from "@/lib/antigravity/schemas";
import { buildFactSource, nowIso } from "@/lib/antigravity/runtime/utils";

function fieldValue(field: StructuredClinicField) {
  if (field.status === "unresolved" || field.value === undefined || field.value === null) {
    return undefined;
  }

  if (typeof field.value === "string") {
    return field.value;
  }

  if (typeof field.value === "number" || typeof field.value === "boolean") {
    return String(field.value);
  }

  if (typeof field.value === "object") {
    if ("displayText" in field.value && typeof field.value.displayText === "string") {
      return field.value.displayText;
    }

    if ("question" in field.value && typeof field.value.question === "string") {
      const answer = "answer" in field.value && typeof field.value.answer === "string" ? field.value.answer : undefined;
      return answer ? `${field.value.question}\n  Απάντηση: ${answer}` : field.value.question;
    }
  }

  return JSON.stringify(field.value);
}

function renderList(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : "- Δεν επαληθεύτηκε σχετική πληροφορία.";
}

function supportingFacts(primary: ExtractedFact | null, extras: ExtractedFact[]) {
  return [primary, ...extras].filter(Boolean) as ExtractedFact[];
}

function unresolvedBullet(field: StructuredClinicField) {
  return `- ${field.label}: ${field.englishSummary ?? "Unresolved"}${field.blockerForLiveDemo ? " [blocker for live demo]" : ""}`;
}

export function buildAthensClinicKnowledgePack(args: {
  businessData: StructuredBusinessData;
  provenanceUri: string;
}): KnowledgePack {
  const extraction = args.businessData.structuredExtraction;
  const name = String(args.businessData.canonicalName.value);
  const services = extraction.coreServices.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const doctorNames = extraction.doctorNames.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const teamNames = extraction.teamNames.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const qualifications = extraction.qualificationsAndSpecialties.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const testimonials = extraction.testimonials.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const faqs = extraction.faqs
    .map((field) => {
      if (field.status === "unresolved" || !field.value || typeof field.value !== "object") {
        return null;
      }

      const question = "question" in field.value ? String(field.value.question ?? "") : "";
      const answer = "answer" in field.value ? String(field.value.answer ?? "") : "";
      return question ? `${question}${answer ? `\n  Απάντηση: ${answer}` : ""}` : null;
    })
    .filter(Boolean) as string[];
  const trustMarkers = extraction.trustMarkers.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const phoneNumbers = extraction.phoneNumbers.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const emails = extraction.emails.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const hours = extraction.openingHours.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const socialLinks = extraction.socialLinks.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const images = extraction.imageGalleryUrls.map((field) => fieldValue(field)).filter(Boolean) as string[];
  const whyChooseThisClinic = [
    ...trustMarkers.slice(0, 3),
    ...testimonials.slice(0, 2),
    ...qualifications.slice(0, 2),
  ].slice(0, 5);

  const markdown = [
    `# ${name}`,
    "",
    "## Επισκόπηση κλινικής",
    renderList(
      [
        fieldValue(extraction.clinicCategory) ? `Κατηγορία / ειδικότητα: ${fieldValue(extraction.clinicCategory)}` : undefined,
        fieldValue(extraction.clinicStory) ? `Περιγραφή: ${fieldValue(extraction.clinicStory)}` : undefined,
        fieldValue(extraction.neighborhood) ? `Περιοχή: ${fieldValue(extraction.neighborhood)}` : undefined,
      ].filter(Boolean) as string[],
    ),
    "",
    "## Βασικές υπηρεσίες",
    renderList(services),
    "",
    "## Γιατί να επιλέξει κάποιος αυτή την κλινική",
    renderList(whyChooseThisClinic),
    "",
    "## Ομάδα και αξιοπιστία",
    renderList(
      [
        doctorNames.length > 0 ? `Ιατροί: ${doctorNames.join(", ")}` : undefined,
        teamNames.length > 0 ? `Ομάδα: ${teamNames.join(", ")}` : undefined,
        fieldValue(extraction.yearsOfExperience) ? `Εμπειρία: ${fieldValue(extraction.yearsOfExperience)}` : undefined,
        qualifications.length > 0 ? `Προσόντα / ειδικότητες: ${qualifications.join(" | ")}` : undefined,
      ].filter(Boolean) as string[],
    ),
    "",
    "## Επικοινωνία και τοποθεσία",
    renderList(
      [
        fieldValue(extraction.address) ? `Διεύθυνση: ${fieldValue(extraction.address)}` : undefined,
        fieldValue(extraction.neighborhood) ? `Περιοχή Αθήνας: ${fieldValue(extraction.neighborhood)}` : undefined,
        phoneNumbers.length > 0 ? `Τηλέφωνα: ${phoneNumbers.join(", ")}` : undefined,
        emails.length > 0 ? `Email: ${emails.join(", ")}` : undefined,
        fieldValue(extraction.contactPageUrl) ? `Σελίδα επικοινωνίας: ${fieldValue(extraction.contactPageUrl)}` : undefined,
        fieldValue(extraction.bookingUrl) ? `Σελίδα ραντεβού: ${fieldValue(extraction.bookingUrl)}` : undefined,
        hours.length > 0 ? `Ωράριο: ${hours.join(" | ")}` : undefined,
      ].filter(Boolean) as string[],
    ),
    "",
    "## Συχνές ερωτήσεις",
    renderList(faqs),
    "",
    "## Σημειώσεις εμπιστοσύνης",
    renderList(
      [
        ...trustMarkers,
        socialLinks.length > 0 ? `Social links: ${socialLinks.join(" | ")}` : undefined,
        images.length > 0 ? `Image references: ${images.slice(0, 6).join(" | ")}` : undefined,
      ].filter(Boolean) as string[],
    ),
    "",
    "## Λείπουν πληροφορίες / Μην το ισχυριστείς",
    extraction.unresolvedFields.length > 0
      ? extraction.unresolvedFields.map(unresolvedBullet).join("\n")
      : "- Δεν εντοπίστηκαν κρίσιμα κενά, αλλά το demo πρέπει να παραμένει συντηρητικό και να μην εφευρίσκει πληροφορίες.",
  ].join("\n");

  const provenance: FactSource[] = [
    buildFactSource({
      sourceType: "stage_output",
      label: "build_knowledge_pack",
      uri: args.provenanceUri,
    }),
  ];

  return KnowledgePackSchema.parse({
    title: `${name} knowledge pack`,
    generatedAt: nowIso(),
    summary: args.businessData.summary,
    sections: [
      {
        heading: "Clinic overview",
        body:
          fieldValue(extraction.clinicStory) ??
          fieldValue(extraction.clinicCategory) ??
          args.businessData.summary,
        supportingFacts: supportingFacts(args.businessData.canonicalName, [
          ...args.businessData.locationFacts,
          ...args.businessData.contactFacts,
        ]).slice(0, 6),
      },
      {
        heading: "Key services",
        body: renderList(services),
        supportingFacts:
          args.businessData.services.length > 0 ? args.businessData.services.slice(0, 8) : [args.businessData.canonicalName],
      },
      {
        heading: "Team and credibility",
        body: renderList([...doctorNames, ...qualifications, ...trustMarkers].slice(0, 8)),
        supportingFacts:
          [...args.businessData.disclaimerFacts, ...args.businessData.hoursFacts].length > 0
            ? [...args.businessData.services, ...args.businessData.contactFacts].slice(0, 6)
            : [args.businessData.canonicalName],
      },
      {
        heading: "Contact and location",
        body: renderList([
          fieldValue(extraction.address) ? `Address: ${fieldValue(extraction.address)}` : "Address unresolved.",
          phoneNumbers.length > 0 ? `Phones: ${phoneNumbers.join(", ")}` : "Phone unresolved.",
          fieldValue(extraction.contactPageUrl)
            ? `Contact page: ${fieldValue(extraction.contactPageUrl)}`
            : "Contact page unresolved.",
        ]),
        supportingFacts:
          [...args.businessData.contactFacts, ...args.businessData.locationFacts].slice(0, 8).length > 0
            ? [...args.businessData.contactFacts, ...args.businessData.locationFacts].slice(0, 8)
            : [args.businessData.canonicalName],
      },
      {
        heading: "Missing information / do not claim",
        body:
          extraction.unresolvedFields.length > 0
            ? extraction.unresolvedFields.map(unresolvedBullet).join("\n")
            : "No critical unresolved fields were detected.",
        supportingFacts:
          args.businessData.disclaimerFacts.length > 0 ? args.businessData.disclaimerFacts : [args.businessData.canonicalName],
      },
    ],
    markdown,
    structuredJson: extraction,
    unresolvedFieldsReport: extraction.unresolvedFields,
    liveDemoEligibility: extraction.liveDemoEligibility,
    provenance,
  });
}
