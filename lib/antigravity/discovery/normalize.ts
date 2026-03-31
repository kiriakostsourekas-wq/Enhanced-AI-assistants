import type { CampaignConfig, DiscoveredProspect, LeadScore } from "@/lib/antigravity/schemas";
import type { DiscoverySourceCandidate } from "@/lib/antigravity/discovery/schemas";
import { DiscoveredProspectSchema } from "@/lib/antigravity/schemas";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";

const DIRECTORY_HOST_PARTS = [
  "google.com",
  "maps.google.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "doctoranytime",
  "vrisko.",
  "xo.gr",
  "businessguide.",
  "olesepicheiriseis.",
  "primepages.",
  "instadoctor.",
  "top100ofgreece.",
  "top-rated.online",
];

const MARKETPLACE_HOST_PARTS = ["skroutz", "tripadvisor", "booksy", "treatwell", "resy"];
const CHAIN_NAME_PATTERNS = [/\bplaza\b/i, /\bmarket\b/i, /\bfranchise\b/i];
const NON_APPOINTMENT_PATTERNS = [
  /\bgrocery\b/i,
  /\brestaurant\b/i,
  /\bshopping\b/i,
  /\bmarketplace\b/i,
  /\blibrary\b/i,
  /\bhotel\b/i,
  /\bcafe\b/i,
];
const APPOINTMENT_PATTERNS = [
  /\bclinic\b/i,
  /\bdent/i,
  /\bdoctor\b/i,
  /\bmedical\b/i,
  /\borthop/i,
  /\bophthalm/i,
  /\bplastic\b/i,
  /\bdermat/i,
  /\bfertility\b/i,
  /\bcardio\b/i,
  /\bdiagnostic\b/i,
  /\bphysio/i,
  /\btherapy\b/i,
  /\bhospital\b/i,
  /\bχειρουργ/i,
  /\bιατρ/i,
  /\bκλιν/i,
  /\bοδοντ/i,
  /\bοφθαλμ/i,
];

export type CandidateWebsiteStatus =
  | { kind: "missing" }
  | { kind: "directory" | "official"; url: string; domain: string };

export type NormalizedDiscoveryCandidate = {
  externalId: string;
  businessName: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  visibleEmail?: string;
  website: CandidateWebsiteStatus;
  contactPageUrl?: string;
  mapsUrl?: string;
  sourceUrl: string;
  notes?: string;
  confidence: number;
  provenance: DiscoverySourceCandidate["provenance"];
  scoring: LeadScore;
};

function safeHostname(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function normalizeBusinessName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeAddress(value?: string) {
  return value?.replace(/\s+/g, " ").trim() || undefined;
}

function parseCountry(candidate: DiscoverySourceCandidate) {
  const combined = `${candidate.country ?? ""} ${candidate.address ?? ""}`.toLowerCase();

  if (combined.includes("greece") || combined.includes("ελλάδα")) {
    return "Greece";
  }

  return candidate.country;
}

function parseCity(candidate: DiscoverySourceCandidate) {
  const combined = `${candidate.city ?? ""} ${candidate.address ?? ""}`.toLowerCase();

  if (combined.includes("athina") || combined.includes("athens") || combined.includes("αθήνα")) {
    return "Athens";
  }

  return candidate.city;
}

function isDirectoryHost(host?: string) {
  return !!host && DIRECTORY_HOST_PARTS.some((part) => host.includes(part));
}

function isMarketplaceHost(host?: string) {
  return !!host && MARKETPLACE_HOST_PARTS.some((part) => host.includes(part));
}

function selectWebsite(candidate: DiscoverySourceCandidate): CandidateWebsiteStatus {
  const officialHost = safeHostname(candidate.officialWebsiteUrl);
  if (candidate.officialWebsiteUrl && officialHost && !isDirectoryHost(officialHost) && !isMarketplaceHost(officialHost)) {
    return {
      kind: "official",
      url: candidate.officialWebsiteUrl,
      domain: officialHost,
    };
  }

  const websiteHost = safeHostname(candidate.websiteUrl);
  if (candidate.websiteUrl && websiteHost) {
    if (isDirectoryHost(websiteHost) || isMarketplaceHost(websiteHost)) {
      return {
        kind: "directory",
        url: candidate.websiteUrl,
        domain: websiteHost,
      };
    }

    return {
      kind: "official",
      url: candidate.websiteUrl,
      domain: websiteHost,
    };
  }

  return { kind: "missing" };
}

function scoreLocalRelevance(candidate: DiscoverySourceCandidate, campaign: CampaignConfig) {
  const wantedCity = campaign.geography.city?.toLowerCase();
  const wantedCountryCode = campaign.geography.countryCode.toLowerCase();
  const city = parseCity(candidate)?.toLowerCase();
  const country = parseCountry(candidate)?.toLowerCase();
  const address = (candidate.address ?? "").toLowerCase();

  let score = 0;
  if (wantedCountryCode === "gr" && country === "greece") {
    score += 0.45;
  }

  if (wantedCity && city === wantedCity) {
    score += 0.45;
  } else if (wantedCity && address.includes(wantedCity)) {
    score += 0.35;
  }

  if (address.includes("athina") || address.includes("athens") || address.includes("αθήνα")) {
    score = Math.max(score, 0.8);
  }

  return Math.min(1, score);
}

function matchesPattern(patterns: RegExp[], value: string) {
  return patterns.some((pattern) => pattern.test(value));
}

function scoreIcpFit(candidate: DiscoverySourceCandidate, campaign: CampaignConfig) {
  const haystack = `${candidate.businessName} ${candidate.category ?? ""}`.toLowerCase();
  const verticalTokens = campaign.vertical
    .toLowerCase()
    .split(/[^a-zα-ω0-9]+/i)
    .filter((token) => token.length >= 4);

  if (matchesPattern(NON_APPOINTMENT_PATTERNS, haystack)) {
    return 0;
  }

  let score = matchesPattern(APPOINTMENT_PATTERNS, haystack) ? 0.55 : 0.2;

  const tokenHits = verticalTokens.filter((token) => haystack.includes(token)).length;
  if (tokenHits > 0) {
    score += Math.min(0.35, tokenHits * 0.18);
  }

  if ((candidate.category ?? "").toLowerCase().includes("clinic")) {
    score += 0.1;
  }

  return Math.min(1, score);
}

function scoreWebsitePresent(website: CandidateWebsiteStatus) {
  if (website.kind === "official") {
    return 1;
  }

  if (website.kind === "directory") {
    return 0.15;
  }

  return 0;
}

function scoreContactability(candidate: DiscoverySourceCandidate, website: CandidateWebsiteStatus) {
  let score = 0;

  if (candidate.visibleEmail) {
    score += 0.45;
  }

  if (candidate.phone) {
    score += 0.3;
  }

  if (candidate.contactPageUrl) {
    score += 0.2;
  } else if (website.kind === "official") {
    score += 0.1;
  }

  return Math.min(1, score);
}

function buildScoreCard(candidate: DiscoverySourceCandidate, campaign: CampaignConfig, website: CandidateWebsiteStatus): LeadScore {
  const icpFit = scoreIcpFit(candidate, campaign);
  const websitePresent = scoreWebsitePresent(website);
  const contactability = scoreContactability(candidate, website);
  const localRelevance = scoreLocalRelevance(candidate, campaign);
  const overall = Math.min(1, icpFit * 0.35 + localRelevance * 0.3 + contactability * 0.25 + websitePresent * 0.1);

  return {
    icpFit,
    websitePresent,
    contactability,
    localRelevance,
    overall,
  };
}

export function shouldExcludeCandidate(candidate: DiscoverySourceCandidate, campaign: CampaignConfig, website: CandidateWebsiteStatus) {
  const normalizedName = normalizeBusinessName(candidate.businessName);
  const lowerName = normalizedName.toLowerCase();
  const websiteDomain = website.kind === "missing" ? undefined : website.domain;

  if (campaign.discovery.excludeBusinessNames.some((value) => lowerName.includes(value.toLowerCase()))) {
    return true;
  }

  if (websiteDomain && campaign.discovery.excludeDomains.some((value) => websiteDomain.includes(value.toLowerCase()))) {
    return true;
  }

  if (isMarketplaceHost(websiteDomain)) {
    return true;
  }

  if (CHAIN_NAME_PATTERNS.some((pattern) => pattern.test(normalizedName))) {
    return true;
  }

  return matchesPattern(NON_APPOINTMENT_PATTERNS, `${candidate.category ?? ""} ${candidate.businessName}`);
}

export function dedupeKey(candidate: NormalizedDiscoveryCandidate) {
  if (candidate.website?.kind === "official") {
    return `domain:${candidate.website.domain}`;
  }

  const address = (candidate.address ?? "").toLowerCase();
  const phone = (candidate.phone ?? "").replace(/\D+/g, "");
  return `name:${slugify(candidate.businessName)}|address:${slugify(address)}|phone:${phone}`;
}

export function toDiscoveredProspect(
  candidate: NormalizedDiscoveryCandidate,
  campaign: CampaignConfig,
  index: number,
): DiscoveredProspect {
  return DiscoveredProspectSchema.parse({
    prospectId: `${campaign.campaignId}-${slugify(candidate.businessName)}-${index + 1}`,
    businessName: candidate.businessName,
    websiteDomain: candidate.website?.kind === "missing" ? undefined : candidate.website.domain,
    category: candidate.category,
    address: candidate.address,
    city: candidate.city,
    country: candidate.country,
    phone: candidate.phone,
    visibleEmail: candidate.visibleEmail,
    contactPageUrl: candidate.contactPageUrl,
    websiteUrl: candidate.website?.kind === "official" ? candidate.website.url : undefined,
    mapsUrl: candidate.mapsUrl,
    sourceUrl: candidate.sourceUrl,
    scoring: candidate.scoring,
    notes: candidate.notes,
    confidence: candidate.confidence,
    provenance: [
      ...candidate.provenance,
      buildFactSource({
        sourceType: "stage_output",
        label: "appointment SMB normalization",
        uri: candidate.sourceUrl,
      }),
    ],
  });
}

export function normalizeCandidate(candidate: DiscoverySourceCandidate, campaign: CampaignConfig): NormalizedDiscoveryCandidate {
  const website = selectWebsite(candidate);
  const scoring = buildScoreCard(candidate, campaign, website);

  return {
    externalId: candidate.externalId,
    businessName: normalizeBusinessName(candidate.businessName),
    category: candidate.category,
    address: normalizeAddress(candidate.address),
    city: parseCity(candidate),
    country: parseCountry(candidate),
    phone: candidate.phone,
    visibleEmail: candidate.visibleEmail,
    website,
    contactPageUrl: candidate.contactPageUrl,
    mapsUrl: candidate.mapsUrl,
    sourceUrl: candidate.sourceUrl,
    notes: candidate.notes,
    confidence: Math.min(1, (candidate.confidence + scoring.overall) / 2),
    provenance: candidate.provenance,
    scoring,
  };
}
