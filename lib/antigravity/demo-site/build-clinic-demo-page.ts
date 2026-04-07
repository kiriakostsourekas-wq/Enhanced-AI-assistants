import { DemoLandingPageSchema } from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  DemoChatbotConfig,
  DemoLandingPage,
  DemoLandingPageMediaItem,
  DiscoveredProspect,
  KnowledgePack,
  NormalizedDesignSchema,
  WebsiteCrawlResult,
  WebsiteGrade,
} from "@/lib/antigravity/schemas";
import { buildClinicDemoContext } from "@/lib/antigravity/demo-site/clinic-demo-context";
import { resolveEditorialClinicProfile } from "@/lib/antigravity/demo-site/editorial-profiles";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";

type DemoLandingPageDoctor = DemoLandingPage["doctorCards"][number];
type DemoLandingPageContactItem = DemoLandingPage["contactItems"][number];
type DemoLandingPageService = DemoLandingPage["services"][number];
type DemoLandingPageTestimonial = DemoLandingPage["testimonials"][number];

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item).trim().toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function qualificationChunks(items: string[]) {
  const chunks: string[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    chunks.push(items.slice(index, index + 2));
  }

  return chunks;
}

function cleanTestimonial(value: string) {
  const normalized = value.replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();

  if (normalized.length < 24) {
    return undefined;
  }

  return normalized;
}

function buildDoctorCards(args: {
  doctorNames: string[];
  teamNames: string[];
  category?: string;
  qualifications: string[];
  mediaGallery: DemoLandingPageMediaItem[];
}) {
  const names = uniqueStrings([...args.doctorNames, ...args.teamNames]).slice(0, 4);
  const factsByDoctor = qualificationChunks(args.qualifications);
  const portraitImages = args.mediaGallery.filter((item) => item.emphasis === "portrait" || item.emphasis === "team");

  return names.map((name, index) => ({
    name,
    role: args.category,
    bio: index < args.qualifications.length ? args.qualifications[index] : undefined,
    facts: factsByDoctor[index] ?? [],
    imageUrl: portraitImages[index]?.url,
    imageAlt: portraitImages[index]?.alt ?? `${name} portrait`,
  }));
}

function serviceDetail(args: {
  index: number;
  service: string;
  layout: NormalizedDesignSchema["servicesLayout"];
  category?: string;
}) {
  if (args.layout === "feature_split" && args.index === 0) {
    return "Τοποθετείται σε featured θέση για να αποσαφηνίζει άμεσα την κύρια εξειδίκευση της κλινικής.";
  }

  if (args.layout === "stacked_list") {
    return "Σύντομη verified περιγραφή για ταχύτερο mobile scanning και πιο καθαρή επιλογή επόμενου βήματος.";
  }

  if (args.category) {
    return `Επαληθευμένη υπηρεσία που εντάσσεται στο νέο ${args.category.toLowerCase()} demo.`;
  }

  return undefined;
}

function buildServiceCards(args: {
  services: string[];
  category?: string;
  layout: NormalizedDesignSchema["servicesLayout"];
  mediaGallery: DemoLandingPageMediaItem[];
}) {
  const serviceMedia = args.mediaGallery.filter((item) => item.emphasis === "service");
  const clinicMedia = args.mediaGallery.filter((item) => item.emphasis === "clinic");
  const mediaPool = [...serviceMedia, ...clinicMedia];

  if (args.services.length > 0) {
    return args.services.slice(0, 8).map((service, index) => ({
      title: service,
      eyebrow: index === 0 && args.layout === "feature_split" ? "Featured service" : "Verified service",
      detail: serviceDetail({
        index,
        service,
        layout: args.layout,
        category: args.category,
      }),
      imageUrl: mediaPool[index]?.url,
      imageAlt: mediaPool[index]?.alt ?? mediaPool[index]?.caption ?? service,
    }));
  }

  if (args.category) {
    return [
      {
        title: `Εξειδίκευση: ${args.category}`,
        eyebrow: "Verified specialty",
        detail: "Οι επιμέρους υπηρεσίες παραμένουν συντηρητικές μέχρι να επιβεβαιωθούν περισσότερα δημόσια στοιχεία.",
        imageUrl: mediaPool[0]?.url,
        imageAlt: mediaPool[0]?.alt ?? mediaPool[0]?.caption ?? args.category,
      },
    ];
  }

  return [
    {
      title: "Υπηρεσίες υπό επιβεβαίωση",
      eyebrow: "Conservative fallback",
      detail: "Το demo κρατά καθαρότερη δομή χωρίς να γεμίζει τα κενά με μη επαληθευμένες claims.",
      imageUrl: mediaPool[0]?.url,
      imageAlt: mediaPool[0]?.alt ?? mediaPool[0]?.caption ?? "Clinic visual",
    },
  ];
}

function heroCopy(args: {
  clinicName: string;
  category?: string;
  neighborhood?: string;
  renderingMode: DemoLandingPage["renderingMode"];
  heroType: NormalizedDesignSchema["hero"]["type"];
  voice: NormalizedDesignSchema["voice"];
  rationale: string;
}) {
  const location = args.neighborhood ? `στην ${args.neighborhood}` : "στην Αθήνα";
  const specialty = args.category ?? "κλινική";
  const toneFragment =
    args.voice === "precise_specialist"
      ? "με πιο ειδικό, ακριβές και αξιόπιστο μήνυμα"
      : args.voice === "warm_reassuring"
        ? "με πιο ζεστή, καθησυχαστική και ξεκάθαρη πρώτη εντύπωση"
        : args.voice === "modern_premium"
          ? "με πιο οργανωμένη, premium και σύγχρονη παρουσίαση"
          : "με πιο καθαρή τοπική αξιοπιστία και ευκολότερη κατεύθυνση προς επικοινωνία";

  switch (args.heroType) {
    case "split_contact":
      return {
        eyebrow: args.renderingMode === "live_demo" ? "Greek-first clinic redesign" : "Contact-first concept redesign",
        headline: `${args.clinicName} με πιο καθαρή hero διαδρομή προς επικοινωνία και εμπιστοσύνη.`,
        subheadline:
          args.renderingMode === "live_demo"
            ? `${specialty} ${location} ${toneFragment}. Η πρώτη οθόνη κάνει τις βασικές ενέργειες και τα verified στοιχεία σαφή πριν από το πρώτο scroll.`
            : `${specialty} ${location} σε concept demo που δείχνει πώς η hero μπορεί να οδηγεί γρηγορότερα σε επαφή, χωρίς να υπερβάλλει όπου τα στοιχεία παραμένουν συντηρητικά.`,
      };
    case "split_credentials":
      return {
        eyebrow: "Specialist trust redesign",
        headline: `${args.clinicName} με ειδικότητα, γιατρό και αξιοπιστία πιο μπροστά από το πρώτο scroll.`,
        subheadline: `${specialty} ${location} ${toneFragment}. Το hero απαντά άμεσα στο αδύναμο σημείο «${args.rationale}» με πιο ορατή εξειδίκευση και πιο πειστική οπτική δομή.`,
      };
    case "split_image":
      return {
        eyebrow: "Image-led clinic redesign",
        headline: `${args.clinicName}: πιο ζωντανή πρώτη εντύπωση για ασθενείς ${location}.`,
        subheadline: `${specialty} με Greek-first structure, πραγματικά visuals και πιο σαφή υπηρεσιακή ιεραρχία αντί για generic clinic layout.`,
      };
    default:
      return {
        eyebrow: "Critique-first demo",
        headline: `${args.clinicName} με πιο δυνατή πρώτη οθόνη και λιγότερη τριβή πριν την επικοινωνία.`,
        subheadline: `${specialty} ${location} ${toneFragment}. Το demo χτίστηκε από verified facts, τρέχοντα visuals και συγκεκριμένη κριτική του site, όχι από γενικό template.`,
      };
  }
}

function buildSummarySections(args: {
  category?: string;
  services: string[];
  websiteGrade: WebsiteGrade;
  renderingMode: DemoLandingPage["renderingMode"];
  liveDemoRationale: string;
  designSchema: NormalizedDesignSchema;
  mediaCount: number;
}) {
  return compact([
    {
      heading: "Γιατί αυτό το redesign είναι πιο πειστικό",
      body: `${args.designSchema.designSummary} ${args.websiteGrade.plainEnglishDiagnosis}`.trim(),
    },
    {
      heading: "Τι βλέπει πιο γρήγορα ο ασθενής",
      body:
        args.services.length > 0
          ? `Η νέα ιεραρχία φέρνει νωρίτερα υπηρεσίες όπως ${args.services.slice(0, 3).join(", ")} και δεν αφήνει την εξειδίκευση θαμμένη πιο χαμηλά στη σελίδα.`
          : `Η νέα ιεραρχία δίνει νωρίτερα specialty context και επαφή, ακόμη κι όταν οι επιμέρους υπηρεσίες χρειάζονται πρόσθετη επιβεβαίωση.`,
    },
    args.mediaCount > 0
      ? {
          heading: "Visual treatment με πραγματικά clinic assets",
          body: `Το demo χρησιμοποιεί ${args.mediaCount} δημόσια visuals από το τρέχον site ώστε η σελίδα να δείχνει πιο αληθινή και λιγότερο template-first.`,
        }
      : null,
    {
      heading: args.renderingMode === "live_demo" ? "Live demo mode" : "Concept demo mode",
      body: args.liveDemoRationale,
    },
  ]);
}

function buildTestimonials(quotes: string[]) {
  return uniqueBy(
    compact(
      quotes.map((quote) => {
        const cleaned = cleanTestimonial(quote);
        return cleaned ? { quote: cleaned } : null;
      }),
    ),
    (item) => item.quote,
  ).slice(0, 6);
}

function mergeServices(generated: DemoLandingPageService[], curated: DemoLandingPageService[] = []) {
  if (curated.length > 0) {
    return uniqueBy(curated, (item) => item.title).slice(0, 8);
  }

  return uniqueBy(generated, (item) => item.title).slice(0, 8);
}

function mergeDoctorCards(generated: DemoLandingPageDoctor[], curated: DemoLandingPageDoctor[] = []) {
  if (curated.length > 0) {
    return uniqueBy(curated, (item) => item.name).slice(0, 6);
  }

  return uniqueBy(generated, (item) => item.name).slice(0, 6);
}

function mergeTestimonials(generated: DemoLandingPageTestimonial[], curated: DemoLandingPageTestimonial[] = []) {
  if (curated.length > 0) {
    return uniqueBy(curated, (item) => item.quote).slice(0, 6);
  }

  return uniqueBy(generated, (item) => item.quote).slice(0, 6);
}

function mergeMediaGallery(generated: DemoLandingPageMediaItem[], curated: DemoLandingPageMediaItem[] = []) {
  return uniqueBy([...curated, ...generated], (item) => item.url).slice(0, 8);
}

function contactPriority(item: DemoLandingPageContactItem) {
  switch (item.label) {
    case "Τηλέφωνο":
      return 0;
    case "Email":
      return 1;
    case "Διεύθυνση":
      return 2;
    case "Σελίδα ραντεβού":
      return 3;
    case "Επικοινωνία":
      return 4;
    case "Google Maps":
      return 5;
    default:
      return 6;
  }
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function sanitizeContactItems(items: DemoLandingPageContactItem[]) {
  const grouped = new Map<string, DemoLandingPageContactItem[]>();

  for (const item of items) {
    const bucket = grouped.get(item.label) ?? [];
    bucket.push(item);
    grouped.set(item.label, bucket);
  }

  const cleaned: DemoLandingPageContactItem[] = [];
  const phoneItems = uniqueBy(grouped.get("Τηλέφωνο") ?? [], (item) => normalizePhone(item.value)).slice(0, 1);
  const emailItems = uniqueBy(grouped.get("Email") ?? [], (item) => item.value.toLowerCase()).slice(0, 1);
  const addressItems = uniqueBy(grouped.get("Διεύθυνση") ?? [], (item) => item.value.toLowerCase()).slice(0, 1);
  const bookingItems = uniqueBy(grouped.get("Σελίδα ραντεβού") ?? [], (item) => item.href ?? item.value).slice(0, 1);
  const contactPageItems = uniqueBy(grouped.get("Επικοινωνία") ?? [], (item) => item.href ?? item.value).slice(0, 1);
  const mapsItems = uniqueBy(grouped.get("Google Maps") ?? [], (item) => item.href ?? item.value).slice(0, 1);
  const handledLabels = new Set(["Τηλέφωνο", "Email", "Διεύθυνση", "Σελίδα ραντεβού", "Επικοινωνία", "Google Maps"]);

  cleaned.push(...phoneItems, ...emailItems, ...addressItems, ...bookingItems, ...contactPageItems, ...mapsItems);

  for (const item of items) {
    if (handledLabels.has(item.label)) {
      continue;
    }

    if (cleaned.some((existing) => existing.label === item.label && existing.value === item.value && existing.href === item.href)) {
      continue;
    }

    cleaned.push(item);
  }

  return uniqueBy(cleaned, (item) => `${item.label}:${item.value}:${item.href ?? ""}`)
    .sort((left, right) => contactPriority(left) - contactPriority(right))
    .slice(0, 6);
}

export function buildClinicDemoLandingPage(args: {
  campaignId: string;
  prospect: DiscoveredProspect;
  knowledgePack: KnowledgePack;
  websiteGrade: WebsiteGrade;
  chatbotConfig: DemoChatbotConfig;
  contactValidation?: ContactValidation;
  crawl?: WebsiteCrawlResult;
  designSchema: NormalizedDesignSchema;
}): DemoLandingPage {
  const context = buildClinicDemoContext({
    prospect: args.prospect,
    knowledgePack: args.knowledgePack,
    contactValidation: args.contactValidation,
    crawl: args.crawl,
  });
  const editorialProfile = resolveEditorialClinicProfile(args.prospect);
  const generatedDoctorCards = buildDoctorCards({
    doctorNames: context.doctorNames,
    teamNames: context.teamNames,
    category: context.category,
    qualifications: context.qualifications,
    mediaGallery: context.mediaGallery,
  });
  const generatedServices = buildServiceCards({
    services: context.services,
    category: context.category,
    layout: args.designSchema.servicesLayout,
    mediaGallery: context.mediaGallery,
  });
  const generatedHero = heroCopy({
    clinicName: context.clinicName,
    category: context.category,
    neighborhood: context.neighborhood,
    renderingMode: context.renderingMode,
    heroType: args.designSchema.hero.type,
    voice: args.designSchema.voice,
    rationale: args.designSchema.hero.rationale,
  });
  const mediaGallery = mergeMediaGallery(context.mediaGallery, editorialProfile?.mediaGallery);
  const doctorCards = mergeDoctorCards(generatedDoctorCards, editorialProfile?.doctorCards);
  const services = mergeServices(generatedServices, editorialProfile?.services);
  const testimonials = mergeTestimonials(buildTestimonials(context.testimonials), editorialProfile?.testimonials);
  const trustItems = uniqueStrings([...(editorialProfile?.trustItems ?? []), ...context.trustItems]).slice(0, 8);
  const contactItems = sanitizeContactItems(context.contactItems);
  const hero = editorialProfile?.hero ?? generatedHero;
  const headline = hero.headline;
  const subheadline = hero.subheadline;
  const summarySections = uniqueBy(
    [
      ...(editorialProfile?.sections ?? []),
      ...buildSummarySections({
        category: context.category,
        services: services.map((item) => item.title),
        websiteGrade: args.websiteGrade,
        renderingMode: context.renderingMode,
        liveDemoRationale: args.contactValidation?.operatorSummary ?? args.knowledgePack.liveDemoEligibility.rationale,
        designSchema: args.designSchema,
        mediaCount: mediaGallery.length,
      }),
    ],
    (item) => item.heading,
  ).slice(0, 6);
  const footerNote =
    context.renderingMode === "live_demo"
      ? "Το demo χρησιμοποιεί μόνο επαληθευμένα δημόσια στοιχεία επικοινωνίας και τοποθεσίας."
      : args.contactValidation?.operatorSummary ??
        "Το demo παραμένει σε concept mode μέχρι να επιβεβαιωθούν επαρκώς τα στοιχεία επικοινωνίας ή τοποθεσίας για live αποστολή.";
  const chatbotEndpointPath = `/api/antigravity-chat/${slugify(args.campaignId)}/${slugify(args.prospect.businessName)}`;

  return DemoLandingPageSchema.parse({
    slug: `${slugify(args.campaignId)}-${slugify(args.prospect.businessName)}`,
    title: editorialProfile?.title ?? `${context.clinicName} | Demo clinic landing page`,
    metaDescription: subheadline,
    renderingMode: context.renderingMode,
    modeNotice: context.modeNotice,
    headline,
    subheadline,
    callToActionLabel: context.primaryCta.label,
    hero: {
      eyebrow: hero.eyebrow,
      headline,
      subheadline,
      primaryCta: context.primaryCta,
      secondaryCta: context.secondaryCta,
      badges:
        editorialProfile?.heroBadges && editorialProfile.heroBadges.length > 0
          ? editorialProfile.heroBadges
          : uniqueStrings(
              compact([
                context.category,
                context.neighborhood ? `Αθήνα • ${context.neighborhood}` : args.prospect.city ? `Αθήνα • ${args.prospect.city}` : "Αθήνα",
                args.designSchema.themeVariant.replace(/_/g, " "),
                context.renderingMode === "live_demo" ? "Live demo" : "Concept demo",
              ]),
            ),
      stats:
        editorialProfile?.heroStats && editorialProfile.heroStats.length > 0
          ? editorialProfile.heroStats
          : compact([
              context.category ? { label: "Ειδικότητα", value: context.category } : null,
              context.neighborhood ? { label: "Περιοχή", value: context.neighborhood } : null,
              context.phones[0]
                ? { label: args.designSchema.ctaStrategy.primaryGoal === "call" ? "Άμεση επικοινωνία" : "Τηλέφωνο", value: context.phones[0] }
                : null,
            ]),
      logoUrl: context.logoUrl,
      logoAlt: context.logoUrl ? `${context.clinicName} logo` : undefined,
      imageUrl: editorialProfile?.heroImageUrl ?? context.heroImageUrl ?? mediaGallery[0]?.url,
      imageAlt:
        editorialProfile?.heroImageAlt ??
        (editorialProfile?.heroImageUrl ?? context.heroImageUrl ?? mediaGallery[0]?.url ? `${context.clinicName} demo preview` : undefined),
    },
    mediaGallery,
    improvementHighlights: args.websiteGrade.topDemoImprovementOpportunities.map((item) => ({
      title: item.title,
      detail: item.detail,
    })),
    services,
    trustItems,
    doctorCards,
    testimonials,
    faqs: context.faqItems,
    contactItems,
    map: context.map,
    chatbot: {
      title: "Chatbot επίδειξης",
      description:
        context.renderingMode === "live_demo"
          ? "Greek-first chatbot demo για ερωτήσεις, αρχική αξιολόγηση ενδιαφέροντος και ασφαλή προώθηση προς επικοινωνία ή ραντεβού."
          : "Greek-first chatbot demo που δείχνει τη μελλοντική εμπειρία απαντήσεων, χωρίς να ισχυρίζεται μη επαληθευμένα στοιχεία.",
      endpointPath: chatbotEndpointPath,
      initialAssistantMessage:
        context.renderingMode === "live_demo"
          ? `Γεια σας. Μπορώ να βοηθήσω με βασικές ερωτήσεις για το demo του ${context.clinicName} και να σας κατευθύνω προς το κατάλληλο επόμενο βήμα.`
          : `Γεια σας. Αυτό είναι concept demo για το ${context.clinicName}. Μπορώ να απαντήσω μόνο με βάση τα επαληθευμένα δημόσια στοιχεία που έχουν συγκεντρωθεί.`,
      starterPrompts: uniqueStrings(
        compact([
          context.services[0] ? "Ποιες υπηρεσίες προβάλλονται πιο έντονα στο νέο demo;" : null,
          context.bookingUrl ? "Πώς οδηγεί το demo σε ραντεβού;" : "Πώς θα βοηθούσε αυτό το demo στις νέες επαφές;",
          "Τι βελτιώνει αυτό το redesign σε σχέση με το τρέχον site;",
        ]),
      ).slice(0, 3),
      cta: context.persistentCta,
      leadCaptureFields: args.chatbotConfig.leadCaptureFields,
      disabledReason: context.renderingMode === "concept_demo" ? "Τα live contact details παραμένουν συντηρητικά μέχρι επιβεβαίωσης." : undefined,
    },
    persistentCta: context.persistentCta,
    footer: {
      note: footerNote,
      contactItems,
      locationNote: context.renderingMode === "live_demo" ? context.neighborhood ?? args.prospect.city : "Athens clinic preview",
    },
    sections: summarySections,
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "build_clinic_demo_landing_page",
        uri: args.prospect.websiteUrl ?? args.prospect.mapsUrl ?? `prospect:${args.prospect.prospectId}`,
      }),
    ],
  });
}
