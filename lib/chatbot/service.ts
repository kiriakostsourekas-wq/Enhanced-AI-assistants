import { getChatbotConfig } from "@/lib/chatbot/config";
import { loadKnowledgePack, loadSystemPromptFile } from "@/lib/chatbot/knowledge-pack";
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

const NO_AI_TALKING_TO_CUSTOMERS_PATTERN = /\bdon['’]?t want ai talking to customers\b/i;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeAssistantReply(reply: string, demoUrl: string) {
  const demoTargets = [
    demoUrl.trim() ? escapeRegExp(demoUrl.trim()) : null,
    "https?:\\/\\/(?:www\\.)?calendly\\.com\\/[^)\\s]+",
  ].filter(Boolean) as string[];

  if (demoTargets.length === 0) {
    return reply.trim();
  }

  const markdownDemoLinkPattern = new RegExp(
    `\\[([^\\]]+)\\]\\((?:${demoTargets.join("|")})\\)`,
    "gi",
  );
  const rawDemoLinkPattern = new RegExp(`(?:${demoTargets.join("|")})`, "gi");

  const sanitized = reply
    .replace(markdownDemoLinkPattern, "$1")
    .replace(rawDemoLinkPattern, "")
    .replace(/\b(?:using|via)\s+(?:this|the)\s+link\b:?\s*/gi, "")
    .replace(/\bat\s+(?:this|the)\s+link\b:?\s*/gi, "")
    .replace(/\bat\s+the\s+link\s+below\b:?\s*/gi, "")
    .replace(/\bhere\b:?\s*(?=$|[.!?])/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim()
    .replace(/[:;-]\s*$/, ".");

  return /[A-Za-z0-9]/.test(sanitized)
    ? sanitized
    : "Happy to help with fit, setup, or your current booking flow.";
}

function applyReplyGuardrails(reply: string, message: string) {
  if (NO_AI_TALKING_TO_CUSTOMERS_PATTERN.test(message)) {
    return "That's a valid concern. Northline is not positioned as replacing staff; it supports early website enquiries and routine pre-booking questions so human follow-up can happen with better context. Is the bigger concern keeping the first response human, or keeping staff fully in control of the conversation?";
  }

  return reply;
}

export async function generateWebsiteAssistantReply({
  message,
  history,
}: GenerateWebsiteAssistantReplyArgs) {
  const config = getChatbotConfig();

  if (!config.openAiApiKey) {
    throw new ChatbotConfigError("OPENAI_API_KEY is not configured.");
  }

  const [knowledgePack, baseSystemPrompt] = await Promise.all([
    loadKnowledgePack(),
    loadSystemPromptFile(),
  ]);

  const systemPrompt = buildSystemPrompt({
    assistantName: "Lena",
    baseSystemPrompt,
    brandName: config.brandName,
    history,
    knowledgePack,
    message,
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
    reply: applyReplyGuardrails(sanitizeAssistantReply(response.reply, config.demoUrl), message),
  };
}
