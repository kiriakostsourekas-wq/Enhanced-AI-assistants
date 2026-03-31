import { DemoLandingPageSchema } from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  DemoChatbotConfig,
  DemoLandingPage,
  DiscoveredProspect,
  ExtractedFact,
  KnowledgePack,
  StructuredClinicField,
  StructuredFieldStatus,
  WebsiteGrade,
} from "@/lib/antigravity/schemas";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";

const DEFAULT_RENDER_THRESHOLD = 0.72;
const STRONG_CONTACT_THRESHOLD = 0.84;
const STRONG_LOCATION_THRESHOLD = 0.84;
const NON_HERO_IMAGE_PATTERNS = /(logo|icon|flag|badge|favicon|sprite|placeholder|blank)/i;

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

function normalizePhoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function buildGoogleMapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function choosePrimaryCta(args: {
  bookingUrl?: string;
  phone?: string;
  contactUrl?: string;
  conceptMode: boolean;
}) {
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

function chooseHeroImage(imageUrls: string[]) {
  return imageUrls.find((url) => !NON_HERO_IMAGE_PATTERNS.test(url));
}

function buildDoctorCards(args: {
  doctorNames: string[];
  teamNames: string[];
  category?: string;
  qualifications: string[];
}) {
  const names = uniqueStrings([...args.doctorNames, ...args.teamNames]).slice(0, 6);
  return names.map((name, index) => ({
    name,
    role: args.category,
    bio: index < args.qualifications.length ? args.qualifications[index] : undefined,
  }));
}

function buildServiceCards(services: string[], category?: string) {
  // Future vertical templates can swap this mapper while keeping the same page schema.
  if (services.length > 0) {
    return services.slice(0, 8).map((service) => ({ title: service }));
  }

  if (category) {
    return [
      {
        title: `Εξειδίκευση: ${category}`,
        detail: "Οι επιμέρους υπηρεσίες θα επιβεβαιωθούν πριν από live αποστολή προς την κλινική.",
      },
    ];
  }

  return [
    {
      title: "Υπηρεσίες υπό επιβεβαίωση",
      detail: "Το demo παραμένει συντηρητικό μέχρι να επιβεβαιωθούν περισσότερα δημόσια στοιχεία.",
    },
  ];
}

function buildSummarySections(args: {
  category?: string;
  services: string[];
  websiteGrade: WebsiteGrade;
  renderingMode: DemoLandingPage["renderingMode"];
  liveDemoRationale: string;
}) {
  return [
    {
      heading: "Γιατί αυτό το demo έχει εμπορικό νόημα",
      body: args.websiteGrade.plainEnglishDiagnosis,
    },
    {
      heading: "Επαληθευμένο business context",
      body:
        args.services.length > 0
          ? `Επαληθεύτηκαν δημόσια στοιχεία για ${args.category ?? "την κλινική"} και υπηρεσίες όπως ${args.services.slice(0, 4).join(", ")}.`
          : `Επαληθεύτηκε δημόσιο context για ${args.category ?? "την κλινική"}, αλλά η λεπτομερής λίστα υπηρεσιών χρειάζεται περαιτέρω επιβεβαίωση.`,
    },
    {
      heading: args.renderingMode === "live_demo" ? "Live demo mode" : "Concept demo mode",
      body: args.liveDemoRationale,
    },
  ];
}

export function buildClinicDemoLandingPage(args: {
  campaignId: string;
  prospect: DiscoveredProspect;
  knowledgePack: KnowledgePack;
  websiteGrade: WebsiteGrade;
  chatbotConfig: DemoChatbotConfig;
  contactValidation?: ContactValidation;
}): DemoLandingPage {
  // This builder is the clinic-specific mapping layer. Reuse the schema, but fork the mapping
  // rules per vertical when salons, med spas, or other appointment-led SMBs need different blocks.
  const extraction = args.knowledgePack.structuredJson;
  const clinicName = fieldText(extraction.clinicName, 0.7, ["verified_fact"]) ?? args.prospect.businessName;
  const category =
    fieldText(extraction.clinicCategory, 0.68, ["verified_fact", "inferred_suggestion"]) ?? args.prospect.category;
  const neighborhood =
    factText(args.contactValidation?.validatedNeighborhood) ??
    fieldText(extraction.neighborhood, 0.66, ["verified_fact", "inferred_suggestion"]);
  const address =
    factText(args.contactValidation?.validatedAddress) ??
    fieldText(extraction.address, STRONG_LOCATION_THRESHOLD, ["verified_fact"]);
  const phones = uniqueStrings([
    ...factTexts(args.contactValidation?.validatedPhones ?? []),
    ...fieldTexts(extraction.phoneNumbers, STRONG_CONTACT_THRESHOLD, ["verified_fact"]),
  ]);
  const emails = uniqueStrings([
    ...factTexts(args.contactValidation?.validatedEmails ?? []),
    ...fieldTexts(extraction.emails, STRONG_CONTACT_THRESHOLD, ["verified_fact"]),
  ]);
  const bookingUrl =
    factText(args.contactValidation?.validatedBookingPage) ??
    fieldText(extraction.bookingUrl, STRONG_CONTACT_THRESHOLD, ["verified_fact"]);
  const contactPageUrl =
    factText(args.contactValidation?.validatedContactPage) ??
    fieldText(extraction.contactPageUrl, STRONG_CONTACT_THRESHOLD, ["verified_fact"]);
  const hours = fieldTexts(extraction.openingHours, 0.78, ["verified_fact"]);
  const services = fieldTexts(extraction.coreServices, 0.72, ["verified_fact"]);
  const qualifications = fieldTexts(extraction.qualificationsAndSpecialties, 0.76, ["verified_fact"]);
  const trustMarkers = fieldTexts(extraction.trustMarkers, 0.76, ["verified_fact"]);
  const doctorNames = fieldTexts(extraction.doctorNames, 0.76, ["verified_fact"]);
  const teamNames = fieldTexts(extraction.teamNames, 0.76, ["verified_fact"]);
  const testimonials = fieldTexts(extraction.testimonials, 0.7, ["verified_fact"]).slice(0, 4);
  const imageUrls = fieldTexts(extraction.imageGalleryUrls, 0.74, ["verified_fact"]);
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
  const clinicStory =
    fieldText(extraction.clinicStory, 0.72, ["verified_fact"]) ??
    args.knowledgePack.summary;

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
  const heroImageUrl = chooseHeroImage(imageUrls);
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

  const doctorCards = buildDoctorCards({
    doctorNames,
    teamNames,
    category,
    qualifications,
  });
  const serviceCards = buildServiceCards(services, category);
  const chatbotEndpointPath = `/api/antigravity-chat/${slugify(args.campaignId)}/${slugify(args.prospect.businessName)}`;
  const headline =
    renderingMode === "live_demo"
      ? `${clinicName} με πιο καθαρή διαδρομή προς επικοινωνία και ραντεβού.`
      : `${clinicName} σε polished concept demo για ασθενείς στην Αθήνα.`;
  const subheadline =
    renderingMode === "live_demo"
      ? `${category ?? "Κλινική στην Αθήνα"} με Greek-first εμπειρία, πιο ξεκάθαρο above-the-fold μήνυμα και CTA που οδηγεί τον ασθενή σε επόμενο βήμα μέσα σε λίγα δευτερόλεπτα.`
      : `${category ?? "Κλινική στην Αθήνα"} σε Greek-first concept demo που δείχνει πώς θα μπορούσε να αποδίδει καλύτερα εμπορικά, χωρίς να παρουσιάζει αβέβαια στοιχεία ως βέβαια.`;
  const footerNote =
    renderingMode === "live_demo"
      ? "Το demo χρησιμοποιεί μόνο επαληθευμένα δημόσια στοιχεία επικοινωνίας και τοποθεσίας."
      : args.contactValidation?.operatorSummary ??
        "Το demo παραμένει σε concept mode μέχρι να επιβεβαιωθούν επαρκώς τα στοιχεία επικοινωνίας ή τοποθεσίας για live αποστολή.";

  return DemoLandingPageSchema.parse({
    slug: `${slugify(args.campaignId)}-${slugify(args.prospect.businessName)}`,
    title: `${clinicName} | Demo clinic landing page`,
    metaDescription: subheadline,
    renderingMode,
    modeNotice,
    headline,
    subheadline,
    callToActionLabel: primaryCta.label,
    hero: {
      eyebrow: renderingMode === "live_demo" ? "Greek-first clinic demo" : "Concept clinic demo",
      headline,
      subheadline,
      primaryCta,
      secondaryCta,
      badges: uniqueStrings(
        compact([
          category,
          neighborhood ? `Αθήνα • ${neighborhood}` : args.prospect.city ? `Αθήνα • ${args.prospect.city}` : "Αθήνα",
          renderingMode === "live_demo" ? "Live demo" : "Concept demo",
        ]),
      ),
      stats: compact([
        category ? { label: "Ειδικότητα", value: category } : null,
        neighborhood ? { label: "Περιοχή", value: neighborhood } : null,
        phones[0] ? { label: "Άμεση επικοινωνία", value: phones[0] } : null,
      ]),
      imageUrl: heroImageUrl,
      imageAlt: heroImageUrl ? `${clinicName} demo preview` : undefined,
    },
    improvementHighlights: args.websiteGrade.topDemoImprovementOpportunities.map((item) => ({
      title: item.title,
      detail: item.detail,
    })),
    services: serviceCards,
    trustItems,
    doctorCards,
    testimonials: testimonials.map((quote) => ({ quote })),
    faqs: faqItems,
    contactItems,
    map,
    chatbot: {
      title: "Chatbot επίδειξης",
      description:
        renderingMode === "live_demo"
          ? "Greek-first chatbot demo για ερωτήσεις, αρχική αξιολόγηση ενδιαφέροντος και ασφαλή προώθηση προς επικοινωνία ή ραντεβού."
          : "Greek-first chatbot demo που δείχνει τη μελλοντική εμπειρία απαντήσεων, χωρίς να ισχυρίζεται μη επαληθευμένα στοιχεία.",
      endpointPath: chatbotEndpointPath,
      initialAssistantMessage:
        renderingMode === "live_demo"
          ? `Γεια σας. Μπορώ να βοηθήσω με βασικές ερωτήσεις για το demo του ${clinicName} και να σας κατευθύνω προς το κατάλληλο επόμενο βήμα.`
          : `Γεια σας. Αυτό είναι concept demo για το ${clinicName}. Μπορώ να απαντήσω μόνο με βάση τα επαληθευμένα δημόσια στοιχεία που έχουν συγκεντρωθεί.`,
      starterPrompts: uniqueStrings(
        compact([
          services[0] ? `Ποιες υπηρεσίες προβάλλονται στο demo;` : null,
          bookingUrl ? "Πώς οδηγεί το demo σε ραντεβού;" : "Πώς θα βοηθούσε αυτό το demo στις νέες επαφές;",
          "Τι βελτιώνει αυτό το demo σε σχέση με το τρέχον site;",
        ]),
      ).slice(0, 3),
      cta: persistentCta,
      leadCaptureFields: args.chatbotConfig.leadCaptureFields,
      disabledReason: renderingMode === "concept_demo" ? "Τα live contact details παραμένουν συντηρητικά μέχρι επιβεβαίωσης." : undefined,
    },
    persistentCta,
    footer: {
      note: footerNote,
      contactItems,
      locationNote:
        renderingMode === "live_demo"
          ? neighborhood ?? args.prospect.city
          : "Athens clinic preview",
    },
    sections: buildSummarySections({
      category,
      services,
      websiteGrade: args.websiteGrade,
      renderingMode,
      liveDemoRationale: args.contactValidation?.operatorSummary ?? args.knowledgePack.liveDemoEligibility.rationale,
    }),
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "build_clinic_demo_landing_page",
        uri: args.prospect.websiteUrl ?? args.prospect.mapsUrl ?? `prospect:${args.prospect.prospectId}`,
      }),
    ],
  });
}
