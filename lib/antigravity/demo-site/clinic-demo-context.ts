import type {
  ContactValidation,
  CurrentSiteScreenshot,
  DemoLandingPage,
  DemoLandingPageMediaItem,
  DiscoveredProspect,
  ExtractedFact,
  KnowledgePack,
  SiteImageReference,
  SitePageSnapshot,
  StructuredClinicField,
  StructuredFieldStatus,
  WebsiteCrawlResult,
} from "@/lib/antigravity/schemas";

const DEFAULT_RENDER_THRESHOLD = 0.72;
const STRONG_CONTACT_THRESHOLD = 0.84;
const STRONG_LOCATION_THRESHOLD = 0.84;
const GENERIC_CLINIC_NAME_PATTERNS = /^(home|homepage|index|landing page|αρχική|αρχικη)$/i;
const NON_DISPLAY_IMAGE_PATTERNS = /(logo|icon|flag|badge|favicon|sprite|placeholder|blank|avatar|thumbnail)/i;
const GENERIC_MEDIA_TEXT_PATTERNS = /^(image|open graph image|photo|clinic image|verified clinic image|slide)$/i;
const IMAGE_FORMAT_PATTERNS = /\.(jpe?g|png|webp|avif)(\?|$)/i;
const INSTITUTION_PATTERNS = /(university|medical school|college|board|clinic foundation|institute|fellowship|lecture|λέκτορας|κλινικός λέκτορας)/i;
const NON_SERVICE_PATTERNS =
  /(βιογραφ|curriculum|doctor|dr\.|md\b|abo\b|χειρουργός|fellowship|university|medical school|board|internship|lecturer|foundation)/i;
const GENERIC_SERVICE_PATTERNS =
  /^(services?|our services|all treatments|(?:οι\s+)?υπηρεσίες(?: μας)?|όλες οι θεραπείες μας|αρχική|home|contact|επικοινωνία|book(?:ing)?|appointment|ραντεβού|talk to us|μιλήστε μας|synovus|η ομάδα μας|ομάδα μας|team|ιατροί|doctors?|βιογραφ(?:ικό|y)?|awards|βραβεία|publications|presentations|παρουσιάσεις(?:\s*[–-]\s*δημοσιεύσεις)?|δημοσιεύσεις|cv|clinic athens|ιστορία|φιλοσοφία|η φιλοσοφία μας|όραμα(?:\s*&\s*στόχοι)?|στόχοι|λένε για(?: τον οφθαλμίατρο)?|τμήματα|articles|άρθρα)$/i;
const ADDRESS_NOISE_PATTERNS = /(privacy|cookies|all rights reserved|powered|impressum|mailto:|https?:\/\/|www\.|@)/i;
const EMAIL_TOKEN_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function fieldValueToText(value: StructuredClinicField["value"]) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    if ("displayText" in value && typeof value.displayText === "string") {
      return value.displayText.trim() || undefined;
    }

    if ("question" in value && typeof value.question === "string") {
      const answer = "answer" in value && typeof value.answer === "string" ? value.answer.trim() : "";
      return answer ? `${value.question.trim()} ${answer}`.trim() : value.question.trim();
    }
  }

  return undefined;
}

function fieldText(field: StructuredClinicField, minimumConfidence = DEFAULT_RENDER_THRESHOLD, allowedStatuses?: StructuredFieldStatus[]) {
  if (field.status === "unresolved" || field.confidence < minimumConfidence) {
    return undefined;
  }

  if (allowedStatuses && !allowedStatuses.includes(field.status)) {
    return undefined;
  }

  return fieldValueToText(field.value);
}

function fieldTexts(
  fields: StructuredClinicField[],
  minimumConfidence = DEFAULT_RENDER_THRESHOLD,
  allowedStatuses?: StructuredFieldStatus[],
) {
  return uniqueStrings(
    fields
      .map((field) => fieldText(field, minimumConfidence, allowedStatuses))
      .filter(Boolean) as string[],
  );
}

function factValueToText(value: ExtractedFact["value"]) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function factText(fact?: ExtractedFact) {
  return fact ? factValueToText(fact.value) : undefined;
}

function factTexts(facts: ExtractedFact[]) {
  return uniqueStrings(facts.map((fact) => factText(fact)).filter(Boolean) as string[]);
}

function looksGenericClinicName(value?: string) {
  if (!value) {
    return true;
  }

  return GENERIC_CLINIC_NAME_PATTERNS.test(value.trim()) || value.trim().length < 3;
}

function sanitizeText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[-–|:]+/, "")
    .replace(/\s+[|:-]\s+/g, " ")
    .trim();
}

function normalizeComparableUrl(value?: string) {
  return value ? value.replace(/\/+$/, "") : undefined;
}

function looksSlugLikeText(value: string) {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+){2,}$/i.test(value);
}

function stripImageFileDecorations(value: string) {
  return value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-\d+x\d+$/i, "")
    .replace(/-scaled$/i, "")
    .replace(/-copy$/i, "");
}

function humanizeImageStem(url: string) {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const fileName = pathname.split("/").pop() ?? pathname;
    const stem = stripImageFileDecorations(fileName)
      .replace(/^img[-_]?/i, "")
      .replace(/^image[-_]?/i, "")
      .replace(/^photo[-_]?/i, "")
      .replace(/[-_]+/g, " ");
    const normalized = sanitizeText(stem);

    if (!normalized || normalized.length < 4 || /^\d[\d\s/-]*$/.test(normalized) || GENERIC_MEDIA_TEXT_PATTERNS.test(normalized)) {
      return undefined;
    }

    return normalized;
  } catch {
    return undefined;
  }
}

function normalizedImageKey(url: string) {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname).toLowerCase();
    const fileName = pathname.split("/").pop() ?? pathname;
    return stripImageFileDecorations(fileName)
      .replace(/[-_]+/g, "-")
      .replace(/^copy-/, "");
  } catch {
    return url.toLowerCase();
  }
}

function sanitizeAddressCandidate(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = sanitizeText(value);
  if (!normalized || normalized.length < 10 || normalized.length > 120) {
    return undefined;
  }

  if (ADDRESS_NOISE_PATTERNS.test(normalized)) {
    return undefined;
  }

  const phoneMatches = normalized.match(/\+?\d[\d\s()-]{7,}\d/g) ?? [];
  if (phoneMatches.length > 0) {
    return undefined;
  }

  return normalized;
}

function normalizeEmailCandidate(raw: string) {
  const match = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!match) {
    return undefined;
  }

  const token = match[0].toLowerCase();
  const [rawLocal = "", rawDomain = ""] = token.split("@");
  if (!rawLocal || !rawDomain) {
    return undefined;
  }

  const local = rawLocal.replace(/^\d{3,}(info|contact|hello|office|admin|reception|booking|bookings|appointments?)$/i, "$1");
  if (/^\d{5,}/.test(local)) {
    return undefined;
  }

  return `${local}@${rawDomain}`;
}

function collectEmailCandidates(values: Array<string | undefined>) {
  const emails: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const matches = value.match(EMAIL_TOKEN_REGEX) ?? [];
    if (matches.length === 0) {
      const normalized = normalizeEmailCandidate(value);
      if (normalized) {
        emails.push(normalized);
      }
      continue;
    }

    for (const match of matches) {
      const normalized = normalizeEmailCandidate(match);
      if (normalized) {
        emails.push(normalized);
      }
    }
  }

  return uniqueStrings(emails);
}

function descriptivePageHeading(page?: SitePageSnapshot) {
  if (!page) {
    return undefined;
  }

  const headings = page.headings
    .map((heading) => sanitizeText(heading.text))
    .filter((heading) => heading && !looksGenericClinicName(heading) && !GENERIC_SERVICE_PATTERNS.test(heading));

  return headings.find((heading) => heading.length >= 6 && heading.length <= 48);
}

function sanitizePersonLabel(value: string) {
  return sanitizeText(value.replace(/^βιογραφικό\s*-\s*/i, "").replace(/^biography\s*-\s*/i, ""));
}

function looksLikeInstitution(value: string) {
  return INSTITUTION_PATTERNS.test(value);
}

function looksLikeServiceLabel(value: string, blockedNames: string[]) {
  const normalized = sanitizeText(value);

  if (!normalized || normalized.length < 4 || looksGenericClinicName(normalized)) {
    return false;
  }

  if (normalized.length > 52 || normalized.split(/\s+/).length > 6 || GENERIC_SERVICE_PATTERNS.test(normalized)) {
    return false;
  }

  if (NON_SERVICE_PATTERNS.test(normalized)) {
    return false;
  }

  return !blockedNames.some((name) => {
    const lowered = name.toLowerCase();
    const candidate = normalized.toLowerCase();
    return candidate.includes(lowered) || lowered.includes(candidate);
  });
}

function usefulAltText(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = sanitizeText(value);
  if (
    !normalized ||
    NON_DISPLAY_IMAGE_PATTERNS.test(normalized) ||
    GENERIC_MEDIA_TEXT_PATTERNS.test(normalized) ||
    looksSlugLikeText(normalized) ||
    /\(\d+\)$/.test(normalized) ||
    /^[a-z]{4,}$/i.test(normalized)
  ) {
    return undefined;
  }

  return normalized;
}

function imageLooksRenderable(url: string, alt?: string) {
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }

  if (!IMAGE_FORMAT_PATTERNS.test(url)) {
    return false;
  }

  return !NON_DISPLAY_IMAGE_PATTERNS.test(`${url} ${alt ?? ""}`);
}

function inferMediaEmphasis(image: { url: string; alt?: string; sourcePageType?: SitePageSnapshot["pageType"] }): DemoLandingPageMediaItem["emphasis"] {
  const haystack = `${image.url} ${image.alt ?? ""}`.toLowerCase();

  if (image.sourcePageType === "team") {
    return "team";
  }

  if (/(doctor|portrait|bio|βιογραφ|ιατρ|χειρουργ)/i.test(haystack) || image.sourcePageType === "about") {
    return "portrait";
  }

  if (image.sourcePageType === "services" || /(service|treatment|laser|implant|ortho|retina|δόντι|γόνατο|ώμο)/i.test(haystack)) {
    return "service";
  }

  return "clinic";
}

function pageLabel(pageType: CurrentSiteScreenshot["pageType"]) {
  switch (pageType) {
    case "about":
      return "About";
    case "services":
      return "Services";
    case "contact":
      return "Contact";
    case "booking":
      return "Booking";
    case "team":
      return "Team";
    case "faq":
      return "FAQ";
    default:
      return "Homepage";
  }
}

function mediaCaption(args: {
  url: string;
  alt?: string;
  pageType?: SitePageSnapshot["pageType"];
  sourcePage?: SitePageSnapshot;
  clinicName: string;
}) {
  const alt = usefulAltText(args.alt);

  if (alt) {
    return alt;
  }

  if (args.pageType === "about" || args.pageType === "team") {
    return args.pageType === "team" ? "Πορτρέτο ιατρικής ομάδας" : "Εικόνα χώρου και αξιοπιστίας κλινικής";
  }

  const imageStem = humanizeImageStem(args.url);
  if (imageStem) {
    return imageStem;
  }

  const pageHeading = descriptivePageHeading(args.sourcePage);
  if (pageHeading) {
    return pageHeading;
  }

  switch (args.pageType) {
    case "services":
      return `${args.clinicName} treatment or services visual`;
    case "contact":
      return `${args.clinicName} contact or location visual`;
    default:
      return `${args.clinicName} clinic visual`;
  }
}

function mediaScore(image: SiteImageReference) {
  let score = 0;

  if (image.confidence >= 0.9) {
    score += 4;
  }

  switch (image.pageType) {
    case "about":
    case "team":
      score += 5;
      break;
    case "services":
      score += 4;
      break;
    case "homepage":
      score += 3;
      break;
    case "contact":
      score += 2;
      break;
    default:
      score += 1;
  }

  if (usefulAltText(image.alt)) {
    score += 2;
  }

  if (/open graph/i.test(image.alt ?? "")) {
    score -= 3;
  }

  if (/smush-webp|-\d+x\d+\./i.test(image.url)) {
    score -= 2;
  }

  return score;
}

function crawlServiceCandidates(args: {
  crawl?: WebsiteCrawlResult;
  blockedNames: string[];
}) {
  const candidates: string[] = [];

  for (const page of compact([
    args.crawl?.siteSnapshot?.canonicalPages.services,
    args.crawl?.siteSnapshot?.canonicalPages.booking,
  ])) {
    for (const heading of page.headings) {
      candidates.push(heading.text);
    }

    for (const link of page.internalLinks) {
      if (link.label) {
        candidates.push(link.label);
      }
    }
  }

  for (const page of compact([
    args.crawl?.siteSnapshot?.canonicalPages.homepage,
    args.crawl?.siteSnapshot?.canonicalPages.contact,
  ])) {
    for (const link of page.internalLinks) {
      if (link.label) {
        candidates.push(link.label);
      }
    }
  }

  return uniqueStrings(
    candidates
      .map((value) => sanitizeText(value))
      .filter((value) => looksLikeServiceLabel(value, args.blockedNames)),
  );
}

function buildMediaGallery(args: {
  clinicName: string;
  extraction: KnowledgePack["structuredJson"];
  crawl?: WebsiteCrawlResult;
}) {
  const seen = new Set<string>();
  const pages = compact([
    args.crawl?.siteSnapshot?.canonicalPages.homepage,
    args.crawl?.siteSnapshot?.canonicalPages.about,
    args.crawl?.siteSnapshot?.canonicalPages.services,
    args.crawl?.siteSnapshot?.canonicalPages.contact,
    args.crawl?.siteSnapshot?.canonicalPages.booking,
    args.crawl?.siteSnapshot?.canonicalPages.team,
    args.crawl?.siteSnapshot?.canonicalPages.faq,
  ]);
  const pageByUrl = new Map(pages.map((page) => [normalizeComparableUrl(page.finalUrl), page] as const));
  const crawlImages = [...(args.crawl?.siteSnapshot?.imageReferences ?? [])]
    .filter((image) => imageLooksRenderable(image.url, image.alt))
    .sort((left, right) => mediaScore(right) - mediaScore(left));

  const mediaItems: DemoLandingPageMediaItem[] = [];

  for (const image of crawlImages) {
    const imageKey = normalizedImageKey(image.url);
    if (seen.has(imageKey)) {
      continue;
    }

    seen.add(imageKey);
    const sourcePage = pageByUrl.get(normalizeComparableUrl(image.sourcePageUrl));
    mediaItems.push({
      url: image.url,
      alt: usefulAltText(image.alt),
      caption: mediaCaption({
        url: image.url,
        alt: image.alt,
        pageType: image.pageType,
        sourcePage,
        clinicName: args.clinicName,
      }),
      sourceLabel: pageLabel(image.pageType),
      emphasis: inferMediaEmphasis({
        url: image.url,
        alt: image.alt,
        sourcePageType: image.pageType,
      }),
    });
  }

  for (const url of fieldTexts(args.extraction.imageGalleryUrls, 0.72, ["verified_fact"])) {
    const imageKey = normalizedImageKey(url);
    if (seen.has(imageKey) || !imageLooksRenderable(url)) {
      continue;
    }

    seen.add(imageKey);
    mediaItems.push({
      url,
      caption: humanizeImageStem(url) ?? `${args.clinicName} clinic visual`,
      sourceLabel: "Verified image",
      emphasis: "clinic",
    });
  }

  return mediaItems.slice(0, 6);
}

function chooseLogoUrl(args: {
  extraction: KnowledgePack["structuredJson"];
  crawl?: WebsiteCrawlResult;
}) {
  const inferredLogo = fieldText(args.extraction.logoUrl, 0.68, ["verified_fact", "inferred_suggestion"]);

  if (inferredLogo && /^https?:\/\//i.test(inferredLogo)) {
    return inferredLogo;
  }

  return (args.crawl?.siteSnapshot?.imageReferences ?? []).find((image) => /logo/i.test(image.url) && /^https?:\/\//i.test(image.url))
    ?.url;
}

function chooseHeroImage(mediaGallery: DemoLandingPageMediaItem[]) {
  const portrait = mediaGallery.find((item) => item.emphasis === "portrait");
  if (portrait) {
    return portrait.url;
  }

  const clinic = mediaGallery.find((item) => item.emphasis === "clinic" || item.emphasis === "service");
  return clinic?.url;
}

function summarizePageSignals(page: SitePageSnapshot) {
  const notes = compact([
    page.headings.length > 6 ? "Dense heading structure suggests the page needs cleaner scanning and stronger hierarchy." : null,
    page.pageType === "homepage" && page.visibleElements.phones.length === 0 && page.visibleElements.forms.length === 0
      ? "Homepage snapshot shows weak contact visibility above the fold."
      : null,
    page.pageType === "contact" && page.visibleElements.forms.length === 0 && page.visibleElements.phones.length === 0
      ? "Contact page snapshot lacks a strong immediate action for mobile visitors."
      : null,
    page.metadata.language === "en" ? "Visible metadata suggests English-first presentation despite Greek-first clinic requirements." : null,
    page.visibleElements.addresses.length === 0 && page.pageType !== "booking"
      ? "Location proof is not obvious in the captured page structure."
      : null,
  ]);

  return notes[0] ?? "Captured to preserve the current-site structure and inform the redesign step.";
}

export function buildCurrentSiteScreenshots(crawl?: WebsiteCrawlResult): CurrentSiteScreenshot[] {
  const pages = crawl?.siteSnapshot?.canonicalPages;

  if (!pages) {
    return [];
  }

  const orderedPages = compact([
    pages.homepage,
    pages.contact,
    pages.booking,
    pages.services,
    pages.about,
    pages.team,
    pages.faq,
  ]);

  return orderedPages
    .filter((page) => page.screenshotPath)
    .map((page) => ({
      pageType: page.pageType,
      pageLabel: pageLabel(page.pageType),
      sourceUrl: page.finalUrl,
      screenshotPath: page.screenshotPath,
      title: page.metadata.title,
      primaryHeading: page.headings[0]?.text,
      observationSummary: summarizePageSignals(page),
    }));
}

export function normalizePhoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export function buildGoogleMapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function choosePrimaryCta(args: {
  bookingUrl?: string;
  phone?: string;
  contactUrl?: string;
  conceptMode: boolean;
}): DemoLandingPage["persistentCta"] {
  if (args.bookingUrl && !args.conceptMode) {
    return { label: "Κλείστε ραντεβού", href: args.bookingUrl };
  }

  if (args.phone && !args.conceptMode) {
    return { label: "Καλέστε τώρα", href: normalizePhoneHref(args.phone) };
  }

  if (args.contactUrl && !args.conceptMode) {
    return { label: "Επικοινωνία", href: args.contactUrl };
  }

  return { label: "Δείτε το demo", href: "#contact" };
}

export type ClinicDemoContext = {
  clinicName: string;
  category?: string;
  neighborhood?: string;
  address?: string;
  phones: string[];
  emails: string[];
  bookingUrl?: string;
  contactPageUrl?: string;
  hours: string[];
  services: string[];
  qualifications: string[];
  trustMarkers: string[];
  doctorNames: string[];
  teamNames: string[];
  testimonials: string[];
  faqItems: Array<{ question: string; answer?: string }>;
  yearsOfExperience?: string;
  clinicStory: string;
  logoUrl?: string;
  mediaGallery: DemoLandingPageMediaItem[];
  heroImageUrl?: string;
  mapsLinkUrl?: string;
  renderingMode: DemoLandingPage["renderingMode"];
  modeNotice?: string;
  primaryCta: DemoLandingPage["persistentCta"];
  secondaryCta: DemoLandingPage["persistentCta"];
  persistentCta: DemoLandingPage["persistentCta"];
  map?: DemoLandingPage["map"];
  contactItems: DemoLandingPage["contactItems"];
  trustItems: string[];
};

export function buildClinicDemoContext(args: {
  prospect: DiscoveredProspect;
  knowledgePack: KnowledgePack;
  contactValidation?: ContactValidation;
  crawl?: WebsiteCrawlResult;
}): ClinicDemoContext {
  const extraction = args.knowledgePack.structuredJson;
  const rawClinicName = fieldText(extraction.clinicName, 0.7, ["verified_fact"]);
  const fallbackClinicName =
    typeof extraction.clinicName.englishSummary === "string" ? extraction.clinicName.englishSummary.trim() : undefined;
  const clinicNameCandidate = !looksGenericClinicName(rawClinicName)
    ? rawClinicName
    : !looksGenericClinicName(fallbackClinicName)
      ? fallbackClinicName
      : args.prospect.businessName;
  const clinicName = clinicNameCandidate ? sanitizeText(clinicNameCandidate) : args.prospect.businessName;
  const category =
    fieldText(extraction.clinicCategory, 0.68, ["verified_fact", "inferred_suggestion"]) ?? args.prospect.category;
  const neighborhood =
    factText(args.contactValidation?.validatedNeighborhood) ??
    fieldText(extraction.neighborhood, 0.66, ["verified_fact", "inferred_suggestion"]);
  const address =
    sanitizeAddressCandidate(factText(args.contactValidation?.validatedAddress)) ??
    sanitizeAddressCandidate(fieldText(extraction.address, STRONG_LOCATION_THRESHOLD, ["verified_fact"])) ??
    sanitizeAddressCandidate(args.prospect.address);
  const phones = uniqueStrings(
    compact([
      ...factTexts(args.contactValidation?.validatedPhones ?? []),
      ...fieldTexts(extraction.phoneNumbers, STRONG_CONTACT_THRESHOLD, ["verified_fact"]),
      args.prospect.phone,
    ]),
  );
  const emails = collectEmailCandidates([
    ...factTexts(args.contactValidation?.validatedEmails ?? []),
    ...fieldTexts(extraction.emails, STRONG_CONTACT_THRESHOLD, ["verified_fact"]),
    args.prospect.visibleEmail,
  ]);
  const bookingUrl =
    factText(args.contactValidation?.validatedBookingPage) ??
    fieldText(extraction.bookingUrl, STRONG_CONTACT_THRESHOLD, ["verified_fact"]);
  const contactPageUrl =
    factText(args.contactValidation?.validatedContactPage) ??
    fieldText(extraction.contactPageUrl, STRONG_CONTACT_THRESHOLD, ["verified_fact"]);
  const hours = fieldTexts(extraction.openingHours, 0.78, ["verified_fact"]);
  const rawDoctorNames = fieldTexts(extraction.doctorNames, 0.76, ["verified_fact"]).map(sanitizePersonLabel);
  const doctorNames = uniqueStrings(rawDoctorNames.filter((value) => value && !looksGenericClinicName(value) && !looksLikeInstitution(value)));
  const rawTeamNames = fieldTexts(extraction.teamNames, 0.74, ["verified_fact"]).map(sanitizePersonLabel);
  const teamNames = uniqueStrings(rawTeamNames.filter((value) => value && !looksLikeInstitution(value) && value.split(" ").length <= 4));
  const qualifications = uniqueStrings([
    ...fieldTexts(extraction.qualificationsAndSpecialties, 0.76, ["verified_fact"]),
    ...rawTeamNames.filter((value) => looksLikeInstitution(value)),
  ]).slice(0, 8);
  const blockedServiceNames = uniqueStrings([clinicName, ...doctorNames]);
  const services = uniqueStrings([
    ...fieldTexts(extraction.coreServices, 0.72, ["verified_fact"]).filter((value) => looksLikeServiceLabel(value, blockedServiceNames)),
    ...crawlServiceCandidates({
      crawl: args.crawl,
      blockedNames: blockedServiceNames,
    }),
  ]).slice(0, 8);
  const trustMarkers = fieldTexts(extraction.trustMarkers, 0.76, ["verified_fact"]);
  const testimonials = fieldTexts(extraction.testimonials, 0.7, ["verified_fact"]).slice(0, 4);
  const mediaGallery = buildMediaGallery({
    clinicName,
    extraction,
    crawl: args.crawl,
  });
  const faqItems = extraction.faqs
    .filter((field) => field.status === "verified_fact" && field.confidence >= 0.72 && field.value && typeof field.value === "object")
    .map((field) => {
      const faqValue = field.value as Record<string, unknown>;
      const question = typeof faqValue.question === "string" ? faqValue.question.trim() : "";
      const answer = typeof faqValue.answer === "string" ? faqValue.answer.trim() : "";
      return question ? { question, answer: answer || undefined } : null;
    })
    .filter(Boolean) as Array<{ question: string; answer?: string }>;
  const yearsOfExperience = fieldText(extraction.yearsOfExperience, 0.8, ["verified_fact"]);
  const clinicStory = fieldText(extraction.clinicStory, 0.72, ["verified_fact"]) ?? args.knowledgePack.summary;

  const liveDemoEligible = args.contactValidation?.liveDemoEligibility ?? args.knowledgePack.liveDemoEligibility.eligible;
  const renderingMode: DemoLandingPage["renderingMode"] =
    args.contactValidation?.recommendedRenderMode ??
    (liveDemoEligible && (phones.length > 0 || emails.length > 0 || Boolean(contactPageUrl)) && Boolean(address)
      ? "live_demo"
      : "concept_demo");
  const modeNotice =
    renderingMode === "concept_demo"
      ? args.contactValidation?.operatorSummary ??
        "Concept demo mode: το layout χρησιμοποιεί μόνο επαληθευμένα δημόσια στοιχεία και κρατά συντηρητική στάση όπου λείπουν επαρκώς αξιόπιστα στοιχεία επικοινωνίας ή τοποθεσίας."
      : undefined;

  const primaryCta = choosePrimaryCta({
    bookingUrl,
    phone: phones[0],
    contactUrl: contactPageUrl,
    conceptMode: renderingMode === "concept_demo",
  });
  const secondaryCta = { label: "Μιλήστε με το chatbot", href: "#chatbot" };
  const persistentCta = renderingMode === "live_demo" ? primaryCta : { label: "Ζητήστε custom demo", href: "#contact" };
  const heroImageUrl = chooseHeroImage(mediaGallery);
  const logoUrl = chooseLogoUrl({
    extraction,
    crawl: args.crawl,
  });
  const mapsLinkUrl = args.contactValidation?.mapEmbedConfiguration.linkUrl ?? args.prospect.mapsUrl;
  const map =
    renderingMode === "live_demo" && args.contactValidation?.mapEmbedConfiguration.safeForLiveWidget && address
      ? {
          title: neighborhood ? `Τοποθεσία στην ${neighborhood}` : "Τοποθεσία κλινικής",
          embedUrl: args.contactValidation.mapEmbedConfiguration.embedUrl ?? buildGoogleMapEmbedUrl(address),
          linkUrl: mapsLinkUrl,
          helperText:
            args.contactValidation.mapEmbedConfiguration.summary ||
            (neighborhood
              ? `Προβολή τοποθεσίας για ασθενείς που αναζητούν ${category ?? "κλινική"} στην ${neighborhood}.`
              : "Επαληθευμένη δημόσια τοποθεσία της κλινικής."),
        }
      : undefined;

  const contactItems = compact([
    ...phones.map((value) => ({
      label: "Τηλέφωνο",
      value,
      href: normalizePhoneHref(value),
    })),
    ...emails.map((value) => ({
      label: "Email",
      value,
      href: `mailto:${value}`,
    })),
    address
      ? {
          label: "Διεύθυνση",
          value: address,
          href: mapsLinkUrl,
        }
      : null,
    ...hours.map((value) => ({
      label: "Ωράριο",
      value,
    })),
    bookingUrl
      ? {
          label: "Σελίδα ραντεβού",
          value: "Άνοιγμα booking page",
          href: bookingUrl,
        }
      : null,
    !bookingUrl && contactPageUrl
      ? {
          label: "Επικοινωνία",
          value: "Άνοιγμα contact page",
          href: contactPageUrl,
        }
      : null,
    renderingMode === "concept_demo" && mapsLinkUrl
      ? {
          label: "Google Maps",
          value: "Δημόσια καταχώριση",
          href: mapsLinkUrl,
        }
      : null,
  ]).slice(0, 8);

  const trustItems = uniqueStrings(
    compact([
      yearsOfExperience ? `Εμπειρία: ${yearsOfExperience}` : null,
      ...qualifications,
      ...trustMarkers,
    ]),
  ).slice(0, 8);

  return {
    clinicName,
    category,
    neighborhood,
    address,
    phones,
    emails,
    bookingUrl,
    contactPageUrl,
    hours,
    services,
    qualifications,
    trustMarkers,
    doctorNames,
    teamNames,
    testimonials,
    faqItems,
    yearsOfExperience,
    clinicStory,
    logoUrl,
    mediaGallery,
    heroImageUrl,
    mapsLinkUrl,
    renderingMode,
    modeNotice,
    primaryCta,
    secondaryCta,
    persistentCta,
    map,
    contactItems,
    trustItems,
  };
}
