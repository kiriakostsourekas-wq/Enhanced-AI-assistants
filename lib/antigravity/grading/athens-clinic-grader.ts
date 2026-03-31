import type {
  DiscoveredProspect,
  SitePageSnapshot,
  SiteSnapshot,
  WebsiteGrade,
  WebsiteGradeCategoryScore,
  WebsiteGradeInsight,
} from "@/lib/antigravity/schemas";

const APPOINTMENT_PATTERNS = [
  /\bappointment\b/i,
  /\bbook\b/i,
  /\bcontact\b/i,
  /\bconsultation\b/i,
  /\brequest\b/i,
  /ραντεβ/i,
  /επικοινων/i,
  /καλέστ/i,
];

const CLINIC_SERVICE_PATTERNS = [
  /\bclinic\b/i,
  /\bmedical\b/i,
  /\bdoctor\b/i,
  /\bdental\b/i,
  /\borthop/i,
  /\bophthalm/i,
  /\bcardio/i,
  /\bfertility\b/i,
  /\bivf\b/i,
  /\bplastic\b/i,
  /\bdermat/i,
  /\bphysio/i,
  /\bdiagnostic\b/i,
  /\bsurgeon\b/i,
  /κλινικ/i,
  /ιατρ/i,
  /οδοντ/i,
  /ορθοπ/i,
  /οφθαλμ/i,
  /καρδιο/i,
  /γονιμ/i,
  /γυναικ/i,
  /πλαστικ/i,
  /δερματο/i,
  /φυσικοθερ/i,
  /διαγνωσ/i,
  /χειρουργ/i,
];

const QUALIFICATION_PATTERNS = [
  /\bmd\b/i,
  /\bmsc\b/i,
  /\bphd\b/i,
  /\bfrcs\b/i,
  /\bfellow(ship)?\b/i,
  /\bspecialist\b/i,
  /\bconsultant\b/i,
  /\byears? of experience\b/i,
  /δρ\./i,
  /χειρουργ/i,
  /ειδικ/i,
  /εμπειρ/i,
  /καθηγητ/i,
];

const TRUST_PATTERNS = [
  /\btestimonial/i,
  /\breview/i,
  /\baward/i,
  /\bcertif/i,
  /\bassociation\b/i,
  /\bmember\b/i,
  /\biso\b/i,
  /\bbefore and after\b/i,
  /μαρτυρ/i,
  /πιστοποι/i,
  /βραβε/i,
  /συνεργασ/i,
  /μέλος/i,
];

const CTA_PATTERNS = [
  /\bbook\b/i,
  /\bappointment\b/i,
  /\bcall\b/i,
  /\bcontact\b/i,
  /\bconsultation\b/i,
  /\brequest\b/i,
  /\bwhatsapp\b/i,
  /ραντεβ/i,
  /επικοινων/i,
  /καλέστ/i,
  /τηλεφ/i,
  /στείλ/i,
];

const LOCAL_PATTERNS = [
  /\bathens\b/i,
  /\bathina\b/i,
  /αθήνα/i,
  /αθηνα/i,
  /αμπελόκηπ/i,
  /κολωνάκι/i,
  /παγκράτι/i,
  /ψυχικό/i,
  /κηφισ/i,
  /μαρούσ/i,
];

const TRANSPORT_PATTERNS = [/\bmetro\b/i, /\bparking\b/i, /\baccess\b/i, /μετρό/i, /στάθμευ/i, /πρόσβαση/i];

const GENERIC_HEADLINE_PATTERNS = [
  /\bwelcome\b/i,
  /\bhome\b/i,
  /\bmedical services\b/i,
  /\bhealthcare\b/i,
  /\bclinic\b/i,
  /καλωσήρθ/i,
  /ιατρικές υπηρεσίες/i,
];

const INSTITUTION_PATTERNS = [
  /\bhospital\b/i,
  /\bgeneral hospital\b/i,
  /\bchildren'?s hospital\b/i,
  /\bair force\b/i,
  /\barmy\b/i,
  /νοσοκομ/i,
  /στρατιωτικ/i,
];

const CHAIN_PATTERNS = [/\baffidea\b/i, /\beuroclinic\b/i, /\biatriko\b/i, /\bbioclinic\b/i, /\beuromedica\b/i];

type CategoryEvaluation = {
  category: WebsiteGradeCategoryScore;
  weakness?: WebsiteGradeInsight;
  opportunity?: WebsiteGradeInsight;
  strength?: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(clamp(value));
}

function pageList(snapshot?: SiteSnapshot) {
  if (!snapshot) {
    return [] as SitePageSnapshot[];
  }

  return [
    snapshot.canonicalPages.homepage,
    snapshot.canonicalPages.about,
    snapshot.canonicalPages.services,
    snapshot.canonicalPages.contact,
    snapshot.canonicalPages.booking,
    snapshot.canonicalPages.team,
    snapshot.canonicalPages.faq,
  ].filter(Boolean) as SitePageSnapshot[];
}

function joinText(values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function anyMatch(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function greekRatio(value: string) {
  const greek = (value.match(/\p{Script=Greek}/gu) ?? []).length;
  const latin = (value.match(/[A-Za-z]/g) ?? []).length;
  const total = greek + latin;
  return total === 0 ? 0 : greek / total;
}

function countMatches(value: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(value) ? 1 : 0), 0);
}

function firstHeading(page?: SitePageSnapshot) {
  return page?.headings.find((heading) => heading.level === "h1")?.text ?? "";
}

function homepageActionText(homepage?: SitePageSnapshot) {
  if (!homepage) {
    return "";
  }

  return joinText([
    homepage.textContent?.slice(0, 1_000),
    homepage.internalLinks.map((link) => link.label ?? "").join(" "),
    homepage.forms.flatMap((form) => form.submitLabels).join(" "),
  ]);
}

function makeInsight(title: string, detail: string, whyThisMattersCommercially: string): WebsiteGradeInsight {
  return {
    title,
    detail,
    whyThisMattersCommercially,
  };
}

function makeCategoryScore(args: {
  score: number;
  rationale: string;
  whyThisMattersCommercially: string;
}): WebsiteGradeCategoryScore {
  return {
    score: round(args.score),
    rationale: args.rationale,
    whyThisMattersCommercially: args.whyThisMattersCommercially,
  };
}

function assessOfferClarity(args: {
  homepage?: SitePageSnapshot;
  servicesPage?: SitePageSnapshot;
  prospect: DiscoveredProspect;
}): CategoryEvaluation {
  const heading = firstHeading(args.homepage);
  const title = args.homepage?.metadata.title ?? "";
  const homepageText = args.homepage?.textContent ?? "";
  const serviceText = args.servicesPage?.textContent ?? "";
  const score =
    (heading ? 28 : 0) +
    (anyMatch(`${heading} ${title}`, CLINIC_SERVICE_PATTERNS) ? 28 : 0) +
    (args.servicesPage ? 18 : 0) +
    (greekRatio(joinText([heading, homepageText.slice(0, 500), serviceText.slice(0, 500)])) >= 0.2 ? 16 : 0) +
    (title.length > 20 && !anyMatch(heading || title, GENERIC_HEADLINE_PATTERNS) ? 10 : 0);

  const rationale = heading
    ? anyMatch(`${heading} ${title}`, CLINIC_SERVICE_PATTERNS)
      ? "The homepage quickly signals the clinic specialty rather than hiding behind generic medical language."
      : "The homepage has a headline, but it still leans generic and does not crisply state the clinic offer."
    : "The homepage does not give Athens patients a clear specialty statement within the first screen.";

  const why = "Clear offer clarity reduces bounce, improves trust in ads and search, and makes more visitors self-qualify into appointment intent.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 60
        ? makeInsight(
            "Offer is not clear enough in the first 5 seconds",
            "The homepage headline/service framing is too generic or too buried for a patient to immediately understand what this Athens clinic actually offers.",
            why,
          )
        : undefined,
    opportunity:
      score < 70
        ? makeInsight(
            "Lead with a Greek-first specialty headline",
            "A rebuild can open with a precise Greek headline, a short service summary, and an Athens location cue instead of a vague generic hero.",
            "A clearer hero usually improves both organic conversions and owner perception of uplift in the first 30 seconds of a demo.",
          )
        : undefined,
    strength: score >= 75 ? "The clinic offer is understandable without excessive scrolling." : undefined,
  };
}

function assessTrustAndCredibility(args: {
  snapshot?: SiteSnapshot;
  aboutPage?: SitePageSnapshot;
  teamPage?: SitePageSnapshot;
  allText: string;
}): CategoryEvaluation {
  const imageCount = args.snapshot?.imageReferences.length ?? 0;
  const score =
    (args.aboutPage ? 20 : 0) +
    (args.teamPage ? 20 : 0) +
    (anyMatch(args.allText, QUALIFICATION_PATTERNS) ? 22 : 0) +
    (anyMatch(args.allText, TRUST_PATTERNS) ? 16 : 0) +
    (imageCount >= 6 ? 12 : imageCount >= 3 ? 6 : 0) +
    ((args.snapshot?.extractedVisibleElements.addresses.length ?? 0) > 0 ? 10 : 0);

  const rationale =
    score >= 75
      ? "The site exposes meaningful doctor/team credibility signals, qualifications, and enough real-world context to feel medically trustworthy."
      : "Medical credibility is thin or uneven, so a patient has to work too hard to confirm who the doctors are and why they should trust the clinic.";

  const why = "For clinics, visible doctor credibility is a direct conversion lever. Weak trust blocks depress calls, forms, and higher-value consultations.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 65
        ? makeInsight(
            "Doctor trust signals are weaker than they should be",
            "Qualifications, specialties, real team visibility, or trust markers are missing or too scattered across the site.",
            why,
          )
        : undefined,
    opportunity:
      score < 75
        ? makeInsight(
            "Add a trust-heavy doctor proof section",
            "A demo can showcase doctor bios, qualifications, specialties, clinic story, real photos, and trust markers in a single focused credibility block.",
            "Clinic owners respond quickly when the demo makes their expertise feel easier to trust than the current site does.",
          )
        : undefined,
    strength: score >= 70 ? "The site already exposes some meaningful trust signals." : undefined,
  };
}

function assessConversionReadiness(args: {
  snapshot?: SiteSnapshot;
  homepage?: SitePageSnapshot;
  contactPage?: SitePageSnapshot;
  bookingPage?: SitePageSnapshot;
}): CategoryEvaluation {
  const actionText = homepageActionText(args.homepage);
  const phoneVisible = (args.snapshot?.extractedVisibleElements.phones.length ?? 0) > 0;
  const formCount = args.snapshot?.extractedVisibleElements.forms.length ?? 0;
  const contactSignals =
    (args.contactPage ? 24 : 0) +
    (args.bookingPage ? 24 : 0) +
    (phoneVisible ? 16 : 0) +
    (formCount > 0 ? 14 : 0) +
    (anyMatch(actionText, CTA_PATTERNS) ? 22 : 0);

  const rationale =
    contactSignals >= 75
      ? "A patient can see and reach a conversion path quickly, with visible CTAs and an obvious appointment/contact route."
      : "Calls to action, contact paths, or appointment flows are not prominent enough to convert anxious clinic visitors efficiently.";

  const why = "Athens clinic traffic is high intent. If a patient cannot quickly call, book, or ask a question, the lead often leaks to the next clinic.";

  return {
    category: makeCategoryScore({
      score: contactSignals,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      contactSignals < 65
        ? makeInsight(
            "The site is not conversion-first",
            "Above-the-fold CTAs, visible phone access, and an obvious appointment path are too weak or inconsistent.",
            why,
          )
        : undefined,
    opportunity:
      contactSignals < 75
        ? makeInsight(
            "Push one clear primary conversion action",
            "A demo can use sticky mobile CTAs, one primary appointment action, and a faster question flow instead of making users hunt for contact paths.",
            "This is usually the most legible commercial uplift for a clinic owner viewing a demo preview.",
          )
        : undefined,
    strength: contactSignals >= 80 ? "The site already exposes a credible conversion path." : undefined,
  };
}

function assessMobileUx(args: {
  homepage?: SitePageSnapshot;
  snapshot?: SiteSnapshot;
}): CategoryEvaluation {
  const homepageText = args.homepage?.textContent ?? "";
  const wordCount = homepageText.slice(0, 900).split(/\s+/).filter(Boolean).length;
  const headingCount = args.homepage?.headings.length ?? 0;
  const navLinkCount = args.homepage?.internalLinks.length ?? 0;
  const screenshotReady = Boolean(args.homepage?.screenshotPath);
  const contactSignals = countMatches(homepageActionText(args.homepage), CTA_PATTERNS);

  const score =
    (screenshotReady ? 18 : 0) +
    (wordCount >= 30 && wordCount <= 140 ? 24 : wordCount <= 180 ? 14 : 4) +
    (headingCount >= 2 && headingCount <= 10 ? 18 : 8) +
    (navLinkCount <= 20 ? 16 : navLinkCount <= 30 ? 10 : 2) +
    (contactSignals > 0 ? 24 : 6);

  const rationale =
    score >= 70
      ? "The site is at least reasonably scan-friendly on mobile, with tolerable density and visible action points."
      : "The mobile experience likely feels text-heavy, cluttered, or low-action, which is a problem for phone-first clinic traffic.";

  const why = "A large share of local clinic traffic is mobile. If the page feels dense or non-actionable on a phone, conversions drop immediately.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 60
        ? makeInsight(
            "Mobile visitors are probably not getting a clean path to act",
            "The homepage appears too dense or too low-action for phone-first clinic browsing.",
            why,
          )
        : undefined,
    opportunity:
      score < 70
        ? makeInsight(
            "Design for thumb-first mobile action",
            "A demo can tighten the hero, enlarge CTA prominence, and reduce cognitive load so Greek patients can call or book without friction.",
            "This kind of visible mobile cleanup makes the demo feel instantly better than the current site.",
          )
        : undefined,
    strength: score >= 75 ? "The site does not look obviously overloaded for mobile users." : undefined,
  };
}

function assessBookingFriction(args: {
  snapshot?: SiteSnapshot;
  homepage?: SitePageSnapshot;
  contactPage?: SitePageSnapshot;
  bookingPage?: SitePageSnapshot;
}): CategoryEvaluation {
  const homepageSignals = homepageActionText(args.homepage);
  const hasDirectHomepageAction =
    anyMatch(homepageSignals, CTA_PATTERNS) &&
    ((args.snapshot?.extractedVisibleElements.phones.length ?? 0) > 0 || (args.snapshot?.extractedVisibleElements.forms.length ?? 0) > 0);

  let score = 20;
  if (hasDirectHomepageAction) {
    score += 40;
  }
  if (args.contactPage) {
    score += 18;
  }
  if (args.bookingPage) {
    score += 18;
  }
  if ((args.snapshot?.extractedVisibleElements.forms.length ?? 0) > 0) {
    score += 12;
  }

  const rationale =
    score >= 75
      ? "The contact path is short enough that a patient can move from interest to action without unnecessary friction."
      : "Patients likely need too many steps to reach a real person, ask a question, or request an appointment.";

  const why = "Every extra step between interest and contact increases drop-off, especially for urgent or comparison-shopping clinic traffic.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 65
        ? makeInsight(
            "Booking/contact friction is still too high",
            "The path to call, message, or request an appointment is buried or indirect.",
            why,
          )
        : undefined,
    opportunity:
      score < 75
        ? makeInsight(
            "Shorten the path from landing to appointment intent",
            "A demo can expose click-to-call, instant inquiry, and one-step appointment actions without forcing extra navigation.",
            "Lower friction typically produces the clearest near-term lift in clinic lead generation.",
          )
        : undefined,
    strength: score >= 80 ? "The path from visit to inquiry is reasonably short." : undefined,
  };
}

function assessLocalProof(args: {
  snapshot?: SiteSnapshot;
  allText: string;
}): CategoryEvaluation {
  const addressCount = args.snapshot?.extractedVisibleElements.addresses.length ?? 0;
  const localMentions = countMatches(args.allText, LOCAL_PATTERNS);
  const transportMentions = countMatches(args.allText, TRANSPORT_PATTERNS);
  const contactPage = Boolean(args.snapshot?.canonicalPages.contact);
  const score = (addressCount > 0 ? 35 : 0) + (localMentions > 0 ? 30 : 0) + (contactPage ? 20 : 0) + Math.min(15, transportMentions * 5);

  const rationale =
    score >= 70
      ? "The site gives Athens patients enough location proof to understand where the clinic is and why it is locally relevant."
      : "Athens-specific location proof is weak, so the site does not fully reassure local patients about where the clinic is or how accessible it feels.";

  const why = "Local proof helps convert searchers who are comparing nearby clinics and need fast reassurance about location and convenience.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 60
        ? makeInsight(
            "The site underuses Athens-local proof",
            "Address, neighborhood relevance, and convenience cues are weaker than they should be for local patient conversion.",
            why,
          )
        : undefined,
    opportunity:
      score < 70
        ? makeInsight(
            "Make the Athens location feel real and convenient",
            "A demo can add a stronger Athens address block, map/location proof, and neighborhood/service-area cues above the fold.",
            "That makes the offer feel more local and easier to trust for nearby patients.",
          )
        : undefined,
    strength: score >= 70 ? "The site does include usable local proof for Athens visitors." : undefined,
  };
}

function assessGreekFirstUsability(args: {
  snapshot?: SiteSnapshot;
  homepage?: SitePageSnapshot;
  pages: SitePageSnapshot[];
}): CategoryEvaluation {
  const combinedKeyText = joinText([
    args.homepage?.textContent?.slice(0, 1_000),
    args.pages.map((page) => page.internalLinks.map((link) => link.label ?? "").join(" ")).join(" "),
  ]);
  const ratio = greekRatio(combinedKeyText);
  const englishPaths = args.pages.filter((page) => /\/en\b/i.test(page.finalUrl)).length;
  const greekPathDefault = args.homepage ? !/\/en\b/i.test(args.homepage.finalUrl) : false;
  const greekCtas = countMatches(combinedKeyText, [/ραντεβ/i, /επικοινων/i, /καλέστ/i, /υπηρεσ/i, /γιατρ/i]);
  const score =
    (ratio >= 0.45 ? 38 : ratio >= 0.25 ? 26 : ratio >= 0.1 ? 14 : 4) +
    (greekCtas > 0 ? 22 : 0) +
    (greekPathDefault ? 16 : 0) +
    (englishPaths > 0 && greekPathDefault ? 12 : 0) +
    (ratio >= 0.2 || englishPaths > 0 ? 10 : 0);

  const rationale =
    score >= 70
      ? "The language handling feels Greek-first enough for the local clinic market, with bilingual support rather than awkward English leakage."
      : "Greek-first usability is weak or uneven, so local patients may see awkward language mixing or unclear Greek CTAs/navigation.";

  const why = "Greek-native copy and CTAs lift comprehension and trust for Athens patients, especially in high-consideration medical decisions.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 60
        ? makeInsight(
            "Greek-first usability is weaker than the Athens market expects",
            "The site reads too English-heavy, mixed, or confusing for Greek-speaking patients.",
            why,
          )
        : undefined,
    opportunity:
      score < 70
        ? makeInsight(
            "Use cleaner Greek-first navigation and CTAs",
            "A demo can make the Greek experience feel native, readable, and conversion-oriented while still supporting English where needed.",
            "This is a concrete local-market advantage over generic international clinic templates.",
          )
        : undefined,
    strength: score >= 75 ? "The site feels reasonably aligned with Greek-first usage." : undefined,
  };
}

function assessSeoBasics(args: {
  snapshot?: SiteSnapshot;
  homepage?: SitePageSnapshot;
  servicesPage?: SitePageSnapshot;
}): CategoryEvaluation {
  const title = args.homepage?.metadata.title ?? "";
  const metaDescription = args.homepage?.metadata.metaDescription ?? "";
  const h1 = firstHeading(args.homepage);
  const localTitle = anyMatch(`${title} ${h1} ${metaDescription}`, LOCAL_PATTERNS);
  const serviceClarity = anyMatch(`${title} ${h1} ${args.servicesPage?.textContent ?? ""}`, CLINIC_SERVICE_PATTERNS);
  const score =
    (title ? 20 : 0) +
    (h1 ? 20 : 0) +
    (metaDescription ? 14 : 0) +
    (serviceClarity ? 22 : 0) +
    (localTitle ? 14 : 0) +
    (args.servicesPage ? 10 : 0);

  const rationale =
    score >= 70
      ? "The site covers the main SEO basics: title, H1, service intent, and enough local relevance to support clinic discovery."
      : "SEO basics are uneven, so the clinic is probably leaving local search clarity and service-page relevance on the table.";

  const why = "Local clinic SEO only works when service intent and Athens relevance are explicit. Weak basics waste both search traffic and paid clicks.";

  return {
    category: makeCategoryScore({
      score,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      score < 60
        ? makeInsight(
            "SEO basics are underpowered for Athens clinic discovery",
            "Title/H1/service structure/local relevance are not strong enough to support local search and landing-page conversion.",
            why,
          )
        : undefined,
    opportunity:
      score < 70
        ? makeInsight(
            "Create stronger local service-page structure",
            "A demo can show cleaner titles, Greek H1s, service modules, and Athens relevance that read better to both users and search engines.",
            "That gives the owner an easy before/after comparison against the current site.",
          )
        : undefined,
    strength: score >= 75 ? "The site already covers several important SEO basics." : undefined,
  };
}

function prospectFitScore(prospect: DiscoveredProspect, snapshot?: SiteSnapshot) {
  const seedText = joinText([
    prospect.businessName,
    prospect.category,
    prospect.address,
    snapshot?.metadata.title,
    snapshot?.canonicalPages.homepage?.metadata.metaDescription,
  ]);
  let score = anyMatch(seedText, CLINIC_SERVICE_PATTERNS) ? 75 : 55;

  if (anyMatch(seedText, APPOINTMENT_PATTERNS)) {
    score += 10;
  }

  if (anyMatch(seedText, INSTITUTION_PATTERNS)) {
    score -= 45;
  }

  if (anyMatch(seedText, CHAIN_PATTERNS)) {
    score -= 20;
  }

  if (snapshot?.canonicalPages.contact || snapshot?.canonicalPages.booking) {
    score += 8;
  }

  return clamp(score);
}

function evaluateDemoWorthiness(args: {
  prospect: DiscoveredProspect;
  siteQualityScore: number;
  fitScore: number;
  weaknessCount: number;
}): CategoryEvaluation {
  const opportunityScore = round((100 - args.siteQualityScore) * 0.65 + args.fitScore * 0.35 + args.weaknessCount * 4);
  const rationale =
    opportunityScore >= 75
      ? "This looks like a commercially viable demo target: the clinic fit is real and the current site leaves visible room for a faster, more persuasive rebuild."
      : "The upside is limited because either the site is already competent, the business looks too institutional, or the weaknesses are not sharp enough for a convincing before/after demo.";
  const why = "The demo should only be generated when a clinic owner can feel obvious uplift in trust, clarity, and contact flow within a 30-second review.";

  return {
    category: makeCategoryScore({
      score: opportunityScore,
      rationale,
      whyThisMattersCommercially: why,
    }),
    weakness:
      opportunityScore < 70
        ? makeInsight(
            "Demo upside is not strong enough",
            "Either the clinic is not a strong SMB-style fit or the current site is not weak enough to make a demo feel dramatically better.",
            why,
          )
        : undefined,
    opportunity:
      opportunityScore >= 70
        ? makeInsight(
            "Generate a clearly superior demo preview",
            "The clinic fit and the visible website weaknesses are strong enough that a conversion-first demo should feel meaningfully better very quickly.",
            "This is the exact profile where demo generation has the highest chance of getting owner attention.",
          )
        : undefined,
    strength: opportunityScore >= 75 ? "The lead looks commercially demo-worthy." : undefined,
  };
}

export function gradeAthensClinicWebsite(args: {
  prospect: DiscoveredProspect;
  snapshot?: SiteSnapshot;
  crawlStatus?: "success" | "not_available" | "blocked";
  blockedReason?: string;
}): Omit<WebsiteGrade, "provenance"> {
  const snapshot = args.snapshot;
  const pages = pageList(snapshot);
  const homepage = snapshot?.canonicalPages.homepage;
  const aboutPage = snapshot?.canonicalPages.about;
  const servicesPage = snapshot?.canonicalPages.services;
  const contactPage = snapshot?.canonicalPages.contact;
  const bookingPage = snapshot?.canonicalPages.booking;
  const teamPage = snapshot?.canonicalPages.team;
  const allText = joinText([
    args.prospect.businessName,
    args.prospect.category,
    ...pages.map((page) => page.textContent),
  ]);

  const fitScore = prospectFitScore(args.prospect, snapshot);

  if (!snapshot || pages.length === 0 || args.crawlStatus !== "success") {
    const missingSite = args.crawlStatus !== "success";
    const offer = makeCategoryScore({
      score: 0,
      rationale: "No usable site content was available, so there is no existing digital offer to judge.",
      whyThisMattersCommercially: "When there is no usable current site, even a basic clinic demo can create obvious uplift in clarity and lead capture.",
    });
    const weakCategory = makeCategoryScore({
      score: 0,
      rationale: "The current web presence could not be verified, so all conversion-facing signals are effectively absent.",
      whyThisMattersCommercially: "Absent or unusable web journeys make it much easier for competitors to win appointment demand.",
    });
    const demoWorthiness = evaluateDemoWorthiness({
      prospect: args.prospect,
      siteQualityScore: 0,
      fitScore,
      weaknessCount: 5,
    });
    const demoOpportunityGate = fitScore >= 65 && !anyMatch(args.prospect.businessName, INSTITUTION_PATTERNS);

    return {
      overallScore: 0,
      gradeBand: "missing",
      conversionReadinessScore: 0,
      bookingReadinessScore: 0,
      demoOpportunityScore: demoWorthiness.category.score,
      demoOpportunityGate,
      categoryScores: {
        offerClarity: offer,
        trustAndMedicalCredibility: weakCategory,
        conversionReadiness: weakCategory,
        mobileUxHeuristics: weakCategory,
        bookingContactFriction: weakCategory,
        localProofForAthens: weakCategory,
        greekFirstUsability: weakCategory,
        seoBasics: weakCategory,
        overallDemoWorthiness: demoWorthiness.category,
      },
      plainEnglishDiagnosis: missingSite
        ? `The clinic has no usable verified website experience to review${args.blockedReason ? ` because ${args.blockedReason}` : ""}. A focused demo would likely feel substantially better immediately.`
        : "The current site snapshot is missing, which leaves the clinic with no credible conversion experience to benchmark against.",
      operatorSummary: demoOpportunityGate
        ? "Worth generating: the clinic fit is good and the lack of a usable site creates obvious demo upside."
        : "Not worth generating automatically: the web presence is missing, but the lead looks too institutional or low-fit for an SMB-style demo.",
      topWeaknesses: [
        makeInsight(
          "No credible current website journey",
          "There is no verified site experience strong enough to support trust, conversion, or appointment capture.",
          "This creates immediate commercial leakage and makes the before/after demo contrast very visible.",
        ),
        makeInsight(
          "No conversion-first contact path",
          "Patients do not have a trustworthy website journey for booking, calling, or asking a question.",
          "High-intent clinic traffic drops quickly when there is no obvious next step.",
        ),
        makeInsight(
          "No Greek-first web messaging",
          "Without a usable site, there is no strong Greek-first offer or local trust framing for Athens visitors.",
          "Local language alignment directly affects trust and inquiry rates.",
        ),
        makeInsight(
          "No local trust proof on-site",
          "Athens patients cannot verify the clinic through a proper trust-oriented website experience.",
          "Trust gaps are costly in medical categories where hesitation is high.",
        ),
        makeInsight(
          "No SEO landing experience",
          "The clinic is missing a site structure that can support local service discovery.",
          "That limits both search visibility and the conversion value of any traffic the clinic already earns.",
        ),
      ],
      topDemoImprovementOpportunities: [
        makeInsight(
          "Launch a Greek-first conversion page",
          "The demo can immediately show a clear specialty headline, Athens location proof, and one obvious appointment action.",
          "This is the fastest way to make the owner feel visible uplift.",
        ),
        makeInsight(
          "Add a doctor trust block and contact CTA",
          "A short clinic story, doctor credibility, and immediate call/booking actions would outperform a missing site instantly.",
          "This makes the demo feel commercially concrete, not cosmetic.",
        ),
        makeInsight(
          "Create a local search-ready clinic structure",
          "A demo can include service sections, a contact page, and Athens-local SEO fundamentals from day one.",
          "That shows both lead-gen value and long-term discoverability.",
        ),
      ],
      issues: [
        "No usable website was available to grade.",
        "There is no clear patient-facing conversion journey.",
        "Athens-local trust and language cues are effectively absent online.",
      ],
      strengths: demoOpportunityGate ? ["The clinic still looks like an appointment-led prospect."] : [],
      confidence: 0.78,
    };
  }

  const offer = assessOfferClarity({
    homepage,
    servicesPage,
    prospect: args.prospect,
  });
  const trust = assessTrustAndCredibility({
    snapshot,
    aboutPage,
    teamPage,
    allText,
  });
  const conversion = assessConversionReadiness({
    snapshot,
    homepage,
    contactPage,
    bookingPage,
  });
  const mobile = assessMobileUx({
    homepage,
    snapshot,
  });
  const friction = assessBookingFriction({
    snapshot,
    homepage,
    contactPage,
    bookingPage,
  });
  const localProof = assessLocalProof({
    snapshot,
    allText,
  });
  const greekFirst = assessGreekFirstUsability({
    snapshot,
    homepage,
    pages,
  });
  const seo = assessSeoBasics({
    snapshot,
    homepage,
    servicesPage,
  });

  const siteQualityScore = round(
    offer.category.score * 0.15 +
      trust.category.score * 0.18 +
      conversion.category.score * 0.17 +
      mobile.category.score * 0.1 +
      friction.category.score * 0.15 +
      localProof.category.score * 0.08 +
      greekFirst.category.score * 0.08 +
      seo.category.score * 0.09,
  );

  const weaknessPool = [
    offer.weakness,
    trust.weakness,
    conversion.weakness,
    mobile.weakness,
    friction.weakness,
    localProof.weakness,
    greekFirst.weakness,
    seo.weakness,
  ].filter(Boolean) as WebsiteGradeInsight[];
  const opportunityPool = [
    conversion.opportunity,
    friction.opportunity,
    trust.opportunity,
    offer.opportunity,
    greekFirst.opportunity,
    localProof.opportunity,
    seo.opportunity,
    mobile.opportunity,
  ].filter(Boolean) as WebsiteGradeInsight[];

  const demoWorthiness = evaluateDemoWorthiness({
    prospect: args.prospect,
    siteQualityScore,
    fitScore,
    weaknessCount: weaknessPool.length,
  });

  const strongModernSite =
    siteQualityScore >= 78 &&
    conversion.category.score >= 72 &&
    trust.category.score >= 70 &&
    mobile.category.score >= 65 &&
    friction.category.score >= 70;

  const demoOpportunityGate =
    fitScore >= 65 &&
    demoWorthiness.category.score >= 65 &&
    !strongModernSite &&
    weaknessPool.length >= 2 &&
    !anyMatch(args.prospect.businessName, INSTITUTION_PATTERNS);

  const topWeaknesses = (weaknessPool.length > 0
    ? weaknessPool
    : [
        makeInsight(
          "The site is not weak enough to justify a rebuild demo",
          "The current clinic website is already covering the main trust and conversion basics well enough that a generated demo would not feel dramatically better fast enough.",
          "Avoiding low-upside demos protects operator time and preserves outreach quality.",
        ),
      ]
  ).slice(0, 5);

  const topDemoImprovementOpportunities = (opportunityPool.length > 0
    ? opportunityPool
    : [
        makeInsight(
          "Only pursue targeted incremental improvements",
          "The current site looks competent enough that only narrow UX or SEO improvements appear worthwhile.",
          "A full demo rebuild is less likely to feel compelling to the owner.",
        ),
      ]
  ).slice(0, 3);

  const strengths = [
    offer.strength,
    trust.strength,
    conversion.strength,
    mobile.strength,
    friction.strength,
    localProof.strength,
    greekFirst.strength,
    seo.strength,
    demoWorthiness.strength,
  ].filter(Boolean) as string[];

  const issues = topWeaknesses.map((weakness) => `${weakness.title}: ${weakness.detail}`);
  const gradeBand =
    siteQualityScore >= 80 ? "excellent" : siteQualityScore >= 60 ? "healthy" : siteQualityScore >= 30 ? "weak" : "missing";

  const primaryGaps = topWeaknesses.slice(0, 2).map((weakness) => weakness.title.toLowerCase());
  const plainEnglishDiagnosis = demoOpportunityGate
    ? `This Athens clinic is a solid demo target because the fit is real and the current site still leaves clear upside in ${primaryGaps.join(" and ")}. A rebuild could feel noticeably stronger to the owner very quickly.`
    : strongModernSite
      ? "This clinic site already covers the main trust and conversion fundamentals well enough that a generated demo is unlikely to feel clearly superior in the first 30 seconds."
      : `This lead is not a strong demo target right now because the fit or uplift case is weaker than needed, even though the site still has some issues around ${primaryGaps.join(" and ")}.`;

  const operatorSummary = demoOpportunityGate
    ? `Generate demo: strong Athens clinic fit with visible commercial upside. Demo opportunity ${demoWorthiness.category.score}/100.`
    : `Skip for now: demo uplift is not obvious enough or the lead looks too institutional. Demo opportunity ${demoWorthiness.category.score}/100.`;

  const confidence = round(60 + pages.length * 5 + (snapshot.crawlReport.screenshotStatus === "captured" ? 10 : 0)) / 100;

  return {
    overallScore: siteQualityScore,
    gradeBand,
    conversionReadinessScore: conversion.category.score,
    bookingReadinessScore: friction.category.score,
    demoOpportunityScore: demoWorthiness.category.score,
    demoOpportunityGate,
    categoryScores: {
      offerClarity: offer.category,
      trustAndMedicalCredibility: trust.category,
      conversionReadiness: conversion.category,
      mobileUxHeuristics: mobile.category,
      bookingContactFriction: friction.category,
      localProofForAthens: localProof.category,
      greekFirstUsability: greekFirst.category,
      seoBasics: seo.category,
      overallDemoWorthiness: demoWorthiness.category,
    },
    plainEnglishDiagnosis,
    operatorSummary,
    topWeaknesses,
    topDemoImprovementOpportunities,
    issues,
    strengths: strengths.slice(0, 5),
    confidence: clamp(confidence, 0, 0.98),
  };
}
