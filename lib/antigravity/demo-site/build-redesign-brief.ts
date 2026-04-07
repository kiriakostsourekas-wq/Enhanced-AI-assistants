import { RedesignBriefSchema } from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  DiscoveredProspect,
  KnowledgePack,
  RedesignProblemSummary,
  RedesignResponsePlanItem,
  WebsiteCrawlResult,
  WebsiteGrade,
  WebsiteGradeInsight,
} from "@/lib/antigravity/schemas";
import { buildCurrentSiteScreenshots, buildClinicDemoContext } from "@/lib/antigravity/demo-site/clinic-demo-context";
import { buildFactSource, nowIso } from "@/lib/antigravity/runtime/utils";

function includesAny(value: string, patterns: string[]) {
  const lower = value.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

function clinicAudience(category?: string) {
  const normalized = (category ?? "").toLowerCase();

  if (includesAny(normalized, ["dental", "dent", "orthodont", "implant"])) {
    return "Greek-speaking patients in Athens comparing dental treatments, comfort, and visible trust signals before booking.";
  }

  if (includesAny(normalized, ["orth", "physio", "rehab", "sports"])) {
    return "Adults in Athens looking for pain relief, mobility support, or orthopaedic expertise with a fast route to contact the clinic.";
  }

  if (includesAny(normalized, ["eye", "retina", "ophthal", "vision"])) {
    return "Athens patients seeking specialist eye care who need clarity, credibility, and a confident next step quickly.";
  }

  return "Greek-speaking patients in Athens who want immediate clarity on specialty, trust, and how to contact the clinic.";
}

function visualGuidance(category: string | undefined, weaknessTitles: string[]) {
  const normalizedCategory = (category ?? "").toLowerCase();
  const weaknessText = weaknessTitles.join(" ").toLowerCase();

  if (includesAny(normalizedCategory, ["eye", "retina", "ophthal", "vision"])) {
    return {
      directionName: "Editorial specialist precision",
      tone: "Measured, premium, and clinically confident.",
      paletteMood: "Warm parchment foundation with deep teal emphasis and restrained contrast.",
      heroIntent: "Lead with specialist clarity and visible proof instead of generic clinic language.",
      sectionRhythm: "Open hero, concise proof band, then service detail with deliberate whitespace.",
      variationSignals: [
        "Use a credentials-forward hero visual treatment.",
        "Move trust proof above generic about-us content.",
        "Keep copy crisp and specialist-led rather than lifestyle-led.",
      ],
      avoidPatterns: ["Generic blue medical template", "Three equal cards above the fold", "Abstract AI-style visuals"],
    };
  }

  if (includesAny(normalizedCategory, ["dental", "dent", "implant", "orthodont"])) {
    return {
      directionName: "Warm premium reassurance",
      tone: "Welcoming, polished, and conversion-aware without sounding salesy.",
      paletteMood: "Warm cream surfaces with teal CTAs and subtle amber punctuation.",
      heroIntent: "Make comfort, specialty, and contact options obvious immediately.",
      sectionRhythm: "Hero and services early, then social proof and easy contact actions.",
      variationSignals: [
        "Use service-led cards with softer trust framing.",
        "Let CTA placement feel obvious on mobile without becoming aggressive.",
        "Prioritize approachable copy over cold institutional phrasing.",
      ],
      avoidPatterns: ["Stock-smile aesthetic overload", "Sterile white clinical layout", "Overcrowded hero copy"],
    };
  }

  if (includesAny(normalizedCategory, ["orth", "physio", "rehab", "sports"])) {
    return {
      directionName: "Structured recovery confidence",
      tone: "Confident, direct, and locally grounded.",
      paletteMood: "Warm neutrals with deeper teal structure and stronger contrast blocks.",
      heroIntent: "Show the clinic as organized, credible, and ready to move visitors toward contact fast.",
      sectionRhythm: "Tighter hierarchy with an early contact path and clear service grouping.",
      variationSignals: [
        "Use a contact-forward hero or structured proof panel.",
        "Surface location and phone actions earlier.",
        "Let service groupings feel purposeful rather than decorative.",
      ],
      avoidPatterns: ["Soft generic spa styling", "Long paragraphs before CTA", "Buried location proof"],
    };
  }

  return {
    directionName: weaknessText.includes("mobile") ? "Calm conversion cleanup" : "Local clinic authority",
    tone: "Trustworthy, warm, and visibly more organized than the current site.",
    paletteMood: "Warm parchment base, translucent cards, premium teal actions.",
    heroIntent: "Clarify specialty, local trust, and next step in the first screen.",
    sectionRhythm: "Alternating proof and action sections with clear visual hierarchy.",
    variationSignals: [
      "Respond directly to the strongest critique instead of reusing a fixed template order.",
      "Vary hero and proof treatment by specialty and trust density.",
      "Favor Greek-first clarity and mobile scanning.",
    ],
    avoidPatterns: ["Generic clinic landing-page clone", "Template-first section order", "Unverified credibility claims"],
  };
}

function summarizeProblems(websiteGrade: WebsiteGrade) {
  const problems: RedesignProblemSummary = {
    trust: [],
    conversion: [],
    mobile: [],
    language: [],
    localCredibility: [],
  };

  if (websiteGrade.categoryScores.trustAndMedicalCredibility.score < 70) {
    problems.trust.push("Trust cues and medical credibility are not prominent enough.");
  }

  if (websiteGrade.categoryScores.conversionReadiness.score < 70 || websiteGrade.categoryScores.bookingContactFriction.score < 70) {
    problems.conversion.push("The current site does not lead clearly toward a primary action.");
  }

  if (websiteGrade.categoryScores.mobileUxHeuristics.score < 70) {
    problems.mobile.push("Mobile scanning and tap-path clarity need improvement.");
  }

  if (websiteGrade.categoryScores.greekFirstUsability.score < 70) {
    problems.language.push("Greek-first clarity is inconsistent or buried.");
  }

  if (websiteGrade.categoryScores.localProofForAthens.score < 70) {
    problems.localCredibility.push("Athens-local proof and neighborhood confidence are underused.");
  }

  for (const insight of websiteGrade.topWeaknesses) {
    const haystack = `${insight.title} ${insight.detail}`.toLowerCase();

    if (includesAny(haystack, ["trust", "credib", "doctor", "medical", "proof"])) {
      problems.trust.push(insight.detail);
    }
    if (includesAny(haystack, ["cta", "contact", "book", "convert", "fold", "offer"])) {
      problems.conversion.push(insight.detail);
    }
    if (includesAny(haystack, ["mobile", "readability", "scroll", "scan"])) {
      problems.mobile.push(insight.detail);
    }
    if (includesAny(haystack, ["greek", "english", "language", "mixed"])) {
      problems.language.push(insight.detail);
    }
    if (includesAny(haystack, ["athens", "local", "neighborhood", "location"])) {
      problems.localCredibility.push(insight.detail);
    }
  }

  return {
    trust: [...new Set(problems.trust)],
    conversion: [...new Set(problems.conversion)],
    mobile: [...new Set(problems.mobile)],
    language: [...new Set(problems.language)],
    localCredibility: [...new Set(problems.localCredibility)],
  };
}

function responsePlanForInsight(insight: WebsiteGradeInsight): RedesignResponsePlanItem {
  const haystack = `${insight.title} ${insight.detail}`.toLowerCase();

  if (includesAny(haystack, ["contact", "cta", "book", "appointment", "call"])) {
    return {
      weaknessTitle: insight.title,
      designMove: "Promote a single primary contact action in the hero and repeat it in a persistent mobile-safe CTA.",
      sectionTarget: "contact",
      commercialGoal: "Reduce friction between interest and first contact.",
    };
  }

  if (includesAny(haystack, ["trust", "credib", "doctor", "medical", "qualification"])) {
    return {
      weaknessTitle: insight.title,
      designMove: "Bring verified credentials, doctors, and proof signals into an earlier, more visible trust treatment.",
      sectionTarget: "trust",
      commercialGoal: "Increase confidence before the visitor compares alternative clinics.",
    };
  }

  if (includesAny(haystack, ["mobile", "readability", "scan"])) {
    return {
      weaknessTitle: insight.title,
      designMove: "Use shorter section intros, stronger spacing, and stacked mobile-friendly layouts that keep actions visible.",
      sectionTarget: "services",
      commercialGoal: "Improve readability and CTA discovery on smaller screens.",
    };
  }

  if (includesAny(haystack, ["greek", "english", "language", "mixed"])) {
    return {
      weaknessTitle: insight.title,
      designMove: "Keep the interface Greek-first with consistent labels, headings, and CTAs from the hero downward.",
      sectionTarget: "hero",
      commercialGoal: "Reduce hesitation caused by mixed-language confusion.",
    };
  }

  if (includesAny(haystack, ["athens", "local", "neighborhood", "location"])) {
    return {
      weaknessTitle: insight.title,
      designMove: "Pull neighborhood and location proof closer to the top of the page and reinforce it near contact actions.",
      sectionTarget: "contact",
      commercialGoal: "Improve local credibility and map-driven conversion intent.",
    };
  }

  return {
    weaknessTitle: insight.title,
    designMove: "Replace generic section flow with a tighter hierarchy that responds directly to the clinic’s weakest current-site signals.",
    sectionTarget: "summary",
    commercialGoal: "Make the redesign feel purposeful instead of template-first.",
  };
}

function requiredSections(args: {
  category?: string;
  clinicStory: string;
  mediaCount: number;
  doctorNames: string[];
  teamNames: string[];
  testimonials: string[];
  faqCount: number;
}) {
  const sections = [
    "hero",
    "summary",
    args.mediaCount >= 2 ? "gallery" : null,
    "services",
    "trust",
    args.clinicStory ? "story" : null,
    args.doctorNames.length > 0 || args.teamNames.length > 0 ? "team" : null,
    args.testimonials.length > 0 ? "testimonials" : null,
    args.faqCount > 0 ? "faq" : null,
    "chat",
    "contact",
    "footer",
  ].filter(Boolean);

  return [...new Set(sections)] as Array<
    "hero" | "gallery" | "summary" | "services" | "trust" | "story" | "team" | "testimonials" | "faq" | "chat" | "contact" | "footer"
  >;
}

function truthConstraints(args: {
  renderingMode: "concept_demo" | "live_demo";
  modeRationale: string;
  unresolvedCount: number;
}) {
  return [
    "Never invent services, credentials, testimonials, pricing, or clinic policies.",
    "Never override verified contact or location facts with stronger wording than the verification layer allows.",
    args.renderingMode === "concept_demo"
      ? `Stay explicitly in concept-demo posture where contact/location confidence is weak. ${args.modeRationale}`
      : "Keep live-demo claims limited to verified public facts and approved contact paths.",
    args.unresolvedCount > 0
      ? `Some extracted fields remain unresolved (${args.unresolvedCount}); the redesign must avoid filling those gaps with assumptions.`
      : "Even with strong fact coverage, the redesign remains constrained to extracted and verified public information.",
  ];
}

export function buildAthensClinicRedesignBrief(args: {
  prospect: DiscoveredProspect;
  crawl?: WebsiteCrawlResult;
  websiteGrade: WebsiteGrade;
  knowledgePack: KnowledgePack;
  contactValidation?: ContactValidation;
}) {
  const context = buildClinicDemoContext({
    prospect: args.prospect,
    knowledgePack: args.knowledgePack,
    contactValidation: args.contactValidation,
    crawl: args.crawl,
  });
  const screenshotRefs = buildCurrentSiteScreenshots(args.crawl);
  const problems = summarizeProblems(args.websiteGrade);
  const guidance = visualGuidance(context.category, args.websiteGrade.topWeaknesses.map((item) => item.title));
  const responsePlan = args.websiteGrade.topWeaknesses.map(responsePlanForInsight);
  const modeRationale = args.contactValidation?.operatorSummary ?? args.knowledgePack.liveDemoEligibility.rationale;

  return RedesignBriefSchema.parse({
    generatedAt: nowIso(),
    clinicIdentity: {
      businessName: context.clinicName,
      specialty: context.category,
      targetAudience: clinicAudience(context.category),
      languageStrategy: "greek_first",
    },
    currentSiteScreenshots: screenshotRefs,
    verifiedFacts: {
      clinicName: context.clinicName,
      specialty: context.category,
      neighborhood: context.neighborhood,
      address: context.address,
      services: context.services,
      trustMarkers: context.trustItems,
      doctorNames: context.doctorNames,
      teamNames: context.teamNames,
      phones: context.phones,
      emails: context.emails,
      galleryImageUrls: context.mediaGallery.map((item) => item.url),
      logoUrl: context.logoUrl,
      bookingUrl: context.bookingUrl,
      contactUrl: context.contactPageUrl,
      liveDemoEligibility: args.knowledgePack.liveDemoEligibility,
    },
    gradingSummary: {
      overallScore: args.websiteGrade.overallScore,
      gradeBand: args.websiteGrade.gradeBand,
      demoOpportunityScore: args.websiteGrade.demoOpportunityScore,
      operatorSummary: args.websiteGrade.operatorSummary,
      diagnosis: args.websiteGrade.plainEnglishDiagnosis,
    },
    topWeaknesses: args.websiteGrade.topWeaknesses,
    keyOpportunities: args.websiteGrade.topDemoImprovementOpportunities,
    problemSummary: problems,
    responsePlan,
    requiredSections: requiredSections({
      category: context.category,
      clinicStory: context.clinicStory,
      mediaCount: context.mediaGallery.length,
      doctorNames: context.doctorNames,
      teamNames: context.teamNames,
      testimonials: context.testimonials,
      faqCount: context.faqItems.length,
    }),
    visualStyleGuidance: guidance,
    truthfulnessConstraints: truthConstraints({
      renderingMode: context.renderingMode,
      modeRationale,
      unresolvedCount: args.knowledgePack.unresolvedFieldsReport.length,
    }),
    renderingContext: {
      mode: context.renderingMode,
      rationale: modeRationale,
      safeContactStrategy:
        context.renderingMode === "live_demo"
          ? "Promote verified booking/contact actions confidently, but only through validated URLs and phone numbers."
          : "Use demo-request or general-contact wording until contact and location data are verified strongly enough for live-demo posture.",
    },
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "build_redesign_brief",
        uri: args.prospect.websiteUrl ?? args.prospect.mapsUrl ?? `prospect:${args.prospect.prospectId}`,
      }),
    ],
  });
}
