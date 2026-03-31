import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import {
  ClinicStructuredExtractionSchema,
  ExtractedFactSchema,
  StructuredBusinessDataSchema,
} from "@/lib/antigravity/schemas";
import type {
  ClinicStructuredExtraction,
  DiscoveredProspect,
  ExtractedFact,
  FactSource,
  LanguageAssessment,
  PageLanguageAssessment,
  SitePageSnapshot,
  SiteSnapshot,
  StructuredBusinessData,
  StructuredClinicField,
  StructuredFieldStatus,
} from "@/lib/antigravity/schemas";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";
import { detectLanguageAssessment, detectLanguageCode, normalizeExtractionText } from "@/lib/antigravity/extraction/language";

const ATHENS_NEIGHBORHOODS = [
  "Αμπελόκηποι",
  "Κολωνάκι",
  "Παγκράτι",
  "Σύνταγμα",
  "Κηφισιά",
  "Μαρούσι",
  "Γκύζη",
  "Κυψέλη",
  "Νέο Ψυχικό",
  "Ψυχικό",
  "Χολαργός",
  "Βριλήσσια",
  "Χαλάνδρι",
  "Νέα Σμύρνη",
  "Γλυφάδα",
  "Πειραιάς",
  "Athens",
  "Athina",
];

const CATEGORY_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Orthopedic clinic", pattern: /orthop|ορθοπ/i },
  { label: "Dental clinic", pattern: /dent|οδοντ/i },
  { label: "Ophthalmology clinic", pattern: /ophthalm|οφθαλμ|laser vision/i },
  { label: "Cardiology clinic", pattern: /cardio|καρδιο/i },
  { label: "Fertility clinic", pattern: /fertility|ivf|γονιμ/i },
  { label: "Plastic surgery clinic", pattern: /plastic|αισθητ|πλαστικ/i },
  { label: "Diagnostic clinic", pattern: /diagnostic|διαγνωσ/i },
  { label: "Physiotherapy clinic", pattern: /physio|φυσικοθερ/i },
  { label: "Medical clinic", pattern: /medical|clinic|ιατρ/i },
];

const GENERIC_SERVICE_PATTERNS = [/home/i, /about/i, /contact/i, /faq/i, /service/i, /services/i, /υπηρεσ/i, /επικοινων/i];
const SERVICE_PATTERNS = [
  /\btreatment/i,
  /\bservice/i,
  /\bclinic/i,
  /\bprocedure/i,
  /θεραπε/i,
  /υπηρεσ/i,
  /χειρουργ/i,
  /laser/i,
];
const SERVICE_STOP_PATTERNS = [/\bbook/i, /\bappointment/i, /κλείστ/i, /ραντεβ/i, /επικοινων/i, /προγραμματισμ/i];
const QUALIFICATION_PATTERNS = [
  /\bMD\b/g,
  /\bMSc\b/g,
  /\bPhD\b/g,
  /\bDMD\b/g,
  /\bsurgeon\b/gi,
  /\bspecialist\b/gi,
  /\bconsultant\b/gi,
  /\bfellow(ship)?\b/gi,
  /χειρουργ/gi,
  /ειδικ/gi,
  /καθηγητ/gi,
  /διδακτορ/gi,
];
const TRUST_PATTERNS = [
  /\baward/i,
  /\bassociation\b/i,
  /\bcertif/i,
  /\bmember\b/i,
  /\bISO\b/i,
  /βραβε/i,
  /πιστοποι/i,
  /μέλος/i,
];
const FAQ_PATTERNS = [/\?/, /faq/i, /συχν/i, /ερωτ/i];
const EXPERIENCE_PATTERNS = [
  /\b(\d{1,2})\+?\s+years? of experience\b/i,
  /(\d{1,2})\+?\s+χρόνια εμπειρίας/i,
  /\bsince\s+(19|20)\d{2}\b/i,
  /\bαπό το\s+(19|20)\d{2}\b/i,
];
const HOURS_PATTERNS = [
  /(?:Δευτέρα|Τρίτη|Τετάρτη|Πέμπτη|Παρασκευή|Σάββατο|Κυριακή)[^.;]{0,60}\d{1,2}[:.]\d{2}\s*[-–]\s*\d{1,2}[:.]\d{2}/gi,
  /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^.;]{0,60}\d{1,2}[:.]\d{2}\s*[-–]\s*\d{1,2}[:.]\d{2}/gi,
];
const NON_CONTENT_SELECTORS = "script, style, noscript, template, iframe, canvas, object";
const EXCLUDED_EMAIL_PATTERNS = [
  /@sentry\./i,
  /@.*wixpress\.com$/i,
  /@.*editorx\.com$/i,
  /@.*wix\.com$/i,
  /@example\./i,
  /@domain\./i,
  /@email\./i,
  /^noreply@/i,
  /^no-reply@/i,
  /^donotreply@/i,
  /^do-not-reply@/i,
];
const CODE_NOISE_PATTERNS = [
  /sourceMappingURL=/i,
  /\b__NEXT_DATA__\b/i,
  /\bwebpack\b/i,
  /\bsentry\b/i,
  /\bwix\b/i,
  /\bgtag\b/i,
  /\bgoogle_tag_manager\b/i,
  /\bwindow\./i,
  /\bdocument\./i,
];
const STORY_NOISE_PATTERNS = [/\bgoogle review\b/i, /\breview\b/i, /\btestimonial\b/i, /μαρτυρ/i, /κριτικ/i];
const NAME_SIGNAL_PATTERN = /\b(?:MD|MSc|PhD|DDS|DMD|BSc|BA|MA|MBA|DO|FRCS|Dr\.?)\b|Δρ\.?/i;
const PERSON_STOP_PATTERNS = [
  /\bcontact\b/i,
  /\bservices?\b/i,
  /\babout\b/i,
  /\bfaq\b/i,
  /\bhome\b/i,
  /\bteam\b/i,
  /\btalk to us\b/i,
  /\blearn more\b/i,
  /\bexperience\b/i,
  /\bexpertise\b/i,
  /\bclinic\b/i,
  /\bdental\b/i,
  /\blaser\b/i,
  /\bappointment\b/i,
  /\bsmile\b/i,
  /επικοινων/i,
  /υπηρεσ/i,
  /σχετικ/i,
  /οδοντιατρ/i,
  /κλινικ/i,
  /ραντεβ/i,
  /εξειδίκευ/i,
  /ομάδα μας/i,
  /χειρουργ/i,
  /ορθοπαιδ/i,
  /οφθαλμ/i,
  /καρδιο/i,
  /plastic/i,
];

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const results: T[] = [];

  for (const item of items) {
    const itemKey = key(item);
    if (!itemKey || seen.has(itemKey)) {
      continue;
    }
    seen.add(itemKey);
    results.push(item);
  }

  return results;
}

function compact<T>(items: Array<T | null | undefined>): T[] {
  return items.filter(Boolean) as T[];
}

function firstNonEmpty(values: Array<string | undefined>) {
  return values.find((value) => Boolean(value && value.trim()))?.trim();
}

function toAbsoluteUrl(rawValue: string | undefined, baseUrl: string) {
  if (!rawValue) {
    return undefined;
  }

  try {
    return new URL(rawValue, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function pageSource(page: SitePageSnapshot | undefined, label: string, excerpt?: string): FactSource {
  return buildFactSource({
    sourceType: "website_crawl",
    label,
    uri: page?.finalUrl ?? "about:blank",
    excerpt,
  });
}

function seedSource(prospect: DiscoveredProspect, label: string, excerpt?: string): FactSource {
  return buildFactSource({
    sourceType: "campaign_seed",
    label,
    uri: prospect.mapsUrl ?? prospect.websiteUrl ?? `prospect:${prospect.prospectId}`,
    excerpt,
  });
}

function makeField(args: {
  key: string;
  label: string;
  status: StructuredFieldStatus;
  value?: unknown;
  originalText?: string;
  englishSummary?: string;
  sourceLanguage?: StructuredClinicField["sourceLanguage"];
  confidence: number;
  provenance: FactSource[];
  blockerForLiveDemo?: boolean;
}): StructuredClinicField {
  return {
    key: args.key,
    label: args.label,
    status: args.status,
    value: args.value,
    originalText: args.originalText,
    englishSummary: args.englishSummary,
    sourceLanguage: args.sourceLanguage ?? "unknown",
    confidence: args.confidence,
    blockerForLiveDemo: args.blockerForLiveDemo ?? false,
    provenance: args.provenance,
  };
}

function unresolvedField(args: {
  key: string;
  label: string;
  reason: string;
  provenance: FactSource[];
  blockerForLiveDemo?: boolean;
}): StructuredClinicField {
  return makeField({
    key: args.key,
    label: args.label,
    status: "unresolved",
    englishSummary: args.reason,
    confidence: 0.1,
    provenance: args.provenance,
    blockerForLiveDemo: args.blockerForLiveDemo,
  });
}

function fieldLanguage(originalText?: string, fallback = "unknown" as StructuredClinicField["sourceLanguage"]) {
  return originalText ? detectLanguageCode(originalText) : fallback;
}

function fieldToFact(field: StructuredClinicField): ExtractedFact | null {
  if (field.status === "unresolved" || field.value === undefined) {
    return null;
  }

  return ExtractedFactSchema.parse({
    key: field.key,
    label: field.label,
    value: field.value,
    confidence: field.confidence,
    provenance: field.provenance,
  });
}

function sanitizeExtractableDom($: ReturnType<typeof load>) {
  $(NON_CONTENT_SELECTORS).remove();
}

function sanitizeFallbackText(text: string) {
  return normalizeExtractionText(
    text
      .replace(/sourceMappingURL=\S+/gi, " ")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/[{}[\]<>]/g, " "),
  );
}

function normalizeSentence(text: string) {
  return normalizeExtractionText(text.replace(/\s+/g, " "));
}

function isLikelyContentSentence(text: string) {
  if (text.length < 20 || text.length > 320) {
    return false;
  }

  if (!/[A-Za-zΑ-Ωα-ωΆ-Ώά-ώ]/.test(text)) {
    return false;
  }

  return !CODE_NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!;;\?])\s+/)
    .map((sentence) => normalizeSentence(sentence))
    .filter(isLikelyContentSentence);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase().replace(/^mailto:/i, "").split("?")[0]?.replace(/[),.;:]+$/g, "") ?? "";
}

function isLikelyBusinessEmail(email: string) {
  if (!email || email.length > 120) {
    return false;
  }

  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
    return false;
  }

  if (EXCLUDED_EMAIL_PATTERNS.some((pattern) => pattern.test(email))) {
    return false;
  }

  return true;
}

function normalizeGreekPhone(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }

  const normalizedLocal =
    digits.startsWith("0030") && digits.length === 14
      ? digits.slice(4)
      : digits.startsWith("30") && digits.length === 12
        ? digits.slice(2)
        : digits;

  if (!/^(2\d{9}|69\d{8}|800\d{7})$/.test(normalizedLocal)) {
    return undefined;
  }

  if (/^(\d)\1+$/.test(normalizedLocal)) {
    return undefined;
  }

  return `+30 ${normalizedLocal}`;
}

function isUsefulImageUrl(url: string) {
  return !/(favicon|logo|sprite|icon|placeholder|pixel|blank)/i.test(url);
}

async function readReadablePageText(page?: SitePageSnapshot) {
  if (!page) {
    return "";
  }

  if (page.rawHtmlPath) {
    try {
      const html = await readFile(page.rawHtmlPath, "utf8");
      const $ = load(html);
      sanitizeExtractableDom($);
      return normalizeSentence($("body").text());
    } catch {
      return sanitizeFallbackText(page.textContent ?? "");
    }
  }

  return sanitizeFallbackText(page.textContent ?? "");
}

function chooseClinicName(args: {
  prospectName: string;
  homepageTitle?: string;
  homepageH1?: string;
}) {
  const candidates = compact([
    args.homepageH1 ? normalizeSentence(args.homepageH1) : undefined,
    args.homepageTitle ? normalizeSentence(args.homepageTitle.split("|")[0] ?? args.homepageTitle) : undefined,
  ]);

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (candidate.length <= 80 && !candidate.includes("|") && candidate.split(",").length <= 2) {
      return candidate;
    }
  }

  return args.prospectName;
}

function likelyServiceLabel(text: string) {
  const normalized = normalizeSentence(text);
  if (!normalized || normalized.length < 3 || normalized.length > 100) {
    return false;
  }

  if (GENERIC_SERVICE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  if (SERVICE_STOP_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  return SERVICE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function extractServiceCandidates(pages: SitePageSnapshot[]) {
  const labels = pages.flatMap((page) => [
    ...page.headings.map((heading) => heading.text),
    ...page.internalLinks.map((link) => link.label ?? ""),
  ]);

  return uniqueBy(
    labels
      .map((label) => normalizeSentence(label))
      .filter(likelyServiceLabel)
      .map((label) => label.replace(/^[\d.\-•]+\s*/, "")),
    (label) => label.toLowerCase(),
  ).slice(0, 12);
}

function inferCategory(prospect: DiscoveredProspect, snapshot?: SiteSnapshot) {
  const evidence = normalizeSentence([
    prospect.category,
    prospect.businessName,
    snapshot?.metadata.title,
    snapshot?.canonicalPages.homepage?.metadata.metaDescription,
    snapshot?.canonicalPages.homepage?.headings.map((heading) => heading.text).join(" "),
  ]
    .filter(Boolean)
    .join(" "));

  if (prospect.category) {
    return {
      value: prospect.category,
      status: "verified_fact" as const,
      confidence: 0.88,
      originalText: prospect.category,
      englishSummary: prospect.category,
    };
  }

  const matched = CATEGORY_PATTERNS.find((entry) => entry.pattern.test(evidence));
  if (matched) {
    return {
      value: matched.label,
      status: "inferred_suggestion" as const,
      confidence: 0.68,
      originalText: matched.label,
      englishSummary: matched.label,
    };
  }

  return null;
}

function detectNeighborhood(text: string) {
  const lower = text.toLowerCase();
  return ATHENS_NEIGHBORHOODS.find((candidate) => lower.includes(candidate.toLowerCase()));
}

function likelyPersonName(text: string) {
  const normalized = normalizeSentence(text);
  if (!normalized || normalized.length < 5 || normalized.length > 80) {
    return false;
  }

  if (/\d/.test(normalized)) {
    return false;
  }

  if (PERSON_STOP_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  const words = normalized.split(/\s+/);
  if (words.length < 2 || words.length > 4) {
    return false;
  }

  const capitalizedWords = words.filter((word) => /^[A-ZΑ-ΩΆΈΉΊΌΎΏ][a-zα-ωάέήίόύώϊΐϋΰ-]+$/.test(word));
  return capitalizedWords.length >= 2 || /\bDr\.?\b|Δρ\.?/i.test(normalized);
}

function stripCredentials(text: string) {
  return normalizeSentence(
    text
      .replace(/\b(?:MD|MSc|PhD|DDS|DMD|BSc|BA|MA|MBA|DO|FRCS)\b/gi, " ")
      .replace(/\bDr\.?\b/gi, " ")
      .replace(/\bΔρ\.?\b/gi, " "),
  )
    .replace(/^[,;:\-]+/, "")
    .replace(/[,;:\-]+$/, "")
    .trim();
}

function extractNameCandidatesFromMetadata(values: Array<string | undefined>) {
  return uniqueBy(
    values
      .flatMap((value) => (value ? value.split(/[|,]/) : []))
      .filter((segment) => NAME_SIGNAL_PATTERN.test(segment))
      .map((segment) => stripCredentials(segment))
      .filter(likelyPersonName),
    (value) => value.toLowerCase(),
  ).slice(0, 6);
}

function extractNamesFromPages(pages: SitePageSnapshot[]) {
  const candidates = uniqueBy(
    pages.flatMap((page) => [
      ...(page.pageType === "team" ? page.headings.map((heading) => heading.text).filter(likelyPersonName) : []),
      ...splitSentences(page.textContent ?? "").filter((sentence) => /\bDr\.?\b|Δρ\.?|χειρουργ|ιατρός|doctor/i.test(sentence)),
    ]),
    (value) => normalizeSentence(value).toLowerCase(),
  )
    .map((value) => normalizeSentence(value))
    .filter(likelyPersonName);

  return candidates.slice(0, 12);
}

function extractHours(text: string) {
  return uniqueBy(
    HOURS_PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((match) => normalizeSentence(match[0] ?? ""))),
    (value) => value.toLowerCase(),
  ).slice(0, 8);
}

function extractExperience(text: string) {
  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    const originalText = normalizeSentence(match[0]);
    if (/since|από το/i.test(originalText)) {
      const yearMatch = originalText.match(/(19|20)\d{2}/);
      if (yearMatch) {
        const years = new Date().getFullYear() - Number(yearMatch[0]);
        if (years >= 1 && years <= 80) {
          return {
            value: {
              displayText: originalText,
              normalizedYears: years,
            },
            originalText,
            status: "verified_fact" as const,
            confidence: 0.82,
            englishSummary: `${years} years of experience inferred from an explicit since-year reference.`,
          };
        }
      }
    }

    const numeric = originalText.match(/\d{1,2}/)?.[0];
    return {
      value: {
        displayText: originalText,
        normalizedYears: numeric ? Number(numeric) : undefined,
      },
      originalText,
      status: "verified_fact" as const,
      confidence: 0.86,
      englishSummary: "Years of experience are explicitly mentioned on the site.",
    };
  }

  return null;
}

function extractQualificationPhrases(text: string) {
  const sentences = splitSentences(text);
  return uniqueBy(
    sentences.filter((sentence) => QUALIFICATION_PATTERNS.some((pattern) => pattern.test(sentence))).map((sentence) => sentence.slice(0, 220)),
    (sentence) => sentence.toLowerCase(),
  ).slice(0, 8);
}

function isLikelyStorySentence(sentence: string) {
  if (!isLikelyContentSentence(sentence)) {
    return false;
  }

  return !STORY_NOISE_PATTERNS.some((pattern) => pattern.test(sentence));
}

function extractTestimonialChunks(text: string) {
  return uniqueBy(
    text
      .replace(/\bGoogle Review\b/gi, "|")
      .replace(/\bFacebook Review\b/gi, "|")
      .split("|")
      .map((chunk) => normalizeSentence(chunk))
      .filter(isLikelyContentSentence)
      .map((chunk) => chunk.slice(0, 220)),
    (chunk) => chunk.toLowerCase(),
  );
}

async function extractHtmlSignals(page?: SitePageSnapshot) {
  if (!page) {
    return {
      testimonials: [] as string[],
      faqs: [] as Array<{ question: string; answer?: string }>,
      logoUrl: undefined as string | undefined,
      brandColors: [] as string[],
    };
  }

  const html = await readFile(page.rawHtmlPath, "utf8");
  const $ = load(html);
  sanitizeExtractableDom($);
  const testimonials = uniqueBy(
    compact([
      ...$("[class*='testimonial'], [class*='review'], [class*='quote']")
        .toArray()
        .flatMap((element) => extractTestimonialChunks($(element).text())),
      ...$("blockquote")
        .toArray()
        .flatMap((element) => extractTestimonialChunks($(element).text())),
    ]),
    (value) => value.toLowerCase(),
  ).slice(0, 6);

  const faqs = uniqueBy(
    compact(
      $("[class*='faq'], [class*='accordion'], details")
        .toArray()
        .map((element) => {
          const text = normalizeSentence($(element).text());
          if (!text || !FAQ_PATTERNS.some((pattern) => pattern.test(text))) {
            return null;
          }

          const [question, ...rest] = text.split(/\?\s+/);
          return {
            question: question.endsWith("?") ? question : `${question}?`,
            answer: rest.join("? ").trim() || undefined,
          };
        }),
    ),
    (entry) => entry.question.toLowerCase(),
  ).slice(0, 10);

  const logoUrl =
    toAbsoluteUrl(
      firstNonEmpty(
        compact([
          $("img[alt*='logo' i]").first().attr("src"),
          $("img[src*='logo' i]").first().attr("src"),
          $("meta[property='og:image']").attr("content"),
        ]),
      ),
      page.finalUrl,
    ) ?? undefined;

  const themeColors = uniqueBy(
    compact([
      $("meta[name='theme-color']").attr("content"),
      $("meta[name='msapplication-TileColor']").attr("content"),
      ...Array.from(html.matchAll(/#[0-9a-fA-F]{6,8}/g)).map((match) => match[0]),
    ])
      .map((color) => color.trim())
      .filter((color) => /^#[0-9a-fA-F]{6,8}$/.test(color)),
    (color) => color.toLowerCase(),
  ).slice(0, 4);

  return {
    testimonials,
    faqs,
    logoUrl,
    brandColors: themeColors,
  };
}

function makeLanguageProfile(args: { pages: SitePageSnapshot[]; getPageText: (page?: SitePageSnapshot) => string }): {
  profile: ClinicStructuredExtraction["pageLanguageProfile"];
  sections: Record<string, LanguageAssessment>;
} {
  const { pages, getPageText } = args;
  const pageAssessments: PageLanguageAssessment[] = pages.map((page) => ({
    url: page.finalUrl,
    pageType: page.pageType,
    assessment: detectLanguageAssessment(getPageText(page), `${page.pageType} page language`),
  }));

  const allText = pages.map((page) => getPageText(page)).join(" ");
  const overall = detectLanguageAssessment(allText, "Overall site language");

  const sections: Record<string, LanguageAssessment> = {
    clinic_overview: detectLanguageAssessment(
      [getPageText(pages.find((page) => page.pageType === "homepage")), getPageText(pages.find((page) => page.pageType === "about"))]
        .join(" ")
        .slice(0, 1_600),
      "Clinic overview language",
    ),
    key_services: detectLanguageAssessment(getPageText(pages.find((page) => page.pageType === "services")), "Services language"),
    team: detectLanguageAssessment(
      [getPageText(pages.find((page) => page.pageType === "team")), getPageText(pages.find((page) => page.pageType === "about"))].join(" "),
      "Team language",
    ),
    contact: detectLanguageAssessment(getPageText(pages.find((page) => page.pageType === "contact")), "Contact language"),
    faqs: detectLanguageAssessment(getPageText(pages.find((page) => page.pageType === "faq")), "FAQ language"),
  };

  return {
    profile: {
      overall,
      pages: pageAssessments,
      sections,
    },
    sections,
  };
}

export async function extractAthensClinicBusinessData(args: {
  prospect: DiscoveredProspect;
  snapshot?: SiteSnapshot;
}): Promise<StructuredBusinessData> {
  const homepage = args.snapshot?.canonicalPages.homepage;
  const aboutPage = args.snapshot?.canonicalPages.about;
  const servicesPage = args.snapshot?.canonicalPages.services;
  const contactPage = args.snapshot?.canonicalPages.contact;
  const bookingPage = args.snapshot?.canonicalPages.booking;
  const teamPage = args.snapshot?.canonicalPages.team;
  const faqPage = args.snapshot?.canonicalPages.faq;
  const pages = compact([homepage, aboutPage, servicesPage, contactPage, bookingPage, teamPage, faqPage]);
  const seed = seedSource(args.prospect, "Structured extraction seed", args.prospect.businessName);
  const homepageSource = pageSource(homepage, "Homepage extraction", homepage?.metadata.title);
  const aboutSource = pageSource(aboutPage, "About page extraction", aboutPage?.metadata.title);
  const contactSource = pageSource(contactPage, "Contact page extraction", contactPage?.metadata.title);
  const servicesSource = pageSource(servicesPage, "Services page extraction", servicesPage?.metadata.title);
  const teamSource = pageSource(teamPage, "Team page extraction", teamPage?.metadata.title);
  const faqSource = pageSource(faqPage, "FAQ page extraction", faqPage?.metadata.title);
  const readablePageTexts = new Map(
    await Promise.all(pages.map(async (page) => [page.finalUrl, await readReadablePageText(page)] as const)),
  );
  const getPageText = (page?: SitePageSnapshot) => (page ? readablePageTexts.get(page.finalUrl) ?? sanitizeFallbackText(page.textContent ?? "") : "");
  const [homepageHtmlSignals, faqHtmlSignals, aboutHtmlSignals] = await Promise.all([
    extractHtmlSignals(homepage),
    extractHtmlSignals(faqPage),
    extractHtmlSignals(aboutPage),
  ]);

  const categoryInference = inferCategory(args.prospect, args.snapshot);
  const allText = normalizeSentence(
    [
      args.prospect.businessName,
      args.prospect.category,
      ...pages.map((page) => getPageText(page)),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const clinicNameText = chooseClinicName({
    prospectName: args.prospect.businessName,
    homepageH1: homepage?.headings.find((heading) => heading.level === "h1")?.text,
    homepageTitle: homepage?.metadata.title,
  });

  const clinicName = makeField({
    key: "clinic_name",
    label: "Clinic name",
    status: "verified_fact",
    value: clinicNameText,
    originalText: clinicNameText,
    englishSummary: args.prospect.businessName,
    sourceLanguage: fieldLanguage(clinicNameText, "mixed"),
    confidence: homepage ? 0.92 : 0.88,
    provenance: homepage ? [homepageSource] : [seed],
  });

  const clinicCategory = categoryInference
    ? makeField({
        key: "clinic_category",
        label: "Clinic category / specialty",
        status: categoryInference.status,
        value: categoryInference.value,
        originalText: categoryInference.originalText,
        englishSummary: categoryInference.englishSummary,
        sourceLanguage: fieldLanguage(categoryInference.originalText, "mixed"),
        confidence: categoryInference.confidence,
        provenance: categoryInference.status === "verified_fact" && args.prospect.category ? [seed] : [homepageSource, aboutSource],
      })
    : unresolvedField({
        key: "clinic_category",
        label: "Clinic category / specialty",
        reason: "No reliable specialty statement was found in the public snapshot.",
        provenance: [homepageSource, seed],
      });

  const coreServices = extractServiceCandidates(compact([servicesPage, homepage, aboutPage])).map((service) =>
    makeField({
      key: `service:${service.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
      label: "Core service / treatment",
      status: "verified_fact",
      value: service,
      originalText: service,
      sourceLanguage: fieldLanguage(service, "mixed"),
      confidence: servicesPage ? 0.84 : 0.72,
      provenance: [servicesPage ? servicesSource : homepageSource],
    }),
  );

  const addressValue =
    firstNonEmpty([
      args.snapshot?.extractedVisibleElements.addresses[0],
      contactPage?.visibleElements.addresses[0],
      args.prospect.address,
    ]) ?? "";
  const address = addressValue
    ? makeField({
        key: "address",
        label: "Address",
        status: args.snapshot?.extractedVisibleElements.addresses.length ? "verified_fact" : "inferred_suggestion",
        value: addressValue,
        originalText: addressValue,
        sourceLanguage: fieldLanguage(addressValue, "mixed"),
        confidence: args.snapshot?.extractedVisibleElements.addresses.length ? 0.9 : 0.7,
        provenance: args.snapshot?.extractedVisibleElements.addresses.length ? [contactSource] : [seed],
        blockerForLiveDemo: true,
      })
    : unresolvedField({
        key: "address",
        label: "Address",
        reason: "No reliable clinic address was extracted from the site snapshot.",
        provenance: [contactSource, seed],
        blockerForLiveDemo: true,
      });

  const neighborhoodValue = detectNeighborhood([addressValue, allText].join(" "));
  const neighborhood = neighborhoodValue
    ? makeField({
        key: "neighborhood",
        label: "Neighborhood / Athens area",
        status: addressValue.toLowerCase().includes(neighborhoodValue.toLowerCase()) ? "verified_fact" : "inferred_suggestion",
        value: neighborhoodValue,
        originalText: neighborhoodValue,
        englishSummary: `${neighborhoodValue} area in Athens`,
        sourceLanguage: fieldLanguage(neighborhoodValue, "mixed"),
        confidence: addressValue.toLowerCase().includes(neighborhoodValue.toLowerCase()) ? 0.86 : 0.66,
        provenance: addressValue.toLowerCase().includes(neighborhoodValue.toLowerCase()) ? [contactSource] : [homepageSource, aboutSource],
      })
    : unresolvedField({
        key: "neighborhood",
        label: "Neighborhood / Athens area",
        reason: "No neighborhood or clear Athens area signal could be detected confidently.",
        provenance: [contactSource, homepageSource],
      });

  const verifiedPhones = uniqueBy(
    compact([
      ...(args.snapshot?.contactCandidates.filter((candidate) => candidate.type === "phone").map((candidate) => candidate.value) ?? []),
      ...(args.snapshot?.extractedVisibleElements.phones ?? []),
    ])
      .map((phone) => normalizeGreekPhone(phone))
      .filter(Boolean) as string[],
    (phone) => phone,
  );
  const seededPhones = uniqueBy(
    compact([args.prospect.phone].map((phone) => (phone ? normalizeGreekPhone(phone) : undefined))),
    (phone) => phone,
  ).filter((phone) => !verifiedPhones.includes(phone));
  const phoneNumbers = [...verifiedPhones, ...seededPhones]
    .slice(0, 6)
    .map((phone) =>
      makeField({
        key: `phone:${phone.replace(/\D/g, "")}`,
        label: "Phone number",
        status: verifiedPhones.includes(phone) ? "verified_fact" : "inferred_suggestion",
        value: phone,
        originalText: phone,
        sourceLanguage: "unknown",
        confidence: verifiedPhones.includes(phone) ? 0.92 : 0.74,
        provenance: verifiedPhones.includes(phone) ? [contactSource, homepageSource] : [seed],
        blockerForLiveDemo: true,
      }),
    );

  const verifiedEmails = uniqueBy(
    compact([
      ...(args.snapshot?.contactCandidates.filter((candidate) => candidate.type === "email").map((candidate) => candidate.value) ?? []),
      ...(args.snapshot?.extractedVisibleElements.emails ?? []),
    ])
      .map((email) => normalizeEmail(email))
      .filter(isLikelyBusinessEmail),
    (email) => email,
  );
  const seededEmails = uniqueBy(
    compact([args.prospect.visibleEmail].map((email) => (email ? normalizeEmail(email) : undefined))).filter(isLikelyBusinessEmail),
    (email) => email,
  ).filter((email) => !verifiedEmails.includes(email));
  const emails = [...verifiedEmails, ...seededEmails]
    .slice(0, 6)
    .map((email) =>
      makeField({
        key: `email:${email}`,
        label: "Email address",
        status: verifiedEmails.includes(email) ? "verified_fact" : "inferred_suggestion",
        value: email,
        originalText: email,
        sourceLanguage: "unknown",
        confidence: verifiedEmails.includes(email) ? 0.94 : 0.74,
        provenance: verifiedEmails.includes(email) ? [contactSource, homepageSource] : [seed],
        blockerForLiveDemo: true,
      }),
    );

  const contactPageUrl = contactPage
    ? makeField({
        key: "contact_page_url",
        label: "Contact page URL",
        status: "verified_fact",
        value: contactPage.finalUrl,
        originalText: contactPage.finalUrl,
        sourceLanguage: "unknown",
        confidence: 0.96,
        provenance: [contactSource],
        blockerForLiveDemo: true,
      })
    : args.prospect.contactPageUrl
      ? makeField({
          key: "contact_page_url",
          label: "Contact page URL",
          status: "inferred_suggestion",
          value: args.prospect.contactPageUrl,
          originalText: args.prospect.contactPageUrl,
          sourceLanguage: "unknown",
          confidence: 0.74,
          provenance: [seed],
          blockerForLiveDemo: true,
        })
      : unresolvedField({
          key: "contact_page_url",
          label: "Contact page URL",
          reason: "No explicit contact page was identified.",
          provenance: [homepageSource],
          blockerForLiveDemo: true,
        });

  const bookingUrl = bookingPage
    ? makeField({
        key: "booking_url",
        label: "Appointment / booking URL",
        status: "verified_fact",
        value: bookingPage.finalUrl,
        originalText: bookingPage.finalUrl,
        sourceLanguage: "unknown",
        confidence: 0.96,
        provenance: [pageSource(bookingPage, "Booking page extraction", bookingPage.metadata.title)],
      })
    : unresolvedField({
        key: "booking_url",
        label: "Appointment / booking URL",
        reason: "No dedicated booking or appointment page was verified.",
        provenance: [contactSource, homepageSource],
      });

  const openingHours = extractHours(
    [getPageText(contactPage), getPageText(homepage), contactPage?.footerText ?? "", homepage?.footerText ?? ""].join(" "),
  ).map((hours) =>
    makeField({
      key: `opening_hours:${hours.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
      label: "Opening hours",
      status: "verified_fact",
      value: hours,
      originalText: hours,
      sourceLanguage: fieldLanguage(hours, "mixed"),
      confidence: 0.8,
      provenance: [contactSource, homepageSource],
    }),
  );

  const doctorNameValues = extractNamesFromPages(
    compact([aboutPage, teamPage]).map((page) => ({
      ...page,
      textContent: getPageText(page),
    })),
  );
  const metadataDoctorNames = extractNameCandidatesFromMetadata([
    homepage?.metadata.title,
    homepage?.metadata.metaDescription,
    aboutPage?.metadata.title,
    aboutPage?.metadata.metaDescription,
  ]);
  const doctorNames = uniqueBy([...metadataDoctorNames, ...doctorNameValues], (name) => name.toLowerCase()).map((name) =>
    makeField({
      key: `doctor_name:${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
      label: "Doctor name",
      status: "verified_fact",
      value: name,
      originalText: name,
      sourceLanguage: fieldLanguage(name, "mixed"),
      confidence: /\bDr\.?\b|Δρ\.?/i.test(name) ? 0.88 : 0.76,
      provenance: [teamPage ? teamSource : aboutSource],
    }),
  );

  const teamNames = uniqueBy(
    compact([...(teamPage?.headings.map((heading) => heading.text) ?? []), ...(aboutPage?.headings.map((heading) => heading.text) ?? [])])
      .map((name) => normalizeSentence(name))
      .filter((name) => likelyPersonName(name) && !doctorNameValues.includes(name)),
    (name) => name.toLowerCase(),
  )
    .slice(0, 8)
    .map((name) =>
      makeField({
        key: `team_name:${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
        label: "Team name",
        status: "verified_fact",
        value: name,
        originalText: name,
        sourceLanguage: fieldLanguage(name, "mixed"),
        confidence: 0.74,
        provenance: [teamPage ? teamSource : aboutSource],
      }),
    );

  const experience = extractExperience([getPageText(aboutPage), getPageText(teamPage), getPageText(homepage)].join(" "));
  const yearsOfExperience = experience
    ? makeField({
        key: "years_of_experience",
        label: "Years of experience",
        status: experience.status,
        value: experience.value,
        originalText: experience.originalText,
        englishSummary: experience.englishSummary,
        sourceLanguage: fieldLanguage(experience.originalText, "mixed"),
        confidence: experience.confidence,
        provenance: [aboutSource, teamSource],
      })
    : unresolvedField({
        key: "years_of_experience",
        label: "Years of experience",
        reason: "No explicit years-of-experience statement was found.",
        provenance: [aboutSource, teamSource],
      });

  const qualificationsAndSpecialties = extractQualificationPhrases([getPageText(aboutPage), getPageText(teamPage)].join(" "))
    .map((phrase) =>
      makeField({
        key: `qualification:${phrase.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}`,
        label: "Qualification / specialty",
        status: "verified_fact",
        value: phrase,
        originalText: phrase,
        sourceLanguage: fieldLanguage(phrase, "mixed"),
        confidence: 0.8,
        provenance: [aboutSource, teamSource],
      }),
    )
    .slice(0, 8);

  const clinicStoryText = firstNonEmpty([
    ...compact([aboutPage?.metadata.metaDescription, homepage?.metadata.metaDescription]).map((value) => normalizeSentence(value)).filter(isLikelyStorySentence),
    splitSentences(getPageText(aboutPage)).filter(isLikelyStorySentence).slice(0, 3).join(" "),
    splitSentences(getPageText(homepage)).filter(isLikelyStorySentence).slice(0, 2).join(" "),
  ]);
  const clinicStory = clinicStoryText
    ? makeField({
        key: "clinic_story",
        label: "Clinic story / about us",
        status: "verified_fact",
        value: clinicStoryText,
        originalText: clinicStoryText,
        englishSummary: "Concise about-us summary extracted from the public website.",
        sourceLanguage: fieldLanguage(clinicStoryText, "mixed"),
        confidence: aboutPage ? 0.84 : 0.72,
        provenance: [aboutPage ? aboutSource : homepageSource],
      })
    : unresolvedField({
        key: "clinic_story",
        label: "Clinic story / about us",
        reason: "No usable about-us narrative was extracted.",
        provenance: [aboutSource, homepageSource],
      });

  const testimonials = uniqueBy([...homepageHtmlSignals.testimonials, ...aboutHtmlSignals.testimonials], (value) => value.toLowerCase())
    .slice(0, 6)
    .map((quote) =>
      makeField({
        key: `testimonial:${quote.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 36)}`,
        label: "Testimonial",
        status: "verified_fact",
        value: quote,
        originalText: quote,
        sourceLanguage: fieldLanguage(quote, "mixed"),
        confidence: 0.74,
        provenance: [homepageSource, aboutSource],
      }),
    );

  const faqs = uniqueBy(
    [...faqHtmlSignals.faqs, ...(faqPage?.headings.filter((heading) => FAQ_PATTERNS.some((pattern) => pattern.test(heading.text))).map((heading) => ({ question: heading.text })) ?? [])],
    (entry) => entry.question.toLowerCase(),
  )
    .slice(0, 8)
    .map((entry) =>
      makeField({
        key: `faq:${entry.question.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}`,
        label: "FAQ",
        status: "verified_fact",
        value: entry,
        originalText: "answer" in entry && entry.answer ? `${entry.question} ${entry.answer}` : entry.question,
        sourceLanguage: fieldLanguage(entry.question, "mixed"),
        confidence: faqPage ? 0.82 : 0.68,
        provenance: [faqPage ? faqSource : homepageSource],
      }),
    );

  const trustMarkers = uniqueBy(
    splitSentences([getPageText(homepage), getPageText(aboutPage), getPageText(teamPage)].join(" "))
      .filter((sentence) => TRUST_PATTERNS.some((pattern) => pattern.test(sentence)))
      .map((sentence) => sentence.slice(0, 220)),
    (sentence) => sentence.toLowerCase(),
  )
    .slice(0, 8)
    .map((marker) =>
      makeField({
        key: `trust_marker:${marker.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}`,
        label: "Trust marker",
        status: "verified_fact",
        value: marker,
        originalText: marker,
        sourceLanguage: fieldLanguage(marker, "mixed"),
        confidence: 0.78,
        provenance: [homepageSource, aboutSource],
      }),
    );

  const socialLinks = (args.snapshot?.extractedVisibleElements.socialLinks ?? []).slice(0, 10).map((link) =>
    makeField({
      key: `social_link:${link.href}`,
      label: "Social link",
      status: "verified_fact",
      value: link.href,
      originalText: link.label ?? link.href,
      sourceLanguage: fieldLanguage(link.label ?? "", "unknown"),
      confidence: 0.94,
      provenance: [homepageSource],
    }),
  );

  const imageGalleryUrls = uniqueBy(args.snapshot?.imageReferences ?? [], (image) => image.url)
    .filter((image) => isUsefulImageUrl(image.url))
    .slice(0, 12)
    .map((image) =>
      makeField({
        key: `image:${image.url}`,
        label: "Image / gallery URL",
        status: "verified_fact",
        value: image.url,
        originalText: image.alt ?? image.url,
        sourceLanguage: fieldLanguage(image.alt ?? "", "unknown"),
        confidence: image.confidence,
        provenance: image.provenance,
      }),
    );

  const logoUrl = homepageHtmlSignals.logoUrl
    ? makeField({
        key: "logo_url",
        label: "Logo URL",
        status: "inferred_suggestion",
        value: homepageHtmlSignals.logoUrl,
        originalText: homepageHtmlSignals.logoUrl,
        sourceLanguage: "unknown",
        confidence: 0.72,
        provenance: [homepageSource],
      })
    : unresolvedField({
        key: "logo_url",
        label: "Logo URL",
        reason: "No explicit logo asset could be inferred confidently from the homepage HTML.",
        provenance: [homepageSource],
      });

  const brandColors = homepageHtmlSignals.brandColors.map((color) =>
    makeField({
      key: `brand_color:${color.toLowerCase()}`,
      label: "Brand color",
      status: "inferred_suggestion",
      value: color,
      originalText: color,
      sourceLanguage: "unknown",
      confidence: 0.58,
      provenance: [homepageSource],
    }),
  );

  const { profile: pageLanguageProfile } = makeLanguageProfile({ pages, getPageText });

  const contactConfidenceCandidates = compact([
    ...phoneNumbers.map((field) => field.confidence),
    ...emails.map((field) => field.confidence),
    contactPageUrl.status !== "unresolved" ? contactPageUrl.confidence : null,
    bookingUrl.status !== "unresolved" ? bookingUrl.confidence : null,
  ]);
  const locationConfidenceCandidates = compact([
    address.status !== "unresolved" ? address.confidence : null,
    neighborhood.status !== "unresolved" ? neighborhood.confidence : null,
    args.prospect.mapsUrl ? 0.82 : null,
  ]);

  const liveDemoBlockers = compact([
    phoneNumbers.length === 0 && emails.length === 0 && contactPageUrl.status === "unresolved"
      ? "Weak contact extraction: no verified phone/email/contact page combination is available."
      : null,
    address.status === "unresolved" && !args.prospect.mapsUrl
      ? "Weak location extraction: no verified address or maps listing is available."
      : null,
  ]);
  const liveDemoEligibility = {
    eligible:
      liveDemoBlockers.length === 0 &&
      (contactConfidenceCandidates.length > 0 ? Math.max(...contactConfidenceCandidates) : 0) >= 0.75 &&
      (locationConfidenceCandidates.length > 0 ? Math.max(...locationConfidenceCandidates) : 0) >= 0.7,
    confidence: Math.min(
      0.98,
      Math.max(
        0.35,
        ((contactConfidenceCandidates.length > 0 ? Math.max(...contactConfidenceCandidates) : 0) +
          (locationConfidenceCandidates.length > 0 ? Math.max(...locationConfidenceCandidates) : 0)) /
          2,
      ),
    ),
    blockers: liveDemoBlockers,
    rationale:
      liveDemoBlockers.length === 0
        ? "Contact and location extraction are strong enough for a live business demo mode."
        : "Contact or location extraction is too weak for live business demo mode without human review.",
  } as const;

  const unresolvedFields = compact([
    clinicCategory.status === "unresolved" ? clinicCategory : null,
    coreServices.length === 0
      ? unresolvedField({
          key: "core_services",
          label: "Core services / treatments",
          reason: "No reliable service list was extracted from the current snapshot.",
          provenance: [servicesSource, homepageSource],
        })
      : null,
    address.status === "unresolved" ? address : null,
    neighborhood.status === "unresolved" ? neighborhood : null,
    phoneNumbers.length === 0
      ? unresolvedField({
          key: "phone_numbers",
          label: "Phone number(s)",
          reason: "No reliable phone number was extracted.",
          provenance: [contactSource, seed],
          blockerForLiveDemo: true,
        })
      : null,
    emails.length === 0
      ? unresolvedField({
          key: "emails",
          label: "Email(s)",
          reason: "No public clinic email was verified from the snapshot.",
          provenance: [contactSource, homepageSource],
        })
      : null,
    contactPageUrl.status === "unresolved" ? contactPageUrl : null,
    bookingUrl.status === "unresolved" ? bookingUrl : null,
    openingHours.length === 0
      ? unresolvedField({
          key: "opening_hours",
          label: "Opening hours",
          reason: "Opening hours were not extracted reliably.",
          provenance: [contactSource, homepageSource],
        })
      : null,
    doctorNames.length === 0
      ? unresolvedField({
          key: "doctor_names",
          label: "Doctor names",
          reason: "Doctor names were not extracted with enough confidence.",
          provenance: [aboutSource, teamSource],
        })
      : null,
    teamNames.length === 0
      ? unresolvedField({
          key: "team_names",
          label: "Team names",
          reason: "Team names were not extracted with enough confidence.",
          provenance: [teamSource, aboutSource],
        })
      : null,
    yearsOfExperience.status === "unresolved" ? yearsOfExperience : null,
    qualificationsAndSpecialties.length === 0
      ? unresolvedField({
          key: "qualifications_and_specialties",
          label: "Qualifications / specialties",
          reason: "No explicit qualifications or specialties were extracted reliably.",
          provenance: [aboutSource, teamSource],
        })
      : null,
    clinicStory.status === "unresolved" ? clinicStory : null,
    testimonials.length === 0
      ? unresolvedField({
          key: "testimonials",
          label: "Testimonials quoted on site",
          reason: "No testimonial block was verified.",
          provenance: [homepageSource, aboutSource],
        })
      : null,
    faqs.length === 0
      ? unresolvedField({
          key: "faqs",
          label: "FAQs",
          reason: "No FAQ content was extracted reliably.",
          provenance: [faqSource, homepageSource],
        })
      : null,
    trustMarkers.length === 0
      ? unresolvedField({
          key: "trust_markers",
          label: "Trust markers",
          reason: "No explicit trust markers such as awards, memberships, or certifications were verified.",
          provenance: [homepageSource, aboutSource],
        })
      : null,
    socialLinks.length === 0
      ? unresolvedField({
          key: "social_links",
          label: "Social links",
          reason: "No social links were detected.",
          provenance: [homepageSource],
        })
      : null,
    imageGalleryUrls.length === 0
      ? unresolvedField({
          key: "image_gallery_urls",
          label: "Image / gallery URLs",
          reason: "No usable image gallery URLs were preserved from the snapshot.",
          provenance: [homepageSource],
        })
      : null,
    logoUrl.status === "unresolved" ? logoUrl : null,
    brandColors.length === 0
      ? unresolvedField({
          key: "brand_colors",
          label: "Brand colors",
          reason: "Brand colors were not inferable confidently from the public HTML.",
          provenance: [homepageSource],
        })
      : null,
  ]);

  const structuredExtraction = ClinicStructuredExtractionSchema.parse({
    clinicName,
    clinicCategory,
    coreServices,
    address,
    neighborhood,
    phoneNumbers,
    emails,
    contactPageUrl,
    bookingUrl,
    openingHours,
    doctorNames,
    teamNames,
    yearsOfExperience,
    qualificationsAndSpecialties,
    clinicStory,
    testimonials,
    faqs,
    trustMarkers,
    socialLinks,
    imageGalleryUrls,
    logoUrl,
    brandColors,
    pageLanguageProfile,
    operatorEnglishSummary: [
      clinicName.value,
      clinicCategory.status !== "unresolved" ? clinicCategory.value : "clinic",
      neighborhood.status !== "unresolved" ? `in ${neighborhood.value}` : undefined,
      coreServices.length ? `with services such as ${coreServices.slice(0, 3).map((field) => field.value).join(", ")}` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    unresolvedFields,
    liveDemoEligibility,
  });

  const canonicalName = fieldToFact(clinicName) ?? ExtractedFactSchema.parse({
    key: "clinic_name",
    label: "Clinic name",
    value: args.prospect.businessName,
    confidence: 0.85,
    provenance: [seed],
  });
  const services = compact(coreServices.map(fieldToFact));
  const bookingSignals = compact([
    contactPageUrl.status !== "unresolved"
      ? fieldToFact(
          makeField({
            key: "booking_signal:contact_page",
            label: "Has contact page",
            status: "verified_fact",
            value: true,
            confidence: contactPageUrl.confidence,
            provenance: contactPageUrl.provenance,
          }),
        )
      : null,
    bookingUrl.status !== "unresolved"
      ? fieldToFact(
          makeField({
            key: "booking_signal:booking_page",
            label: "Has booking page",
            status: "verified_fact",
            value: true,
            confidence: bookingUrl.confidence,
            provenance: bookingUrl.provenance,
          }),
        )
      : null,
  ]);
  const contactFacts = compact([
    ...phoneNumbers.map(fieldToFact),
    ...emails.map(fieldToFact),
    fieldToFact(contactPageUrl),
    fieldToFact(bookingUrl),
  ]);
  const locationFacts = compact([
    fieldToFact(address),
    fieldToFact(neighborhood),
    args.prospect.mapsUrl
      ? ExtractedFactSchema.parse({
          key: "maps_url",
          label: "Maps URL",
          value: args.prospect.mapsUrl,
          confidence: 0.82,
          provenance: [seed],
        })
      : null,
  ]);
  const hoursFacts = compact(openingHours.map(fieldToFact));
  const disclaimerFacts = unresolvedFields
    .slice(0, 8)
    .map((field) =>
      ExtractedFactSchema.parse({
        key: `unresolved:${field.key}`,
        label: field.label,
        value: field.englishSummary ?? "Unresolved",
        confidence: field.confidence,
        provenance: field.provenance,
      }),
    );

  return StructuredBusinessDataSchema.parse({
    canonicalName,
    summary:
      structuredExtraction.operatorEnglishSummary ??
      `${args.prospect.businessName} is a clinic in Athens with a partially extracted public web presence.`,
    services,
    bookingSignals,
    contactFacts,
    locationFacts,
    hoursFacts,
    disclaimerFacts,
    structuredExtraction,
    extractionConfidence: Math.min(
      0.96,
      Math.max(
        0.45,
        [
          clinicName.confidence,
          clinicCategory.confidence,
          address.confidence,
          contactPageUrl.confidence,
          bookingUrl.confidence,
          yearsOfExperience.confidence,
          liveDemoEligibility.confidence,
        ].reduce((sum, value) => sum + value, 0) / 7,
      ),
    ),
    provenance: uniqueBy(
      [seed, homepageSource, aboutSource, contactSource, servicesSource, teamSource, faqSource].filter(
        (source) => source.uri !== "about:blank",
      ),
      (source) => `${source.label}:${source.uri}`,
    ),
  });
}
