import { ContactValidationSchema, ExtractedFactSchema } from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  ContactValidationCheck,
  ContactValidationCheckStatus,
  DiscoveredProspect,
  ExtractedFact,
  FactSource,
  SiteContactCandidate,
  SiteSnapshot,
  StructuredBusinessData,
} from "@/lib/antigravity/schemas";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";

const STRONG_ADDRESS_THRESHOLD = 0.82;
const STRONG_CONTACT_PATH_THRESHOLD = 0.8;
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

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, value));
}

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}+/gu, "");
}

function normalizeComparableText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()[\]"'|+<>?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeComparableText(value: string) {
  return normalizeComparableText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function tokenOverlapScore(left: string, right: string) {
  const leftTokens = tokenizeComparableText(left);
  const rightTokens = tokenizeComparableText(right);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  const rightSet = new Set(rightTokens);
  const overlap = leftTokens.filter((token) => rightSet.has(token)).length;
  return overlap / Math.max(leftTokens.length, rightTokens.length);
}

function textsAreConsistent(left: string, right: string) {
  const normalizedLeft = normalizeComparableText(left);
  const normalizedRight = normalizeComparableText(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
    return true;
  }

  const numericTokensLeft: string[] = normalizedLeft.match(/\b\d{2,6}\b/g) ?? [];
  const numericTokensRight: string[] = normalizedRight.match(/\b\d{2,6}\b/g) ?? [];
  const sharesNumber =
    numericTokensLeft.length === 0 ||
    numericTokensRight.length === 0 ||
    numericTokensLeft.some((token) => numericTokensRight.includes(token));

  return sharesNumber && tokenOverlapScore(normalizedLeft, normalizedRight) >= 0.58;
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

  return !EXCLUDED_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
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

function normalizedHostname(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function sharesClinicOrigin(value: string, prospect: DiscoveredProspect, snapshot?: SiteSnapshot) {
  const candidateHost = normalizedHostname(value);
  if (!candidateHost) {
    return false;
  }

  const knownHosts = compact([
    prospect.websiteDomain?.toLowerCase().replace(/^www\./, ""),
    normalizedHostname(prospect.websiteUrl),
    snapshot?.domain.toLowerCase().replace(/^www\./, ""),
  ]);

  return knownHosts.length === 0 || knownHosts.includes(candidateHost);
}

function extractFactString(fact?: ExtractedFact) {
  return typeof fact?.value === "string" ? fact.value.trim() : undefined;
}

function sortFactsByConfidence(facts: ExtractedFact[]) {
  return [...facts].sort((left, right) => right.confidence - left.confidence);
}

function dedupeFactsByValue(
  facts: ExtractedFact[],
  normalizer: (value: string) => string | undefined,
) {
  const seen = new Set<string>();
  const output: ExtractedFact[] = [];

  for (const fact of sortFactsByConfidence(facts)) {
    const value = extractFactString(fact);
    if (!value) {
      continue;
    }

    const normalized = normalizer(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    output.push(
      ExtractedFactSchema.parse({
        ...fact,
        value: normalized.startsWith("+30 ") || normalized.includes("@") ? normalized : value,
      }),
    );
  }

  return output;
}

function makeSeedFact(args: {
  key: string;
  label: string;
  value: string;
  confidence: number;
  prospect: DiscoveredProspect;
  uri?: string;
}): ExtractedFact {
  return ExtractedFactSchema.parse({
    key: args.key,
    label: args.label,
    value: args.value,
    confidence: clampConfidence(args.confidence),
    provenance: [
      buildFactSource({
        sourceType: "campaign_seed",
        label: args.label,
        uri: args.uri ?? args.prospect.sourceUrl ?? args.prospect.websiteUrl ?? `prospect:${args.prospect.prospectId}`,
      }),
    ],
  });
}

function makeCandidateFact(args: {
  key: string;
  label: string;
  candidate: SiteContactCandidate;
  value?: string;
  confidence?: number;
}): ExtractedFact {
  return ExtractedFactSchema.parse({
    key: args.key,
    label: args.label,
    value: args.value ?? args.candidate.value,
    confidence: clampConfidence(args.confidence ?? args.candidate.confidence),
    provenance: args.candidate.provenance,
  });
}

function makeWebsiteFact(args: {
  key: string;
  label: string;
  value: string;
  confidence: number;
  uri: string;
  provenance?: FactSource[];
}): ExtractedFact {
  return ExtractedFactSchema.parse({
    key: args.key,
    label: args.label,
    value: args.value,
    confidence: clampConfidence(args.confidence),
    provenance:
      args.provenance && args.provenance.length > 0
        ? args.provenance
        : [
            buildFactSource({
              sourceType: "website_crawl",
              label: args.label,
              uri: args.uri,
            }),
          ],
  });
}

function buildCheck(args: {
  name: ContactValidationCheck["name"];
  status: ContactValidationCheckStatus;
  confidence: number;
  summary: string;
}): ContactValidationCheck {
  return {
    name: args.name,
    status: args.status,
    confidence: clampConfidence(args.confidence),
    summary: args.summary,
  };
}

function detectNeighborhood(text?: string) {
  if (!text) {
    return undefined;
  }

  const lower = text.toLowerCase();
  return ATHENS_NEIGHBORHOODS.find((candidate) => lower.includes(candidate.toLowerCase()));
}

function isAthensRelevant(args: {
  address?: string;
  neighborhood?: string;
  prospect: DiscoveredProspect;
  mapsQuery?: string;
}) {
  const joined = [
    args.address,
    args.neighborhood,
    args.mapsQuery,
    args.prospect.address,
    args.prospect.city,
    args.prospect.country,
  ]
    .filter(Boolean)
    .join(" ");
  const normalized = normalizeComparableText(joined);

  return (
    normalized.includes("athens") ||
    normalized.includes("athina") ||
    normalized.includes("αθηνα") ||
    normalized.includes("greece") ||
    normalized.includes("ελλαδα") ||
    Boolean(detectNeighborhood(joined))
  );
}

function extractPlaceIdFromMapsUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    return (
      url.searchParams.get("query_place_id") ??
      url.searchParams.get("place_id") ??
      undefined
    );
  } catch {
    return undefined;
  }
}

function extractMapsQuery(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const query =
      url.searchParams.get("q") ??
      url.searchParams.get("query") ??
      url.searchParams.get("destination") ??
      undefined;

    return query?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function buildPublicMapsLink(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

function buildMapsEmbedUrl(args: { apiKey?: string; addressQuery?: string; placeId?: string }) {
  if (args.apiKey) {
    const query = args.placeId ? `place_id:${args.placeId}` : args.addressQuery;
    if (!query) {
      return undefined;
    }

    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(args.apiKey)}&q=${encodeURIComponent(query)}`;
  }

  if (!args.addressQuery) {
    return undefined;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(args.addressQuery)}&output=embed`;
}

function averageConfidence(checks: ContactValidationCheck[]) {
  if (checks.length === 0) {
    return 0;
  }

  return clampConfidence(checks.reduce((total, check) => total + check.confidence, 0) / checks.length);
}

function findFact(facts: ExtractedFact[], key: string) {
  return facts.find((fact) => fact.key === key);
}

export function verifyAthensClinicContactsAndMap(args: {
  prospect: DiscoveredProspect;
  businessData: StructuredBusinessData;
  snapshot?: SiteSnapshot;
  mapsEmbedApiKey?: string;
}): ContactValidation {
  const { prospect, businessData, snapshot } = args;
  const contactFacts = businessData.contactFacts;
  const locationFacts = businessData.locationFacts;
  const mapSourceUrl = prospect.mapsUrl ?? extractFactString(findFact(locationFacts, "maps_url"));

  const rawPhoneFacts = contactFacts.filter((fact) => fact.key.startsWith("phone:"));
  const rawEmailFacts = contactFacts.filter((fact) => fact.key.startsWith("email:"));
  const rawAddressFacts = compact([
    findFact(locationFacts, "address"),
    ...(snapshot?.contactCandidates
      .filter((candidate) => candidate.type === "address")
      .map((candidate) =>
        makeCandidateFact({
          key: "address",
          label: "Address",
          candidate,
        }),
      ) ?? []),
    prospect.address
      ? makeSeedFact({
          key: "address",
          label: "Address",
          value: prospect.address,
          confidence: 0.66,
          prospect,
        })
      : null,
  ]);

  const validatedPhones = dedupeFactsByValue(
    rawPhoneFacts.filter((fact) => normalizeGreekPhone(String(fact.value))),
    normalizeGreekPhone,
  );
  const validatedEmails = dedupeFactsByValue(
    rawEmailFacts.filter((fact) => isLikelyBusinessEmail(normalizeEmail(String(fact.value)))),
    (value) => (isLikelyBusinessEmail(normalizeEmail(value)) ? normalizeEmail(value) : undefined),
  );

  const contactPageFact = sortFactsByConfidence(compact([
    findFact(contactFacts, "contact_page_url"),
    snapshot?.canonicalPages.contact
      ? makeWebsiteFact({
          key: "contact_page_url",
          label: "Contact page URL",
          value: snapshot.canonicalPages.contact.finalUrl,
          confidence: 0.96,
          uri: snapshot.canonicalPages.contact.finalUrl,
          provenance: snapshot.canonicalPages.contact.provenance,
        })
      : null,
  ])).find((fact) => {
    const value = extractFactString(fact);
    return value ? sharesClinicOrigin(value, prospect, snapshot) : false;
  });

  const bookingPageFact = sortFactsByConfidence(compact([
    findFact(contactFacts, "booking_url"),
    snapshot?.canonicalPages.booking
      ? makeWebsiteFact({
          key: "booking_url",
          label: "Appointment / booking URL",
          value: snapshot.canonicalPages.booking.finalUrl,
          confidence: 0.96,
          uri: snapshot.canonicalPages.booking.finalUrl,
          provenance: snapshot.canonicalPages.booking.provenance,
        })
      : null,
  ])).find((fact) => Boolean(extractFactString(fact)));

  const mapsListingFact = mapSourceUrl
    ? makeSeedFact({
        key: "maps_url",
        label: "Maps URL",
        value: mapSourceUrl,
        confidence: 0.82,
        prospect,
        uri: mapSourceUrl,
      })
    : undefined;

  const phoneCandidates = snapshot?.contactCandidates.filter((candidate) => candidate.type === "phone") ?? [];
  const validPhoneCandidateValues = new Set(phoneCandidates.map((candidate) => normalizeGreekPhone(candidate.value)).filter(Boolean) as string[]);
  const phoneVisibleOnKeyPage = phoneCandidates.some((candidate) => {
    const normalized = normalizeGreekPhone(candidate.value);
    return normalized && (candidate.pageType === "homepage" || candidate.pageType === "contact" || candidate.pageType === "booking");
  });
  const phoneCheck =
    validatedPhones.length > 0
      ? buildCheck({
          name: "phone_format_visibility",
          status: phoneVisibleOnKeyPage ? "passed" : "warning",
          confidence: phoneVisibleOnKeyPage ? 0.93 : 0.72,
          summary: phoneVisibleOnKeyPage
            ? "A valid Greek phone number is visible on a key page, so the clinic has a direct contact action for a live demo."
            : "A valid phone number exists, but it is not clearly surfaced on the homepage or contact flow.",
        })
      : buildCheck({
          name: "phone_format_visibility",
          status: "failed",
          confidence: 0.18,
          summary: "No valid Greek phone number was verified from the extracted clinic data.",
        });

  const emailCheck =
    validatedEmails.length > 0
      ? buildCheck({
          name: "email_format",
          status: "passed",
          confidence: 0.9,
          summary: "At least one business email passed format validation.",
        })
      : buildCheck({
          name: "email_format",
          status: "warning",
          confidence: 0.4,
          summary: "No business email was verified. This does not block a live demo if the phone/contact path is strong.",
        });

  const contactPageCheck = contactPageFact
    ? buildCheck({
        name: "contact_page_existence",
        status: snapshot?.canonicalPages.contact ? "passed" : "warning",
        confidence: snapshot?.canonicalPages.contact ? 0.96 : 0.74,
        summary: snapshot?.canonicalPages.contact
          ? "A contact page was crawled successfully."
          : "A contact URL exists, but the crawler did not verify it as a canonical contact page.",
      })
    : buildCheck({
        name: "contact_page_existence",
        status: "failed",
        confidence: 0.18,
        summary: "No reliable contact page was verified.",
      });

  const forms = snapshot?.extractedVisibleElements.forms ?? [];
  const hasContactForm = forms.some((form) => form.purposeHint === "contact" || form.purposeHint === "booking");
  const hasStrongBookingPath = Boolean(extractFactString(bookingPageFact));
  const ctaPathConfidence = clampConfidence(
    Math.max(
      hasStrongBookingPath ? bookingPageFact?.confidence ?? 0 : 0,
      contactPageFact?.confidence ?? 0,
      phoneCheck.confidence,
      hasContactForm ? 0.84 : 0,
    ),
  );
  const ctaPathCheck =
    hasStrongBookingPath || (Boolean(contactPageFact) && (phoneVisibleOnKeyPage || hasContactForm))
      ? buildCheck({
          name: "cta_path_validity",
          status: ctaPathConfidence >= STRONG_CONTACT_PATH_THRESHOLD ? "passed" : "warning",
          confidence: ctaPathConfidence,
          summary: hasStrongBookingPath
            ? "A usable booking/contact path was verified for the demo CTA flow."
            : "The site has a contact path, but it is less direct than a strong booking-ready clinic flow.",
        })
      : phoneCheck.status !== "failed" || hasContactForm
        ? buildCheck({
            name: "cta_path_validity",
            status: "warning",
            confidence: ctaPathConfidence,
            summary: "Some contact actions exist, but the path is too weak or fragmented for a confident live clinic demo.",
          })
        : buildCheck({
            name: "cta_path_validity",
            status: "failed",
            confidence: 0.2,
            summary: "No reliable contact or booking path was verified for a live demo CTA.",
          });

  const structuredNeighborhoodFact = findFact(locationFacts, "neighborhood");
  const bestAddressFact = sortFactsByConfidence(rawAddressFacts)[0];
  const bestAddressValue = extractFactString(bestAddressFact);
  const addressSupportCount = bestAddressValue
    ? rawAddressFacts.filter((fact) => {
        const value = extractFactString(fact);
        return value ? textsAreConsistent(bestAddressValue, value) : false;
      }).length
    : 0;
  const addressConflictCount = bestAddressValue
    ? rawAddressFacts.filter((fact) => {
        const value = extractFactString(fact);
        return value ? !textsAreConsistent(bestAddressValue, value) : false;
      }).length
    : 0;
  const inferredNeighborhoodValue =
    detectNeighborhood(bestAddressValue) ??
    detectNeighborhood(extractFactString(structuredNeighborhoodFact)) ??
    detectNeighborhood(prospect.address);
  const athensRelevant = isAthensRelevant({
    address: bestAddressValue,
    neighborhood: extractFactString(structuredNeighborhoodFact) ?? inferredNeighborhoodValue,
    mapsQuery: extractMapsQuery(mapSourceUrl),
    prospect,
  });

  const addressConfidence = clampConfidence(
    (bestAddressFact?.confidence ?? 0) +
      Math.min(0.12, Math.max(0, addressSupportCount - 1) * 0.06) -
      Math.min(0.28, addressConflictCount * 0.18) +
      (athensRelevant ? 0.04 : -0.1),
  );
  const addressCheck =
    bestAddressValue && addressConfidence >= STRONG_ADDRESS_THRESHOLD && addressConflictCount === 0 && athensRelevant
      ? buildCheck({
          name: "address_consistency",
          status: "passed",
          confidence: addressConfidence,
          summary: addressSupportCount > 1
            ? "The clinic address is consistent across the crawl and strong enough for a live Athens demo."
            : "A strong clinic address was verified and aligns with Athens location signals.",
        })
      : bestAddressValue && addressConfidence >= 0.62 && athensRelevant
        ? buildCheck({
            name: "address_consistency",
            status: "warning",
            confidence: addressConfidence,
            summary:
              addressConflictCount > 0
                ? "Address evidence is present but not fully consistent across sources."
                : "Address evidence exists, but it is not strong enough for a confident live business demo.",
          })
        : buildCheck({
            name: "address_consistency",
            status: "failed",
            confidence: addressConfidence || 0.18,
            summary: "Address evidence is too weak or inconsistent to present a live clinic location safely.",
          });

  const neighborhoodValue = extractFactString(structuredNeighborhoodFact) ?? inferredNeighborhoodValue;
  const neighborhoodCheck =
    neighborhoodValue && bestAddressValue && textsAreConsistent(`${bestAddressValue} ${neighborhoodValue}`, bestAddressValue)
      ? buildCheck({
          name: "neighborhood_consistency",
          status: "passed",
          confidence: clampConfidence(Math.max(structuredNeighborhoodFact?.confidence ?? 0, 0.82)),
          summary: "Neighborhood evidence is consistent with the verified Athens address.",
        })
      : neighborhoodValue && athensRelevant
        ? buildCheck({
            name: "neighborhood_consistency",
            status: "warning",
            confidence: clampConfidence(Math.max(structuredNeighborhoodFact?.confidence ?? 0, 0.58)),
            summary: "A neighborhood signal exists, but it is not strongly corroborated across the crawl.",
          })
        : buildCheck({
            name: "neighborhood_consistency",
            status: "warning",
            confidence: 0.35,
            summary: "No clear neighborhood signal was verified. Athens relevance depends on the broader address context.",
          });

  const placeId = extractPlaceIdFromMapsUrl(mapSourceUrl);
  const addressQuery = bestAddressValue ?? extractMapsQuery(mapSourceUrl);
  const safeForLiveWidget = addressCheck.status === "passed";
  const mapEmbedUrl = safeForLiveWidget
    ? buildMapsEmbedUrl({
        apiKey: args.mapsEmbedApiKey,
        addressQuery,
        placeId,
      })
    : undefined;
  const mapLinkUrl = mapSourceUrl ?? (addressQuery ? buildPublicMapsLink(addressQuery) : undefined);
  const mapCheck =
    safeForLiveWidget && (Boolean(addressQuery) || Boolean(placeId))
      ? buildCheck({
          name: "map_embed_configuration",
          status: "passed",
          confidence: clampConfidence(Math.max(addressCheck.confidence, mapSourceUrl ? 0.86 : 0.82)),
          summary: args.mapsEmbedApiKey
            ? "The clinic can be rendered with a real Google Maps widget from validated location data."
            : "The clinic can be rendered with a map widget from validated location data, using a public iframe fallback until an Embed API key is configured.",
        })
      : mapLinkUrl
        ? buildCheck({
            name: "map_embed_configuration",
            status: "warning",
            confidence: clampConfidence(Math.max(addressCheck.confidence, 0.42)),
            summary: "A public maps link exists, but the location evidence is not strong enough for a confident live widget.",
          })
        : buildCheck({
            name: "map_embed_configuration",
            status: "failed",
            confidence: 0.2,
            summary: "No safe map configuration could be derived for a live clinic demo.",
          });

  const blockers = compact([
    addressCheck.status !== "passed"
      ? "Address confidence is below the live-demo threshold, so the preview must stay in concept mode."
      : null,
    ctaPathCheck.status !== "passed"
      ? "Phone/contact path confidence is too weak for a live clinic demo."
      : null,
    !safeForLiveWidget && addressCheck.status === "passed"
      ? "The clinic location is not safe enough to show with a real map widget."
      : null,
  ]);

  const warnings = compact([
    phoneCheck.status === "warning" ? phoneCheck.summary : null,
    emailCheck.status === "warning" ? emailCheck.summary : null,
    contactPageCheck.status === "warning" ? contactPageCheck.summary : null,
    neighborhoodCheck.status === "warning" ? neighborhoodCheck.summary : null,
    mapCheck.status === "warning" ? mapCheck.summary : null,
    safeForLiveWidget && !args.mapsEmbedApiKey
      ? "GOOGLE_MAPS_EMBED_API_KEY is not configured, so previews use a public maps iframe fallback."
      : null,
  ]);

  const liveDemoEligibility = blockers.length === 0;
  const validatedAddress =
    addressCheck.status === "failed" || !bestAddressValue
      ? undefined
      : ExtractedFactSchema.parse({
          ...(bestAddressFact ??
            makeSeedFact({
              key: "address",
              label: "Address",
              value: bestAddressValue,
              confidence: addressConfidence,
              prospect,
            })),
          confidence: addressConfidence,
        });
  const validatedNeighborhood =
    neighborhoodValue && neighborhoodCheck.status !== "failed"
      ? ExtractedFactSchema.parse({
          ...(structuredNeighborhoodFact ??
            makeSeedFact({
              key: "neighborhood",
              label: "Neighborhood / Athens area",
              value: neighborhoodValue,
              confidence: neighborhoodCheck.confidence,
              prospect,
            })),
          confidence: neighborhoodCheck.confidence,
          value: neighborhoodValue,
        })
      : undefined;

  const checks = [
    addressCheck,
    neighborhoodCheck,
    phoneCheck,
    emailCheck,
    contactPageCheck,
    ctaPathCheck,
    mapCheck,
  ];
  const operatorSummary = liveDemoEligibility
    ? "Live demo approved: address, contact path, and map evidence are strong enough for a real Athens clinic preview."
    : `Downgrade to concept demo: ${blockers.join(" ")}`;

  return ContactValidationSchema.parse({
    pass: liveDemoEligibility,
    liveDemoEligibility,
    blockers,
    warnings,
    recommendedRenderMode: liveDemoEligibility ? "live_demo" : "concept_demo",
    validatedAddress,
    validatedNeighborhood,
    validatedEmails,
    validatedPhones: validatedPhones.sort((left, right) => {
      const leftValue = extractFactString(left);
      const rightValue = extractFactString(right);
      const leftPriority = leftValue && validPhoneCandidateValues.has(leftValue) ? 1 : 0;
      const rightPriority = rightValue && validPhoneCandidateValues.has(rightValue) ? 1 : 0;
      return rightPriority - leftPriority || right.confidence - left.confidence;
    }),
    validatedContactPage: contactPageFact,
    validatedBookingPage: bookingPageFact,
    validatedMapsListing: mapsListingFact,
    mapEmbedConfiguration: {
      provider: "google_maps",
      mode: safeForLiveWidget ? (placeId ? "place_id" : addressQuery ? "address" : "none") : mapLinkUrl ? "public_link_only" : "none",
      safeForLiveWidget,
      confidence: mapCheck.confidence,
      summary: mapCheck.summary,
      usesEmbedApi: Boolean(args.mapsEmbedApiKey),
      embedUrl: mapEmbedUrl,
      linkUrl: mapLinkUrl,
      placeId,
      addressQuery,
    },
    overallConfidence: averageConfidence(checks),
    checks,
    operatorSummary,
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "verify_athens_clinic_contacts_and_map",
        uri: prospect.websiteUrl ?? prospect.mapsUrl ?? `prospect:${prospect.prospectId}`,
      }),
    ],
  });
}
