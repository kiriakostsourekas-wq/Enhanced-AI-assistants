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
    brandName: "Northline",
    shortName: "Northline",
    brandStatement: "Quality websites that turn more inquiries into booked work.",
    tagline: "Custom websites with integrated chat for service businesses.",
    description:
      "Northline builds quality websites for service businesses with integrated chat, lead capture, booking flows, and tailored demo setups.",
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
    headerCta: {
      label: "Book a Demo",
      href: "/contact",
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
      eyebrow: "Northline",
      kicker: "Website enquiries, handled properly.",
      headline: "Quality websites built to convert enquiries.",
      description:
        "Northline combines modern website design, integrated chat, smarter intake, and clearer next steps so interested visitors do not drift before booking.",
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
        "Northline builds quality websites, integrated chat, lead capture systems, and booking flows for service businesses. Based in Greece.",
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
      { href: "/industries", label: "Website Demos" },
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
        eyebrow: "Integrated Chat",
        title: "Chatbot-first response for new inquiries",
        summary:
          "The chatbot answers common questions, handles first-contact engagement, and keeps the lead moving inside the website.",
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
          "Northline combines quality websites, integrated chat, stronger lead capture, and better booking flow into one service-business system.",
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
          "We tailor the website and chat flow around your offer, your lead flow, and the way your team actually handles appointments.",
        label: "Next step",
        title: "Book a demo built around your business.",
      },
      bottomNote: {
        description:
          "Start with the niche that is closest to your inquiries, then tighten the messaging, qualification questions, and booking flow around that exact audience.",
        label: "How to use this page",
        title: "Choose the demo that matches how your business books.",
      },
      cardBadge: "Website Demo",
      cardButtonLabel: "Book a Demo",
      hero: {
        description:
          "Preview how tailored websites with integrated chat can answer inquiries, capture lead details, and guide booking flows for different appointment-based businesses.",
        eyebrow: "Website Demos",
        highlights: [
          "Booking-focused demos for service businesses",
          "Built around real inquiry and scheduling situations",
          "Easy to tailor to one niche or offer later",
        ],
        secondaryAction: { label: "View solutions", href: "/solutions" },
        title: "Website demos for real booking situations",
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
      closedInputPlaceholder: "This chat has ended. Book a demo or refresh to start again.",
      closedSendLabel: "Closed",
      connectionIssueDescription: "I couldn't reply just now. Please try again in a moment.",
      connectionIssueTitle: "Connection issue",
      ctaLabel: "Book a Demo",
      ctaPrompt: "Prefer to talk it through?",
      feedbackAcknowledgementNo: "Thanks. That helps us improve the experience.",
      feedbackAcknowledgementYes: "Thanks. Glad it was useful.",
      feedbackNoLabel: "No",
      feedbackQuestion: "Was this conversation useful?",
      feedbackYesLabel: "Yes",
      headerTitle: "Live Chat",
      initialAssistantMessage:
        "Hi there. I'm Lena. I can help with bookings, setup, and whether this could fit your business.",
      inputLabel: "Message Lena",
      inputPlaceholder: "Write a message...",
      limitReachedMessage:
        "That’s probably the right point to pause here. If this feels relevant, the next step is a short demo so we can look at your setup properly and show what this would look like for your business.",
      launcherLabelClosed: "Open chat with Lena",
      launcherLabelOpen: "Close chat",
      minimizeLabel: "Minimize chat",
      sendLabel: "Send",
      typingLabel: "Lena is typing",
    },
  },
  gr: {
    brandName: "Northline",
    shortName: "Northline",
    brandStatement: "Ποιοτικές ιστοσελίδες που μετατρέπουν περισσότερα αιτήματα σε δουλειά και ραντεβού.",
    tagline: "Ποιοτικές ιστοσελίδες με ενσωματωμένο chat για επιχειρήσεις υπηρεσιών.",
    description:
      "Η Northline δημιουργεί ποιοτικές ιστοσελίδες για επιχειρήσεις υπηρεσιών, με ενσωματωμένο chat, καλύτερη καταγραφή ενδιαφέροντος, καθαρότερη πορεία προς την κράτηση και προσαρμοσμένα demos.",
    founder: {
      name: "Kyriakos Tsourekas",
      title: "CEO",
    } satisfies Founder,
    navigation: {
      mobileLabel: "Μενού κινητού",
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
    headerCta: {
      label: "Κλείστε demo",
      href: "/contact",
    },
    primaryCta: {
      label: "Κλείστε demo",
      href: primaryCtaHref,
    },
    secondaryCta: {
      label: "Δείτε παραδείγματα",
      href: "/industries",
    },
    hero: {
      eyebrow: "Northline",
      kicker: "Το ενδιαφέρον από το site, με σωστή συνέχεια.",
      headline: "Ποιοτικές ιστοσελίδες που μετατρέπουν τα αιτήματα σε ραντεβού.",
      description:
        "Η Northline συνδυάζει σύγχρονο website design, ενσωματωμένο chat, πιο σωστή καταγραφή του ενδιαφέροντος και καθαρή πορεία προς το επόμενο βήμα, ώστε οι επισκέπτες που ενδιαφέρονται να μη χάνονται πριν κλείσουν.",
      audienceLine:
        "Φτιαγμένο για κλινικές, οδοντιατρεία, med spas, κομμωτήρια, συμβούλους και επιχειρήσεις υπηρεσιών, όπου το site πρέπει να δουλεύει περισσότερο από την πρώτη επαφή.",
      primaryActionLabel: "Δείτε τη ροή προς το ραντεβού",
      secondaryActionLabel: "Δείτε ένα ζωντανό παράδειγμα",
      secondaryActionHref: "#real-scenarios",
      scanPoints: [
        "Απαντά σε βασικές ερωτήσεις",
        "Συλλέγει ό,τι χρειάζεται",
        "Ξεκαθαρίζει το επόμενο βήμα",
      ],
    },
    homepage: {
      problem: {
        eyebrow: "Πού χάνονται οι κρατήσεις",
        title: "Οι περισσότερες κρατήσεις χάνονται ανάμεσα στο πρώτο ενδιαφέρον και το ημερολόγιο.",
        description:
          "Συνήθως δεν λείπει μόνο η ζήτηση. Λείπει η γρήγορη απάντηση, οι σωστές ερωτήσεις και ένα καθαρό επόμενο βήμα μόλις κάποιος ενδιαφερθεί.",
      },
      solution: {
        eyebrow: "Πώς λειτουργεί",
        processPanelLabel: "Διαδικασία",
        title: "Η Northline οργανώνει τη διαδρομή από την πρώτη ερώτηση μέχρι την επόμενη κίνηση.",
        description:
          "Αντί για ένα γενικό widget, η Northline οργανώνει μαζί την πρώτη απάντηση, την καταγραφή του ενδιαφέροντος και τη συνέχεια, ώστε η εμπειρία να οδηγεί κάπου συγκεκριμένα.",
        ctaLabel: "Δείτε όλη τη διαδρομή",
      },
      demos: {
        eyebrow: "Πραγματικά σενάρια",
        title: "Πώς δουλεύει σε πραγματικές περιπτώσεις.",
        description:
          "Κάθε παράδειγμα δείχνει σε ποια επιχείρηση ταιριάζει, τι αναλαμβάνει ο βοηθός και ποιο αποτέλεσμα βελτιώνει στην πράξη.",
        linkHref: "/industries",
        cardActionLabel: "Άνοιγμα demo",
        featuredBadge: "Προτεινόμενο",
        featuredTitles: ["Demo Med Spa", "Demo Οδοντιατρείου", "Demo Υπηρεσιών Κατ’ Οίκον"],
        handlesLabel: "Τι αναλαμβάνει",
        outcomeLabel: "Αποτέλεσμα",
        showsLabel: "Τι δείχνει",
        useCaseBadge: "Περίπτωση χρήσης",
      },
      proof: {
        eyebrow: "Γιατί Northline",
        title: "Χρήσιμη όταν το θέμα δεν είναι η επισκεψιμότητα, αλλά όσα ακολουθούν μετά το ενδιαφέρον.",
        description:
          "Η πραγματική αξία συνήθως κρύβεται στα κενά: αργή απάντηση, ελλιπής καταγραφή και θολό επόμενο βήμα. Η Northline έχει σχεδιαστεί για να βελτιώνει ακριβώς αυτά τα σημεία.",
        resultsTitle: "Τι βγάζει στην επιφάνεια μια αξιολόγηση",
        resultsDescription: "Πού χάνεται η δυναμική των αιτημάτων και τι έχει νόημα να βελτιωθεί πρώτο.",
        ctaLabel: "Δείτε τη σημερινή σας ροή",
      },
      finalCta: {
        eyebrow: "Επόμενο βήμα",
        title: "Δείτε τη σημερινή σας ροή προς το ραντεβού.",
        description:
          "Θα δούμε πού κολλάει η διαδρομή, πού χάνεται η συνέχεια και τι θα έκανε πιο καθαρό το πέρασμα από το ενδιαφέρον στο ραντεβού.",
        buttonLabel: "Δείτε τη ροή μου",
      },
    },
    footer: {
      description:
        "Η Northline δημιουργεί ποιοτικές ιστοσελίδες, ενσωματωμένο chat, συστήματα καταγραφής ενδιαφέροντος και πορεία προς την κράτηση για επιχειρήσεις υπηρεσιών. Με έδρα την Ελλάδα.",
    },
    contact: {
      email: "kiriakos.tsourekas@gmail.com",
      phone: "+30 6955300340",
      location: "Με έδρα την Ελλάδα και έμφαση σε επιχειρήσεις που λειτουργούν με ραντεβού",
    },
    nav: [
      { href: "/", label: "Αρχική" },
      { href: "/solutions", label: "Λύσεις" },
      { href: "/how-it-works", label: "Πώς Λειτουργεί" },
      { href: "/industries", label: "Website Demos" },
    ] satisfies NavItem[],
    trustStrip: ["Med Spas", "Οδοντιατρεία", "Κλινικές", "Κομμωτήρια", "Σύμβουλοι", "Υπηρεσίες Κατ’ Οίκον"],
    painPoints: [
      {
        title: "Αιτήματα που χάνονται",
        copy: "Έρχονται νέα αιτήματα, αλλά δεν υπάρχει αρκετά γρήγορη απάντηση για να μείνει ζωντανό το ενδιαφέρον.",
      },
      {
        title: "Αργή συνέχεια",
        copy: "Μέχρι να απαντήσει κάποιος από την ομάδα, ο ενδιαφερόμενος συχνά έχει ήδη κοιτάξει αλλού.",
      },
      {
        title: "Πολλά πήγαινε-έλα",
        copy: "Οι ομάδες χάνουν χρόνο απαντώντας στα ίδια και ζητώντας πληροφορίες που θα μπορούσαν να έχουν ήδη καταγραφεί.",
      },
      {
        title: "Ραντεβού που δεν κλείνονται",
        copy: "Επισκέπτες με πραγματικό ενδιαφέρον δεν φτάνουν ποτέ στο ημερολόγιο, επειδή το επόμενο βήμα δεν είναι ξεκάθαρο.",
      },
    ] satisfies PainPoint[],
    solutionPoints: [
      {
        title: "Δώστε άμεση πρώτη απάντηση",
        copy: "Δώστε στον επισκέπτη μια χρήσιμη πρώτη απάντηση όσο το ενδιαφέρον είναι ακόμη ζωντανό.",
      },
      {
        title: "Συλλέξτε τις σωστές πληροφορίες",
        copy: "Συγκεντρώστε τύπο υπηρεσίας, επείγον, προτίμηση χρόνου και βασικά στοιχεία πριν μπει η ομάδα στη συζήτηση.",
      },
      {
        title: "Καθοδηγήστε το επόμενο βήμα",
        copy: "Οδηγήστε τον επισκέπτη στη σωστή πορεία για ραντεβού, σε αίτημα αξιολόγησης ή στην κατάλληλη παράδοση στην ομάδα.",
      },
      {
        title: "Κάντε το site να δουλεύει μαζί με τον βοηθό",
        copy: "Ο βοηθός και η σελίδα πρέπει να λειτουργούν σαν ένα ενιαίο σύστημα, όχι σαν δύο ξεχωριστά κομμάτια.",
      },
    ] satisfies SolutionPoint[],
    services: [
      {
        eyebrow: "Ενσωματωμένο Chat",
        title: "Chatbot για την πρώτη απάντηση σε νέα αιτήματα",
        summary:
          "Το chatbot απαντά στις βασικές ερωτήσεις, αναλαμβάνει την πρώτη επαφή και κρατά το ενδιαφέρον ζωντανό μέσα στο ίδιο το site.",
        bullets: [
          "Απαντά σε συχνές ερωτήσεις και βασικές απορίες για τις υπηρεσίες",
          "Μειώνει τις απώλειες από αργές ή χαμένες απαντήσεις",
          "Δίνει πιο επαγγελματική πρώτη εικόνα της επιχείρησης",
        ],
      },
      {
        eyebrow: "Καταγραφή ενδιαφέροντος",
        title: "Πιο χρήσιμα στοιχεία πριν αναλάβει η ομάδα σας",
        summary:
          "Συλλέγετε τα στοιχεία που πραγματικά χρειάζεται η επιχείρηση, αντί για αόριστες φόρμες χωρίς ουσία.",
        bullets: [
          "Καταγράφει πρόθεση, επείγον και προτίμηση χρόνου",
          "Οργανώνει την πληροφορία πριν φτάσει στην ομάδα",
          "Βοηθά την ομάδα να εστιάζει στα πιο ουσιαστικά αιτήματα",
        ],
      },
      {
        eyebrow: "Ροή Κράτησης",
        title: "Πιο καθαρή πορεία από το αίτημα στο ραντεβού",
        summary:
          "Καθοδηγεί τον επισκέπτη προς αίτημα αξιολόγησης, πρόταση ώρας ή το σωστό επόμενο βήμα.",
        bullets: [
          "Προτείνει το επόμενο βήμα όσο το ενδιαφέρον είναι ακόμη ενεργό",
          "Μειώνει τα περιττά πήγαινε-έλα πριν από την κράτηση",
          "Κάνει το site να δουλεύει πιο αποτελεσματικά ως εργαλείο μετατροπής",
        ],
      },
      {
        eyebrow: "Σύγχρονη ιστοσελίδα",
        title: "Μια καλύτερη ψηφιακή πρώτη εικόνα για επιχειρήσεις με ραντεβού",
        summary:
          "Όταν χρειάζεται, η Northline βελτιώνει και την ίδια την ιστοσελίδα, ώστε μήνυμα, σχεδιασμός και πορεία προς την κράτηση να λειτουργούν μαζί.",
        bullets: [
          "Πιο καθαρό μήνυμα για επιχειρήσεις υπηρεσιών",
          "Ισχυρότερες προτροπές και καλύτερη δομή σελίδας",
          "Βάση που επεκτείνεται και προσαρμόζεται εύκολα αργότερα",
        ],
      },
    ] satisfies Service[],
    aiDemos: [
      {
        title: "Demo Med Spa",
        audience: "Αισθητικές κλινικές που δουλεύουν με συμβουλευτικά ραντεβού",
        summary:
          "Δείχνει πώς ερωτήσεις για θεραπείες, ενδιαφέρον για πρώτη επίσκεψη και αιτήματα αξιολόγησης μπορούν να εξυπηρετηθούν χωρίς να περνούν όλα από την υποδοχή.",
        handles: ["Συμβουλευτικά ραντεβού laser", "Ερωτήσεις για injectables", "Τιμές και χρόνος αποθεραπείας"],
        outcome: "Λιγότερα αιτήματα αξιολόγησης σε αναμονή και πιο καθαρή συνέχεια για την πρώτη επίσκεψη",
      },
      {
        title: "Demo Οδοντιατρείου",
        audience: "Οδοντιατρεία με νέα περιστατικά και ζήτηση για αισθητικές υπηρεσίες",
        summary:
          "Δείχνει πώς απαντώνται ερωτήσεις για λεύκανση, εμφυτεύματα και επείγοντα περιστατικά πριν ο ασθενής οδηγηθεί στο σωστό ραντεβού ή στο σωστό επόμενο βήμα.",
        handles: ["Λεύκανση", "Εμφυτεύματα", "Επείγοντα περιστατικά"],
        outcome: "Καλύτερη αρχική καταγραφή ενδιαφέροντος και λιγότερα ζεστά αιτήματα να χάνονται",
      },
      {
        title: "Demo Κλινικής",
        audience: "Κλινικές με πολλά ραντεβού και συχνές ερωτήσεις για υπηρεσίες και διαθεσιμότητα",
        summary:
          "Δείχνει πώς ερωτήσεις για ιδιωτικές επισκέψεις, ασφαλιστική κάλυψη και διαθεσιμότητα οδηγούνται στη σωστή πορεία προς ραντεβού.",
        handles: ["Ιδιωτικές επισκέψεις", "Ερωτήσεις για ασφαλιστική κάλυψη", "Συνέχεια για διαθεσιμότητα"],
        outcome: "Πιο ουσιαστικά αιτήματα ασθενών να φτάνουν στο σωστό επόμενο βήμα",
      },
      {
        title: "Demo Κομμωτηρίου",
        audience: "Επιχειρήσεις ομορφιάς με κυρίως επισκέπτες από κινητό",
        summary:
          "Δείχνει πώς πιο απαιτητικά αιτήματα για ραντεβού φιλτράρονται πριν μετατραπούν σε ατελείωτα μηνύματα ή αδύναμα αιτήματα.",
        handles: ["Διόρθωση χρώματος", "Νυφικές δοκιμές", "Πακέτα"],
        outcome: "Καλύτερα προεπιλεγμένα αιτήματα για ραντεβού με λιγότερη χειροκίνητη επικοινωνία",
      },
      {
        title: "Demo Συμβούλου",
        audience: "Επιχειρήσεις που δουλεύουν με αναγνωριστικές κλήσεις",
        summary:
          "Δείχνει πώς ερωτήσεις για καταλληλότητα, προϋπολογισμό και εύρος έργου μπορούν να απαντηθούν πριν δεσμευτεί χρόνος στο ημερολόγιο.",
        handles: ["Αναγνωριστικές κλήσεις", "Ερωτήσεις για προϋπολογισμό", "Καταλληλότητα έργου"],
        outcome: "Λιγότερες κλήσεις χαμηλής προτεραιότητας και καλύτερη εικόνα πριν από την πρώτη συζήτηση",
      },
      {
        title: "Demo Υπηρεσιών Κατ’ Οίκον",
        audience: "Ομάδες όπου η ταχύτητα στην απάντηση κερδίζει τη δουλειά",
        summary:
          "Δείχνει πώς επείγοντα αιτήματα επισκευής και εκτίμησης καταγράφονται γρήγορα και δρομολογούνται με τα σωστά στοιχεία.",
        handles: ["Επισκευές HVAC", "Ηλεκτρολογικές βλάβες", "Εκτιμήσεις αυθημερόν"],
        outcome: "Πιο καθαρά αιτήματα εκτίμησης και ταχύτερη πρώτη συνέχεια",
      },
    ] satisfies AiDemo[],
    processSteps: [
      {
        number: "01",
        title: "Ο επισκέπτης εκδηλώνει ενδιαφέρον",
        description: "Το site απαντά όσο το ενδιαφέρον είναι ακόμη φρέσκο, αντί να αφήνει το αίτημα να περιμένει.",
      },
      {
        number: "02",
        title: "Συλλέγονται οι σωστές πληροφορίες",
        description: "Ο επισκέπτης παίρνει χρήσιμες απαντήσεις, ενώ καταγράφονται όσα χρειάζεται πραγματικά η ομάδα σας.",
      },
      {
        number: "03",
        title: "Το επόμενο βήμα γίνεται ξεκάθαρο",
        description: "Το αίτημα οδηγείται σε ραντεβού αξιολόγησης, στη σωστή πορεία προς κράτηση ή στην κατάλληλη παράδοση στην ομάδα.",
      },
      {
        number: "04",
        title: "Η ομάδα σας αναλαμβάνει με πλήρη εικόνα",
        description: "Η συνέχεια ξεκινά με καλύτερες πληροφορίες, όχι με ακόμη έναν γύρο από βασικές ερωτήσεις.",
      },
    ] satisfies ProcessStep[],
    industries: [
      {
        name: "Med Spas",
        summary:
          "Καταγράψτε πιο γρήγορα τα αιτήματα για συμβουλευτικά ραντεβού και μην αφήνετε ερωτήσεις για θεραπείες να μετατρέπονται σε χαμένα έσοδα.",
        painPoint: "Οι ενδιαφερόμενοι συγκρίνουν γρήγορα επιλογές και χάνονται εύκολα μετά από μία μόνο καθυστερημένη απάντηση.",
        outcome: "Περισσότερα αιτήματα για αξιολόγηση να καταλήγουν σε ραντεβού, με λιγότερη πίεση στην υποδοχή.",
        examples: ["Συμβουλευτικά ραντεβού laser", "Ερωτήσεις για injectables", "Τιμές και χρόνος αποθεραπείας"],
        assistantFit: "Ιδανικό για υπηρεσίες που βασίζονται σε συμβουλευτικά ραντεβού",
      },
      {
        name: "Οδοντιατρεία",
        summary:
          "Απαντήστε σε ερωτήσεις νέων ασθενών, αισθητικές υπηρεσίες και επείγοντα περιστατικά πριν χαθεί το ενδιαφέρον.",
        painPoint: "Η υποδοχή είναι συνήθως πιεσμένη, οπότε τα αιτήματα από το site περιμένουν συχνά περισσότερο απ’ όσο πρέπει.",
        outcome: "Καθαρότερη αρχική καταγραφή και περισσότερα ραντεβού για θεραπεία ή αξιολόγηση.",
        examples: ["Λεύκανση", "Εμφυτεύματα", "Επείγοντα περιστατικά"],
        assistantFit: "Ιδιαίτερα χρήσιμο για νέα περιστατικά και αισθητικές υπηρεσίες",
      },
      {
        name: "Κλινικές",
        summary:
          "Υποστηρίξτε κλινικές με πολλά ραντεβού με πιο γρήγορες απαντήσεις και καλύτερη πορεία προς την κράτηση.",
        painPoint: "Πιθανοί ασθενείς αποχωρούν όταν το site μοιάζει παθητικό και το επόμενο βήμα δεν είναι καθαρό.",
        outcome: "Περισσότερα αιτήματα να μετατρέπονται σε προγραμματισμένα ραντεβού.",
        examples: ["Ιδιωτικές επισκέψεις", "Ερωτήσεις για ασφαλιστική κάλυψη", "Συνέχεια για διαθεσιμότητα"],
        assistantFit: "Ιδανικό όπου μετρά η ποιότητα της αρχικής καταγραφής",
      },
      {
        name: "Κομμωτήρια",
        summary:
          "Μετατρέψτε επισκέπτες από κινητό που θέλουν γρήγορες απαντήσεις πριν κλείσουν ένα πιο απαιτητικό ραντεβού.",
        painPoint: "Πάρα πολλά αιτήματα μένουν κολλημένα σε μηνύματα, φόρμες ή στην ουρά της ομάδας για απάντηση.",
        outcome: "Περισσότερα ραντεβού με λιγότερη χειροκίνητη επικοινωνία.",
        examples: ["Διόρθωση χρώματος", "Νυφικές δοκιμές", "Πακέτα"],
        assistantFit: "Εξαιρετικό για επιχειρήσεις ομορφιάς με κοινό κυρίως από κινητό",
      },
      {
        name: "Σύμβουλοι",
        summary:
          "Ξεχωρίστε τα πιο κατάλληλα αιτήματα και οδηγήστε τους σωστούς ενδιαφερόμενους σε αναγνωριστικές κλήσεις με καλύτερη εικόνα.",
        painPoint: "Οι σύμβουλοι χάνουν χρόνο σε κλήσεις χαμηλής προτεραιότητας, επειδή το site δεν ξεκαθαρίζει από πριν ποιος ταιριάζει.",
        outcome: "Καλύτερες πρώτες κλήσεις και λιγότερος χαμένος χρόνος στο ημερολόγιο.",
        examples: ["Αναγνωριστικές κλήσεις", "Ερωτήσεις για προϋπολογισμό", "Καταλληλότητα έργου"],
        assistantFit: "Χρήσιμο για πωλήσεις που βασίζονται σε συζήτηση και αξιολόγηση",
      },
      {
        name: "Υπηρεσίες Κατ’ Οίκον",
        summary:
          "Πιάστε γρήγορα επείγοντα αιτήματα και συλλέξτε τα στοιχεία που χρειάζονται για εκτίμηση ή σωστή ανάθεση.",
        painPoint: "Όταν η απάντηση αργεί, ο ιδιοκτήτης σπιτιού συνήθως κλείνει με την πρώτη εταιρεία που απαντά.",
        outcome: "Περισσότερες προγραμματισμένες εκτιμήσεις και λιγότερα επείγοντα αιτήματα να χάνονται.",
        examples: ["Επισκευές HVAC", "Ηλεκτρολογικές βλάβες", "Εκτιμήσεις αυθημερόν"],
        assistantFit: "Υψηλή επίδραση όπου η ταχύτητα κερδίζει τη δουλειά",
      },
    ] satisfies Industry[],
    benefits: [
      {
        title: "Τα κενά στην απάντηση γίνονται ορατά",
        copy: "Δείτε πού τα αιτήματα μένουν για ώρα χωρίς να τα αναλαμβάνει κανείς.",
      },
      {
        title: "Η αρχική καταγραφή γίνεται πιο καθαρή",
        copy: "Συλλέξτε τις λεπτομέρειες που συνήθως η ομάδα αναγκάζεται να ζητά ξανά και ξανά.",
      },
      {
        title: "Τα επόμενα βήματα ξεκαθαρίζουν",
        copy: "Κάντε τη διαδρομή του επισκέπτη πιο καθαρή, αντί να μένει χαλαρή ή παθητική.",
      },
      {
        title: "Η υπάρχουσα ζήτηση αξιοποιείται καλύτερα",
        copy: "Αξιοποιήστε καλύτερα την επισκεψιμότητα και τα αιτήματα που ήδη έχετε.",
      },
    ] satisfies Benefit[],
    credibilityPoints: [
      {
        title: "Σχεδιασμένο πάνω στην πραγματική διαδρομή προς την κράτηση",
        copy: "Η Northline ξεκινά από όσα συμβαίνουν αφού κάποιος ενδιαφερθεί, όχι μόνο από το μήνυμα της αρχικής σελίδας.",
      },
      {
        title: "Χρήσιμο χωρίς να προσθέτει θόρυβο",
        copy: "Ο βοηθός, οι σελίδες και οι προτροπές διαμορφώνονται ώστε το επόμενο βήμα να γίνεται πιο ξεκάθαρο.",
      },
      {
        title: "Χτισμένο για πραγματικές ομάδες",
        copy: "Το τελικό αποτέλεσμα πρέπει να διευκολύνει την ομάδα στην πράξη, όχι απλώς να δείχνει ωραίο.",
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
          "Αυτό που το έκανε αξιόπιστο ήταν η παράδοση στην ομάδα. Η ομάδα έπαιρνε καλύτερες πληροφορίες και πιο έτοιμα αιτήματα για κράτηση.",
        author: "Marcus Wynn",
        role: "Founder, Wynn Dental Group",
      },
      {
        quote:
          "Έμοιαζε λιγότερο με την προσθήκη ενός widget και περισσότερο με διόρθωση του τρόπου που το site διαχειριζόταν τη ζήτηση.",
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
        question: "Μπορεί να λειτουργήσει αν χρειάζεται βελτίωση και το site;",
        answer:
          "Ναι. Η Northline μπορεί να βελτιώσει ταυτόχρονα το site και τη διαδρομή προς την κράτηση, ώστε η εμπειρία να είναι πιο ολοκληρωμένη και να αποδίδει καλύτερα εμπορικά.",
      },
      {
        question: "Παραμένει εύκολο να προσαρμοστεί αργότερα η τοπική έκδοση;",
        answer:
          "Ναι. Το μήνυμα, οι κλάδοι, τα CTA, οι μαρτυρίες και τα χρώματα είναι συγκεντρωμένα κεντρικά, ώστε να προσαρμόζετε το site γρήγορα.",
      },
    ] satisfies FaqItem[],
    dashboardMetrics: [
      { label: "Νέα αιτήματα", value: "42", delta: "Αυτή την εβδομάδα" },
      { label: "Αξιολογημένα αιτήματα", value: "31", delta: "Έτοιμα για συνέχεια" },
      { label: "Κλεισμένα ραντεβού", value: "19", delta: "Πέρασαν στο ημερολόγιο" },
      { label: "Χαμένες ευκαιρίες", value: "3", delta: "Από 14 παλαιότερα" },
    ],
    launchPhases: [
      {
        title: "Ξεκαθάρισμα της προσφοράς",
        summary: "Ορίζουμε ποιες ερωτήσεις, ποια σημεία αξιολόγησης και ποια επόμενα βήματα έχουν πραγματική σημασία.",
      },
      {
        title: "Στήσιμο της ροής",
        summary: "Σχεδιάζουμε site, βοηθό και CTA γύρω από πιο γρήγορη και πιο καθαρή μετατροπή.",
      },
      {
        title: "Βελτίωση μέσα από πραγματική χρήση",
        summary: "Βελτιώνουμε τη διατύπωση, τη δρομολόγηση και τη συνέχεια με βάση το πώς αντιδρούν πραγματικά οι ενδιαφερόμενοι.",
      },
    ],
    contactExpectations: [
      "Μια καθαρή εικόνα της σημερινής σας διαδρομής από το πρώτο αίτημα μέχρι το ραντεβού",
      "Μια πρόταση για το πιο λογικό επόμενο βήμα με βάση τον τρόπο που λειτουργεί η επιχείρησή σας",
      "Μια σαφή εικόνα για το πού μπορούν να βοηθήσουν περισσότερο η πιο γρήγορη απάντηση και η καθαρότερη ροή προς την κράτηση",
    ],
    solutionsPage: {
      capabilitySectionLabel: "Τι περιλαμβάνεται",
      capabilitySectionTitle: "Τι έρχεται να βελτιώσει η Northline",
      capabilityRows: [
        "Απαντήσεις σε συχνές ερωτήσεις και πρώτη επαφή με τον ενδιαφερόμενο",
        "Αρχική αξιολόγηση και σωστή καταγραφή στοιχείων",
        "Προτροπές για ραντεβού και καθαρή παράδοση στην ομάδα",
        "Σχεδιασμός ιστοσελίδας με έμφαση στη μετατροπή",
        "Δομημένες περιλήψεις αιτημάτων για την ομάδα",
        "Καθαρή βάση κώδικα έτοιμη για μελλοντικές επεκτάσεις",
      ],
      deliveryPillars: [
        {
          title: "Η απάντηση είναι ενσωματωμένη στο site",
          copy:
            "Το site είναι χτισμένο ώστε να απαντά πιο γρήγορα, να καθοδηγεί καλύτερα και να βοηθά περισσότερα αιτήματα να φτάνουν σε απόφαση για ραντεβού.",
        },
        {
          title: "Συλλογή στοιχείων που επιστρέφει ουσιαστική πληροφορία",
          copy:
            "Η επιχείρηση λαμβάνει πιο καθαρά στοιχεία αντί για αόριστα μηνύματα φόρμας και σκόρπια συνέχεια.",
        },
        {
          title: "Ροή κράτησης σχεδιασμένη για πραγματική λειτουργία",
          copy:
            "Όλα οργανώνονται γύρω από ό,τι βοηθά μια επιχείρηση υπηρεσιών να μετατρέπει αιτήματα σε πραγματικά ραντεβού.",
        },
      ],
      finalCtaLabel: "Κλείστε demo",
      hero: {
        description:
          "Η Northline συνδυάζει ταχύτερη πρώτη απάντηση, καλύτερη καταγραφή ενδιαφέροντος, πιο καθαρή πορεία προς την κράτηση και πιο σωστό μήνυμα στο site σε ένα ενιαίο σύστημα για επιχειρήσεις υπηρεσιών.",
        eyebrow: "Λύσεις",
        highlights: [
          "Άμεση πρώτη απάντηση για νέα αιτήματα",
          "Καλύτερη αρχική αξιολόγηση και καθαρότερη παράδοση στην ομάδα",
          "Υποστήριξη της ροής κράτησης για επιχειρήσεις που δουλεύουν με ραντεβού",
          "Σύγχρονες ιστοσελίδες χτισμένες γύρω από τη μετατροπή",
        ],
        secondaryAction: { label: "Δείτε κλάδους", href: "/industries" },
        title: "Υπηρεσίες σχεδιασμένες ώστε περισσότερα αιτήματα να καταλήγουν σε ραντεβού",
      },
      whyApproachDescription:
        "Όταν η απάντηση αργεί, η κράτηση δεν είναι ξεκάθαρη ή η συνέχεια γίνεται χειροκίνητα, τα αιτήματα χάνονται μέσα στη διαδρομή. Η Northline ξεκινά ακριβώς από εκεί.",
      whyApproachLabel: "Γιατί αυτή η προσέγγιση αποδίδει καλύτερα",
      whyApproachTitle:
        "Οι περισσότερες επιχειρήσεις υπηρεσιών δεν χρειάζονται πρώτα περισσότερα αιτήματα. Χρειάζονται καλύτερο τρόπο να χειρίζονται όσα ήδη έχουν.",
    },
    industriesPage: {
      bottomCta: {
        description:
          "Προσαρμόζουμε το website και το chat γύρω από την προσφορά σας, τη ροή των αιτημάτων σας και τον τρόπο που η ομάδα σας διαχειρίζεται στην πράξη τα ραντεβού.",
        label: "Επόμενο βήμα",
        title: "Κλείστε ένα demo προσαρμοσμένο στη δική σας επιχείρηση.",
      },
      bottomNote: {
        description:
          "Ξεκινήστε από τον κλάδο που μοιάζει περισσότερο με τα αιτήματά σας και μετά προσαρμόστε το μήνυμα, τις ερωτήσεις αξιολόγησης και τη ροή κράτησης γύρω από αυτό το κοινό.",
        label: "Πώς να χρησιμοποιήσετε αυτή τη σελίδα",
        title: "Επιλέξτε το demo που ταιριάζει στον τρόπο με τον οποίο κλείνει ραντεβού η επιχείρησή σας.",
      },
      cardBadge: "Website Demo",
      cardButtonLabel: "Κλείστε demo",
      hero: {
        description:
          "Δείτε πώς προσαρμοσμένες ιστοσελίδες με ενσωματωμένο chat μπορούν να απαντούν σε αιτήματα, να συλλέγουν χρήσιμα στοιχεία και να κατευθύνουν τη διαδρομή προς το ραντεβού για διαφορετικές επιχειρήσεις που λειτουργούν με ραντεβού.",
        eyebrow: "Website Demos",
        highlights: [
          "Παραδείγματα με έμφαση στο ραντεβού για επιχειρήσεις υπηρεσιών",
          "Χτισμένα γύρω από πραγματικές περιπτώσεις ενδιαφέροντος και προγραμματισμού",
          "Εύκολα στην προσαρμογή για συγκεκριμένο κοινό ή προσφορά",
        ],
        secondaryAction: { label: "Δείτε λύσεις", href: "/solutions" },
        title: "Website demos για πραγματικές καταστάσεις κράτησης",
      },
    },
    howItWorksPage: {
      finalCtaLabel: "Κλείστε demo",
      finalCtaTitle: "Περισσότερα αιτήματα απαντημένα. Περισσότερα αιτήματα αξιολογημένα. Περισσότερα ραντεβού κλεισμένα.",
      hero: {
        description:
          "Η Northline είναι σχεδιασμένη ώστε να βοηθά επιχειρήσεις να απαντούν πιο γρήγορα, να συλλέγουν καλύτερες πληροφορίες και να οδηγούν περισσότερα αιτήματα μέχρι το ραντεβού.",
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
          copy: "Καθαρότερη παράδοση στην ομάδα, με τις λεπτομέρειες που χρειάζονται για επιβεβαίωση, συνέχεια ή κράτηση.",
        },
        {
          title: "Για τη λειτουργία",
          copy:
            "Λιγότερα χειροκίνητα πήγαινε-έλα και καλύτερη πιθανότητα να αξιοποιήσετε τα αιτήματα που ήδη έχετε.",
        },
      ],
    },
    contactPage: {
      hero: {
        description:
          "Κλείστε απευθείας από το ημερολόγιο ή στείλτε ένα σύντομο αίτημα μέσα από τη φόρμα παρακάτω. Η Northline ξεκινά από την Ελλάδα και εστιάζει σε επιχειρήσεις που θέλουν περισσότερα αιτήματα να καταλήγουν σε ραντεβού.",
        eyebrow: "Επικοινωνία",
        primaryActionLabel: "Κλείστε άμεσα στο Calendly",
        secondaryActionLabel: "Χρησιμοποιήστε τη φόρμα",
        title: "Κλείστε demo και δείτε πού μπορείτε να κερδίσετε περισσότερα ραντεβού",
      },
    },
    chatbotTestPage: {
      hero: {
        description:
          "Αυτή η σελίδα είναι ένα απλό τοπικό περιβάλλον δοκιμής για το chatbot backend. Στέλνει πραγματικά requests στο local API route και χρησιμοποιεί το knowledge pack στον server.",
        eyebrow: "Τοπική δοκιμή chatbot",
        highlights: [
          "Καλεί το πραγματικό /api/chat route",
          "Χρησιμοποιεί το knowledge-pack.md στον server",
          "Κρατά τα API keys μόνο στον server",
        ],
        secondaryAction: { label: "Δείτε λύσεις", href: "/solutions" },
        title: "Δοκιμάστε το chatbot backend σε τοπικό περιβάλλον",
      },
      sideCard: {
        apiRouteBody:
          "Τα POST requests πηγαίνουν στο /api/chat με το τελευταίο μήνυμα και προαιρετικό history.",
        apiRouteTitle: "API route",
        backHomeLabel: "Επιστροφή στην αρχική",
        ctaLabel: "Κλείστε demo",
        demoCtaBody:
          "Η απάντηση περιλαμβάνει CTA για demo που χρησιμοποιεί το NEXT_PUBLIC_DEMO_URL.",
        demoCtaTitle: "Demo CTA",
        description:
          "Ο assistant απαντά σε ερωτήσεις για την προσφορά, μένει μέσα στο knowledge pack και μπορεί να κατευθύνει σχετικούς επισκέπτες προς demo.",
        knowledgeSourceBody:
          "Το business context του server φορτώνεται από το knowledge-pack.md.",
        knowledgeSourceTitle: "Knowledge source",
        panelLabel: "Τι κάνει αυτό το V1",
        title: "Απαντήσεις με επιχειρηματικό context, πάνω σε καθαρό local backend.",
      },
    },
    notFoundPage: {
      ctaLabel: "Επιστροφή στην αρχική",
      description: "Χρησιμοποιήστε την κύρια πλοήγηση για να συνεχίσετε την περιήγησή σας στο site.",
      title: "Αυτή η σελίδα δεν υπάρχει.",
    },
    contactForm: {
      actions: {
        calendarButtonLabel: "Κλείστε άμεσα στο Calendly",
        note:
          "Το κουμπί του ημερολογίου ανοίγει τη ζωντανή κράτηση. Η παρακάτω φόρμα είναι ξεχωριστή τοπική ροή αιτήματος και αποθηκεύεται στον browser σας μόνο για σκοπούς demo.",
        savingLabel: "Αποθήκευση αιτήματος demo...",
        submitLabel: "Υποβολή αιτήματος demo",
      },
      fields: {
        business: "Επιχείρηση",
        email: "Email",
        industry: "Κλάδος",
        monthlyLeads: "Εκτιμώμενα μηνιαία αιτήματα",
        name: "Όνομα",
        notes: "Τι θα θέλατε να αναλαμβάνει ο βοηθός;",
        phone: "Τηλέφωνο",
        websiteStatus: "Τωρινή κατάσταση της ιστοσελίδας",
      },
      latestRequest: {
        emptyDescription:
          "Χρησιμοποιήστε τη φόρμα για να προσομοιώσετε ένα πραγματικό αίτημα και να δείτε εδώ την αποθηκευμένη επιβεβαίωση.",
        emptyTitle: "Δεν υπάρχει ακόμη υποβολή",
        panelLabel: "Τελευταίο αποθηκευμένο αίτημα",
        summaryTemplate: "Καταχωρήθηκε αίτημα demo από {{name}} για επιχείρηση στον κλάδο {{industry}} στις {{submittedAt}}.",
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
          "Παράδειγμα: να απαντά σε ερωτήσεις για θεραπείες, να κάνει αρχική αξιολόγηση των ενδιαφερόμενων, να προτείνει ώρες για ραντεβού και να ενημερώνει την υποδοχή μας.",
        phone: "+30 69X XXX XXXX",
      },
      quickBooking: {
        buttonLabel: "Άνοιγμα Ημερολογίου",
        label: "Άμεση κράτηση",
        metaDuration: "30λεπτη κλήση",
        metaProvider: "Calendly",
        title: "Θέλετε να προγραμματίσετε αμέσως;",
        description: "Χρησιμοποιήστε το ημερολόγιο κράτησης για να επιλέξετε ώρα άμεσα.",
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
          { label: "Υπάρχει ιστοσελίδα, αλλά χρειάζεται βελτίωση", value: "existing-needs-improvement" },
          { label: "Δεν υπάρχει ακόμη ουσιαστική ιστοσελίδα", value: "no-real-website-yet" },
          { label: "Η ιστοσελίδα είναι καλή, αλλά χρειάζεται καλύτερη καταγραφή ενδιαφέροντος", value: "website-fine-need-capture" },
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
            { author: "assistant", text: "Ωραία. Μπορώ να σας δείξω μερικές διαθέσιμες ώρες." },
          ],
          nextStepMeta: "Νέος ασθενής · λεύκανση · επόμενη εβδομάδα",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Τρ 10:00", "Τετ 14:30", "Πεμ 17:15"],
        },
        {
          audience: "Med Spa",
          label: "Med Spa",
          messages: [
            { author: "user", text: "Θα ήθελα ένα συμβουλευτικό ραντεβού για laser αυτό το Σαββατοκύριακο." },
            { author: "assistant", text: "Βεβαίως. Είναι η πρώτη σας επίσκεψη;" },
            { author: "user", text: "Ναι, πρώτη φορά." },
            { author: "assistant", text: "Ωραία. Ορίστε μερικές διαθέσιμες επιλογές." },
          ],
          nextStepMeta: "Πρώτη επίσκεψη · συμβουλευτικό ραντεβού laser · προτίμηση για Σαββατοκύριακο",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Σαβ 11:00", "Σαβ 13:30", "Κυρ 10:15"],
        },
        {
          audience: "Κομμωτήριο",
          label: "Κομμωτήριο",
          messages: [
            { author: "user", text: "Χρειάζομαι διόρθωση χρώματος την επόμενη εβδομάδα." },
            { author: "assistant", text: "Με χαρά. Έχετε κάνει πρόσφατα κάποια βαφή στο σπίτι;" },
            { author: "user", text: "Ναι, πριν από περίπου δύο εβδομάδες." },
            { author: "assistant", text: "Ευχαριστώ. Το σωστό επόμενο βήμα είναι ένα σύντομο ραντεβού αξιολόγησης." },
          ],
          nextStepMeta: "Διόρθωση χρώματος · πρώτα αξιολόγηση · επόμενη εβδομάδα",
          nextStepTitle: "Προτεινόμενες ώρες",
          slots: ["Δευ 18:00", "Τρ 17:30", "Τετ 19:00"],
        },
      ] satisfies ChatDemoScenario[],
      panelLabel: "Παράδειγμα ροής",
      tabsAriaLabel: "Σενάρια προεπισκόπησης",
      title: "Από το αίτημα στο επόμενο βήμα",
    },
    chatbotTestPanel: {
      ctaLabel: "Κλείστε demo",
      errorFallback: "Δεν μπόρεσα να απαντήσω αυτή τη στιγμή. Μπορείτε πάντως να κλείσετε demo.",
      initialAssistantMessage:
        "Γεια, είμαι η Lena. Μπορώ να απαντήσω σε ερωτήσεις για το πώς βοηθάμε επιχειρήσεις να μετατρέπουν περισσότερα αιτήματα σε κλεισμένα ραντεβού.",
      inputLabel: "Το μήνυμά σας",
      placeholder: "Ρωτήστε για την υπηρεσία, τους κλάδους, την υποστήριξη του site ή τα επόμενα βήματα.",
      quickPrompts: [
        "Με τι ακριβώς βοηθάτε;",
        "Ταιριάζει αυτό σε ένα οδοντιατρείο;",
        "Μπορείτε να βελτιώσετε και το site μου;",
        "Τι γίνεται αφού κλείσω demo;",
      ],
      roleLabels: {
        assistant: "Βοηθός",
        user: "Εσείς",
      },
      sendLabel: "Αποστολή μηνύματος",
      sendingLabel: "Αποστολή...",
    },
    widget: {
      closedInputPlaceholder: "Η συνομιλία ολοκληρώθηκε. Κλείστε demo ή ανανεώστε τη σελίδα για νέα αρχή.",
      closedSendLabel: "Κλειστό",
      connectionIssueDescription: "Δεν μπόρεσα να απαντήσω αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο.",
      connectionIssueTitle: "Πρόβλημα σύνδεσης",
      ctaLabel: "Κλείστε demo",
      ctaPrompt: "Αν θέλετε, μπορούμε να το δούμε πιο πρακτικά.",
      feedbackAcknowledgementNo: "Ευχαριστώ. Το κρατάμε για να βελτιώνουμε την εμπειρία.",
      feedbackAcknowledgementYes: "Ευχαριστώ. Χαίρομαι που σας φάνηκε χρήσιμο.",
      feedbackNoLabel: "Όχι",
      feedbackQuestion: "Σας βοήθησε αυτή η συνομιλία;",
      feedbackYesLabel: "Ναι",
      headerTitle: "Άμεση συνομιλία",
      initialAssistantMessage:
        "Γεια σας, είμαι η Lena. Μπορώ να βοηθήσω με ερωτήσεις για ραντεβού, για το πώς λειτουργεί η λύση και για το αν ταιριάζει στην επιχείρησή σας.",
      inputLabel: "Στείλτε μήνυμα στη Lena",
      inputPlaceholder: "Γράψτε μήνυμα...",
      limitReachedMessage:
        "Νομίζω πως εδώ είναι το σωστό σημείο να το κλείσουμε. Αν σας φαίνεται σχετικό, το επόμενο βήμα είναι ένα σύντομο demo για να δούμε τη δική σας περίπτωση και πώς θα μπορούσε να εφαρμοστεί στην επιχείρησή σας.",
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
