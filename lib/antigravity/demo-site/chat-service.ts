import { getChatbotConfig } from "@/lib/chatbot/config";
import { generateOpenAIReply } from "@/lib/chatbot/providers/openai";
import type { ChatMessage, DemoCta } from "@/lib/chatbot/types";
import type { Locale } from "@/lib/i18n";
import { loadPreviewArtifacts } from "@/lib/antigravity/demo-site/artifacts";

export class DemoPreviewChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoPreviewChatError";
  }
}

type GenerateClinicDemoAssistantReplyArgs = {
  campaignSlug: string;
  prospectSlug: string;
  history: ChatMessage[];
  locale: Locale;
  message: string;
};

function getFallbackReply(locale: Locale) {
  return locale === "gr"
    ? "Μπορώ να απαντήσω μόνο με βάση τα επαληθευμένα στοιχεία του demo και να σας κατευθύνω στο επόμενο βήμα."
    : "I can only answer from the verified demo context and guide you to the next step.";
}

function sanitizeReply(reply: string, locale: Locale) {
  const cleaned = reply
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return cleaned || getFallbackReply(locale);
}

export async function generateClinicDemoAssistantReply(args: GenerateClinicDemoAssistantReplyArgs) {
  const runtimeConfig = getChatbotConfig();

  if (!runtimeConfig.openAiApiKey) {
    throw new DemoPreviewChatError("OPENAI_API_KEY is not configured.");
  }

  const { chatbotConfig, landingPage, knowledgePack } = await loadPreviewArtifacts({
    campaignSlug: args.campaignSlug,
    prospectSlug: args.prospectSlug,
  });

  const systemPrompt = [
    chatbotConfig.systemPrompt,
    "",
    `Rendering mode: ${landingPage.renderingMode}.`,
    `Visitor locale hint: ${args.locale}.`,
    `Primary CTA: ${landingPage.persistentCta.label} (${landingPage.persistentCta.href}).`,
    "Stay concise. Default to Greek unless the user clearly writes in English.",
    "If a fact is unresolved or not explicitly present in the knowledge pack, say it needs confirmation from the clinic.",
    "Never claim pricing, outcomes, insurance coverage, or clinician availability unless it is explicitly verified.",
    "",
    "Knowledge pack markdown:",
    knowledgePack.markdown,
  ].join("\n");

  const response = await generateOpenAIReply({
    apiKey: runtimeConfig.openAiApiKey,
    model: runtimeConfig.model,
    history: args.history,
    message: args.message,
    systemPrompt,
  });

  return {
    brandName: String(knowledgePack.structuredJson.clinicName.value ?? landingPage.title),
    cta: {
      href: landingPage.persistentCta.href,
      label: landingPage.persistentCta.label,
    } satisfies DemoCta,
    model: response.model,
    provider: "openai" as const,
    reply: sanitizeReply(response.reply, args.locale),
  };
}
