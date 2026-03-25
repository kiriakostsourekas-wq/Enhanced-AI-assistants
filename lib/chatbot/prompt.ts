import type { Locale } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/chatbot/types";

type BuildSystemPromptArgs = {
  assistantName: string;
  baseSystemPrompt: string;
  brandName: string;
  knowledgePack: string;
  locale: Locale;
  history: ChatMessage[];
  message: string;
};

type TurnGuidance = {
  answerShape: string;
  ctaGuidance: string;
  detectedIndustry: string | null;
  followUpGuidance: string;
  questionFocus: string;
  responseLength: string;
  specificityGuidance: string;
  stage: string;
};

const DETAIL_PATTERNS = [
  /\bmore detail\b/i,
  /\bin detail\b/i,
  /\bwalk me through\b/i,
  /\bexplain\b/i,
  /\bspecifically\b/i,
  /\bhow exactly\b/i,
  /\bhow would\b/i,
  /\bwhat happens after\b/i,
  /\bimplementation\b/i,
  /\bsetup\b/i,
];

const FIT_PATTERNS = [
  /\bis this relevant\b/i,
  /\bis this a fit\b/i,
  /\bcould this work\b/i,
  /\bwould this work\b/i,
  /\bfor my business\b/i,
  /\bfor our business\b/i,
  /\bi run\b/i,
  /\bwe run\b/i,
];

const OBJECTION_PATTERNS = [
  /\bwe already have\b/i,
  /\balready have a contact form\b/i,
  /\bwhy would (?:i|we) need this\b/i,
  /\bwhy not just\b/i,
  /\bi don'?t want ai\b/i,
  /\bwe don'?t want ai\b/i,
  /\bnot sure about ai\b/i,
  /\bdon'?t want (?:it|this) talking to customers\b/i,
];

const IMPLEMENTATION_PATTERNS = [
  /\bhow does this work\b/i,
  /\bhow would this work\b/i,
  /\bsetup\b/i,
  /\bimplement/i,
  /\bonboard/i,
  /\binstall/i,
  /\bintegration/i,
];

const NEXT_STEP_PATTERNS = [
  /\bbook a demo\b/i,
  /\bnext step\b/i,
  /\bwhat happens next\b/i,
  /\bwhat happens after\b/i,
  /\bwhat should i do next\b/i,
  /\bhow do (?:i|we) get started\b/i,
];

const BUYING_INTENT_PATTERNS = [
  /\bi(?:'m| am) interested\b/i,
  /\bwe(?:'re| are) interested\b/i,
  /\bthis sounds relevant\b/i,
  /\bthis sounds like a fit\b/i,
  /\bhow do (?:i|we) move forward\b/i,
  /\bmove forward\b/i,
  /\bcan we talk\b/i,
  /\blet'?s talk\b/i,
  /\bshould (?:i|we) book\b/i,
];

const POSITIONING_PATTERNS = [
  /\bchatbot\b/i,
  /\bai company\b/i,
  /\bwhat exactly do you do\b/i,
  /\bwhat do you do\b/i,
];

const WEBSITE_PATTERNS = [
  /\bwebsite\b/i,
  /\bsite\b/i,
  /\bredesign\b/i,
  /\bbuild\b/i,
];

const PAIN_PATTERNS = [
  /\bslow\b/i,
  /\breply\b/i,
  /\bfollow-?up\b/i,
  /\bbusy\b/i,
  /\bbooking\b/i,
  /\bbookings\b/i,
  /\bappointment\b/i,
  /\bappointments\b/i,
  /\blead/i,
  /\benquir/i,
  /\btraffic\b/i,
];

const INDUSTRY_MATCHERS = [
  {
    label: "Dental Clinics",
    patterns: [/\bdental\b/i, /\bdentist\b/i, /\bwhitening\b/i, /\bimplant\b/i, /\bnew patient\b/i],
  },
  {
    label: "Clinics",
    patterns: [/\bclinic\b/i, /\bmedical practice\b/i, /\bpatient\b/i],
  },
  {
    label: "Med Spas",
    patterns: [/\bmed spa\b/i, /\bmedical spa\b/i, /\binjectable/i, /\blaser\b/i, /\baesthetic\b/i],
  },
  {
    label: "Salons and Beauty Businesses",
    patterns: [/\bsalon\b/i, /\bbeauty\b/i, /\bcolor correction\b/i, /\bbridal\b/i],
  },
  {
    label: "Consultants",
    patterns: [/\bconsultant\b/i, /\bagency\b/i, /\bdiscovery call\b/i, /\bconsulting\b/i],
  },
  {
    label: "Home Service Businesses",
    patterns: [/\bhvac\b/i, /\bplumb/i, /\belectric/i, /\bhome service\b/i, /\bestimate\b/i, /\bdispatch\b/i],
  },
];

function parseSections(markdown: string) {
  const sections = new Map<string, string>();
  const lines = markdown.split(/\r?\n/);
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        sections.set(currentTitle, currentBody.join("\n").trim());
      }

      currentTitle = line.slice(3).trim();
      currentBody = [];
      continue;
    }

    if (currentTitle) {
      currentBody.push(line);
    }
  }

  if (currentTitle) {
    sections.set(currentTitle, currentBody.join("\n").trim());
  }

  return sections;
}

function parseSubsections(markdown: string) {
  const sections = new Map<string, string>();
  const lines = markdown.split(/\r?\n/);
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentTitle) {
        sections.set(currentTitle, currentBody.join("\n").trim());
      }

      currentTitle = line.slice(4).trim();
      currentBody = [];
      continue;
    }

    if (currentTitle) {
      currentBody.push(line);
    }
  }

  if (currentTitle) {
    sections.set(currentTitle, currentBody.join("\n").trim());
  }

  return sections;
}

function matchesAny(patterns: RegExp[], value: string) {
  return patterns.some((pattern) => pattern.test(value));
}

function detectIndustry(message: string) {
  const normalizedMessage = message.toLowerCase();

  for (const matcher of INDUSTRY_MATCHERS) {
    if (matcher.patterns.some((pattern) => pattern.test(normalizedMessage))) {
      return matcher.label;
    }
  }

  return null;
}

function inferTurnGuidance(message: string, history: ChatMessage[]): TurnGuidance {
  const stage = history.length === 0 ? "first-turn question" : "ongoing conversation";
  const wantsMoreDetail = matchesAny(DETAIL_PATTERNS, message);
  const isFitQuestion = matchesAny(FIT_PATTERNS, message);
  const isObjectionQuestion = matchesAny(OBJECTION_PATTERNS, message);
  const isImplementationQuestion = matchesAny(IMPLEMENTATION_PATTERNS, message);
  const isNextStepQuestion = matchesAny(NEXT_STEP_PATTERNS, message);
  const showsBuyingIntent = matchesAny(BUYING_INTENT_PATTERNS, message);
  const isPositioningQuestion = matchesAny(POSITIONING_PATTERNS, message);
  const detectedIndustry = detectIndustry(message);
  const isPainQuestion = matchesAny(PAIN_PATTERNS, message);

  let questionFocus = "general overview";

  if (isObjectionQuestion) {
    questionFocus = "objection";
  } else if (detectedIndustry || isFitQuestion) {
    questionFocus = "industry fit";
  } else if (isImplementationQuestion) {
    questionFocus = "implementation or setup";
  } else if (isNextStepQuestion || showsBuyingIntent) {
    questionFocus = "next step";
  } else if (isPositioningQuestion) {
    questionFocus = "positioning";
  } else if (matchesAny(WEBSITE_PATTERNS, message)) {
    questionFocus = "website scope";
  } else if (isPainQuestion) {
    questionFocus = "pain point";
  }

  let responseLength = "Target 2 to 4 short sentences. Keep it compact unless the user asks for more detail.";

  if (history.length === 0 && !wantsMoreDetail && (isPositioningQuestion || questionFocus === "general overview")) {
    responseLength =
      "This is a broad early question. Target 1 to 2 short sentences. Use a third sentence only if it adds concrete value.";
  } else if (history.length === 0 && !wantsMoreDetail) {
    responseLength =
      "This is an early question. Target 1 to 3 short sentences and keep the reply tight.";
  } else if (wantsMoreDetail) {
    responseLength =
      "The user may need a bit more depth. Target 3 to 5 sentences, but go longer only if the user clearly asked for detail.";
  }

  const ctaGuidance = isNextStepQuestion || showsBuyingIntent || isImplementationQuestion
    ? "A soft demo suggestion is appropriate if it fits naturally. Keep it brief and do not include the URL."
    : detectedIndustry || isFitQuestion || isObjectionQuestion
      ? "Do not jump to a demo CTA. Diagnose the bottleneck first. Add a CTA only if the user also shows clear buying intent."
      : "Do not include a demo CTA in this reply.";

  let followUpGuidance =
    "Do not end with a follow-up question unless the answer would otherwise be incomplete.";

  if (isPositioningQuestion) {
    followUpGuidance = "Do not ask a follow-up question.";
  } else if (detectedIndustry || isFitQuestion || isObjectionQuestion) {
    followUpGuidance =
      "Answer directly first. If useful, ask exactly one diagnostic question about the bottleneck. Do not stack a follow-up question on top of a CTA.";
  } else if (history.length === 0 && isImplementationQuestion) {
    followUpGuidance =
      "Answer directly first. Avoid a follow-up question unless it helps guide the next step.";
  }

  let specificityGuidance = "Use only supported specifics from the selected knowledge context.";
  let answerShape =
    "Answer the question directly in 1 to 3 short sentences. Do not add a CTA unless the turn guidance says it is appropriate.";

  if (isObjectionQuestion) {
    specificityGuidance =
      "Handle the objection directly and credibly. Use only the supported distinction between Northline and a basic form or generic AI. Do not oversell. Do not invent safeguards, operating modes, routing rules, or feature toggles. For objections about AI talking to customers, keep the answer at the level of early enquiry support with human follow-up.";
    answerShape =
      "Recommended shape: sentence 1 validates the concern and makes clear Northline is not positioned as replacing staff. Sentence 2 explains the practical difference using supported source material. Sentence 3 may ask one short qualifying question if it would help.";
  } else if (isImplementationQuestion) {
    specificityGuidance =
      "Stay high level and brief. Do not mention code snippets, install methods, notifications, routing, integrations, timelines, or technical steps unless they are explicitly provided in the selected knowledge context. If specifics are not provided, say the exact implementation would be scoped in a demo.";
    answerShape =
      "Recommended shape: sentence 1 explains that setup is tailored around the business and website. Sentence 2 says exact implementation details are scoped around the current setup. Sentence 3 can offer a short demo as the next step. Do not list steps.";
  } else if (isNextStepQuestion || showsBuyingIntent) {
    specificityGuidance =
      "Describe the next step honestly. Do not infer demo length or other logistics from the URL. Do not mention confirmation emails, reminders, attendees, or calendar details unless they are explicitly provided.";
    answerShape =
      "Recommended shape: explain what happens in the discovery conversation and what gets reviewed, then optionally add a short CTA.";
  } else if (detectedIndustry || isFitQuestion) {
    specificityGuidance =
      "Use concrete industry examples from the selected context, but do not invent detailed workflows or guarantees.";
    answerShape =
      "Recommended shape: sentence 1 gives a clear fit or no-fit answer. Sentence 2 gives one or two concrete examples or pains. Sentence 3 asks one useful diagnostic question about the main bottleneck. Do not add a CTA unless the user also shows clear buying intent.";
  } else if (isPositioningQuestion) {
    answerShape =
      "Recommended shape: answer the positioning question directly in 1 or 2 sentences. Add one short clarifying sentence only if it materially helps. No CTA.";
  } else if (isPainQuestion) {
    answerShape =
      "Recommended shape: answer the pain point directly, connect it to one practical issue Northline can help with, and stop there unless the user asks for more.";
  }

  return {
    answerShape,
    ctaGuidance,
    detectedIndustry,
    followUpGuidance,
    questionFocus,
    responseLength,
    specificityGuidance,
    stage,
  };
}

function formatSection(title: string, body: string | null | undefined) {
  const trimmed = body?.trim();

  if (!trimmed) {
    return null;
  }

  return `## ${title}\n${trimmed}`;
}

function selectKnowledgeContext(knowledgePack: string, message: string) {
  const sections = parseSections(knowledgePack);
  const selected: string[] = [];
  const detectedIndustry = detectIndustry(message);
  const lowerMessage = message.toLowerCase();
  const isFitQuestion = matchesAny(FIT_PATTERNS, lowerMessage);
  const isObjectionQuestion = matchesAny(OBJECTION_PATTERNS, lowerMessage);
  const isPainQuestion = matchesAny(PAIN_PATTERNS, lowerMessage);
  const isBuyingIntent = matchesAny(BUYING_INTENT_PATTERNS, lowerMessage);

  const alwaysInclude = [
    "Business Summary",
    "Positioning: What We Are / What We Are Not",
    "Who We Help",
    "Tone Guidance For Lena",
  ];

  for (const name of alwaysInclude) {
    const section = formatSection(name, sections.get(name));

    if (section) {
      selected.push(section);
    }
  }

  if (isPainQuestion || detectedIndustry || isFitQuestion || isObjectionQuestion) {
    const painPoints = formatSection("Common Pain Points", sections.get("Common Pain Points"));

    if (painPoints) {
      selected.push(painPoints);
    }
  }

  if (
    detectedIndustry ||
    isFitQuestion ||
    matchesAny(WEBSITE_PATTERNS, lowerMessage) ||
    matchesAny(POSITIONING_PATTERNS, lowerMessage)
  ) {
    const helpWith = formatSection("What We Help With", sections.get("What We Help With"));

    if (helpWith) {
      selected.push(helpWith);
    }
  }

  if (matchesAny(WEBSITE_PATTERNS, lowerMessage)) {
    const websiteScope = formatSection("Website Scope", sections.get("Website Scope"));

    if (websiteScope) {
      selected.push(websiteScope);
    }
  }

  if (matchesAny(IMPLEMENTATION_PATTERNS, lowerMessage)) {
    const implementationNotes = formatSection(
      "Implementation Notes",
      sections.get("Implementation Notes"),
    );

    if (implementationNotes) {
      selected.push(implementationNotes);
    }
  }

  if (matchesAny(NEXT_STEP_PATTERNS, lowerMessage) || isBuyingIntent) {
    const nextSteps = formatSection(
      "What Happens After Booking a Demo",
      sections.get("What Happens After Booking a Demo"),
    );

    if (nextSteps) {
      selected.push(nextSteps);
    }
  }

  if (
    matchesAny(POSITIONING_PATTERNS, lowerMessage) ||
    matchesAny(NEXT_STEP_PATTERNS, lowerMessage) ||
    isObjectionQuestion
  ) {
    const faq = formatSection("FAQ Short Answers", sections.get("FAQ Short Answers"));

    if (faq) {
      selected.push(faq);
    }
  }

  if (detectedIndustry || isFitQuestion || isPainQuestion) {
    const diagnosticAngles = formatSection("Diagnostic Angles", sections.get("Diagnostic Angles"));

    if (diagnosticAngles) {
      selected.push(diagnosticAngles);
    }
  }

  if (isObjectionQuestion) {
    const objectionNotes = formatSection("Objection Notes", sections.get("Objection Notes"));

    if (objectionNotes) {
      selected.push(objectionNotes);
    }
  }

  const industryNotes = sections.get("Industry Fit Notes");

  if (industryNotes) {
    if (detectedIndustry) {
      const subsections = parseSubsections(industryNotes);
      const industryBody = subsections.get(detectedIndustry);
      const formattedIndustry = formatSection(`Industry Context: ${detectedIndustry}`, industryBody);

      if (formattedIndustry) {
        selected.push(formattedIndustry);
      }
    } else if (matchesAny(FIT_PATTERNS, lowerMessage)) {
      const formattedIndustryNotes = formatSection("Industry Fit Notes", industryNotes);

      if (formattedIndustryNotes) {
        selected.push(formattedIndustryNotes);
      }
    }
  }

  return selected.join("\n\n");
}

export function buildSystemPrompt({
  assistantName,
  baseSystemPrompt,
  brandName,
  knowledgePack,
  locale,
  history,
  message,
}: BuildSystemPromptArgs) {
  const turnGuidance = inferTurnGuidance(message, history);
  const selectedKnowledgeContext = selectKnowledgeContext(knowledgePack, message);

  return `# Role And Operating Rules

${baseSystemPrompt.trim()}

## Assistant Identity

- The assistant's public name on the website is ${assistantName}.
- If asked who you are, introduce yourself as ${assistantName}, the website assistant for ${brandName}.
- The chat UI already includes a clickable "Book a Demo" CTA.
- If you mention the next step, refer to it as a short demo or quick demo without pasting any raw URL or markdown link.

## Language Guidance

- Current website locale: ${locale === "gr" ? "Greek" : "English"}.
- Reply in the same language as the user's latest message.
- If the latest user message is ambiguous or mixed-language, default to the current website locale.
- Do not switch languages unless the user does.

## Current Turn Guidance

- Conversation stage: ${turnGuidance.stage}
- Question focus: ${turnGuidance.questionFocus}
- Detected industry context: ${turnGuidance.detectedIndustry || "none explicitly stated"}
- Recommended answer shape: ${turnGuidance.answerShape}
- Response length guidance: ${turnGuidance.responseLength}
- Specificity guidance: ${turnGuidance.specificityGuidance}
- Follow-up question guidance: ${turnGuidance.followUpGuidance}
- CTA guidance: ${turnGuidance.ctaGuidance}

## Selected Knowledge Context

${selectedKnowledgeContext}`;
}
