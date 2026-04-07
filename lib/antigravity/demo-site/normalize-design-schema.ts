import { NormalizedDesignSchema } from "@/lib/antigravity/schemas";
import type {
  DesignSectionKind,
  DesignSurface,
  NormalizedDesignSection,
  RedesignBrief,
  StitchDesignOutput,
} from "@/lib/antigravity/schemas";
import { buildFactSource, nowIso, slugify } from "@/lib/antigravity/runtime/utils";

function firstWeakness(brief: RedesignBrief) {
  return brief.topWeaknesses[0]?.title ?? "the current site hierarchy";
}

function firstOpportunity(brief: RedesignBrief) {
  return brief.keyOpportunities[0]?.detail ?? "Make the demo feel immediately clearer and more trustworthy.";
}

function sectionSurface(kind: DesignSectionKind, stitch: StitchDesignOutput): DesignSurface {
  switch (kind) {
    case "gallery":
      return "transparent";
    case "summary":
      return "highlight";
    case "trust":
    case "testimonials":
      return "muted";
    case "chat":
    case "footer":
      return "dark";
    case "contact":
      return stitch.contactPlacement === "dark_split" ? "dark" : "muted";
    default:
      return "transparent";
  }
}

function sectionDefinition(args: {
  kind: DesignSectionKind;
  redesignBrief: RedesignBrief;
  stitchDesignOutput: StitchDesignOutput;
}): NormalizedDesignSection {
  const { kind, redesignBrief, stitchDesignOutput } = args;
  const weakest = firstWeakness(redesignBrief);
  const opportunity = firstOpportunity(redesignBrief);

  switch (kind) {
    case "services":
      return {
        kind,
        variant: stitchDesignOutput.servicesLayout,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "conversion",
        eyebrow: "Services",
        title: "Υπηρεσίες με πιο καθαρή ιεραρχία",
        description:
          stitchDesignOutput.servicesLayout === "feature_split"
            ? "Οι βασικές υπηρεσίες εμφανίζονται με featured-first δομή αντί για ισοπεδωμένο grid."
            : "Οι υπηρεσίες παρουσιάζονται με δομή που βοηθά τον επισκέπτη να βρει γρήγορα το κατάλληλο επόμενο βήμα.",
      };
    case "gallery":
      return {
        kind,
        variant: stitchDesignOutput.galleryLayout,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "story",
        eyebrow: "Clinic visuals",
        title: "Πραγματικά visuals από το σημερινό site, σε πιο premium σύνθεση",
        description: "Η ενότητα χρησιμοποιεί πραγματικά clinic assets για να κάνει το demo πιο πειστικό και λιγότερο template-first.",
      };
    case "trust":
      return {
        kind,
        variant: stitchDesignOutput.trustTreatment,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "trust",
        eyebrow: "Trust",
        title: "Εμπιστοσύνη και ιατρική αξιοπιστία νωρίτερα στη σελίδα",
        description: `Η ενότητα απαντά άμεσα στο αδύναμο σημείο «${weakest}» χωρίς να εφευρίσκει νέα proof points.`,
      };
    case "story":
      return {
        kind,
        variant: "narrative_split",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "story",
        eyebrow: "Clinic story",
        title: "Πλαίσιο κλινικής χωρίς γενικόλογο about us",
        description: "Το story section κρατά μόνο επαληθευμένο context και λειτουργεί ως γέφυρα προς τις υπηρεσίες και την εμπιστοσύνη.",
      };
    case "team":
      return {
        kind,
        variant: stitchDesignOutput.teamLayout,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "trust",
        eyebrow: "Doctors & team",
        title: "Πρόσωπα, ειδικότητα και ανθρώπινη αξιοπιστία",
        description: "Η ομάδα προβάλλεται μόνο όταν υπάρχουν επαληθευμένα ονόματα ή ειδικότητες.",
      };
    case "testimonials":
      return {
        kind,
        variant: stitchDesignOutput.trustTreatment === "quote_band" ? "quote_band" : "quote_cards",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "trust",
        eyebrow: "Social proof",
        title: "Κοινωνική απόδειξη με συντηρητική χρήση",
        description: "Τα testimonials εμφανίζονται μόνο όταν έχουν εξαχθεί ως verified facts.",
      };
    case "faq":
      return {
        kind,
        variant: stitchDesignOutput.faqPlacement,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "utility",
        eyebrow: "FAQ",
        title: "Συχνές ερωτήσεις σε πιο mobile-friendly μορφή",
        description: "Μικρότερες μονάδες πληροφορίας για καλύτερο scanning και λιγότερη τριβή.",
      };
    case "summary":
      return {
        kind,
        variant: "critique_cards",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "conversion",
        eyebrow: "Why this redesign",
        title: "Το redesign απαντά άμεσα στα πραγματικά προβλήματα του σημερινού site",
        description: opportunity,
      };
    case "chat":
      return {
        kind,
        variant: "assistant_panel",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "utility",
        eyebrow: "Embedded chatbot",
        title: "Greek-first βοηθός μέσα στο demo",
        description: "Το chatbot μένει συνδεδεμένο με την ίδια truth-safe λογική του preview.",
      };
    case "contact":
      return {
        kind,
        variant: stitchDesignOutput.contactPlacement,
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "conversion",
        eyebrow: "Contact & map",
        title:
          redesignBrief.renderingContext.mode === "live_demo"
            ? "Επικοινωνία και τοποθεσία χωρίς περιττή τριβή"
            : "Ασφαλής διαδρομή επικοινωνίας μέχρι να επιβεβαιωθούν πλήρως τα στοιχεία",
        description: redesignBrief.renderingContext.safeContactStrategy,
      };
    case "footer":
      return {
        kind,
        variant: "verified_footer",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: "utility",
        eyebrow: "Verified footer",
        title: "Footer με ελεγχόμενα στοιχεία",
        description: "Το footer επαναλαμβάνει μόνο τα contact/location στοιχεία που περνούν το verification gate.",
      };
    default:
      return {
        kind,
        variant: kind === "hero" ? stitchDesignOutput.heroType : "default",
        surface: sectionSurface(kind, stitchDesignOutput),
        emphasis: kind === "hero" ? "conversion" : "story",
      };
  }
}

export function normalizeStitchDesignSchema(args: {
  redesignBrief: RedesignBrief;
  stitchDesignOutput: StitchDesignOutput;
}) {
  const sections = args.stitchDesignOutput.sectionOrder.map((kind) =>
    sectionDefinition({
      kind,
      redesignBrief: args.redesignBrief,
      stitchDesignOutput: args.stitchDesignOutput,
    }),
  );
  const designId = `${slugify(args.redesignBrief.clinicIdentity.businessName)}-${args.stitchDesignOutput.heroType}`;

  return NormalizedDesignSchema.parse({
    version: "v1",
    generatedAt: nowIso(),
    designId,
    themeVariant: args.stitchDesignOutput.themeVariant,
    voice: args.stitchDesignOutput.voice,
    hero: {
      type: args.stitchDesignOutput.heroType,
      visualFocus: args.redesignBrief.visualStyleGuidance.heroIntent,
      rationale: firstWeakness(args.redesignBrief),
    },
    ctaStrategy: {
      primaryGoal:
        args.redesignBrief.renderingContext.mode === "live_demo"
          ? args.redesignBrief.verifiedFacts.bookingUrl
            ? "booking"
            : args.redesignBrief.verifiedFacts.phones.length > 0
              ? "call"
              : "contact"
          : "demo_request",
      layout: args.stitchDesignOutput.ctaLayout,
      persistentStyle: args.stitchDesignOutput.contactPlacement === "dark_split" ? "dark_float" : "soft_float",
    },
    trustTreatment: args.stitchDesignOutput.trustTreatment,
    servicesLayout: args.stitchDesignOutput.servicesLayout,
    teamLayout: args.stitchDesignOutput.teamLayout,
    galleryLayout: args.stitchDesignOutput.galleryLayout,
    faqPlacement: args.stitchDesignOutput.faqPlacement,
    contactPlacement: args.stitchDesignOutput.contactPlacement,
    mapPlacement: args.stitchDesignOutput.mapPlacement,
    mobileHints: args.stitchDesignOutput.mobileFirstMoves,
    sectionOrder: args.stitchDesignOutput.sectionOrder,
    sections,
    critiqueResponses: args.stitchDesignOutput.critiqueResponses,
    designSummary: `${args.redesignBrief.visualStyleGuidance.directionName} with ${args.stitchDesignOutput.heroType} hero, ${args.stitchDesignOutput.galleryLayout} gallery treatment, ${args.stitchDesignOutput.trustTreatment} trust treatment, and ${args.stitchDesignOutput.servicesLayout} services layout.`,
    provenance: [
      buildFactSource({
        sourceType: "stage_output",
        label: "normalize_design_schema",
        uri: `stitch-design-output:${designId}`,
      }),
    ],
  });
}
