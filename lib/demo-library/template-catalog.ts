import { readFile } from "node:fs/promises";
import path from "node:path";

type TemplateManifestEntry = {
  slug: string;
  url: string;
};

type TemplateSpec = {
  hero?: {
    heading?: string;
    subheading?: string;
    primary_cta?: string;
  };
  sections?: string[];
  ctas?: string[];
  nav_labels?: string[];
  paragraph_samples?: string[];
  fonts?: string[];
  palette?: {
    theme?: {
      primary?: string;
      secondary?: string;
      background?: string;
      surface?: string;
      text?: string;
      border?: string;
    };
  };
  source_url?: string;
};

type TemplateDescriptor = {
  title: string;
  description: string;
  audienceLabel: string;
  bestFor: string;
  recommendedFor: string[];
  featured?: boolean;
  accentColor?: string;
  matchPatterns: RegExp[];
};

export type TemplateCatalogEntry = {
  slug: string;
  title: string;
  description: string;
  audienceLabel: string;
  bestFor: string;
  recommendedFor: string[];
  featured: boolean;
  accentColor: string;
  sourceUrl: string;
  pageHref: string;
  mirrorHref: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroPrimaryCta?: string;
  sectionHighlights: string[];
  ctaHighlights: string[];
  navLabels: string[];
  fonts: string[];
  paletteTheme: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    border?: string;
  };
  templateSummary?: string;
};

const TEMPLATE_ROOT = path.join(process.cwd(), "virtualprosmax");
const TEMPLATE_MANIFEST_PATH = path.join(TEMPLATE_ROOT, "virtualpros_demos.json");

const TEMPLATE_DESCRIPTORS: Record<string, TemplateDescriptor> = {
  attorney: {
    title: "Attorney",
    description: "Gold-and-navy legal services template with authority-first framing and case-study style sections.",
    audienceLabel: "Professional services websites built around trust and authority",
    bestFor: "Law firms, advisors, and other credibility-led service brands",
    recommendedFor: ["Authority-led hero", "Case study rhythm", "Premium lead capture"],
    accentColor: "#DBA268",
    matchPatterns: [/attorney/i, /law/i, /legal/i],
  },
  cardealership: {
    title: "Car Dealership",
    description: "Dark dealership landing page built around inventory trust, pricing, and premium vehicle presentation.",
    audienceLabel: "Inventory-heavy offers that need premium visual framing",
    bestFor: "Dealers, brokers, and other catalogue-led businesses",
    recommendedFor: ["Inventory trust", "Premium visuals", "Finance-ready CTAs"],
    accentColor: "#060644",
    matchPatterns: [/dealer/i, /automotive/i, /car/i],
  },
  carpetcleaning: {
    title: "Carpet Cleaning",
    description: "Service-business template centered on cleanliness, process clarity, and household trust signals.",
    audienceLabel: "Local home services that need simple quote-first conversion",
    bestFor: "Cleaning, restoration, and in-home care services",
    recommendedFor: ["Process clarity", "Household trust", "Fast quote CTA"],
    accentColor: "#83639E",
    matchPatterns: [/clean/i, /restoration/i],
  },
  chiropracter: {
    title: "Chiropracter",
    description: "Health-and-wellness template with symptom relief messaging and appointment-driven calls to action.",
    audienceLabel: "General clinics that need a treatment-led health template",
    bestFor: "Orthopedic, ophthalmology, cardiology, and broader clinic leads",
    recommendedFor: ["Health-service framing", "Trust-led sections", "Appointment-first CTA"],
    accentColor: "#8112C9",
    matchPatterns: [
      /clinic/i,
      /orthop/i,
      /ophthalm/i,
      /cardio/i,
      /physio/i,
      /medical/i,
      /οφθαλμ/i,
      /ορθοπ/i,
      /καρδιο/i,
      /ιατρ/i,
      /φυσικοθερ/i,
    ],
  },
  dental: {
    title: "Dental",
    description: "Dental clinic template with procedure categories, bright accenting, and trust-forward service blocks.",
    audienceLabel: "Dental practices, implant clinics, and cosmetic dentistry offers",
    bestFor: "Dentists that need procedure-led sections and a strong booking CTA",
    recommendedFor: ["Procedure-led layout", "Dental trust blocks", "Booking-first conversion"],
    featured: true,
    accentColor: "#F96331",
    matchPatterns: [/dent/i, /orthodont/i, /implant/i, /oral/i, /οδοντ/i],
  },
  electrician: {
    title: "Electrician",
    description: "Local electrician template organized around location credibility, service reliability, and contact capture.",
    audienceLabel: "Local operators where fast contact and trust win the job",
    bestFor: "Electricians, emergency callouts, and inspection services",
    recommendedFor: ["Local proof", "Service reliability", "Fast contact capture"],
    accentColor: "#188BF6",
    matchPatterns: [/electric/i, /ηλεκτρ/i],
  },
  hvac: {
    title: "HVAC",
    description: "Orange-led heating and cooling template focused on residential and commercial service positioning.",
    audienceLabel: "Trade businesses balancing urgent response with maintenance work",
    bestFor: "HVAC, facilities, and seasonal maintenance services",
    recommendedFor: ["Residential-commercial split", "Urgent service cues", "Maintenance CTA"],
    accentColor: "#EC6B08",
    matchPatterns: [/hvac/i, /heating/i, /cooling/i, /air[- ]?condition/i],
  },
  medspa: {
    title: "Medspa",
    description: "Beauty and treatment template with soft luxury cues, consultation CTAs, and treatment storytelling.",
    audienceLabel: "Consultation-driven treatment brands with a premium positioning angle",
    bestFor: "Med spas, fertility, aesthetics, dermatology, and plastic surgery clinics",
    recommendedFor: ["Premium treatment framing", "Consultation CTA", "Soft-luxury treatment story"],
    featured: true,
    accentColor: "#EC606A",
    matchPatterns: [
      /medspa/i,
      /aesthetic/i,
      /fertility/i,
      /ivf/i,
      /plastic/i,
      /skin/i,
      /dermat/i,
      /cosmetic/i,
      /γονιμ/i,
      /αισθητ/i,
      /πλαστικ/i,
      /δερματ/i,
    ],
  },
  plumber: {
    title: "Plumber",
    description: "Blue service template for plumbing offers, emergency support, and quote-led conversion flows.",
    audienceLabel: "Trade services that need urgent-response positioning and quotes",
    bestFor: "Plumbers, leak repair teams, and service operators with fast-response demand",
    recommendedFor: ["Emergency support", "Quote-led CTA", "Service trust framing"],
    featured: true,
    accentColor: "#2E67CD",
    matchPatterns: [/plumb/i, /pipe/i, /drain/i],
  },
  restaurant: {
    title: "Restaurant",
    description: "Steakhouse-oriented dining template with menu-style drama, reservation cues, and warm premium tones.",
    audienceLabel: "Hospitality brands that sell atmosphere as much as utility",
    bestFor: "Restaurants, hospitality venues, and reservation-first businesses",
    recommendedFor: ["Atmosphere-heavy visuals", "Reservation cues", "Premium menu framing"],
    accentColor: "#A26B0A",
    matchPatterns: [/restaurant/i, /dining/i, /food/i],
  },
  roofing: {
    title: "Roofing",
    description: "Urgency-oriented roofing template for inspections, repairs, and problem-solution messaging.",
    audienceLabel: "Problem-solution service businesses with storm or repair urgency",
    bestFor: "Roofing, exterior repair, and inspection-heavy service brands",
    recommendedFor: ["Urgent inspection CTA", "Problem-solution messaging", "Repair credibility"],
    accentColor: "#E93D3D",
    matchPatterns: [/roof/i],
  },
};

let templateCatalogPromise: Promise<TemplateCatalogEntry[]> | null = null;

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function titleFromSlug(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function fallbackDescriptor(slug: string): TemplateDescriptor {
  return {
    title: titleFromSlug(slug),
    description: `${titleFromSlug(slug)} template extracted from the Virtual Pros core demo library.`,
    audienceLabel: "Service-business websites that need a reusable starting point",
    bestFor: "Template-led demo generation and fast niche-specific mockups",
    recommendedFor: ["Reusable structure", "Fast niche adaptation", "Template-first demos"],
    matchPatterns: [new RegExp(slug.replace(/[-_]/g, ""), "i")],
  };
}

async function loadTemplateCatalog() {
  const manifest = await readJson<TemplateManifestEntry[]>(TEMPLATE_MANIFEST_PATH);

  const entries = await Promise.all(
    manifest.map(async (item) => {
      const descriptor = TEMPLATE_DESCRIPTORS[item.slug] ?? fallbackDescriptor(item.slug);
      const specPath = path.join(TEMPLATE_ROOT, item.slug, "template-spec.json");
      const spec = await readJson<TemplateSpec>(specPath);
      const paletteTheme = spec.palette?.theme ?? {};

      return {
        slug: item.slug,
        title: descriptor.title,
        description: descriptor.description,
        audienceLabel: descriptor.audienceLabel,
        bestFor: descriptor.bestFor,
        recommendedFor: descriptor.recommendedFor,
        featured: Boolean(descriptor.featured),
        accentColor: descriptor.accentColor ?? paletteTheme.primary ?? "#1f2937",
        sourceUrl: spec.source_url ?? item.url,
        pageHref: `/industries/${item.slug}`,
        mirrorHref: `/industries/${item.slug}/mirror`,
        heroHeading: spec.hero?.heading?.trim() || undefined,
        heroSubheading: spec.hero?.subheading?.trim() || undefined,
        heroPrimaryCta: spec.hero?.primary_cta?.trim() || undefined,
        sectionHighlights: (spec.sections ?? []).filter(Boolean).slice(0, 6),
        ctaHighlights: (spec.ctas ?? []).filter(Boolean).slice(0, 6),
        navLabels: (spec.nav_labels ?? []).filter(Boolean).slice(0, 6),
        fonts: (spec.fonts ?? []).filter(Boolean).slice(0, 6),
        paletteTheme,
        templateSummary: (spec.paragraph_samples ?? []).find((sample) => sample.trim().length > 0),
      } satisfies TemplateCatalogEntry;
    }),
  );

  return entries.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}

export async function getTemplateCatalog() {
  if (!templateCatalogPromise) {
    templateCatalogPromise = loadTemplateCatalog();
  }

  return templateCatalogPromise;
}

export async function getTemplateBySlug(slug: string) {
  const catalog = await getTemplateCatalog();
  return catalog.find((entry) => entry.slug === slug);
}

function descriptorForSlug(slug: string) {
  return TEMPLATE_DESCRIPTORS[slug] ?? fallbackDescriptor(slug);
}

export function matchTemplateSlug(input?: string) {
  if (!input) {
    return "chiropracter";
  }

  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return "chiropracter";
  }

  for (const [slug, descriptor] of Object.entries(TEMPLATE_DESCRIPTORS)) {
    if (descriptor.matchPatterns.some((pattern) => pattern.test(normalized))) {
      return slug;
    }
  }

  return "chiropracter";
}

export function getTemplateDescriptor(slug: string) {
  return descriptorForSlug(slug);
}

