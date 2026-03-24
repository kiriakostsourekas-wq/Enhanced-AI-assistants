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

export type AiDemo = {
  title: string;
  audience: string;
  summary: string;
  handles: string[];
  outcome: string;
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

const DEFAULT_DEMO_PATH = "/contact";
const PLACEHOLDER_DEMO_URL = "[YOUR DEMO PAGE OR CALENDAR LINK]";

function getPublicDemoUrl() {
  const trimmed = process.env.NEXT_PUBLIC_DEMO_URL?.trim();

  if (!trimmed || trimmed === PLACEHOLDER_DEMO_URL) {
    return DEFAULT_DEMO_PATH;
  }

  return trimmed;
}

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
    href: getPublicDemoUrl(),
  },
  secondaryCta: {
    label: "View Demos",
    href: "/industries",
  },
  hero: {
    eyebrow: "Northline AI",
    kicker: "Website enquiries, handled properly.",
    headline: "Turn website enquiries into appointments.",
    description:
      "Northline combines a website assistant, smarter intake, and clearer next steps so interested visitors do not drift before booking.",
    audienceLine:
      "Built for clinics, dentists, med spas, salons, consultants, and service businesses where the website should be doing more of the front-end work.",
    primaryActionLabel: "See the Booking Flow",
    secondaryActionLabel: "See a Live Example",
    secondaryActionHref: "#real-scenarios",
    scanPoints: ["Handle common questions", "Capture useful context", "Make the next step clear"],
  },
  homepage: {
    problem: {
      eyebrow: "Where bookings are lost",
      title: "Most losses happen between the enquiry and the calendar.",
      description:
        "The issue is usually not demand alone. It is the delay, weak intake, or missing next step after someone reaches out.",
    },
    solution: {
      eyebrow: "How it works",
      title: "Northline shapes the path from first question to next step.",
      description:
        "Instead of dropping in a generic widget, Northline tightens the first response, intake questions, and routing together so the journey feels deliberate.",
      ctaLabel: "See the Full Journey",
    },
    demos: {
      eyebrow: "Real scenarios",
      title: "Proof through actual enquiry situations.",
      description:
        "Each example shows who the scenario is for, what the assistant handles, and the operational outcome it is designed to improve.",
      linkHref: "/industries",
      cardActionLabel: "Open Demo",
      featuredTitles: ["Med Spa Demo", "Dental Demo", "Home Services Demo"],
    },
    proof: {
      eyebrow: "Why Northline",
      title: "Useful when the issue is not traffic, but what happens after someone reaches out.",
      description:
        "The business case is usually hidden in the gaps: slow reply, weak intake, and unclear next steps. Northline is designed to tighten those points.",
      resultsTitle: "What a review surfaces",
      resultsDescription:
        "Where enquiries lose momentum, and what to tighten first.",
      ctaLabel: "Review My Current Setup",
    },
    finalCta: {
      eyebrow: "Next step",
      title: "Review your current booking flow.",
      description:
        "We will look at where enquiries stall, where the handoff gets loose, and what would make the path to booking clearer.",
      buttonLabel: "Review My Flow",
    },
  },
  footer: {
    description:
      "Northline builds AI assistants, lead capture systems, booking flows, and modern websites for appointment-based businesses. Based in Greece.",
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
    { href: "/industries", label: "AI Demos" },
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
      title: "Set the first response",
      copy: "Give visitors a useful answer while interest is still high.",
    },
    {
      title: "Capture the right details",
      copy: "Collect service type, urgency, timing, or context before the team steps in.",
    },
    {
      title: "Route the next step",
      copy: "Direct the visitor to the booking path, consult request, or handoff that fits.",
    },
    {
      title: "Tighten the surrounding page",
      copy: "Make sure the assistant and the page work together instead of fighting each other.",
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
  aiDemos: [
    {
      title: "Med Spa Demo",
      audience: "Consultation-driven aesthetic clinics",
      summary:
        "Shows how treatment questions, first-visit interest, and consult requests are handled without sending everything to the front desk.",
      handles: ["Laser consults", "Injectables questions", "Pricing and downtime"],
      outcome: "Fewer consult enquiries left waiting and a cleaner first-visit handoff",
    },
    {
      title: "Dental Demo",
      audience: "Practices handling new-patient and cosmetic demand",
      summary:
        "Shows how whitening, implant, and emergency questions are answered before the patient is pushed to the right consult or next step.",
      handles: ["Whitening", "Implants", "Emergency requests"],
      outcome: "Stronger cosmetic intake and fewer warm enquiries lost",
    },
    {
      title: "Clinic Demo",
      audience: "Appointment-heavy clinics with service and availability questions",
      summary:
        "Shows how private consult, insurance, and timing questions are handled while the enquiry moves toward the right booking path.",
      handles: ["Private consults", "Insurance questions", "Availability follow-up"],
      outcome: "More useful patient enquiries reaching the right next step",
    },
    {
      title: "Salon Demo",
      audience: "Mobile-first beauty businesses",
      summary:
        "Shows how higher-touch appointment requests are screened before they turn into long DM threads or weak enquiries.",
      handles: ["Color correction", "Bridal trials", "Packages"],
      outcome: "Better qualified appointment requests with less manual messaging",
    },
    {
      title: "Consultant Demo",
      audience: "Discovery-call businesses",
      summary:
        "Shows how fit, budget, and project-shape questions can be handled before calendar time is spent.",
      handles: ["Discovery calls", "Budget questions", "Project fit"],
      outcome: "Fewer low-fit calls and better context before the first conversation",
    },
    {
      title: "Home Services Demo",
      audience: "Teams where response speed wins the job",
      summary:
        "Shows how urgent repair and estimate enquiries are captured quickly and routed with the right context.",
      handles: ["HVAC repair", "Electrical callouts", "Same-day estimates"],
      outcome: "Cleaner estimate requests and faster first follow-up",
    },
  ] satisfies AiDemo[],
  processSteps: [
    {
      number: "01",
      title: "A visitor reaches out",
      description: "The site meets the enquiry while intent is still fresh, instead of letting it sit.",
    },
    {
      number: "02",
      title: "The right context is gathered",
      description: "The visitor gets useful answers while the details your team actually needs are collected.",
    },
    {
      number: "03",
      title: "The next step is made clear",
      description: "The enquiry is directed toward a consult, booking path, or handoff that makes sense.",
    },
    {
      number: "04",
      title: "Your team steps in with context",
      description: "Follow-up starts with better information instead of another round of basic questions.",
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
      title: "Reply gaps exposed",
      copy: "See where enquiries are sitting too long before anyone steps in.",
    },
    {
      title: "Intake tightened",
      copy: "Capture the details staff usually need to chase manually.",
    },
    {
      title: "Next steps clarified",
      copy: "Make the visitor path more obvious instead of leaving it loose or passive.",
    },
    {
      title: "Demand used better",
      copy: "Get more value from the traffic and enquiries you already have.",
    },
  ] satisfies Benefit[],
  credibilityPoints: [
    {
      title: "Designed around the real booking path",
      copy: "Northline starts with what happens after someone reaches out, not just what the homepage says.",
    },
    {
      title: "Useful without adding noise",
      copy: "The assistant, pages, and calls to action are shaped to make the next step clearer.",
    },
    {
      title: "Built for actual teams",
      copy: "The end result should be easier for staff to work with, not just nicer to look at.",
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
