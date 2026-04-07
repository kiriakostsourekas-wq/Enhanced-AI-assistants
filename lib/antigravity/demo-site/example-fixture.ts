import {
  DemoChatbotConfigSchema,
  KnowledgePackSchema,
  WebsiteGradeSchema,
} from "@/lib/antigravity/schemas";
import type {
  DiscoveredProspect,
  FactSource,
  KnowledgePack,
  RedesignBrief,
  StitchDesignOutput,
  StructuredClinicField,
  StructuredFieldStatus,
  WebsiteGrade,
} from "@/lib/antigravity/schemas";
import { buildAthensClinicRedesignBrief } from "@/lib/antigravity/demo-site/build-redesign-brief";
import { buildClinicDemoLandingPage } from "@/lib/antigravity/demo-site/build-clinic-demo-page";
import { generateStitchDesignOutput } from "@/lib/antigravity/demo-site/generate-stitch-design-output";
import { normalizeStitchDesignSchema } from "@/lib/antigravity/demo-site/normalize-design-schema";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";

const FIXTURE_TIMESTAMP = "2026-03-31T08:00:00.000Z";

function fixtureSource(label: string, uri = "https://www.athensdentalspecialists.gr/"): FactSource {
  return buildFactSource({
    sourceType: "website_crawl",
    label,
    uri,
    retrievedAt: FIXTURE_TIMESTAMP,
  });
}

function makeField(args: {
  key: string;
  label: string;
  status: StructuredFieldStatus;
  value?: unknown;
  confidence?: number;
  originalText?: string;
  englishSummary?: string;
  blockerForLiveDemo?: boolean;
}): StructuredClinicField {
  return {
    key: args.key,
    label: args.label,
    status: args.status,
    value: args.value,
    originalText: args.originalText,
    englishSummary: args.englishSummary,
    sourceLanguage: "mixed",
    confidence: args.confidence ?? (args.status === "verified_fact" ? 0.9 : args.status === "inferred_suggestion" ? 0.65 : 0.1),
    blockerForLiveDemo: args.blockerForLiveDemo ?? false,
    provenance: [fixtureSource(args.label)],
  };
}

const exampleStructuredExtraction = {
  clinicName: makeField({
    key: "clinic_name",
    label: "Clinic name",
    status: "verified_fact",
    value: "Athens Dental Clinic",
    originalText: "Athens Dental Clinic",
  }),
  clinicCategory: makeField({
    key: "clinic_category",
    label: "Clinic category / specialty",
    status: "verified_fact",
    value: "Dental clinic",
    originalText: "Dental clinic",
  }),
  coreServices: [
    makeField({
      key: "service:laser-dentistry",
      label: "Core service / treatment",
      status: "verified_fact",
      value: "LASER ΟΔΟΝΤΙΑΤΡΙΚΗ",
      originalText: "LASER ΟΔΟΝΤΙΑΤΡΙΚΗ",
    }),
    makeField({
      key: "service:teeth-whitening",
      label: "Core service / treatment",
      status: "verified_fact",
      value: "Λεύκανση Δοντιών",
      originalText: "Λεύκανση Δοντιών",
    }),
    makeField({
      key: "service:dental-cleaning",
      label: "Core service / treatment",
      status: "verified_fact",
      value: "Καθαρισμός Δοντιών",
      originalText: "Καθαρισμός Δοντιών",
    }),
  ],
  address: makeField({
    key: "address",
    label: "Address",
    status: "verified_fact",
    value: "Athanasiou Axarlian 3, Athens 10563, Greece",
    originalText: "Athanasiou Axarlian 3, Athens 10563, Greece",
    blockerForLiveDemo: true,
  }),
  neighborhood: makeField({
    key: "neighborhood",
    label: "Neighborhood / Athens area",
    status: "verified_fact",
    value: "Σύνταγμα",
    originalText: "Σύνταγμα",
  }),
  phoneNumbers: [
    makeField({
      key: "phone:+302103232553",
      label: "Phone number",
      status: "verified_fact",
      value: "+30 2103232553",
      originalText: "+30 2103232553",
      blockerForLiveDemo: true,
    }),
  ],
  emails: [
    makeField({
      key: "email:info@athensdentalspecialist.gr",
      label: "Email address",
      status: "verified_fact",
      value: "info@athensdentalspecialist.gr",
      originalText: "info@athensdentalspecialist.gr",
      blockerForLiveDemo: true,
    }),
  ],
  contactPageUrl: makeField({
    key: "contact_page_url",
    label: "Contact page URL",
    status: "verified_fact",
    value: "https://www.athensdentalspecialists.gr/index.php/el/contact-us",
    originalText: "https://www.athensdentalspecialists.gr/index.php/el/contact-us",
    blockerForLiveDemo: true,
  }),
  bookingUrl: makeField({
    key: "booking_url",
    label: "Appointment / booking URL",
    status: "verified_fact",
    value: "https://www.athensdentalspecialists.gr/index.php/el/appointment",
    originalText: "https://www.athensdentalspecialists.gr/index.php/el/appointment",
  }),
  openingHours: [],
  doctorNames: [],
  teamNames: [],
  yearsOfExperience: makeField({
    key: "years_of_experience",
    label: "Years of experience",
    status: "unresolved",
    englishSummary: "No explicit years-of-experience statement was verified.",
  }),
  qualificationsAndSpecialties: [],
  clinicStory: makeField({
    key: "clinic_story",
    label: "Clinic story / about us",
    status: "verified_fact",
    value: "Οδοντίατρος στην Αθήνα, πλήρης οδοντιατρική κάλυψη Dentist in Sintagma, Athens providing full dental care",
    originalText: "Οδοντίατρος στην Αθήνα, πλήρης οδοντιατρική κάλυψη Dentist in Sintagma, Athens providing full dental care",
  }),
  testimonials: [
    makeField({
      key: "testimonial:1",
      label: "Testimonial",
      status: "verified_fact",
      value: "Εξαιρετική ιατρός, καθαρός χώρος και πολύ επαγγελματική εμπειρία.",
      originalText: "Εξαιρετική ιατρός, καθαρός χώρος και πολύ επαγγελματική εμπειρία.",
      confidence: 0.78,
    }),
    makeField({
      key: "testimonial:2",
      label: "Testimonial",
      status: "verified_fact",
      value: "The doctor handled our cases with honesty and the staff made us feel welcome.",
      originalText: "The doctor handled our cases with honesty and the staff made us feel welcome.",
      confidence: 0.74,
    }),
  ],
  faqs: [
    makeField({
      key: "faq:appointment",
      label: "FAQ",
      status: "verified_fact",
      value: {
        question: "Μπορώ να κλείσω ραντεβού online;",
        answer: "Ναι, μέσω της σελίδας appointment του site.",
      },
      originalText: "Μπορώ να κλείσω ραντεβού online; Ναι, μέσω της σελίδας appointment του site.",
      confidence: 0.82,
    }),
  ],
  trustMarkers: [],
  socialLinks: [
    makeField({
      key: "social:facebook",
      label: "Social link",
      status: "verified_fact",
      value: "https://www.facebook.com/lovesmileathens",
      originalText: "Facebook",
    }),
    makeField({
      key: "social:instagram",
      label: "Social link",
      status: "verified_fact",
      value: "https://www.instagram.com/lovesmile.athens",
      originalText: "Instagram",
    }),
  ],
  imageGalleryUrls: [
    makeField({
      key: "image:hero",
      label: "Image / gallery URL",
      status: "verified_fact",
      value: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07.jpg",
      originalText: "Athens Dental Clinic interior",
      confidence: 0.8,
    }),
  ],
  logoUrl: makeField({
    key: "logo_url",
    label: "Logo URL",
    status: "inferred_suggestion",
    value: "https://www.athensdentalspecialists.gr/images/athens-dental-specialists.svg",
    originalText: "https://www.athensdentalspecialists.gr/images/athens-dental-specialists.svg",
    confidence: 0.64,
  }),
  brandColors: [],
  pageLanguageProfile: {
    overall: {
      language: "mixed",
      confidence: 0.84,
      rationale: "The public site uses Greek-first copy with English support content.",
    },
    pages: [],
    sections: {},
  },
  operatorEnglishSummary: "Athens Dental Clinic in central Athens with verified dental services, phone, email, contact page, and booking page.",
  unresolvedFields: [
    makeField({
      key: "doctor_names",
      label: "Doctor names",
      status: "unresolved",
      englishSummary: "Doctor names were not extracted with enough confidence.",
    }),
    makeField({
      key: "team_names",
      label: "Team names",
      status: "unresolved",
      englishSummary: "Team names were not extracted with enough confidence.",
    }),
    makeField({
      key: "opening_hours",
      label: "Opening hours",
      status: "unresolved",
      englishSummary: "Opening hours were not extracted reliably.",
    }),
  ],
  liveDemoEligibility: {
    eligible: true,
    confidence: 0.92,
    blockers: [],
    rationale: "Verified contact and location data are strong enough for a live clinic demo.",
  },
} satisfies KnowledgePack["structuredJson"];

export const exampleKnowledgePack = KnowledgePackSchema.parse({
  title: "Athens Dental Clinic knowledge pack",
  generatedAt: FIXTURE_TIMESTAMP,
  summary: "Athens Dental Clinic is a dental clinic near Syntagma with verified contact details and online appointment flow.",
  sections: [
    {
      heading: "Clinic overview",
      body: "Dental clinic in Athens with Greek-first positioning and online appointment path.",
      supportingFacts: [
        {
          key: "clinic_name",
          label: "Clinic name",
          value: "Athens Dental Clinic",
          confidence: 0.94,
          provenance: [fixtureSource("Clinic name")],
        },
      ],
    },
  ],
  markdown: [
    "# Athens Dental Clinic",
    "",
    "## Επισκόπηση κλινικής",
    "- Κατηγορία / ειδικότητα: Dental clinic",
    "- Περιγραφή: Οδοντίατρος στην Αθήνα, πλήρης οδοντιατρική κάλυψη.",
    "- Περιοχή: Σύνταγμα",
    "",
    "## Βασικές υπηρεσίες",
    "- LASER ΟΔΟΝΤΙΑΤΡΙΚΗ",
    "- Λεύκανση Δοντιών",
    "- Καθαρισμός Δοντιών",
    "",
    "## Επικοινωνία και τοποθεσία",
    "- Διεύθυνση: Athanasiou Axarlian 3, Athens 10563, Greece",
    "- Τηλέφωνο: +30 2103232553",
    "- Email: info@athensdentalspecialist.gr",
  ].join("\n"),
  structuredJson: exampleStructuredExtraction,
  unresolvedFieldsReport: exampleStructuredExtraction.unresolvedFields,
  liveDemoEligibility: exampleStructuredExtraction.liveDemoEligibility,
  provenance: [fixtureSource("Knowledge pack")],
});

export const exampleChatbotConfig = DemoChatbotConfigSchema.parse({
  assistantName: "Athens Dental Clinic demo assistant",
  systemPrompt: [
    "You are the embedded assistant for the Athens Dental Clinic demo page.",
    "Default to Greek unless the visitor clearly writes in English.",
    "Use only the verified facts from the provided demo context.",
    "If a visitor asks about pricing, treatment outcomes, or clinician availability, say that human confirmation is required.",
  ].join("\n"),
  leadCaptureFields: ["name", "phone", "email", "preferred_time"],
  escalationRules: [
    "Escalate pricing and insurance questions.",
    "Escalate medical suitability and diagnosis questions.",
    "Escalate any request that goes beyond verified public facts.",
  ],
  prohibitedClaims: [
    "Do not invent services or treatment outcomes.",
    "Do not claim clinician availability unless verified.",
  ],
  provenance: [fixtureSource("Chatbot config")],
});

export const exampleWebsiteGrade = WebsiteGradeSchema.parse({
  overallScore: 58,
  gradeBand: "weak",
  conversionReadinessScore: 54,
  bookingReadinessScore: 61,
  demoOpportunityScore: 83,
  demoOpportunityGate: true,
  categoryScores: {
    offerClarity: {
      score: 62,
      rationale: "The clinic type is understandable, but the first fold is not as commercially focused as it could be.",
      whyThisMattersCommercially: "Patients need immediate clarity before they decide to stay and contact.",
    },
    trustAndMedicalCredibility: {
      score: 57,
      rationale: "The current site shows some proof, but hierarchy and trust presentation are weaker than the clinic category demands.",
      whyThisMattersCommercially: "Better trust presentation increases willingness to enquire or book.",
    },
    conversionReadiness: {
      score: 49,
      rationale: "Calls to action exist but could be much more obvious above the fold and across mobile sections.",
      whyThisMattersCommercially: "Stronger CTAs reduce drop-off before contact.",
    },
    mobileUxHeuristics: {
      score: 55,
      rationale: "Content is available on mobile, but hierarchy and tap-paths can be simplified.",
      whyThisMattersCommercially: "Most clinic traffic is mobile-first and requires faster scanning.",
    },
    bookingContactFriction: {
      score: 58,
      rationale: "Contact and booking paths exist, but the path can feel more direct and trust-building.",
      whyThisMattersCommercially: "Less friction raises appointment intent.",
    },
    localProofForAthens: {
      score: 67,
      rationale: "Athens location signals are present, though they could be positioned more clearly in the layout.",
      whyThisMattersCommercially: "Local proof reduces uncertainty for nearby patients.",
    },
    greekFirstUsability: {
      score: 64,
      rationale: "Greek-first usability is acceptable, but messaging can be more focused and less split across sections.",
      whyThisMattersCommercially: "Natural Greek copy increases trust and immediate comprehension.",
    },
    seoBasics: {
      score: 59,
      rationale: "Some local SEO basics are present, but the service hierarchy can become clearer.",
      whyThisMattersCommercially: "Clearer service hierarchy helps both search and conversion.",
    },
    overallDemoWorthiness: {
      score: 83,
      rationale: "A cleaner, trust-led, CTA-driven demo would look noticeably stronger within seconds.",
      whyThisMattersCommercially: "The demo can create visible commercial upside for the clinic owner fast.",
    },
  },
  plainEnglishDiagnosis: "The clinic has enough verified substance for a strong demo, but the current presentation leaves visible room for stronger trust hierarchy, clearer CTAs, and a more persuasive mobile booking path.",
  operatorSummary: "Generate a live demo: verified Athens location and contact data are strong, and the current site leaves clear conversion upside.",
  topWeaknesses: [
    {
      title: "Weak above-the-fold conversion path",
      detail: "The first screen does not drive the visitor quickly enough toward booking or direct contact.",
      whyThisMattersCommercially: "Patients can hesitate or bounce before taking action.",
    },
    {
      title: "Trust hierarchy can be clearer",
      detail: "Social proof and credibility signals are not framed as strongly as the market demands.",
      whyThisMattersCommercially: "Trust presentation affects whether high-intent visitors enquire.",
    },
    {
      title: "Mobile scanning can be tighter",
      detail: "The current structure leaves too much work for the visitor on mobile.",
      whyThisMattersCommercially: "Faster scanning supports more calls and contact requests.",
    },
    {
      title: "Contact path could feel more immediate",
      detail: "Contact options exist, but the page can reduce hesitation by presenting them earlier and more consistently.",
      whyThisMattersCommercially: "More obvious contact options improve conversion rate.",
    },
    {
      title: "Local proof could be surfaced sooner",
      detail: "Athens location proof exists but does not carry enough weight in the current hierarchy.",
      whyThisMattersCommercially: "Local patients care about convenience and certainty.",
    },
  ],
  topDemoImprovementOpportunities: [
    {
      title: "Greek-first hero with immediate CTA",
      detail: "Lead with specialty, Athens relevance, and one obvious next step above the fold.",
      whyThisMattersCommercially: "It shortens the path from landing to action.",
    },
    {
      title: "Trust-led mobile hierarchy",
      detail: "Reorder services, credibility, and contact so mobile visitors reach confidence faster.",
      whyThisMattersCommercially: "Better hierarchy improves contact intent on the highest-traffic device.",
    },
    {
      title: "Embedded chatbot handoff",
      detail: "Add a safe enquiry assistant that guides visitors toward contact or booking without inventing facts.",
      whyThisMattersCommercially: "It captures intent that would otherwise leave unanswered.",
    },
  ],
  issues: [
    "CTA placement is not forceful enough for high-intent traffic.",
    "Trust framing can be much stronger.",
  ],
  strengths: [
    "Verified location and contact path exist.",
    "Online appointment route is already available.",
  ],
  confidence: 0.86,
  provenance: [fixtureSource("Website grade")],
});

export const exampleProspect: DiscoveredProspect = {
  prospectId: "example-athens-dental-clinic",
  businessName: "Athens Dental Clinic",
  websiteDomain: "athensdentalspecialists.gr",
  category: "Dental clinic",
  address: "Athanasiou Axarlian 3, Athens 10563, Greece",
  city: "Athens",
  country: "Greece",
  phone: "+30 2103232553",
  visibleEmail: "info@athensdentalspecialist.gr",
  contactPageUrl: "https://www.athensdentalspecialists.gr/index.php/el/contact-us",
  websiteUrl: "https://www.athensdentalspecialists.gr/",
  mapsUrl: "https://www.google.com/maps?q=Athanasiou+Axarlian+3,+Athens+10563,+Greece",
  sourceUrl: "https://www.athensdentalspecialists.gr/",
  scoring: {
    icpFit: 0.93,
    websitePresent: 1,
    contactability: 0.88,
    localRelevance: 0.98,
    overall: 0.92,
  },
  confidence: 0.88,
  provenance: [fixtureSource("Example prospect")],
};

export const exampleRedesignBrief: RedesignBrief = buildAthensClinicRedesignBrief({
  prospect: exampleProspect,
  websiteGrade: exampleWebsiteGrade,
  knowledgePack: exampleKnowledgePack,
});

export const exampleStitchDesignOutput: StitchDesignOutput = generateStitchDesignOutput({
  redesignBrief: exampleRedesignBrief,
});

export const exampleDesignSchema = normalizeStitchDesignSchema({
  redesignBrief: exampleRedesignBrief,
  stitchDesignOutput: exampleStitchDesignOutput,
});

export const exampleDemoLandingPage = buildClinicDemoLandingPage({
  campaignId: "example",
  prospect: exampleProspect,
  knowledgePack: exampleKnowledgePack,
  websiteGrade: exampleWebsiteGrade,
  chatbotConfig: exampleChatbotConfig,
  designSchema: exampleDesignSchema,
});
