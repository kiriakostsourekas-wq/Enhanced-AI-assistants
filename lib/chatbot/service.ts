import { getChatbotConfig } from "@/lib/chatbot/config";
import { loadKnowledgePack } from "@/lib/chatbot/knowledge-pack";
import { buildSystemPrompt } from "@/lib/chatbot/prompt";
import { generateOpenAIReply } from "@/lib/chatbot/providers/openai";
import type { ChatMessage, DemoCta } from "@/lib/chatbot/types";

export class ChatbotConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatbotConfigError";
  }
}

type GenerateWebsiteAssistantReplyArgs = {
  message: string;
  history: ChatMessage[];
};

export async function generateWebsiteAssistantReply({
  message,
  history,
}: GenerateWebsiteAssistantReplyArgs) {
  const config = getChatbotConfig();

  if (!config.openAiApiKey) {
    throw new ChatbotConfigError("OPENAI_API_KEY is not configured.");
  }

  const knowledgePack = await loadKnowledgePack();
  const systemPrompt = buildSystemPrompt({
    brandName: config.brandName,
    demoUrl: config.demoUrl,
    knowledgePack,
  });

  const response = await generateOpenAIReply({
    apiKey: config.openAiApiKey,
    history,
    message,
    model: config.model,
    systemPrompt,
  });

  return {
    brandName: config.brandName,
    cta: {
      href: config.demoUrl,
      label: "Book a Demo",
    } satisfies DemoCta,
    model: response.model,
    provider: "openai" as const,
    reply: response.reply,
  };
}
