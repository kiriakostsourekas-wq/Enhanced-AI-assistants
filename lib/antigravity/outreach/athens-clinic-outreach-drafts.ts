import type {
  ContactValidation,
  DemoLandingPage,
  DiscoveredProspect,
  KnowledgePack,
  OutreachDraft,
  OutreachVariantStyle,
  PreviewDeployment,
  StructuredClinicField,
  WebsiteGrade,
} from "@/lib/antigravity/schemas";

type OutreachObservation = {
  key: string;
  greek: string;
  english: string;
};

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const itemKey = key(item);
    if (seen.has(itemKey)) {
      continue;
    }

    seen.add(itemKey);
    result.push(item);
  }

  return result;
}

function fieldValueToText(field?: StructuredClinicField) {
  if (!field || field.status === "unresolved" || field.value === undefined || field.value === null) {
    return undefined;
  }

  if (typeof field.value === "string") {
    return field.value.trim() || undefined;
  }

  if (typeof field.value === "number" || typeof field.value === "boolean") {
    return String(field.value);
  }

  if (typeof field.value === "object" && "displayText" in field.value && typeof field.value.displayText === "string") {
    return field.value.displayText.trim() || undefined;
  }

  return undefined;
}

function greekClinicCategory(value?: string) {
  const normalized = value?.toLowerCase() ?? "";

  if (/dent|οδοντ/.test(normalized)) {
    return "οδοντιατρική κλινική";
  }

  if (/orthop|ορθοπ/.test(normalized)) {
    return "ορθοπαιδική κλινική";
  }

  if (/ophthalm|οφθαλμ|laser vision/.test(normalized)) {
    return "οφθαλμολογική κλινική";
  }

  if (/cardio|καρδιο/.test(normalized)) {
    return "καρδιολογική κλινική";
  }

  if (/fertility|ivf|γονιμ/.test(normalized)) {
    return "κλινική γονιμότητας";
  }

  if (/plastic|αισθητ|πλαστικ/.test(normalized)) {
    return "κλινική πλαστικής χειρουργικής";
  }

  if (/diagnostic|διαγνωσ/.test(normalized)) {
    return "διαγνωστικό κέντρο";
  }

  if (/physio|φυσικοθερ/.test(normalized)) {
    return "φυσικοθεραπευτικό κέντρο";
  }

  if (/medical|ιατρ/.test(normalized)) {
    return "ιατρική κλινική";
  }

  return "κλινική";
}

function englishClinicCategory(value?: string) {
  const normalized = value?.toLowerCase() ?? "";

  if (/dent|οδοντ/.test(normalized)) {
    return "dental clinic";
  }

  if (/orthop|ορθοπ/.test(normalized)) {
    return "orthopedic clinic";
  }

  if (/ophthalm|οφθαλμ|laser vision/.test(normalized)) {
    return "ophthalmology clinic";
  }

  if (/cardio|καρδιο/.test(normalized)) {
    return "cardiology clinic";
  }

  if (/fertility|ivf|γονιμ/.test(normalized)) {
    return "fertility clinic";
  }

  if (/plastic|αισθητ|πλαστικ/.test(normalized)) {
    return "plastic surgery clinic";
  }

  if (/diagnostic|διαγνωσ/.test(normalized)) {
    return "diagnostic clinic";
  }

  if (/physio|φυσικοθερ/.test(normalized)) {
    return "physiotherapy clinic";
  }

  if (/medical|ιατρ/.test(normalized)) {
    return "medical clinic";
  }

  return "clinic";
}

function blockerSummaryGreek(blocker?: string) {
  if (!blocker) {
    return undefined;
  }

  const normalized = blocker.toLowerCase();

  if (normalized.includes("address confidence")) {
    return "Τα στοιχεία διεύθυνσης δεν είναι ακόμη αρκετά ισχυρά για live παρουσίαση.";
  }

  if (normalized.includes("contact path") || normalized.includes("phone/contact")) {
    return "Η δημόσια διαδρομή προς επικοινωνία ή ραντεβού δεν είναι ακόμη αρκετά ισχυρή για live παρουσίαση.";
  }

  if (normalized.includes("map widget")) {
    return "Η τοποθεσία δεν είναι ακόμη αρκετά ασφαλής για live widget χάρτη.";
  }

  return "Κάποια δημόσια στοιχεία επικοινωνίας ή τοποθεσίας χρειάζονται επιπλέον επιβεβαίωση.";
}

function previewModeNoteGreek(args: { landingPage: DemoLandingPage; contactValidation?: ContactValidation }) {
  if (args.landingPage.renderingMode === "live_demo") {
    return "Το preview χρησιμοποιεί μόνο επαληθευμένα δημόσια στοιχεία επικοινωνίας και τοποθεσίας.";
  }

  return (
    "Το preview είναι concept/improvement preview και όχι live εκδοχή της κλινικής, " +
    "ώστε να μη παρουσιαστούν ως οριστικά στοιχεία που δεν έχουν επιβεβαιωθεί αρκετά ισχυρά." +
    (args.contactValidation?.blockers.length
      ? ` ${blockerSummaryGreek(args.contactValidation.blockers[0])}`
      : "")
  );
}

function previewModeNoteEnglish(args: { landingPage: DemoLandingPage; contactValidation?: ContactValidation }) {
  if (args.landingPage.renderingMode === "live_demo") {
    return "The preview uses only verified public contact and location details.";
  }

  return (
    "This is a concept/improvement preview, not a live representation of the clinic, " +
    "so uncertain contact or location details are not presented as definitive." +
    (args.contactValidation?.blockers.length ? ` ${args.contactValidation.blockers[0]}` : "")
  );
}

function localityLabel(args: { prospect: DiscoveredProspect; knowledgePack: KnowledgePack; contactValidation?: ContactValidation }) {
  const neighborhood =
    (typeof args.contactValidation?.validatedNeighborhood?.value === "string"
      ? args.contactValidation.validatedNeighborhood.value
      : undefined) ?? fieldValueToText(args.knowledgePack.structuredJson.neighborhood);

  if (neighborhood) {
    return {
      greek: `${neighborhood}, Αθήνα`,
      english: `${neighborhood}, Athens`,
    };
  }

  if (args.prospect.city) {
    return {
      greek: args.prospect.city === "Athens" ? "Αθήνα" : `${args.prospect.city}, Ελλάδα`,
      english: args.prospect.city === "Athens" ? "Athens" : `${args.prospect.city}, Greece`,
    };
  }

  return {
    greek: "Αθήνα",
    english: "Athens",
  };
}

function buildObservationCandidates(args: {
  websiteGrade: WebsiteGrade;
  localityGreek: string;
  localityEnglish: string;
}) {
  const categoryScores = args.websiteGrade.categoryScores;

  const candidates = [
    {
      key: "offer_clarity",
      score: categoryScores.offerClarity.score,
      priority: 4,
      greek: "στα πρώτα δευτερόλεπτα δεν ξεκαθαρίζει όσο άμεσα θα μπορούσε τι ακριβώς προσφέρει η κλινική και για ποιον ασθενή.",
      english: "within the first few seconds, the site does not make it clear enough what the clinic specifically offers and for whom.",
    },
    {
      key: "trust_and_medical_credibility",
      score: categoryScores.trustAndMedicalCredibility.score,
      priority: 1,
      greek: "η παρουσίαση εμπιστοσύνης και ιατρικής αξιοπιστίας μπορεί να γίνει πιο καθαρή, ειδικά σε ομάδα, ειδικότητες και αποδείξεις αξιοπιστίας.",
      english: "trust and medical credibility could be presented more clearly, especially around team, specialties, and proof points.",
    },
    {
      key: "conversion_readiness",
      score: categoryScores.conversionReadiness.score,
      priority: 0,
      greek: "πάνω από το fold το επόμενο βήμα προς επικοινωνία ή ραντεβού δεν είναι τόσο άμεσο όσο θα έπρεπε.",
      english: "above the fold, the next step toward contact or booking is not as immediate as it should be.",
    },
    {
      key: "mobile_ux",
      score: categoryScores.mobileUxHeuristics.score,
      priority: 3,
      greek: "σε mobile η ιεράρχηση και τα tap targets μπορούν να γίνουν πιο καθαρά, ώστε ο επισκέπτης να φτάνει γρηγορότερα στην επαφή.",
      english: "on mobile, hierarchy and tap targets could be clearer so visitors reach contact faster.",
    },
    {
      key: "booking_contact_friction",
      score: categoryScores.bookingContactFriction.score,
      priority: 2,
      greek: "η διαδρομή προς επικοινωνία ή αίτημα ραντεβού έχει ακόμη τριβή και μπορεί να γίνει πιο σύντομη.",
      english: "the path toward contact or an appointment request still has friction and can be shortened.",
    },
    {
      key: "local_proof",
      score: categoryScores.localProofForAthens.score,
      priority: 5,
      greek: `η τοπική απόδειξη για ασθενείς στην ${args.localityGreek} μπορεί να φαίνεται πιο καθαρά μέσα στη σελίδα.`,
      english: `local proof for patients in ${args.localityEnglish} could be surfaced more clearly on the page.`,
    },
    {
      key: "greek_first",
      score: categoryScores.greekFirstUsability.score,
      priority: 6,
      greek: "η Greek-first εμπειρία μπορεί να γίνει πιο φυσική και πιο ξεκάθαρη για τοπικό κοινό στην Αθήνα.",
      english: "the Greek-first experience can become more natural and clearer for a local Athens audience.",
    },
    {
      key: "seo_basics",
      score: categoryScores.seoBasics.score,
      priority: 8,
      greek: "η βασική δομή υπηρεσιών και local relevance μπορεί να αποτυπωθεί πιο καθαρά και για αναζήτηση και για conversion.",
      english: "the basic service structure and local relevance can be presented more clearly for both search and conversion.",
    },
  ];

  return candidates.sort((left, right) => left.score - right.score || left.priority - right.priority);
}

function buildObservations(args: {
  websiteGrade: WebsiteGrade;
  localityGreek: string;
  localityEnglish: string;
}) {
  const selected = buildObservationCandidates(args).filter((item) => item.score <= 74).slice(0, 3);
  const fallback = buildObservationCandidates(args).slice(0, 3);
  const observations = uniqueBy(selected.length >= 2 ? selected : fallback, (item) => item.key).slice(0, selected.length >= 2 ? 3 : 2);

  return observations.map((item) => ({
    key: item.key,
    greek: item.greek,
    english: item.english,
  })) satisfies OutreachObservation[];
}

function buildSubjectLinesGreek(args: {
  clinicName: string;
  renderMode: DemoLandingPage["renderingMode"];
}) {
  if (args.renderMode === "live_demo") {
    return [
      `${args.clinicName} | έφτιαξα ένα σύντομο demo για πιο καθαρή online επικοινωνία`,
      `Μια γρήγορη ιδέα για το site του ${args.clinicName}`,
      `${args.clinicName} | preview με πιο καθαρή διαδρομή προς ραντεβού`,
    ];
  }

  return [
    `${args.clinicName} | concept preview για πιο καθαρή online παρουσία`,
    `Μια σύντομη ιδέα βελτίωσης για το site του ${args.clinicName}`,
    `${args.clinicName} | improvement preview για πιο καθαρή διαδρομή επικοινωνίας`,
  ];
}

function buildSubjectLinesEnglish(args: {
  clinicName: string;
  renderMode: DemoLandingPage["renderingMode"];
}) {
  if (args.renderMode === "live_demo") {
    return [
      `${args.clinicName} | I put together a short demo for a clearer online contact flow`,
      `A quick idea for the ${args.clinicName} website`,
      `${args.clinicName} | preview with a clearer route to bookings`,
    ];
  }

  return [
    `${args.clinicName} | concept preview for a clearer online presence`,
    `A short improvement idea for the ${args.clinicName} website`,
    `${args.clinicName} | improvement preview for a clearer contact path`,
  ];
}

function renderObservationBullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function closingGreek() {
  return 'Αν δεν θέλετε άλλο σχετικό μήνυμα, αρκεί ένα "stop" και δεν θα ξαναστείλω.';
}

function closingEnglish() {
  return 'If you do not want another message like this, a simple "stop" is enough and I will not follow up again.';
}

function buildFounderEmailGreek(args: {
  clinicName: string;
  clinicCategoryGreek: string;
  localityGreek: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteGreek: string;
}) {
  return [
    "Καλησπέρα σας,",
    "",
    `κοίταξα το δημόσιο site του ${args.clinicName} και έφτιαξα ένα σύντομο ιδιωτικό preview για το πώς θα μπορούσε να φαίνεται μια πιο καθαρή, Greek-first εμπειρία για ${args.clinicCategoryGreek} στην ${args.localityGreek}.`,
    "",
    "Τρία συγκεκριμένα σημεία που πρόσεξα από την αξιολόγηση:",
    renderObservationBullets(args.observations.map((item) => item.greek)),
    "",
    `Το preview είναι εδώ: ${args.previewUrl}`,
    args.previewNoteGreek,
    "",
    "Αν σας φανεί χρήσιμο, μπορώ να στείλω και πολύ σύντομη ανάλυση για hero, CTA και contact flow.",
    closingGreek(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildConsultativeEmailGreek(args: {
  clinicName: string;
  clinicCategoryGreek: string;
  localityGreek: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteGreek: string;
}) {
  return [
    "Καλησπέρα σας,",
    "",
    `σας στέλνω μια σύντομη ιδέα βελτίωσης αφού είδα το δημόσιο site του ${args.clinicName}. Έφτιαξα ένα ιδιωτικό preview που δείχνει πώς θα μπορούσε να αποτυπώνεται πιο καθαρά η ${args.clinicCategoryGreek} για ασθενείς στην ${args.localityGreek}.`,
    "",
    "Από την αξιολόγηση, μου έμειναν κυρίως τα εξής:",
    renderObservationBullets(args.observations.map((item) => item.greek)),
    "",
    `Link: ${args.previewUrl}`,
    args.previewNoteGreek,
    "",
    "Αν έχει νόημα για εσάς, χαίρομαι να στείλω και σύντομη σύνοψη 3 πρακτικών βελτιώσεων πάνω στο ίδιο preview.",
    closingGreek(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildFounderEmailEnglish(args: {
  clinicName: string;
  clinicCategoryEnglish: string;
  localityEnglish: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteEnglish: string;
}) {
  return [
    "Hello,",
    "",
    `I reviewed the public ${args.clinicName} website and put together a short private preview showing how a clearer, Greek-first experience could look for a ${args.clinicCategoryEnglish} in ${args.localityEnglish}.`,
    "",
    "Three concrete points that stood out in the review:",
    renderObservationBullets(args.observations.map((item) => item.english)),
    "",
    `Preview: ${args.previewUrl}`,
    args.previewNoteEnglish,
    "",
    "If useful, I can also send a very short breakdown of the hero, CTA, and contact-flow changes.",
    closingEnglish(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildConsultativeEmailEnglish(args: {
  clinicName: string;
  clinicCategoryEnglish: string;
  localityEnglish: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteEnglish: string;
}) {
  return [
    "Hello,",
    "",
    `I am sending over a short improvement idea after reviewing the public ${args.clinicName} website. I put together a private preview showing how the ${args.clinicCategoryEnglish} could be presented more clearly for patients in ${args.localityEnglish}.`,
    "",
    "The main points that stood out in the evaluation were:",
    renderObservationBullets(args.observations.map((item) => item.english)),
    "",
    `Link: ${args.previewUrl}`,
    args.previewNoteEnglish,
    "",
    "If helpful, I can also send a short summary of three practical improvements built into the preview.",
    closingEnglish(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildFollowUpGreek(args: {
  clinicName: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteGreek: string;
}) {
  return [
    "Καλησπέρα σας,",
    "",
    `επανέρχομαι μία και τελευταία φορά για το preview που ετοίμασα για το ${args.clinicName}.`,
    `Το link είναι εδώ: ${args.previewUrl}`,
    "",
    "Ο λόγος που το έστειλα είναι κυρίως ότι είδα περιθώριο στα εξής:",
    renderObservationBullets(args.observations.slice(0, 2).map((item) => item.greek)),
    "",
    args.previewNoteGreek,
    closingGreek(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildFollowUpEnglish(args: {
  clinicName: string;
  previewUrl: string;
  observations: OutreachObservation[];
  previewNoteEnglish: string;
}) {
  return [
    "Hello,",
    "",
    `Just following up once on the preview I prepared for ${args.clinicName}.`,
    `Link: ${args.previewUrl}`,
    "",
    "The reason I sent it is that I saw room mainly in the following areas:",
    renderObservationBullets(args.observations.slice(0, 2).map((item) => item.english)),
    "",
    args.previewNoteEnglish,
    closingEnglish(),
    "",
    "Antigravity",
  ].join("\n");
}

function buildDmGreek(args: {
  clinicName: string;
  previewUrl: string;
  renderMode: DemoLandingPage["renderingMode"];
}) {
  return (
    `Καλησπέρα, έφτιαξα ένα σύντομο ${args.renderMode === "live_demo" ? "live demo" : "concept preview"} για το ${args.clinicName} ` +
    `με πιο καθαρή Greek-first ροή προς επικοινωνία ή ραντεβού. Link: ${args.previewUrl}. ` +
    `${args.renderMode === "concept_demo" ? "Το παρουσιάζω καθαρά ως concept βελτίωσης." : "Χρησιμοποιεί μόνο επαληθευμένα δημόσια στοιχεία."} ` +
    'Αν δεν θέλετε άλλο μήνυμα, γράψτε "stop".'
  );
}

function buildDmEnglish(args: {
  clinicName: string;
  previewUrl: string;
  renderMode: DemoLandingPage["renderingMode"];
}) {
  return (
    `Hello, I put together a short ${args.renderMode === "live_demo" ? "live demo" : "concept preview"} for ${args.clinicName} ` +
    `with a clearer Greek-first route to contact or booking. Link: ${args.previewUrl}. ` +
    `${args.renderMode === "concept_demo" ? "It is presented honestly as an improvement concept." : "It uses only verified public details."} ` +
    'If you do not want another message, reply "stop".'
  );
}

export function buildAthensClinicOutreachDraft(args: {
  prospect: DiscoveredProspect;
  knowledgePack: KnowledgePack;
  websiteGrade: WebsiteGrade;
  landingPage: DemoLandingPage;
  previewDeployment: PreviewDeployment;
  contactValidation?: ContactValidation;
}): Pick<
  OutreachDraft,
  | "subject"
  | "bodyText"
  | "language"
  | "primaryVariantStyle"
  | "alternateVariantStyle"
  | "subjectLinesGreek"
  | "observationsGreek"
  | "primaryEmailGreek"
  | "alternateEmailGreek"
  | "followUpEmailGreek"
  | "dmGreek"
  | "englishInternalTranslation"
> {
  const clinicName =
    fieldValueToText(args.knowledgePack.structuredJson.clinicName) ?? args.prospect.businessName;
  const clinicCategoryGreek = greekClinicCategory(
    fieldValueToText(args.knowledgePack.structuredJson.clinicCategory) ?? args.prospect.category,
  );
  const clinicCategoryEnglish = englishClinicCategory(
    fieldValueToText(args.knowledgePack.structuredJson.clinicCategory) ?? args.prospect.category,
  );
  const locality = localityLabel({
    prospect: args.prospect,
    knowledgePack: args.knowledgePack,
    contactValidation: args.contactValidation,
  });
  const observations = buildObservations({
    websiteGrade: args.websiteGrade,
    localityGreek: locality.greek,
    localityEnglish: locality.english,
  });
  const previewUrl = args.previewDeployment.previewUrl ?? "";
  const previewNoteGreek = previewModeNoteGreek({
    landingPage: args.landingPage,
    contactValidation: args.contactValidation,
  });
  const previewNoteEnglish = previewModeNoteEnglish({
    landingPage: args.landingPage,
    contactValidation: args.contactValidation,
  });
  const primaryVariantStyle: OutreachVariantStyle =
    args.landingPage.renderingMode === "concept_demo" ? "warmer_consultative" : "concise_founder";
  const alternateVariantStyle: OutreachVariantStyle =
    primaryVariantStyle === "concise_founder" ? "warmer_consultative" : "concise_founder";

  const founderGreek = buildFounderEmailGreek({
    clinicName,
    clinicCategoryGreek,
    localityGreek: locality.greek,
    previewUrl,
    observations,
    previewNoteGreek,
  });
  const consultativeGreek = buildConsultativeEmailGreek({
    clinicName,
    clinicCategoryGreek,
    localityGreek: locality.greek,
    previewUrl,
    observations,
    previewNoteGreek,
  });
  const founderEnglish = buildFounderEmailEnglish({
    clinicName,
    clinicCategoryEnglish,
    localityEnglish: locality.english,
    previewUrl,
    observations,
    previewNoteEnglish,
  });
  const consultativeEnglish = buildConsultativeEmailEnglish({
    clinicName,
    clinicCategoryEnglish,
    localityEnglish: locality.english,
    previewUrl,
    observations,
    previewNoteEnglish,
  });

  const primaryEmailGreek = primaryVariantStyle === "concise_founder" ? founderGreek : consultativeGreek;
  const alternateEmailGreek = primaryVariantStyle === "concise_founder" ? consultativeGreek : founderGreek;
  const primaryEmailEnglish = primaryVariantStyle === "concise_founder" ? founderEnglish : consultativeEnglish;
  const alternateEmailEnglish = primaryVariantStyle === "concise_founder" ? consultativeEnglish : founderEnglish;

  return {
    subject: buildSubjectLinesGreek({
      clinicName,
      renderMode: args.landingPage.renderingMode,
    })[0],
    bodyText: primaryEmailGreek,
    language: "el",
    primaryVariantStyle,
    alternateVariantStyle,
    subjectLinesGreek: buildSubjectLinesGreek({
      clinicName,
      renderMode: args.landingPage.renderingMode,
    }),
    observationsGreek: observations.map((item) => item.greek),
    primaryEmailGreek,
    alternateEmailGreek,
    followUpEmailGreek: buildFollowUpGreek({
      clinicName,
      previewUrl,
      observations,
      previewNoteGreek,
    }),
    dmGreek: buildDmGreek({
      clinicName,
      previewUrl,
      renderMode: args.landingPage.renderingMode,
    }),
    englishInternalTranslation: {
      subjectLinesEnglish: buildSubjectLinesEnglish({
        clinicName,
        renderMode: args.landingPage.renderingMode,
      }),
      primaryEmailEnglish,
      alternateEmailEnglish,
      followUpEmailEnglish: buildFollowUpEnglish({
        clinicName,
        previewUrl,
        observations,
        previewNoteEnglish,
      }),
      dmEnglish: buildDmEnglish({
        clinicName,
        previewUrl,
        renderMode: args.landingPage.renderingMode,
      }),
    },
  };
}
