export type NavItem = {
  href: string;
  label: string;
};

export type Founder = {
  name: string;
  title: string;
};

export type PainPoint = {
  title: string;
  copy: string;
};

export type SolutionPoint = {
  title: string;
  copy: string;
};

export type Benefit = {
  title: string;
  copy: string;
};

export type Service = {
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type Industry = {
  name: string;
  summary: string;
  painPoint: string;
  outcome: string;
  examples: string[];
  assistantFit: string;
};

export type CredibilityPoint = {
  title: string;
  copy: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const siteConfig = {
  brandName: "Northline AI",
  shortName: "Northline",
  brandStatement: "Turn more inquiries into booked appointments.",
  tagline: "AI assistants and booking systems for appointment-based businesses.",
  description:
    "Northline helps appointment-based businesses turn more inquiries into booked appointments through AI assistants, lead capture systems, booking flows, and modern websites.",
  founder: {
    name: "Kyriakos Tsourekas",
    title: "CEO",
  } satisfies Founder,
  primaryCta: {
    label: "Book a Demo",
    href: "/contact",
  },
  secondaryCta: {
    label: "See How It Works",
    href: "/how-it-works",
  },
  hero: {
    kicker: "Faster replies. More bookings.",
    headline: "Turn inquiries into appointments.",
    description:
      "AI assistants, lead capture, booking flows, and modern websites for appointment-based businesses that want faster response and more booked appointments.",
    audienceLine:
      "Starting in Greece for med spas, dentists, clinics, salons, consultants, and home service businesses.",
    scanPoints: ["Faster response", "Less follow-up", "More booked appointments"],
  },
  contact: {
    email: "kiriakos.tsourekas@gmail.com",
    phone: "+30 6955300340",
    location: "Starting in Greece, focused on appointment-based businesses",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/solutions", label: "Solutions" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/industries", label: "Industries" },
    { href: "/contact", label: "Book Demo" },
  ] satisfies NavItem[],
  trustStrip: [
    "Med Spas",
    "Dentists",
    "Clinics",
    "Salons",
    "Consultants",
    "Home Services",
  ],
  painPoints: [
    {
      title: "Missed leads",
      copy: "New inquiries come in, but no one responds fast enough to keep the momentum.",
    },
    {
      title: "Slow follow-up",
      copy: "By the time someone gets back to the prospect, they are already looking elsewhere.",
    },
    {
      title: "Manual back-and-forth",
      copy: "Teams spend time answering the same questions and chasing details before booking.",
    },
    {
      title: "Lost bookings",
      copy: "Interested visitors never make it into the calendar because the next step is unclear.",
    },
  ] satisfies PainPoint[],
  solutionPoints: [
    {
      title: "Answers instantly",
      copy: "Give new inquiries a useful response the moment they reach out.",
    },
    {
      title: "Qualifies leads",
      copy: "Capture service type, urgency, timing, and contact details automatically.",
    },
    {
      title: "Guides booking",
      copy: "Move the conversation toward the right appointment or next step.",
    },
    {
      title: "Supports the business 24/7",
      copy: "Keep lead capture and booking support working after hours and during busy periods.",
    },
  ] satisfies SolutionPoint[],
  services: [
    {
      eyebrow: "AI Assistant",
      title: "Instant first response for new inquiries",
      summary:
        "The assistant answers common questions, handles first-contact engagement, and keeps the lead moving.",
      bullets: [
        "Handles FAQs, service questions, and first-contact replies",
        "Reduces drop-off from slow or missed responses",
        "Creates a stronger first impression for the business",
      ],
    },
    {
      eyebrow: "Lead Capture",
      title: "Better information before your team steps in",
      summary:
        "Collect the details the business actually needs instead of receiving vague form submissions.",
      bullets: [
        "Captures service intent, urgency, and preferred timing",
        "Packages lead details into a cleaner handoff",
        "Helps teams focus on higher-quality inquiries",
      ],
    },
    {
      eyebrow: "Booking Flow",
      title: "A clearer path from inquiry to appointment",
      summary:
        "Guide visitors toward consultation requests, scheduling prompts, or the right next action.",
      bullets: [
        "Prompts the next step while the lead is still engaged",
        "Reduces manual back-and-forth before booking",
        "Makes the site work harder as a conversion tool",
      ],
    },
    {
      eyebrow: "Modern Website",
      title: "A better front door for appointment-based businesses",
      summary:
        "When needed, Northline also improves the website itself so the message, design, and booking flow work together.",
      bullets: [
        "Sharper service-business messaging",
        "Stronger calls to action and page structure",
        "Built to be expanded and customized later",
      ],
    },
  ] satisfies Service[],
  processSteps: [
    {
      number: "01",
      title: "A new inquiry comes in",
      description: "The assistant engages the visitor immediately instead of leaving them waiting.",
    },
    {
      number: "02",
      title: "Questions get answered",
      description: "The lead gets useful information while key details are captured in the background.",
    },
    {
      number: "03",
      title: "The lead is guided to book",
      description: "The conversation moves toward the right appointment or next step.",
    },
    {
      number: "04",
      title: "Your team gets a clean handoff",
      description: "The business receives the context needed to confirm, follow up, or take over fast.",
    },
  ] satisfies ProcessStep[],
  industries: [
    {
      name: "Med Spas",
      summary:
        "Capture consultation inquiries faster and keep treatment questions from turning into lost revenue.",
      painPoint: "Leads often compare providers quickly and disappear after one missed answer.",
      outcome: "More consultation requests booked with less front-desk friction.",
      examples: ["Laser consults", "Injectables questions", "Pricing and downtime"],
      assistantFit: "Strong fit for consult-driven services",
    },
    {
      name: "Dentists",
      summary:
        "Respond to new-patient questions, cosmetic inquiries, and urgent requests before they go cold.",
      painPoint: "Reception teams are busy, so web inquiries often wait too long for a reply.",
      outcome: "Cleaner intake and more booked treatment consultations.",
      examples: ["Whitening", "Implants", "Emergency requests"],
      assistantFit: "Useful for new-patient and cosmetic demand",
    },
    {
      name: "Clinics",
      summary:
        "Support appointment-heavy clinics with faster replies and a better path into booked consultations.",
      painPoint: "Potential patients leave when the site feels passive and the next step is unclear.",
      outcome: "More inquiries converted into scheduled appointments.",
      examples: ["Private consults", "Insurance questions", "Availability follow-up"],
      assistantFit: "Best where intake quality matters",
    },
    {
      name: "Salons",
      summary:
        "Convert mobile visitors who want fast answers before committing to a premium booking.",
      painPoint: "Too many inquiries stay stuck in DMs, forms, or staff follow-up queues.",
      outcome: "More appointments booked with less manual messaging.",
      examples: ["Color correction", "Bridal trials", "Packages"],
      assistantFit: "Great for mobile-first beauty traffic",
    },
    {
      name: "Consultants",
      summary:
        "Pre-qualify inquiries and move better-fit prospects into discovery calls with more context.",
      painPoint: "Consultants waste time on low-fit calls because the site does not qualify upfront.",
      outcome: "Better discovery calls and less wasted calendar time.",
      examples: ["Discovery calls", "Budget questions", "Project fit"],
      assistantFit: "Useful for consultative sales flows",
    },
    {
      name: "Home Services",
      summary:
        "Catch urgent inquiries fast and collect the details needed to book estimates or dispatch properly.",
      painPoint: "When response is slow, the homeowner usually books the first company that answers.",
      outcome: "More estimates booked and fewer urgent leads lost.",
      examples: ["HVAC repair", "Electrical callouts", "Same-day estimates"],
      assistantFit: "High impact where speed wins the job",
    },
  ] satisfies Industry[],
  benefits: [
    {
      title: "Faster response",
      copy: "Reply to inquiries instantly instead of hours later.",
    },
    {
      title: "More booked appointments",
      copy: "Help more visitors move from interest to a scheduled next step.",
    },
    {
      title: "Less manual admin",
      copy: "Reduce repetitive questions, chasing details, and back-and-forth booking work.",
    },
    {
      title: "Better customer experience",
      copy: "Give leads a smoother, more professional first interaction with the business.",
    },
  ] satisfies Benefit[],
  credibilityPoints: [
    {
      title: "Built around real service-business workflows",
      copy: "The goal is simple: help an inquiry become an appointment with less friction.",
    },
    {
      title: "Execution-focused, not hype-driven",
      copy: "Northline is positioned around response time, lead quality, and booked outcomes.",
    },
    {
      title: "Websites, capture, and booking designed together",
      copy: "The site, assistant, and next-step flow work as one system instead of separate tools.",
    },
  ] satisfies CredibilityPoint[],
  testimonials: [
    {
      quote:
        "The biggest shift was speed. New inquiries stopped feeling like they were waiting on us to catch up.",
      author: "Sophia Patel",
      role: "Operations Lead, Radiant Skin Studio",
    },
    {
      quote:
        "What made it credible was the handoff. The team got better information and more booking-ready inquiries.",
      author: "Marcus Wynn",
      role: "Founder, Wynn Dental Group",
    },
    {
      quote:
        "It felt less like adding a widget and more like fixing the way the website handled demand.",
      author: "Avery Chen",
      role: "Director, Summit Advisory",
    },
  ] satisfies Testimonial[],
  faqs: [
    {
      question: "Is this replacing my staff?",
      answer:
        "No. The goal is to handle first response, capture lead details, and move the inquiry closer to a booking so your team spends less time on repetitive admin.",
    },
    {
      question: "Can this work if the website needs improvement too?",
      answer:
        "Yes. Northline can improve the website and booking flow at the same time so the experience feels more complete and conversion-focused.",
    },
    {
      question: "Is the local version still easy to customize later?",
      answer:
        "Yes. The messaging, industries, CTA labels, testimonials, and colors are centralized so you can adapt the site quickly.",
    },
  ] satisfies FaqItem[],
  dashboardMetrics: [
    { label: "New inquiries", value: "42", delta: "This week" },
    { label: "Qualified leads", value: "31", delta: "Ready for follow-up" },
    { label: "Booked appointments", value: "19", delta: "Moved into calendar" },
    { label: "Missed opportunities", value: "3", delta: "Down from 14" },
  ],
  launchPhases: [
    {
      title: "Clarify the offer",
      summary: "Define the questions, qualification points, and booking actions that matter.",
    },
    {
      title: "Build the lead flow",
      summary: "Design the site, assistant, and calls to action around faster conversion.",
    },
    {
      title: "Refine from real use",
      summary: "Tighten prompts, routing, and follow-up based on how leads actually respond.",
    },
  ],
  contactExpectations: [
    "A walkthrough of your current inquiry and booking flow",
    "A recommendation for the best next step based on your business model",
    "A clear view of where faster response and better booking flow can help most",
  ],
} as const;
