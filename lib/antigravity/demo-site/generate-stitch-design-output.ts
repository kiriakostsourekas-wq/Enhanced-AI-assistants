import { StitchDesignOutputSchema } from "@/lib/antigravity/schemas";
import type {
  DesignFaqPlacement,
  DesignGalleryLayout,
  DesignHeroType,
  DesignSectionKind,
  DesignServicesLayout,
  DesignTeamLayout,
  DesignThemeVariant,
  DesignTrustTreatment,
  DesignVoice,
  RedesignBrief,
  StitchCritiqueResponse,
} from "@/lib/antigravity/schemas";
import { buildFactSource, nowIso } from "@/lib/antigravity/runtime/utils";

const STITCH_DESIGN_SYSTEM_BLOCK = [
  "- Platform: Web, Desktop-first, responsive to mobile",
  "- Theme: Light warm, editorial authority, professional trust",
  "- Background: Warm Parchment (#EFE7D8) with subtle teal/amber radial glows",
  "- Surface: Translucent Cream White (rgba(255,252,247,0.78)) with backdrop-filter blur(18px)",
  "- Primary Accent: Teal Signal (#0D6661) for CTAs, active states, brand elements",
  "- Secondary Accent: Amber Warmth (#C77B2A) for visual punctuation only",
  "- Text Primary: Ink (#0E1822) and Text Secondary: Ink Soft (#51606F)",
  '- Display Font: "Iowan Old Style" / "Palatino Linotype" serif, weight 600, tracking -0.03em',
  '- Body Font: "Avenir Next" / "Segoe UI" sans-serif, line-height 1.7',
  "- Buttons: Pill-shaped, tactile, no neon glows, one primary CTA emphasis",
  "- Layout: Asymmetric, no centered generic hero, no three-equal-card feature rows",
  "- Anti-patterns: no AI purple, no fabricated metrics, no vague filler copy, no generic medical template",
].join("\n");

function includesAny(value: string, patterns: string[]) {
  const lower = value.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

function themeVariantFromBrief(brief: RedesignBrief): DesignThemeVariant {
  const direction = brief.visualStyleGuidance.directionName.toLowerCase();

  if (includesAny(direction, ["editorial", "precision"])) {
    return "editorial_precision";
  }

  if (includesAny(direction, ["warm", "local"])) {
    return "warm_local_clinic";
  }

  if (includesAny(direction, ["structured", "specialist"])) {
    return "modern_specialist";
  }

  return "calm_conversion";
}

function voiceFromTheme(theme: DesignThemeVariant): DesignVoice {
  switch (theme) {
    case "editorial_precision":
      return "precise_specialist";
    case "warm_local_clinic":
      return "warm_reassuring";
    case "modern_specialist":
      return "modern_premium";
    default:
      return "local_trust";
  }
}

function chooseHeroType(brief: RedesignBrief): DesignHeroType {
  if (brief.problemSummary.trust.length > 0 && (brief.verifiedFacts.doctorNames.length > 0 || brief.verifiedFacts.trustMarkers.length > 0)) {
    return "split_credentials";
  }

  if (
    brief.problemSummary.conversion.length > 0 &&
    (brief.verifiedFacts.bookingUrl || brief.verifiedFacts.contactUrl || brief.verifiedFacts.phones.length > 0)
  ) {
    return "split_contact";
  }

  if (brief.verifiedFacts.galleryImageUrls.length >= 2) {
    return "split_image";
  }

  return "split_insight";
}

function chooseServicesLayout(brief: RedesignBrief): DesignServicesLayout {
  if (brief.problemSummary.mobile.length > 0) {
    return "stacked_list";
  }

  if (brief.verifiedFacts.services.length >= 5) {
    return "feature_split";
  }

  return "card_grid";
}

function chooseTrustTreatment(brief: RedesignBrief): DesignTrustTreatment {
  if (brief.verifiedFacts.doctorNames.length > 0) {
    return "doctor_spotlight";
  }

  if (brief.verifiedFacts.trustMarkers.length >= 4) {
    return "credential_grid";
  }

  if (brief.verifiedFacts.teamNames.length > 0) {
    return "proof_tiles";
  }

  return "quote_band";
}

function chooseTeamLayout(brief: RedesignBrief): DesignTeamLayout {
  if (brief.verifiedFacts.doctorNames.length >= 2) {
    return "profile_grid";
  }

  if (brief.problemSummary.trust.length > 0) {
    return "credentials_stack";
  }

  return "story_split";
}

function chooseGalleryLayout(brief: RedesignBrief, themeVariant: DesignThemeVariant): DesignGalleryLayout {
  if (brief.verifiedFacts.doctorNames.length > 0) {
    return "portrait_stack";
  }

  if (brief.verifiedFacts.services.length >= 4) {
    return "service_triptych";
  }

  if (themeVariant === "editorial_precision") {
    return "editorial_strip";
  }

  return "mosaic";
}

function chooseFaqPlacement(brief: RedesignBrief): DesignFaqPlacement {
  if (brief.problemSummary.mobile.length > 0) {
    return "before_contact";
  }

  if (brief.requiredSections.includes("team")) {
    return "after_team";
  }

  return "after_services";
}

function critiqueResponses(brief: RedesignBrief): StitchCritiqueResponse[] {
  return brief.responsePlan.map((item) => ({
    weaknessTitle: item.weaknessTitle,
    designMove: item.designMove,
    sectionTarget: item.sectionTarget,
  }));
}

function orderedSections(args: {
  brief: RedesignBrief;
  heroType: DesignHeroType;
  trustTreatment: DesignTrustTreatment;
  faqPlacement: DesignFaqPlacement;
  galleryLayout: DesignGalleryLayout;
}) {
  const sections: DesignSectionKind[] = ["hero"];
  const required = new Set(args.brief.requiredSections);

  if (required.has("gallery") && (args.heroType === "split_image" || args.galleryLayout === "service_triptych")) {
    sections.push("gallery");
  }

  if (required.has("summary")) {
    sections.push("summary");
  }

  if (args.heroType === "split_credentials" && required.has("trust")) {
    sections.push("trust");
  }

  if (required.has("services")) {
    sections.push("services");
  }

  if (required.has("gallery") && !sections.includes("gallery")) {
    sections.push("gallery");
  }

  if (!sections.includes("trust") && required.has("trust")) {
    sections.push("trust");
  }

  if (required.has("story")) {
    sections.push("story");
  }

  if (required.has("team")) {
    sections.push("team");
  }

  if (required.has("testimonials") && args.trustTreatment !== "quote_band") {
    sections.push("testimonials");
  }

  if (args.faqPlacement === "after_services" && required.has("faq") && !sections.includes("faq")) {
    sections.push("faq");
  }

  if (required.has("chat")) {
    sections.push("chat");
  }

  if (args.faqPlacement !== "after_services" && required.has("faq") && !sections.includes("faq")) {
    sections.push("faq");
  }

  if (required.has("contact")) {
    sections.push("contact");
  }

  if (required.has("testimonials") && args.trustTreatment === "quote_band") {
    sections.push("testimonials");
  }

  sections.push("footer");

  return [...new Set(sections)].filter((section) => required.has(section) || section === "footer");
}

function buildPageStructure(sectionOrder: DesignSectionKind[]) {
  return sectionOrder
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n");
}

function buildPrompt(args: {
  brief: RedesignBrief;
  themeVariant: DesignThemeVariant;
  heroType: DesignHeroType;
  servicesLayout: DesignServicesLayout;
  trustTreatment: DesignTrustTreatment;
  teamLayout: DesignTeamLayout;
  galleryLayout: DesignGalleryLayout;
  faqPlacement: DesignFaqPlacement;
  sectionOrder: DesignSectionKind[];
}) {
  const screenshots = args.brief.currentSiteScreenshots.length
    ? args.brief.currentSiteScreenshots
        .map((shot) => `- ${shot.pageLabel}: ${shot.observationSummary} (${shot.sourceUrl})`)
        .join("\n")
    : "- No screenshots were captured; rely on extracted structure and grading only.";
  const visualAssets = [
    args.brief.verifiedFacts.logoUrl ? `- Logo: ${args.brief.verifiedFacts.logoUrl}` : null,
    ...args.brief.verifiedFacts.galleryImageUrls.slice(0, 6).map((url) => `- Gallery image: ${url}`),
  ]
    .filter(Boolean)
    .join("\n");
  const weaknesses = args.brief.topWeaknesses.map((item) => `- ${item.title}: ${item.detail}`).join("\n");
  const opportunities = args.brief.keyOpportunities.map((item) => `- ${item.title}: ${item.detail}`).join("\n");
  const facts = [
    `Clinic: ${args.brief.verifiedFacts.clinicName}`,
    args.brief.verifiedFacts.specialty ? `Specialty: ${args.brief.verifiedFacts.specialty}` : null,
    args.brief.verifiedFacts.neighborhood ? `Neighborhood: ${args.brief.verifiedFacts.neighborhood}` : null,
    args.brief.verifiedFacts.address ? `Address: ${args.brief.verifiedFacts.address}` : null,
    args.brief.verifiedFacts.services.length > 0 ? `Verified services: ${args.brief.verifiedFacts.services.join(", ")}` : null,
    args.brief.verifiedFacts.trustMarkers.length > 0 ? `Trust markers: ${args.brief.verifiedFacts.trustMarkers.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `${args.brief.clinicIdentity.businessName} redesign for Athens clinic patients. Make it feel premium, Greek-first, image-aware, and visibly more intentional than the current site.`,
    "",
    "**DESIGN SYSTEM (REQUIRED):**",
    STITCH_DESIGN_SYSTEM_BLOCK,
    "",
    "**DESIGN DIRECTION:**",
    `- Theme variant: ${args.themeVariant}`,
    `- Voice: ${voiceFromTheme(args.themeVariant)}`,
    `- Hero type: ${args.heroType}`,
    `- Services layout: ${args.servicesLayout}`,
    `- Trust treatment: ${args.trustTreatment}`,
    `- Team layout: ${args.teamLayout}`,
    `- Gallery layout: ${args.galleryLayout}`,
    `- FAQ placement: ${args.faqPlacement}`,
    `- Visual direction: ${args.brief.visualStyleGuidance.directionName}`,
    `- Tone: ${args.brief.visualStyleGuidance.tone}`,
    `- Hero intent: ${args.brief.visualStyleGuidance.heroIntent}`,
    "",
    "**PAGE STRUCTURE:**",
    buildPageStructure(args.sectionOrder),
    "",
    "**CURRENT SITE SCREENSHOTS:**",
    screenshots,
    "",
    "**VISUAL ASSETS:**",
    visualAssets || "- No strong image assets were recovered; lean on screenshots and asymmetric layout instead of generic placeholders.",
    "",
    "**VERIFIED FACTS:**",
    facts,
    "",
    "**TOP WEAKNESSES:**",
    weaknesses,
    "",
    "**KEY OPPORTUNITIES:**",
    opportunities,
    "",
    "**TRUTH CONSTRAINTS:**",
    ...args.brief.truthfulnessConstraints.map((item) => `- ${item}`),
    "",
    "**ANTI-TEMPLATE RULES:**",
    "- Do not produce a generic clinic landing page clone.",
    "- Use real clinic imagery where available instead of icon-only sections.",
    "- Keep Greek-first hierarchy obvious above the fold.",
    "- Make the first two sections feel different per clinic specialty and critique profile.",
  ].join("\n");
}

export function generateStitchDesignOutput(args: { redesignBrief: RedesignBrief }) {
  const themeVariant = themeVariantFromBrief(args.redesignBrief);
  const voice = voiceFromTheme(themeVariant);
  const heroType = chooseHeroType(args.redesignBrief);
  const servicesLayout = chooseServicesLayout(args.redesignBrief);
  const trustTreatment = chooseTrustTreatment(args.redesignBrief);
  const teamLayout = chooseTeamLayout(args.redesignBrief);
  const galleryLayout = chooseGalleryLayout(args.redesignBrief, themeVariant);
  const faqPlacement = chooseFaqPlacement(args.redesignBrief);
  const sectionOrder = orderedSections({
    brief: args.redesignBrief,
    heroType,
    trustTreatment,
    faqPlacement,
    galleryLayout,
  });
  const prompt = buildPrompt({
    brief: args.redesignBrief,
    themeVariant,
    heroType,
    servicesLayout,
    trustTreatment,
    teamLayout,
    galleryLayout,
    faqPlacement,
    sectionOrder,
  });
  const critiqueMoves = critiqueResponses(args.redesignBrief);

  return StitchDesignOutputSchema.parse({
    generatedAt: nowIso(),
    source: "deterministic_adapter",
    prompt,
    designRationale:
      "Local adapter selected an image-aware clinic direction from screenshots, verified facts, visual assets, grading critique, and live-vs-concept constraints.",
    themeVariant,
    voice,
    heroType,
    ctaLayout:
      args.redesignBrief.renderingContext.mode === "live_demo"
        ? "sticky_bar"
        : args.redesignBrief.problemSummary.conversion.length > 0
          ? "stacked_actions"
          : "paired_buttons",
    trustTreatment,
    servicesLayout,
    teamLayout,
    galleryLayout,
    faqPlacement,
    contactPlacement: args.redesignBrief.renderingContext.mode === "live_demo" ? "dark_split" : "light_card",
    mapPlacement:
      args.redesignBrief.renderingContext.mode === "live_demo" && args.redesignBrief.verifiedFacts.address
        ? "contact_panel"
        : "hidden",
    sectionOrder,
    critiqueResponses: critiqueMoves,
    mobileFirstMoves: [
      "Keep actions visible within the first viewport on phones.",
      "Prefer stacked service summaries or featured-first cards over dense equal grids.",
      "Use image treatments that collapse cleanly without horizontal overflow.",
    ],
    notes: [
      `Visual direction: ${args.redesignBrief.visualStyleGuidance.directionName}`,
      `Variation signals: ${args.redesignBrief.visualStyleGuidance.variationSignals.join(" | ")}`,
      `Gallery assets recovered: ${args.redesignBrief.verifiedFacts.galleryImageUrls.length}`,
    ],
    warnings: args.redesignBrief.renderingContext.mode === "concept_demo" ? ["Stay conservative with live-contact language."] : [],
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "generate_stitch_design",
        uri: `redesign-brief:${args.redesignBrief.clinicIdentity.businessName}`,
      }),
    ],
  });
}
