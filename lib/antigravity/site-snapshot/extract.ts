import path from "node:path";
import { writeFile } from "node:fs/promises";
import { load } from "cheerio";
import type {
  SiteContactCandidate,
  SiteForm,
  SiteHeading,
  SiteImageReference,
  SiteMetadata,
  SitePageSnapshot,
  SitePageType,
  SiteVisibleElements,
  WebsiteLink,
} from "@/lib/antigravity/schemas";
import { buildFactSource, nowIso, sha256, slugify } from "@/lib/antigravity/runtime/utils";
import { classifyPage } from "@/lib/antigravity/site-snapshot/classify";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

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

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => normalizeWhitespace(value)).filter(Boolean))];
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const results: T[] = [];

  for (const item of items) {
    const candidateKey = key(item);
    if (!candidateKey || seen.has(candidateKey)) {
      continue;
    }
    seen.add(candidateKey);
    results.push(item);
  }

  return results;
}

function toAbsoluteUrl(rawValue: string | undefined, baseUrl: string) {
  if (!rawValue) {
    return undefined;
  }

  const trimmed = rawValue.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("javascript:")) {
    return undefined;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function sanitizeExtractableDom($: ReturnType<typeof load>) {
  $(NON_CONTENT_SELECTORS).remove();
}

function isInternalUrl(url: string, baseUrl: string) {
  const candidate = new URL(url);
  const base = new URL(baseUrl);
  return normalizeHost(candidate.hostname) === normalizeHost(base.hostname);
}

function collectHeadings($: ReturnType<typeof load>): SiteHeading[] {
  const headings: SiteHeading[] = [];

  for (const selector of ["h1", "h2", "h3"] as const) {
    $(selector).each((_, element) => {
      const text = normalizeWhitespace($(element).text());
      if (!text) {
        return;
      }

      headings.push({
        level: selector,
        text,
      });
    });
  }

  return uniqueBy(headings, (heading) => `${heading.level}:${heading.text}`).slice(0, 24);
}

function collectInternalLinks($: ReturnType<typeof load>, finalUrl: string): WebsiteLink[] {
  const links: WebsiteLink[] = [];

  $("a[href]").each((_, element) => {
    const href = toAbsoluteUrl($(element).attr("href"), finalUrl);
    if (!href) {
      return;
    }

    if (!isInternalUrl(href, finalUrl)) {
      return;
    }

    const label = normalizeWhitespace($(element).text());
    links.push({
      href,
      label: label || undefined,
    });
  });

  return uniqueBy(links, (link) => link.href).slice(0, 80);
}

function collectSocialLinks($: ReturnType<typeof load>, finalUrl: string): WebsiteLink[] {
  const patterns = /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|x\.com|twitter\.com)/i;
  const links: WebsiteLink[] = [];

  $("a[href]").each((_, element) => {
    const href = toAbsoluteUrl($(element).attr("href"), finalUrl);
    if (!href || !patterns.test(href)) {
      return;
    }

    const label = normalizeWhitespace($(element).text());
    links.push({
      href,
      label: label || undefined,
    });
  });

  return uniqueBy(links, (link) => link.href).slice(0, 20);
}

function normalizeEmail(rawValue: string) {
  return rawValue.trim().toLowerCase().replace(/^mailto:/i, "").split("?")[0]?.replace(/[),.;:]+$/g, "") ?? "";
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

function collectEmails($: ReturnType<typeof load>, visibleText: string) {
  const emailMatches: string[] = [...(visibleText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])];
  $("a[href^='mailto:']").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const email = normalizeEmail(href);
    if (email) {
      emailMatches.push(email);
    }
  });

  return dedupeStrings(emailMatches.map(normalizeEmail).filter(isLikelyBusinessEmail)).slice(0, 10);
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

function collectPhones($: ReturnType<typeof load>, textContent: string) {
  const phoneMatches: string[] = textContent.match(/(?:\+?\d[\d\s()./-]{6,}\d)/g)
    ? [...(textContent.match(/(?:\+?\d[\d\s()./-]{6,}\d)/g) ?? [])]
    : [];
  $("a[href^='tel:']").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const phone = href.replace(/^tel:/i, "").split("?")[0];
    if (phone) {
      phoneMatches.push(phone);
    }
  });

  const isLikelyPhone = (value: string) => {
    if (/^\d{4}\s*[-/.]\s*\d{4}$/.test(value)) {
      return false;
    }

    if (/^\d{4}\s*[-/.]\s*\d{2}\s*[-/.]\s*\d{2}(?:\s+\d{2}(?::\d{2})?)?$/.test(value)) {
      return false;
    }

    if (/\b(?:19|20)\d{2}\b.*\b(?:19|20)\d{2}\b/.test(value)) {
      return false;
    }

    return Boolean(normalizeGreekPhone(value));
  };

  return dedupeStrings(
    phoneMatches
      .map((phone) => phone.replace(/[^\d+()./\s-]/g, "").trim())
      .filter(isLikelyPhone)
      .map((phone) => normalizeGreekPhone(phone) ?? phone),
  ).slice(0, 10);
}

function looksLikeAddress(value: string) {
  return /\d/.test(value) && /(street|st\.|avenue|ave|road|rd|suite|floor|athens|athina|greece|αθήνα|ελλάδα|tk\b|\b\d{3}\s?\d{2}\b)/i.test(value);
}

function collectAddresses($: ReturnType<typeof load>) {
  const candidates: string[] = [];

  $("address, [itemprop='address'], [class*='address'], [id*='address'], footer, [class*='contact'], [id*='contact']").each(
    (_, element) => {
      const text = normalizeWhitespace($(element).text());
      if (text && looksLikeAddress(text)) {
        candidates.push(text);
      }
    },
  );

  return dedupeStrings(candidates).slice(0, 6);
}

function collectForms($: ReturnType<typeof load>, finalUrl: string): SiteForm[] {
  const forms: SiteForm[] = [];

  $("form").each((_, formElement) => {
    const form = $(formElement);
    const method = normalizeWhitespace(form.attr("method") ?? "").toLowerCase() || undefined;
    const action = toAbsoluteUrl(form.attr("action") ?? undefined, finalUrl) ?? form.attr("action") ?? undefined;
    const surroundingText = normalizeWhitespace(form.text()).toLowerCase();

    const fields = form
      .find("input, select, textarea")
      .toArray()
      .map((fieldElement) => {
        const field = $(fieldElement);
        const name = normalizeWhitespace(field.attr("name") ?? "") || normalizeWhitespace(field.attr("id") ?? "") || undefined;
        const type = normalizeWhitespace(field.attr("type") ?? fieldElement.tagName) || undefined;
        const label =
          normalizeWhitespace(field.attr("placeholder") ?? "") ||
          normalizeWhitespace(form.find(`label[for='${field.attr("id")}']`).first().text()) ||
          undefined;
        const required = field.is("[required]") || field.attr("aria-required") === "true";

        return {
          name,
          type,
          label,
          required,
        };
      })
      .filter((field) => field.name || field.type || field.label);

    const submitLabels = dedupeStrings(
      form
        .find("button, input[type='submit']")
        .toArray()
        .map((element) => normalizeWhitespace($(element).text()) || normalizeWhitespace($(element).attr("value") ?? "")),
    );
    const fieldNames = dedupeStrings(fields.map((field) => field.name ?? field.label ?? field.type ?? "field"));
    const purposeHint: SiteForm["purposeHint"] =
      /\b(book|appointment|schedule|reserve|ραντεβ)\b/i.test(`${surroundingText} ${action ?? ""}`)
        ? "booking"
        : /\b(contact|message|question|inquiry|επικοινων)\b/i.test(`${surroundingText} ${action ?? ""}`)
          ? "contact"
          : /\bnewsletter|subscribe\b/i.test(`${surroundingText} ${action ?? ""}`)
            ? "newsletter"
            : "generic";

    forms.push({
      action,
      method,
      purposeHint,
      fieldNames,
      submitLabels,
      fields,
    });
  });

  return forms.slice(0, 8);
}

function collectMetadata($: ReturnType<typeof load>, finalUrl: string): SiteMetadata {
  const ogImage = toAbsoluteUrl($("meta[property='og:image']").attr("content"), finalUrl);
  const canonicalUrl = toAbsoluteUrl($("link[rel='canonical']").attr("href"), finalUrl);

  return {
    title: normalizeWhitespace($("title").text()) || undefined,
    metaDescription: normalizeWhitespace($("meta[name='description']").attr("content") ?? "") || undefined,
    canonicalUrl,
    language: normalizeWhitespace($("html").attr("lang") ?? "") || undefined,
    robots: normalizeWhitespace($("meta[name='robots']").attr("content") ?? "") || undefined,
    openGraphTitle: normalizeWhitespace($("meta[property='og:title']").attr("content") ?? "") || undefined,
    openGraphDescription: normalizeWhitespace($("meta[property='og:description']").attr("content") ?? "") || undefined,
    openGraphImage: ogImage,
  };
}

function collectImages(args: {
  $: ReturnType<typeof load>;
  finalUrl: string;
  pageType: SitePageType;
  provenanceUri: string;
}): SiteImageReference[] {
  const images: SiteImageReference[] = [];

  const ogImage = toAbsoluteUrl(args.$("meta[property='og:image']").attr("content"), args.finalUrl);
  if (ogImage) {
    images.push({
      url: ogImage,
      alt: "Open Graph image",
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: 0.92,
      provenance: [
        buildFactSource({
          sourceType: "website_crawl",
          label: "Open Graph image",
          uri: args.provenanceUri,
        }),
      ],
    });
  }

  args.$("img[src]").each((_, element) => {
    const url = toAbsoluteUrl(args.$(element).attr("src"), args.finalUrl);
    if (!url) {
      return;
    }

    images.push({
      url,
      alt: normalizeWhitespace(args.$(element).attr("alt") ?? "") || undefined,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: 0.72,
      provenance: [
        buildFactSource({
          sourceType: "website_crawl",
          label: "Page image",
          uri: args.provenanceUri,
        }),
      ],
    });
  });

  return uniqueBy(images, (image) => image.url).slice(0, 12);
}

function collectFooterText($: ReturnType<typeof load>) {
  const footerText = normalizeWhitespace($("footer").first().text());
  return footerText || undefined;
}

function buildVisibleElements(args: {
  phones: string[];
  emails: string[];
  addresses: string[];
  socialLinks: WebsiteLink[];
  forms: SiteForm[];
}): SiteVisibleElements {
  return {
    phones: args.phones,
    emails: args.emails,
    addresses: args.addresses,
    socialLinks: args.socialLinks,
    forms: args.forms,
  };
}

function buildContactCandidates(args: {
  pageType: SitePageType;
  finalUrl: string;
  visibleElements: SiteVisibleElements;
  forms: SiteForm[];
}) {
  const provenance = [
    buildFactSource({
      sourceType: "website_crawl",
      label: `${args.pageType} page`,
      uri: args.finalUrl,
    }),
  ];
  const contactCandidates: SiteContactCandidate[] = [];

  for (const phone of args.visibleElements.phones) {
    contactCandidates.push({
      type: "phone",
      value: phone,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: args.pageType === "contact" ? 0.94 : 0.84,
      provenance,
    });
  }

  for (const email of args.visibleElements.emails) {
    contactCandidates.push({
      type: "email",
      value: email,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: args.pageType === "contact" ? 0.95 : 0.86,
      provenance,
    });
  }

  for (const address of args.visibleElements.addresses) {
    contactCandidates.push({
      type: "address",
      value: address,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: args.pageType === "contact" ? 0.88 : 0.78,
      provenance,
    });
  }

  if (args.pageType === "contact") {
    contactCandidates.push({
      type: "contact_page",
      value: args.finalUrl,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: 0.96,
      provenance,
    });
  }

  if (args.pageType === "booking") {
    contactCandidates.push({
      type: "booking_page",
      value: args.finalUrl,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: 0.96,
      provenance,
    });
  }

  if (args.forms.length > 0) {
    contactCandidates.push({
      type: "form",
      value: args.finalUrl,
      sourcePageUrl: args.finalUrl,
      pageType: args.pageType,
      confidence: args.pageType === "contact" || args.pageType === "booking" ? 0.9 : 0.75,
      provenance,
    });
  }

  return uniqueBy(contactCandidates, (candidate) => `${candidate.type}:${candidate.value}`);
}

export async function extractPageSnapshot(args: {
  requestedUrl: string;
  finalUrl: string;
  html: string;
  pageTypeHint: SitePageType;
  artifactDirectory: string;
}) {
  const $ = load(args.html);
  sanitizeExtractableDom($);
  const bodyText = normalizeWhitespace($("body").text());
  const metadata = collectMetadata($, args.finalUrl);
  const headings = collectHeadings($);
  const classification = classifyPage({
    url: args.finalUrl,
    title: metadata.title,
    h1: headings.find((heading) => heading.level === "h1")?.text,
    text: bodyText.slice(0, 4_000),
    hint: args.pageTypeHint,
  });
  const internalLinks = collectInternalLinks($, args.finalUrl);
  const forms = collectForms($, args.finalUrl);
  const phones = collectPhones($, bodyText);
  const emails = collectEmails($, bodyText);
  const addresses = collectAddresses($);
  const socialLinks = collectSocialLinks($, args.finalUrl);
  const visibleElements = buildVisibleElements({
    phones,
    emails,
    addresses,
    socialLinks,
    forms,
  });
  const contactCandidates = buildContactCandidates({
    pageType: classification.pageType,
    finalUrl: args.finalUrl,
    visibleElements,
    forms,
  });
  const imageReferences = collectImages({
    $,
    finalUrl: args.finalUrl,
    pageType: classification.pageType,
    provenanceUri: args.finalUrl,
  });
  const footerText = collectFooterText($);

  const baseName = `${classification.pageType}-${slugify(new URL(args.finalUrl).pathname || "home")}-${sha256(args.finalUrl).slice(0, 8)}`;
  const htmlPath = path.join(args.artifactDirectory, `${baseName}.html`);
  const cleanedTextPath = path.join(args.artifactDirectory, `${baseName}.txt`);

  await writeFile(htmlPath, args.html, "utf8");
  await writeFile(cleanedTextPath, bodyText, "utf8");

  const pageSnapshot: SitePageSnapshot = {
    pageType: classification.pageType,
    requestedUrl: args.requestedUrl,
    finalUrl: args.finalUrl,
    fetchedAt: nowIso(),
    metadata,
    headings,
    internalLinks,
    forms,
    visibleElements,
    footerText,
    textContent: bodyText || undefined,
    rawHtmlPath: htmlPath,
    cleanedTextPath,
    imageReferences,
    classificationConfidence: classification.confidence,
    provenance: [
      buildFactSource({
        sourceType: "website_crawl",
        label: `${classification.pageType} page fetch`,
        uri: args.finalUrl,
      }),
    ],
  };

  return {
    pageSnapshot,
    contactCandidates,
  };
}
