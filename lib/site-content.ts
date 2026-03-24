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

export type SelectOption = {
  label: string;
  value: string;
};

export type DemoMessage = {
  author: "assistant" | "user";
  text: string;
};

export type ChatDemoScenario = {
  audience: string;
  label: string;
  messages: DemoMessage[];
  nextStepMeta: string;
  nextStepTitle: string;
  slots: string[];
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

const primaryCtaHref = getPublicDemoUrl();

const siteContentByLocale = {
  en: {
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
    navigation: {
      mobileLabel: "Mobile navigation",
      primaryLabel: "Primary navigation",
      switcherLabel: "Language",
      toggleMenuLabel: "Toggle menu",
    },
    footerLabels: {
      contact: "Contact",
      pages: "Pages",
    },
    common: {
      includedInApproachLabel: "Included in the approach",
    },
    primaryCta: {
      label: "Book a Demo",
      href: primaryCtaHref,
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
        processPanelLabel: "Process",
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
        featuredBadge: "Featured",
        featuredTitles: ["Med Spa Demo", "Dental Demo", "Home Services Demo"],
        handlesLabel: "Handles",
        outcomeLabel: "Outcome",
        showsLabel: "Shows",
        useCaseBadge: "Use Case",
      },
      proof: {
        eyebrow: "Why Northline",
        title: "Useful when the issue is not traffic, but what happens after someone reaches out.",
        description:
          "The business case is usually hidden in the gaps: slow reply, weak intake, and unclear next steps. Northline is designed to tighten those points.",
        resultsTitle: "What a review surfaces",
        resultsDescription: "Where enquiries lose momentum, and what to tighten first.",
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
    trustStrip: ["Med Spas", "Dentists", "Clinics", "Salons", "Consultants", "Home Services"],
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
    solutionsPage: {
      capabilitySectionLabel: "Included capabilities",
      capabilitySectionTitle: "What Northline is designed to improve",
      capabilityRows: [
        "FAQ answering and lead engagement",
        "Lead qualification and intake logic",
        "Appointment prompts and scheduling handoff",
        "Conversion-focused website design",
        "Structured lead summaries for the business team",
        "A clean codebase ready for later integrations",
      ],
      deliveryPillars: [
        {
          title: "Response built into the website",
          copy:
            "The site is built to answer faster, guide better, and help more inquiries reach a booking decision.",
        },
        {
          title: "Lead capture that produces usable information",
          copy:
            "The business gets cleaner information back instead of vague form messages and scattered follow-up.",
        },
        {
          title: "Booking flow designed for real operations",
          copy:
            "Everything is framed around what helps a service business convert inquiries into actual appointments.",
        },
      ],
      finalCtaLabel: "Book a Demo",
      hero: {
        description:
          "Northline combines faster first response, stronger lead capture, better booking flow, and cleaner website messaging into one service-business system.",
        eyebrow: "Solutions",
        highlights: [
          "Instant first response for new inquiries",
          "Better lead qualification and cleaner handoff",
          "Booking flow support for appointment-driven businesses",
          "Modern websites built around conversion",
        ],
        secondaryAction: { label: "See industries", href: "/industries" },
        title: "Services built to help more inquiries become appointments",
      },
      whyApproachDescription:
        "When response is slow, booking is unclear, or follow-up becomes manual, leads leak out of the pipeline. Northline focuses on fixing that first.",
      whyApproachLabel: "Why this approach converts better",
      whyApproachTitle:
        "Most service businesses do not need more inquiries first. They need a better way to handle the ones they already get.",
    },
    industriesPage: {
      bottomCta: {
        description:
          "We tailor the assistant around your offer, your lead flow, and the way your team actually handles appointments.",
        label: "Next step",
        title: "Book a demo built around your business.",
      },
      bottomNote: {
        description:
          "Start with the niche that is closest to your inquiries, then tighten the messaging, qualification questions, and booking flow around that exact audience.",
        label: "How to use this page",
        title: "Choose the demo that matches how your business books.",
      },
      cardBadge: "AI Demo",
      cardButtonLabel: "Book a Demo",
      hero: {
        description:
          "Preview how AI assistants can answer inquiries, capture lead details, and guide booking flows for different appointment-based businesses.",
        eyebrow: "AI Demos",
        highlights: [
          "Booking-focused demos for service businesses",
          "Built around real inquiry and scheduling situations",
          "Easy to tailor to one niche or offer later",
        ],
        secondaryAction: { label: "View solutions", href: "/solutions" },
        title: "AI demos for real booking situations",
      },
    },
    howItWorksPage: {
      finalCtaLabel: "Book a demo",
      finalCtaTitle: "More inquiries answered. More leads qualified. More appointments booked.",
      hero: {
        description:
          "Northline is designed to help businesses respond faster, capture better information, and guide more inquiries toward booked appointments.",
        eyebrow: "Workflow",
        secondaryAction: { label: "View solutions", href: "/solutions" },
        title: "A simple process from inquiry to booking",
      },
      launchProcessLabel: "Launch process",
      launchProcessTitle: "Three phases to put the flow in place",
      shortVersionLabel: "Short version",
      viewpoints: [
        {
          title: "For the visitor",
          copy: "A faster response, useful answers, and a clearer path toward the next step.",
        },
        {
          title: "For the business",
          copy: "A cleaner handoff with the details needed to confirm, follow up, or book.",
        },
        {
          title: "For the workflow",
          copy:
            "Less manual back-and-forth and a better chance of converting the inquiries you already have.",
        },
      ],
    },
    contactPage: {
      hero: {
        description:
          "Book directly on the calendar or send a short inquiry through the form below. Northline is starting in Greece and focused on appointment-based businesses that want more inquiries turning into appointments.",
        eyebrow: "Contact",
        primaryActionLabel: "Book Instantly on Calendly",
        secondaryActionLabel: "Use inquiry form",
        title: "Book a demo and review where more appointments could be won",
      },
    },
    chatbotTestPage: {
      hero: {
        description:
          "This page is a simple local test harness for the chatbot backend. It sends real requests to the local API route and uses the knowledge pack on the server.",
        eyebrow: "Local chatbot test",
        highlights: [
          "Calls the real /api/chat route",
          "Uses knowledge-pack.md on the server",
          "Keeps API keys server-side only",
        ],
        secondaryAction: { label: "View solutions", href: "/solutions" },
        title: "Test the chatbot backend locally",
      },
      sideCard: {
        apiRouteBody:
          "POST requests go to /api/chat with the latest message and optional history.",
        apiRouteTitle: "API route",
        backHomeLabel: "Back to Home",
        ctaLabel: "Book a Demo",
        demoCtaBody:
          "The response includes a booking CTA using NEXT_PUBLIC_DEMO_URL.",
        demoCtaTitle: "Demo CTA",
        description:
          "The assistant answers questions about the offer, stays within the knowledge pack, and can guide relevant visitors toward booking a demo.",
        knowledgeSourceBody:
          "Server-side business context is loaded from knowledge-pack.md.",
        knowledgeSourceTitle: "Knowledge source",
        panelLabel: "What this V1 does",
        title: "Business-aware replies with a clean local backend.",
      },
    },
    notFoundPage: {
      ctaLabel: "Return home",
      description: "Use the main navigation to continue exploring the site.",
      title: "That page does not exist.",
    },
    contactForm: {
      actions: {
        calendarButtonLabel: "Book Instantly on Calendly",
        note:
          "The calendar button opens live booking. The form below is a separate local inquiry flow stored in your browser for demo purposes.",
        savingLabel: "Saving demo request...",
        submitLabel: "Submit Demo Request",
      },
      fields: {
        business: "Business",
        email: "Email",
        industry: "Industry",
        monthlyLeads: "Approximate monthly leads",
        name: "Name",
        notes: "What would you want the assistant to handle?",
        phone: "Phone",
        websiteStatus: "Current website status",
      },
      latestRequest: {
        emptyDescription:
          "Use the form to simulate a real enquiry and review the saved confirmation here.",
        emptyTitle: "No submission yet",
        panelLabel: "Latest saved request",
        summaryTemplate: "{{name}} requested a demo for a {{industry}} business on {{submittedAt}}.",
      },
      panel: {
        badge: "Demo-ready",
        label: "Request a tailored walkthrough",
        title: "Book a demo",
      },
      placeholders: {
        business: "North Peak Dental",
        email: "you@business.com",
        name: "Jordan Smith",
        notes:
          "Example: answer treatment questions, qualify leads, offer appointment times, and alert our front desk.",
        phone: "+1 (555) 000-0000",
      },
      quickBooking: {
        buttonLabel: "Open Calendar",
        label: "Instant booking",
        metaDuration: "30-minute call",
        metaProvider: "Calendly",
        title: "Prefer to schedule right away?",
        description: "Use the live calendar to choose a time immediately.",
      },
      recentRequests: {
        emptyLabel: "No stored requests yet.",
        panelLabel: "Recent saved requests",
      },
      selectOptions: {
        industries: [
          { label: "Clinic", value: "clinic" },
          { label: "Dentist", value: "dentist" },
          { label: "Med Spa", value: "med-spa" },
          { label: "Salon", value: "salon" },
          { label: "Consulting", value: "consulting" },
          { label: "Home Services", value: "home-services" },
        ] satisfies SelectOption[],
        monthlyLeads: [
          { label: "0-10 leads", value: "0-10" },
          { label: "10-30 leads", value: "10-30" },
          { label: "30-75 leads", value: "30-75" },
          { label: "75+ leads", value: "75+" },
        ] satisfies SelectOption[],
        websiteStatus: [
          { label: "Existing website, needs improvement", value: "existing-needs-improvement" },
          { label: "No real website yet", value: "no-real-website-yet" },
          { label: "Website is fine, need better lead capture", value: "website-fine-need-capture" },
        ] satisfies SelectOption[],
      },
    },
    chatDemo: {
      nextStepLabel: "Recommended next step",
      previewAriaLabelSuffix: "preview",
      scenarios: [
        {
          audience: "Dental clinic",
          label: "Dental",
          messages: [
            { author: "user", text: "I'm interested in teeth whitening next week." },
            { author: "assistant", text: "Happy to help. Are you a new patient?" },
            { author: "user", text: "Yes, I am." },
            { author: "assistant", text: "Great - I can show a few consultation times." },
          ],
          nextStepMeta: "New patient - whitening consult - next week",
          nextStepTitle: "Suggested consultation times",
          slots: ["Tue 10:00", "Wed 14:30", "Thu 17:15"],
        },
        {
          audience: "Med spa",
          label: "Med Spa",
          messages: [
            { author: "user", text: "I'd like a laser consultation this weekend." },
            { author: "assistant", text: "Of course. Is this your first visit?" },
            { author: "user", text: "Yes, first time." },
            { author: "assistant", text: "Great - here are a few consultation options." },
          ],
          nextStepMeta: "First visit - laser consult - weekend preference",
          nextStepTitle: "Suggested consultation times",
          slots: ["Sat 11:00", "Sat 13:30", "Sun 10:15"],
        },
        {
          audience: "Salon",
          label: "Salon",
          messages: [
            { author: "user", text: "I need a color correction next week." },
            { author: "assistant", text: "Happy to help. Have you had recent at-home color done?" },
            { author: "user", text: "Yes, about two weeks ago." },
            { author: "assistant", text: "Thanks - a short consultation is the right next step." },
          ],
          nextStepMeta: "Color correction - consultation first - next week",
          nextStepTitle: "Suggested consultation times",
          slots: ["Mon 18:00", "Tue 17:30", "Wed 19:00"],
        },
      ] satisfies ChatDemoScenario[],
      panelLabel: "Example flow",
      tabsAriaLabel: "Preview scenarios",
      title: "From enquiry to next step",
    },
    chatbotTestPanel: {
      ctaLabel: "Book a Demo",
      errorFallback: "I couldn't answer right now. You can still book a demo.",
      initialAssistantMessage:
        "Hi, I'm Lena. I can answer questions about how we help businesses convert more leads into booked appointments.",
      inputLabel: "Your message",
      placeholder: "Ask about the service, industries, website support, or next steps.",
      quickPrompts: [
        "What exactly do you help with?",
        "Is this a fit for a dental clinic?",
        "Can you also improve my website?",
        "What happens after I book a demo?",
      ],
      roleLabels: {
        assistant: "Assistant",
        user: "You",
      },
      sendLabel: "Send Message",
      sendingLabel: "Sending...",
    },
    widget: {
      connectionIssueDescription: "I couldn't reply just now. Please try again in a moment.",
      connectionIssueTitle: "Connection issue",
      ctaLabel: "Book a Demo",
      ctaPrompt: "Prefer to talk it through?",
      headerTitle: "Live Chat",
      initialAssistantMessage:
        "Hi there. I'm Lena. I can help with bookings, setup, and whether this could fit your business.",
      inputLabel: "Message Lena",
      inputPlaceholder: "Write a message...",
      launcherLabelClosed: "Open chat with Lena",
      launcherLabelOpen: "Close chat",
      minimizeLabel: "Minimize chat",
      sendLabel: "Send",
      typingLabel: "Lena is typing",
    },
  },
  gr: {
    brandName: "Northline AI",
    shortName: "Northline",
    brandStatement: "Μετατρέψτε περισσότερα αιτήματα σε κλεισμένα ραντεβού.",
    tagline: "Βοηθοί AI και συστήματα κρατήσεων για επιχειρήσεις που δουλεύουν με ραντεβού.",
    description:
      "Η Northline βοηθά επιχειρήσεις που βασίζονται σε ραντεβού να μετατρέπουν περισσότερα αιτήματα σε κλεισμένα ραντεβού, με βοηθούς AI, συλλογή χρήσιμων στοιχείων, ροές κράτησης και σύγχρονα websites.",
    founder: {
      name: "Kyriakos Tsourekas",
      title: "CEO",
    } satisfies Founder,
    navigation: {
      mobileLabel: "Πλοήγηση κινητού",
      primaryLabel: "Κύρια πλοήγηση",
      switcherLabel: "Γλώσσα",
      toggleMenuLabel: "Άνοιγμα μενού",
    },
    footerLabels: {
      contact: "Επικοινωνία",
      pages: "Σελίδες",
    },
    common: {
      includedInApproachLabel: "Τι περιλαμβάνει η προσέγγιση",
    },
    primaryCta: {
      label: "Κλείστε Demo",
      href: primaryCtaHref,
    },
    secondaryCta: {
      label: "Δείτε Παραδείγματα",
      href: "/industries",
    },
    hero: {
      eyebrow: "Northline AI",
      kicker: "Τα αιτήματα από το website, σωστά διαχειρισμένα.",
      headline: "Μετατρέψτε τα αιτήματα από το website σε ραντεβού.",
      description:
        "Η Northline συνδυάζει βοηθό στο website, πιο έξυπνη συλλογή στοιχείων και πιο καθαρά επόμενα βήματα, ώστε το ενδιαφέρον να μη χάνεται πριν φτάσει στην κράτηση.",
      audienceLine:
        "Σχεδιασμένο για κλινικές, οδοντιατρεία, med spas, κομμωτήρια, συμβούλους και επιχειρήσεις υπηρεσιών όπου το website πρέπει να κάνει περισσότερη δουλειά στην πρώτη επαφή.",
      primaryActionLabel: "Δείτε τη Ροή Κράτησης",
      secondaryActionLabel: "Δείτε Ζωντανό Παράδειγμα",
      secondaryActionHref: "#real-scenarios",
      scanPoints: [
        "Απαντά σε συχνές ερωτήσεις",
        "Συλλέγει χρήσιμα στοιχεία",
        "Κάνει το επόμενο βήμα σαφές",
      ],
    },
    homepage: {
      problem: {
        eyebrow: "Πού χάνονται οι κρατήσεις",
        title: "Οι περισσότερες απώλειες συμβαίνουν ανάμεσα στο πρώτο ενδιαφέρον και το ημερολόγιο.",
        description:
          "Το πρόβλημα συνήθως δεν είναι μόνο η ζήτηση. Είναι η καθυστέρηση, η αδύναμη συλλογή στοιχείων ή το ασαφές επόμενο βήμα μόλις κάποιος εκδηλώσει ενδιαφέρον.",
      },
      solution: {
        eyebrow: "Πώς λειτουργεί",
        processPanelLabel: "Διαδικασία",
        title: "Η Northline οργανώνει τη διαδρομή από την πρώτη ερώτηση μέχρι το επόμενο βήμα.",
        description:
          "Αντί να προσθέτει απλώς ένα γενικό widget, η Northline βελτιώνει μαζί την πρώτη απάντηση, τις ερωτήσεις συλλογής στοιχείων και τη λογική του επόμενου βήματος, ώστε η εμπειρία να είναι πιο καθαρή και σκόπιμη.",
        ctaLabel: "Δείτε Όλη τη Διαδρομή",
      },
      demos: {
        eyebrow: "Πραγματικά σενάρια",
        title: "Απόδειξη μέσα από πραγματικές περιπτώσεις ενδιαφέροντος.",
        description:
          "Κάθε παράδειγμα δείχνει για ποιον είναι το σενάριο, τι χειρίζεται ο βοηθός και ποιο λειτουργικό αποτέλεσμα βελτιώνει.",
        linkHref: "/industries",
        cardActionLabel: "Άνοιγμα Demo",
        featuredBadge: "Κύριο",
        featuredTitles: ["Demo για Med Spa", "Demo για Οδοντιατρείο", "Demo για Υπηρεσίες Κατ’ Οίκον"],
        handlesLabel: "Χειρίζεται",
        outcomeLabel: "Αποτέλεσμα",
        showsLabel: "Δείχνει",
        useCaseBadge: "Περίπτωση χρήσης",
      },
      proof: {
        eyebrow: "Γιατί Northline",
        title: "Χρήσιμη όταν το πρόβλημα δεν είναι η επισκεψιμότητα, αλλά τι γίνεται αφού κάποιος εκδηλώσει ενδιαφέρον.",
        description:
          "Η επιχειρηματική αξία συνήθως κρύβεται στα κενά: αργή απάντηση, αδύναμη συλλογή στοιχείων και θολό επόμενο βήμα. Η Northline είναι σχεδιασμένη για να βελτιώνει ακριβώς αυτά τα σημεία.",
        resultsTitle: "Τι αναδεικνύει μια αξιολόγηση",
        resultsDescription: "Πού χάνεται η δυναμική των αιτημάτων και τι αξίζει να βελτιωθεί πρώτο.",
        ctaLabel: "Αξιολογήστε την Τωρινή Ροή",
      },
      finalCta: {
        eyebrow: "Επόμενο βήμα",
        title: "Αξιολογήστε τη σημερινή ροή κρατήσεων.",
        description:
          "Θα δούμε πού κολλούν τα αιτήματα, πού χαλαρώνει το handoff και τι θα έκανε τη διαδρομή μέχρι την κράτηση πιο καθαρή.",
        buttonLabel: "Αξιολόγηση Ροής",
      },
    },
    footer: {
      description:
        "Η Northline δημιουργεί βοηθούς AI, συστήματα συλλογής στοιχείων, ροές κράτησης και σύγχρονα websites για επιχειρήσεις που βασίζονται σε ραντεβού. Με βάση την Ελλάδα.",
    },
    contact: {
      email: "kiriakos.tsourekas@gmail.com",
      phone: "+30 6955300340",
      location: "Ξεκινά από την Ελλάδα, με έμφαση σε επιχειρήσεις που βασίζονται σε ραντεβού",
    },
    nav: [
      { href: "/", label: "Αρχική" },
      { href: "/solutions", label: "Λύσεις" },
      { href: "/how-it-works", label: "Πώς Λειτουργεί" },
      { href: "/industries", label: "Παραδείγματα AI" },
      { href: "/contact", label: "Κλείστε Demo" },
    ] satisfies NavItem[],
    trustStrip: ["Med Spas", "Οδοντιατρεία", "Κλινικές", "Κομμωτήρια", "Σύμβουλοι", "Υπηρεσίες Κατ’ Οίκον"],
    painPoints: [
      {
        title: "Χαμένα leads",
        copy: "Έρχονται νέα αιτήματα, αλλά κανείς δεν απαντά αρκετά γρήγορα για να κρατήσει το ενδιαφέρον ζωντανό.",
      },
      {
        title: "Αργό follow-up",
        copy: "Μέχρι να απαντήσει κάποιος από την ομάδα, ο ενδιαφερόμενος συχνά έχει ήδη στραφεί αλλού.",
      },
      {
        title: "Χειροκίνητο back-and-forth",
        copy: "Οι ομάδες χάνουν χρόνο απαντώντας τις ίδιες ερωτήσεις και κυνηγώντας βασικές πληροφορίες πριν από την κράτηση.",
      },
      {
        title: "Χαμένες κρατήσεις",
        copy: "Επισκέπτες με ενδιαφέρον δεν φτάνουν ποτέ στο ημερολόγιο, επειδή το επόμενο βήμα δεν είναι ξεκάθαρο.",
      },
    ] satisfies PainPoint[],
    solutionPoints: [
      {
        title: "Ορίστε την πρώτη απάντηση",
        copy: "Δώστε στον επισκέπτη μια χρήσιμη απάντηση όσο το ενδιαφέρον είναι ακόμα ζωντανό.",
      },
      {
        title: "Συλλέξτε τις σωστές πληροφορίες",
        copy: "Συγκεντρώστε τύπο υπηρεσίας, επείγον, χρονισμό ή βασικά στοιχεία πριν μπει η ομάδα στη συζήτηση.",
      },
      {
        title: "Καθοδηγήστε το επόμενο βήμα",
        copy: "Οδηγήστε τον επισκέπτη στη σωστή διαδρομή κράτησης, σε αίτημα αξιολόγησης ή στο κατάλληλο handoff.",
      },
      {
        title: "Βελτιώστε και τη σελίδα γύρω από τον βοηθό",
        copy: "Ο βοηθός και η σελίδα πρέπει να δουλεύουν μαζί, όχι να ανταγωνίζονται μεταξύ τους.",
      },
    ] satisfies SolutionPoint[],
    services: [
      {
        eyebrow: "Βοηθός AI",
        title: "Άμεση πρώτη απάντηση για νέα αιτήματα",
        summary:
          "Ο βοηθός απαντά σε συχνές ερωτήσεις, χειρίζεται την πρώτη επαφή και κρατά το ενδιαφέρον σε κίνηση.",
        bullets: [
          "Απαντά σε συχνές ερωτήσεις, ερωτήσεις για υπηρεσίες και πρώτες απαντήσεις",
          "Μειώνει το drop-off από αργές ή χαμένες απαντήσεις",
          "Δημιουργεί πιο επαγγελματική πρώτη εντύπωση για την επιχείρηση",
        ],
      },
      {
        eyebrow: "Συλλογή Στοιχείων",
        title: "Καλύτερες πληροφορίες πριν εμπλακεί η ομάδα σας",
        summary:
          "Συλλέξτε τα στοιχεία που πραγματικά χρειάζεται η επιχείρηση, αντί για αόριστες φόρμες χωρίς ουσία.",
        bullets: [
          "Καταγράφει πρόθεση, επείγον και προτιμώμενο timing",
          "Οργανώνει το lead σε πιο καθαρό handoff",
          "Βοηθά την ομάδα να εστιάζει σε πιο ποιοτικά αιτήματα",
        ],
      },
      {
        eyebrow: "Ροή Κράτησης",
        title: "Πιο καθαρή διαδρομή από το αίτημα στο ραντεβού",
        summary:
          "Καθοδηγήστε τους επισκέπτες προς αίτημα αξιολόγησης, πρόταση προγραμματισμού ή το σωστό επόμενο βήμα.",
        bullets: [
          "Προτείνει το επόμενο βήμα ενώ το lead είναι ακόμη ενεργό",
          "Μειώνει το χειροκίνητο back-and-forth πριν την κράτηση",
          "Κάνει το site να δουλεύει περισσότερο ως εργαλείο μετατροπής",
        ],
      },
      {
        eyebrow: "Σύγχρονο Website",
        title: "Μια καλύτερη ψηφιακή είσοδος για επιχειρήσεις που δουλεύουν με ραντεβού",
        summary:
          "Όταν χρειάζεται, η Northline βελτιώνει και το ίδιο το website ώστε μήνυμα, σχεδιασμός και ροή κράτησης να λειτουργούν μαζί.",
        bullets: [
          "Πιο καθαρό μήνυμα για επιχειρήσεις υπηρεσιών",
          "Ισχυρότερα calls to action και καλύτερη δομή σελίδας",
          "Βάση που μπορεί να επεκταθεί και να προσαρμοστεί αργότερα",
        ],
      },
    ] satisfies Service[],
    aiDemos: [
      {
        title: "Demo για Med Spa",
        audience: "Αισθητικές κλινικές που βασίζονται σε consultations",
        summary:
          "Δείχνει πώς ερωτήσεις για θεραπείες, ενδιαφέρον για πρώτη επίσκεψη και αιτήματα αξιολόγησης μπορούν να χειριστούν χωρίς να περνούν όλα από την υποδοχή.",
        handles: ["Laser consultations", "Ερωτήσεις για injectables", "Τιμές και downtime"],
        outcome: "Λιγότερα αιτήματα αξιολόγησης να μένουν σε αναμονή και καθαρότερο handoff πρώτης επίσκεψης",
      },
      {
        title: "Demo για Οδοντιατρείο",
        audience: "Οδοντιατρεία με new-patient και cosmetic demand",
        summary:
          "Δείχνει πώς απαντώνται ερωτήσεις για whitening, implants και επείγοντα περιστατικά πριν ο ασθενής οδηγηθεί στο σωστό ραντεβού αξιολόγησης ή επόμενο βήμα.",
        handles: ["Whitening", "Implants", "Επείγοντα αιτήματα"],
        outcome: "Καλύτερη αρχική καταγραφή ενδιαφέροντος και λιγότερα ζεστά αιτήματα να χάνονται",
      },
      {
        title: "Demo για Κλινική",
        audience: "Κλινικές με πολλά ραντεβού και συχνές ερωτήσεις για υπηρεσίες και διαθεσιμότητα",
        summary:
          "Δείχνει πώς ερωτήσεις για private consults, insurance και timing οδηγούνται προς το σωστό booking path.",
        handles: ["Ιδιωτικά consults", "Ερωτήσεις για ασφάλιση", "Follow-up διαθεσιμότητας"],
        outcome: "Πιο χρήσιμα αιτήματα ασθενών να φτάνουν στο σωστό επόμενο βήμα",
      },
      {
        title: "Demo για Κομμωτήριο",
        audience: "Επιχειρήσεις ομορφιάς με κυρίως mobile επισκεψιμότητα",
        summary:
          "Δείχνει πώς πιο απαιτητικά αιτήματα για ραντεβού φιλτράρονται πριν μετατραπούν σε μεγάλα DM threads ή αδύναμα αιτήματα.",
        handles: ["Color correction", "Bridal trials", "Πακέτα"],
        outcome: "Καλύτερα προεπιλεγμένα αιτήματα για ραντεβού με λιγότερα χειροκίνητα μηνύματα",
      },
      {
        title: "Demo για Σύμβουλο",
        audience: "Επιχειρήσεις που δουλεύουν με discovery calls",
        summary:
          "Δείχνει πώς ερωτήσεις για fit, budget και project scope μπορούν να χειριστούν πριν δεσμευτεί χρόνος στο ημερολόγιο.",
        handles: ["Discovery calls", "Ερωτήσεις για budget", "Καταλληλότητα project"],
        outcome: "Λιγότερα low-fit calls και καλύτερο context πριν από την πρώτη συζήτηση",
      },
      {
        title: "Demo για Υπηρεσίες Κατ’ Οίκον",
        audience: "Ομάδες όπου η ταχύτητα στην απάντηση κερδίζει τη δουλειά",
        summary:
          "Δείχνει πώς επείγοντα αιτήματα επισκευής και εκτίμησης καταγράφονται γρήγορα και δρομολογούνται με τα σωστά στοιχεία.",
        handles: ["Επισκευές HVAC", "Ηλεκτρολογικές επισκέψεις", "Εκτιμήσεις αυθημερόν"],
        outcome: "Πιο καθαρά αιτήματα εκτίμησης και ταχύτερο πρώτο follow-up",
      },
    ] satisfies AiDemo[],
    processSteps: [
      {
        number: "01",
        title: "Ο επισκέπτης εκδηλώνει ενδιαφέρον",
        description: "Το site απαντά όσο το ενδιαφέρον είναι ακόμα φρέσκο, αντί να αφήνει το αίτημα να περιμένει.",
      },
      {
        number: "02",
        title: "Συλλέγεται το σωστό context",
        description: "Ο επισκέπτης παίρνει χρήσιμες απαντήσεις ενώ συγκεντρώνονται οι πληροφορίες που πραγματικά χρειάζεται η ομάδα σας.",
      },
      {
        number: "03",
        title: "Το επόμενο βήμα γίνεται ξεκάθαρο",
        description: "Το αίτημα οδηγείται σε ραντεβού αξιολόγησης, στη σωστή διαδρομή κράτησης ή στο κατάλληλο handoff.",
      },
      {
        number: "04",
        title: "Η ομάδα σας παρεμβαίνει με context",
        description: "Το follow-up ξεκινά με καλύτερες πληροφορίες, όχι με άλλο ένα γύρο από βασικές ερωτήσεις.",
      },
    ] satisfies ProcessStep[],
    industries: [
      {
        name: "Med Spas",
        summary:
          "Καταγράψτε consultation enquiries πιο γρήγορα και μην αφήνετε ερωτήσεις για θεραπείες να μετατρέπονται σε χαμένα έσοδα.",
        painPoint: "Τα leads συχνά συγκρίνουν παρόχους γρήγορα και χάνονται μετά από μία μόνο καθυστερημένη απάντηση.",
        outcome: "Περισσότερα consultation requests να μετατρέπονται σε booked appointments με λιγότερη τριβή στο front desk.",
        examples: ["Laser consults", "Ερωτήσεις για injectables", "Τιμές και downtime"],
        assistantFit: "Ισχυρό fit για consult-driven υπηρεσίες",
      },
      {
        name: "Οδοντιατρεία",
        summary:
          "Απαντήστε σε ερωτήσεις νέων ασθενών, cosmetic enquiries και επείγοντα requests πριν κρυώσουν.",
        painPoint: "Οι reception teams είναι απασχολημένες, οπότε τα web enquiries συχνά περιμένουν υπερβολικά για απάντηση.",
        outcome: "Καθαρότερο intake και περισσότερα booked treatment consultations.",
        examples: ["Whitening", "Implants", "Emergency requests"],
        assistantFit: "Χρήσιμο για new-patient και cosmetic demand",
      },
      {
        name: "Κλινικές",
        summary:
          "Υποστηρίξτε κλινικές με πολλά ραντεβού με πιο γρήγορες απαντήσεις και καλύτερη διαδρομή προς booked consultations.",
        painPoint: "Πιθανοί ασθενείς αποχωρούν όταν το site μοιάζει παθητικό και το επόμενο βήμα δεν είναι καθαρό.",
        outcome: "Περισσότερα enquiries να μετατρέπονται σε προγραμματισμένα ραντεβού.",
        examples: ["Private consults", "Insurance questions", "Availability follow-up"],
        assistantFit: "Ιδανικό όπου μετρά η ποιότητα του intake",
      },
      {
        name: "Salons",
        summary:
          "Μετατρέψτε mobile visitors που θέλουν γρήγορες απαντήσεις πριν δεσμευτούν σε premium booking.",
        painPoint: "Πάρα πολλά enquiries μένουν κολλημένα σε DMs, φόρμες ή queues follow-up της ομάδας.",
        outcome: "Περισσότερα booked appointments με λιγότερο manual messaging.",
        examples: ["Color correction", "Bridal trials", "Packages"],
        assistantFit: "Εξαιρετικό για mobile-first beauty traffic",
      },
      {
        name: "Σύμβουλοι",
        summary:
          "Κάντε pre-qualification στα enquiries και μετακινήστε καλύτερα-fit prospects σε discovery calls με περισσότερο context.",
        painPoint: "Οι σύμβουλοι χάνουν χρόνο σε low-fit calls επειδή το site δεν κάνει qualification από πριν.",
        outcome: "Καλύτερα discovery calls και λιγότερος χαμένος χρόνος στο ημερολόγιο.",
        examples: ["Discovery calls", "Budget questions", "Project fit"],
        assistantFit: "Χρήσιμο για consultative sales flows",
      },
      {
        name: "Υπηρεσίες Κατ’ Οίκον",
        summary:
          "Πιάστε γρήγορα urgent enquiries και συλλέξτε τα στοιχεία που χρειάζονται για estimate ή σωστό dispatch.",
        painPoint: "Όταν η απάντηση αργεί, ο ιδιοκτήτης σπιτιού συνήθως κλείνει με την πρώτη εταιρεία που απαντά.",
        outcome: "Περισσότερα booked estimates και λιγότερα urgent leads να χάνονται.",
        examples: ["HVAC repair", "Electrical callouts", "Same-day estimates"],
        assistantFit: "Υψηλή επίδραση όπου η ταχύτητα κερδίζει τη δουλειά",
      },
    ] satisfies Industry[],
    benefits: [
      {
        title: "Τα κενά στην απάντηση γίνονται ορατά",
        copy: "Δείτε πού τα αιτήματα μένουν για πολλή ώρα χωρίς να τα αναλάβει κανείς.",
      },
      {
        title: "Το intake γίνεται πιο καθαρό",
        copy: "Συλλέξτε τις λεπτομέρειες που συνήθως η ομάδα πρέπει να κυνηγήσει χειροκίνητα.",
      },
      {
        title: "Τα επόμενα βήματα ξεκαθαρίζουν",
        copy: "Κάντε τη διαδρομή του επισκέπτη πιο προφανή, αντί να μένει χαλαρή ή παθητική.",
      },
      {
        title: "Η υπάρχουσα ζήτηση αξιοποιείται καλύτερα",
        copy: "Πάρτε περισσότερη αξία από την επισκεψιμότητα και τα αιτήματα που ήδη έχετε.",
      },
    ] satisfies Benefit[],
    credibilityPoints: [
      {
        title: "Σχεδιασμένο πάνω στην πραγματική διαδρομή προς την κράτηση",
        copy: "Η Northline ξεκινά από το τι γίνεται αφού κάποιος εκδηλώσει ενδιαφέρον, όχι μόνο από το τι λέει η αρχική σελίδα.",
      },
      {
        title: "Χρήσιμο χωρίς να προσθέτει θόρυβο",
        copy: "Ο βοηθός, οι σελίδες και τα calls to action διαμορφώνονται ώστε το επόμενο βήμα να γίνεται πιο ξεκάθαρο.",
      },
      {
        title: "Χτισμένο για πραγματικές ομάδες",
        copy: "Το τελικό αποτέλεσμα πρέπει να διευκολύνει την ομάδα στην πράξη, όχι απλώς να δείχνει όμορφο.",
      },
    ] satisfies CredibilityPoint[],
    testimonials: [
      {
        quote:
          "Η μεγαλύτερη αλλαγή ήταν η ταχύτητα. Τα νέα αιτήματα έπαψαν να μοιάζουν σαν να περιμένουν εμάς να προλάβουμε.",
        author: "Sophia Patel",
        role: "Operations Lead, Radiant Skin Studio",
      },
      {
        quote:
          "Αυτό που το έκανε αξιόπιστο ήταν το handoff. Η ομάδα έπαιρνε καλύτερες πληροφορίες και πιο έτοιμα αιτήματα για κράτηση.",
        author: "Marcus Wynn",
        role: "Founder, Wynn Dental Group",
      },
      {
        quote:
          "Έμοιαζε λιγότερο με την προσθήκη ενός widget και περισσότερο με διόρθωση του τρόπου που το website διαχειριζόταν τη ζήτηση.",
        author: "Avery Chen",
        role: "Director, Summit Advisory",
      },
    ] satisfies Testimonial[],
    faqs: [
      {
        question: "Αυτό αντικαθιστά το προσωπικό μου;",
        answer:
          "Όχι. Ο στόχος είναι να χειρίζεται την πρώτη απάντηση, να συλλέγει τα σωστά στοιχεία και να φέρνει το αίτημα πιο κοντά στην κράτηση, ώστε η ομάδα σας να ξοδεύει λιγότερο χρόνο σε επαναλαμβανόμενες διοικητικές εργασίες.",
      },
      {
        question: "Μπορεί να λειτουργήσει αν το website χρειάζεται και βελτίωση;",
        answer:
          "Ναι. Η Northline μπορεί να βελτιώσει ταυτόχρονα το website και τη ροή κράτησης ώστε η εμπειρία να είναι πιο ολοκληρωμένη και πιο αποτελεσματική εμπορικά.",
      },
      {
        question: "Παραμένει εύκολο να προσαρμοστεί αργότερα η τοπική έκδοση;",
        answer:
          "Ναι. Το messaging, τα industries, τα CTA labels, τα testimonials και τα χρώματα είναι συγκεντρωμένα κεντρικά ώστε να προσαρμόζετε το site γρήγορα.",
      },
    ] satisfies FaqItem[],
    dashboardMetrics: [
      { label: "Νέα enquiries", value: "42", delta: "Αυτή την εβδομάδα" },
      { label: "Qualified leads", value: "31", delta: "Έτοιμα για follow-up" },
      { label: "Κλεισμένα ραντεβού", value: "19", delta: "Πέρασαν στο ημερολόγιο" },
      { label: "Χαμένες ευκαιρίες", value: "3", delta: "Από 14" },
    ],
    launchPhases: [
      {
        title: "Ξεκαθάρισμα της προσφοράς",
        summary: "Ορίστε ποιες ερωτήσεις, ποια σημεία προεπιλογής και ποιες ενέργειες κράτησης έχουν σημασία.",
      },
      {
        title: "Χτίσιμο του lead flow",
        summary: "Σχεδιάστε site, βοηθό και calls to action γύρω από ταχύτερη μετατροπή.",
      },
      {
        title: "Βελτίωση μέσα από πραγματική χρήση",
        summary: "Βελτιώστε prompts, routing και follow-up με βάση το πώς αντιδρούν πραγματικά τα leads.",
      },
    ],
    contactExpectations: [
      "Μια καθαρή εικόνα της σημερινής σας διαδρομής από το πρώτο αίτημα μέχρι την κράτηση",
      "Μια πρόταση για το πιο λογικό επόμενο βήμα με βάση τον τρόπο που λειτουργεί η επιχείρησή σας",
      "Μια σαφή εικόνα για το πού μπορούν να βοηθήσουν περισσότερο η γρηγορότερη απάντηση και μια καλύτερη ροή κράτησης",
    ],
    solutionsPage: {
      capabilitySectionLabel: "Τι περιλαμβάνεται",
      capabilitySectionTitle: "Τι έχει σχεδιαστεί να βελτιώνει η Northline",
      capabilityRows: [
        "Απαντήσεις σε FAQs και αρχική εμπλοκή των leads",
        "Αρχική αξιολόγηση ενδιαφερομένων και λογική intake",
        "Προτροπές για ραντεβού και handoff προς προγραμματισμό",
        "Website design με έμφαση στο conversion",
        "Δομημένες περιλήψεις leads για την ομάδα",
        "Καθαρό codebase έτοιμο για μελλοντικά integrations",
      ],
      deliveryPillars: [
        {
          title: "Η απάντηση είναι ενσωματωμένη στο website",
          copy:
            "Το site είναι χτισμένο ώστε να απαντά πιο γρήγορα, να καθοδηγεί καλύτερα και να βοηθά περισσότερα αιτήματα να φτάνουν σε απόφαση κράτησης.",
        },
        {
          title: "Συλλογή στοιχείων που επιστρέφει χρήσιμες πληροφορίες",
          copy:
            "Η επιχείρηση λαμβάνει πιο καθαρά στοιχεία αντί για αόριστα μηνύματα φόρμας και σκόρπιο follow-up.",
        },
        {
          title: "Ροή κράτησης σχεδιασμένη για πραγματική λειτουργία",
          copy:
            "Όλα οργανώνονται γύρω από ό,τι βοηθά μια επιχείρηση υπηρεσιών να μετατρέπει αιτήματα σε πραγματικά ραντεβού.",
        },
      ],
      finalCtaLabel: "Κλείστε Demo",
      hero: {
        description:
          "Η Northline συνδυάζει ταχύτερη πρώτη απάντηση, καλύτερη συλλογή στοιχείων, πιο καθαρή ροή κράτησης και πιο σαφές μήνυμα στο website σε ένα ενιαίο σύστημα για επιχειρήσεις υπηρεσιών.",
        eyebrow: "Λύσεις",
        highlights: [
          "Άμεση πρώτη απάντηση για νέα αιτήματα",
          "Καλύτερη αρχική αξιολόγηση και καθαρότερο handoff",
          "Υποστήριξη της ροής κράτησης για επιχειρήσεις που δουλεύουν με ραντεβού",
          "Σύγχρονα websites χτισμένα γύρω από την απόδοση",
        ],
        secondaryAction: { label: "Δείτε κλάδους", href: "/industries" },
        title: "Υπηρεσίες σχεδιασμένες ώστε περισσότερα αιτήματα να γίνονται ραντεβού",
      },
      whyApproachDescription:
        "Όταν η απάντηση αργεί, η κράτηση είναι ασαφής ή το follow-up γίνεται χειροκίνητα, τα leads χάνονται μέσα στη διαδρομή. Η Northline εστιάζει πρώτα στο να διορθώσει αυτό.",
      whyApproachLabel: "Γιατί αυτή η προσέγγιση αποδίδει καλύτερα",
      whyApproachTitle:
        "Οι περισσότερες επιχειρήσεις υπηρεσιών δεν χρειάζονται πρώτα περισσότερα αιτήματα. Χρειάζονται καλύτερο τρόπο να χειρίζονται όσα ήδη έχουν.",
    },
    industriesPage: {
      bottomCta: {
        description:
          "Προσαρμόζουμε τον βοηθό γύρω από την προσφορά σας, τη ροή των leads σας και τον τρόπο που η ομάδα σας χειρίζεται πραγματικά τα ραντεβού.",
        label: "Επόμενο βήμα",
        title: "Κλείστε ένα demo γύρω από τη δική σας επιχείρηση.",
      },
      bottomNote: {
        description:
          "Ξεκινήστε από τον κλάδο που μοιάζει περισσότερο με τα αιτήματά σας και μετά βελτιώστε το μήνυμα, τις ερωτήσεις προεπιλογής και τη ροή κράτησης γύρω από αυτό το κοινό.",
        label: "Πώς να χρησιμοποιήσετε αυτή τη σελίδα",
        title: "Επιλέξτε το demo που ταιριάζει με τον τρόπο που κλείνει ραντεβού η επιχείρησή σας.",
      },
      cardBadge: "AI Demo",
      cardButtonLabel: "Κλείστε Demo",
      hero: {
        description:
          "Δείτε πώς βοηθοί AI μπορούν να απαντούν σε αιτήματα, να συλλέγουν χρήσιμα στοιχεία και να καθοδηγούν τη ροή κράτησης για διαφορετικές επιχειρήσεις που βασίζονται σε ραντεβού.",
        eyebrow: "Παραδείγματα AI",
        highlights: [
          "Demos με έμφαση στην κράτηση για επιχειρήσεις υπηρεσιών",
          "Χτισμένα γύρω από πραγματικές περιπτώσεις ενδιαφέροντος και προγραμματισμού",
          "Εύκολα να προσαρμοστούν αργότερα σε συγκεκριμένο κοινό ή προσφορά",
        ],
        secondaryAction: { label: "Δείτε λύσεις", href: "/solutions" },
        title: "Παραδείγματα AI για πραγματικές καταστάσεις κράτησης",
      },
    },
    howItWorksPage: {
      finalCtaLabel: "Κλείστε demo",
      finalCtaTitle: "Περισσότερα αιτήματα απαντημένα. Περισσότερα leads αξιολογημένα. Περισσότερα κλεισμένα ραντεβού.",
      hero: {
        description:
          "Η Northline είναι σχεδιασμένη ώστε να βοηθά επιχειρήσεις να απαντούν πιο γρήγορα, να συλλέγουν καλύτερες πληροφορίες και να οδηγούν περισσότερα αιτήματα προς κλεισμένα ραντεβού.",
        eyebrow: "Ροή εργασίας",
        secondaryAction: { label: "Δείτε λύσεις", href: "/solutions" },
        title: "Μια απλή διαδικασία από το αίτημα μέχρι την κράτηση",
      },
      launchProcessLabel: "Διαδικασία υλοποίησης",
      launchProcessTitle: "Τρεις φάσεις για να μπει η ροή στη θέση της",
      shortVersionLabel: "Με λίγα λόγια",
      viewpoints: [
        {
          title: "Για τον επισκέπτη",
          copy: "Πιο γρήγορη απάντηση, χρήσιμες πληροφορίες και καθαρότερη διαδρομή προς το επόμενο βήμα.",
        },
        {
          title: "Για την επιχείρηση",
          copy: "Καθαρότερο handoff με τις λεπτομέρειες που χρειάζονται για επιβεβαίωση, follow-up ή booking.",
        },
        {
          title: "Για τη λειτουργία",
          copy:
            "Λιγότερο χειροκίνητο back-and-forth και καλύτερη πιθανότητα να μετατρέψετε τα αιτήματα που ήδη έχετε.",
        },
      ],
    },
    contactPage: {
      hero: {
        description:
          "Κλείστε απευθείας από το ημερολόγιο ή στείλτε ένα σύντομο αίτημα μέσω της φόρμας πιο κάτω. Η Northline ξεκινά από την Ελλάδα και εστιάζει σε επιχειρήσεις που θέλουν περισσότερα αιτήματα να μετατρέπονται σε ραντεβού.",
        eyebrow: "Επικοινωνία",
        primaryActionLabel: "Κλείστε Άμεσα στο Calendly",
        secondaryActionLabel: "Χρησιμοποιήστε τη φόρμα",
        title: "Κλείστε demo και δείτε πού μπορούν να κερδηθούν περισσότερα ραντεβού",
      },
    },
    chatbotTestPage: {
      hero: {
        description:
          "Αυτή η σελίδα είναι ένα απλό local test harness για το chatbot backend. Στέλνει πραγματικά requests στο local API route και χρησιμοποιεί το knowledge pack στον server.",
        eyebrow: "Τοπικό chatbot test",
        highlights: [
          "Καλεί το πραγματικό /api/chat route",
          "Χρησιμοποιεί το knowledge-pack.md στον server",
          "Κρατά τα API keys μόνο στον server",
        ],
        secondaryAction: { label: "Δείτε λύσεις", href: "/solutions" },
        title: "Δοκιμάστε το chatbot backend τοπικά",
      },
      sideCard: {
        apiRouteBody:
          "Τα POST requests πηγαίνουν στο /api/chat με το τελευταίο μήνυμα και προαιρετικό history.",
        apiRouteTitle: "API route",
        backHomeLabel: "Επιστροφή στην αρχική",
        ctaLabel: "Κλείστε Demo",
        demoCtaBody:
          "Η απάντηση περιλαμβάνει booking CTA που χρησιμοποιεί το NEXT_PUBLIC_DEMO_URL.",
        demoCtaTitle: "Demo CTA",
        description:
          "Ο assistant απαντά σε ερωτήσεις για την προσφορά, μένει μέσα στο knowledge pack και μπορεί να οδηγήσει σχετικούς επισκέπτες προς booking demo.",
        knowledgeSourceBody:
          "Το server-side business context φορτώνεται από το knowledge-pack.md.",
        knowledgeSourceTitle: "Knowledge source",
        panelLabel: "Τι κάνει αυτό το V1",
        title: "Business-aware απαντήσεις με καθαρό local backend.",
      },
    },
    notFoundPage: {
      ctaLabel: "Επιστροφή στην αρχική",
      description: "Χρησιμοποιήστε την κύρια πλοήγηση για να συνεχίσετε την περιήγησή σας στο site.",
      title: "Αυτή η σελίδα δεν υπάρχει.",
    },
    contactForm: {
      actions: {
        calendarButtonLabel: "Κλείστε Άμεσα στο Calendly",
        note:
          "Το κουμπί ημερολογίου ανοίγει τη ζωντανή κράτηση. Η παρακάτω φόρμα είναι ξεχωριστή τοπική ροή αιτήματος που αποθηκεύεται στον browser σας για σκοπούς demo.",
        savingLabel: "Αποθήκευση αιτήματος demo...",
        submitLabel: "Υποβολή Αιτήματος Demo",
      },
      fields: {
        business: "Επιχείρηση",
        email: "Email",
        industry: "Κλάδος",
        monthlyLeads: "Εκτιμώμενα μηνιαία αιτήματα",
        name: "Όνομα",
        notes: "Τι θα θέλατε να αναλαμβάνει ο βοηθός;",
        phone: "Τηλέφωνο",
        websiteStatus: "Τωρινή κατάσταση website",
      },
      latestRequest: {
        emptyDescription:
          "Χρησιμοποιήστε τη φόρμα για να προσομοιώσετε ένα πραγματικό αίτημα και να δείτε εδώ την αποθηκευμένη επιβεβαίωση.",
        emptyTitle: "Δεν υπάρχει ακόμη υποβολή",
        panelLabel: "Τελευταίο αποθηκευμένο αίτημα",
        summaryTemplate: "Ο/Η {{name}} ζήτησε demo για επιχείρηση στον κλάδο {{industry}} στις {{submittedAt}}.",
      },
      panel: {
        badge: "Έτοιμο για demo",
        label: "Ζητήστε μια προσαρμοσμένη παρουσίαση",
        title: "Κλείστε demo",
      },
      placeholders: {
        business: "Smile Dental Clinic",
        email: "you@business.com",
        name: "Μαρία Παπαδοπούλου",
        notes:
          "Παράδειγμα: να απαντά σε ερωτήσεις για θεραπείες, να κάνει αρχική αξιολόγηση στα leads, να προτείνει ώρες για ραντεβού και να ειδοποιεί την υποδοχή μας.",
        phone: "+30 69X XXX XXXX",
      },
      quickBooking: {
        buttonLabel: "Άνοιγμα Ημερολογίου",
        label: "Άμεση κράτηση",
        metaDuration: "30λεπτη κλήση",
        metaProvider: "Calendly",
        title: "Θέλετε να προγραμματίσετε αμέσως;",
        description: "Χρησιμοποιήστε το live calendar για να επιλέξετε ώρα άμεσα.",
      },
      recentRequests: {
        emptyLabel: "Δεν υπάρχουν ακόμη αποθηκευμένα αιτήματα.",
        panelLabel: "Πρόσφατα αποθηκευμένα αιτήματα",
      },
      selectOptions: {
        industries: [
          { label: "Κλινική", value: "clinic" },
          { label: "Οδοντίατρος", value: "dentist" },
          { label: "Med Spa", value: "med-spa" },
          { label: "Κομμωτήριο", value: "salon" },
          { label: "Συμβουλευτική", value: "consulting" },
          { label: "Υπηρεσίες Κατ’ Οίκον", value: "home-services" },
        ] satisfies SelectOption[],
        monthlyLeads: [
          { label: "0-10 αιτήματα", value: "0-10" },
          { label: "10-30 αιτήματα", value: "10-30" },
          { label: "30-75 αιτήματα", value: "30-75" },
          { label: "75+ αιτήματα", value: "75+" },
        ] satisfies SelectOption[],
        websiteStatus: [
          { label: "Υπάρχει website, αλλά χρειάζεται βελτίωση", value: "existing-needs-improvement" },
          { label: "Δεν υπάρχει ουσιαστικό website ακόμη", value: "no-real-website-yet" },
          { label: "Το website είναι καλό, χρειάζεται καλύτερη συλλογή στοιχείων", value: "website-fine-need-capture" },
        ] satisfies SelectOption[],
      },
    },
    chatDemo: {
      nextStepLabel: "Προτεινόμενο επόμενο βήμα",
      previewAriaLabelSuffix: "προεπισκόπηση",
      scenarios: [
        {
          audience: "Οδοντιατρείο",
          label: "Οδοντιατρείο",
          messages: [
            { author: "user", text: "Με ενδιαφέρει λεύκανση δοντιών την επόμενη εβδομάδα." },
            { author: "assistant", text: "Φυσικά. Είστε νέος ασθενής;" },
            { author: "user", text: "Ναι, είμαι." },
            { author: "assistant", text: "Τέλεια - μπορώ να σας δείξω μερικές διαθέσιμες ώρες." },
          ],
          nextStepMeta: "Νέος ασθενής - λεύκανση - επόμενη εβδομάδα",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Τρ 10:00", "Τετ 14:30", "Πεμ 17:15"],
        },
        {
          audience: "Med Spa",
          label: "Med Spa",
          messages: [
            { author: "user", text: "Θα ήθελα consultation για laser αυτό το Σαββατοκύριακο." },
            { author: "assistant", text: "Βεβαίως. Είναι η πρώτη σας επίσκεψη;" },
            { author: "user", text: "Ναι, πρώτη φορά." },
            { author: "assistant", text: "Ωραία - ορίστε μερικές διαθέσιμες επιλογές." },
          ],
          nextStepMeta: "Πρώτη επίσκεψη - laser consult - προτίμηση για Σαββατοκύριακο",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Σαβ 11:00", "Σαβ 13:30", "Κυρ 10:15"],
        },
        {
          audience: "Κομμωτήριο",
          label: "Κομμωτήριο",
          messages: [
            { author: "user", text: "Χρειάζομαι color correction την επόμενη εβδομάδα." },
            { author: "assistant", text: "Με χαρά. Έχετε κάνει πρόσφατα κάποια βαφή στο σπίτι;" },
            { author: "user", text: "Ναι, πριν από περίπου δύο εβδομάδες." },
            { author: "assistant", text: "Ευχαριστώ - το σωστό επόμενο βήμα είναι ένα σύντομο ραντεβού αξιολόγησης." },
          ],
          nextStepMeta: "Color correction - πρώτα αξιολόγηση - επόμενη εβδομάδα",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Δευ 18:00", "Τρ 17:30", "Τετ 19:00"],
        },
      ] satisfies ChatDemoScenario[],
      panelLabel: "Παράδειγμα ροής",
      tabsAriaLabel: "Σενάρια προεπισκόπησης",
      title: "Από το αίτημα στο επόμενο βήμα",
    },
    chatbotTestPanel: {
      ctaLabel: "Κλείστε Demo",
      errorFallback: "Δεν μπόρεσα να απαντήσω τώρα. Μπορείτε πάντως να κλείσετε demo.",
      initialAssistantMessage:
        "Γεια, είμαι η Lena. Μπορώ να απαντήσω σε ερωτήσεις για το πώς βοηθάμε επιχειρήσεις να μετατρέπουν περισσότερα leads σε κλεισμένα ραντεβού.",
      inputLabel: "Το μήνυμά σας",
      placeholder: "Ρωτήστε για την υπηρεσία, τους κλάδους, την υποστήριξη website ή τα επόμενα βήματα.",
      quickPrompts: [
        "Με τι ακριβώς βοηθάτε;",
        "Ταιριάζει αυτό σε ένα οδοντιατρείο;",
        "Μπορείτε να βελτιώσετε και το website μου;",
        "Τι γίνεται αφού κλείσω demo;",
      ],
      roleLabels: {
        assistant: "Βοηθός",
        user: "Εσείς",
      },
      sendLabel: "Αποστολή Μηνύματος",
      sendingLabel: "Αποστολή...",
    },
    widget: {
      connectionIssueDescription: "Δεν μπόρεσα να απαντήσω τώρα. Δοκιμάστε ξανά σε λίγο.",
      connectionIssueTitle: "Πρόβλημα σύνδεσης",
      ctaLabel: "Κλείστε Demo",
      ctaPrompt: "Θέλετε να το συζητήσουμε πιο πρακτικά;",
      headerTitle: "Ζωντανή συνομιλία",
      initialAssistantMessage:
        "Γεια σας. Είμαι η Lena. Μπορώ να βοηθήσω με κρατήσεις, τον τρόπο υλοποίησης και με το αν αυτό ταιριάζει στην επιχείρησή σας.",
      inputLabel: "Στείλτε μήνυμα στη Lena",
      inputPlaceholder: "Γράψτε μήνυμα...",
      launcherLabelClosed: "Άνοιγμα συνομιλίας με τη Lena",
      launcherLabelOpen: "Κλείσιμο συνομιλίας",
      minimizeLabel: "Ελαχιστοποίηση συνομιλίας",
      sendLabel: "Αποστολή",
      typingLabel: "Η Lena πληκτρολογεί",
    },
  },
} as const;

export type SiteContent = (typeof siteContentByLocale)[keyof typeof siteContentByLocale];

export function getSiteContent(locale: keyof typeof siteContentByLocale = "en") {
  return siteContentByLocale[locale];
}

export const siteConfig = getSiteContent("en");
