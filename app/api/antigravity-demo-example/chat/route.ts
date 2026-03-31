import { NextResponse } from "next/server";
import { getChatbotConfig } from "@/lib/chatbot/config";
import { OpenAIProviderError, generateOpenAIReply } from "@/lib/chatbot/providers/openai";
import type { ChatApiResponse } from "@/lib/chatbot/types";
import { validateChatRequest } from "@/lib/chatbot/validation";
import {
  exampleChatbotConfig,
  exampleDemoLandingPage,
  exampleKnowledgePack,
} from "@/lib/antigravity/demo-site/example-fixture";

export const runtime = "nodejs";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json<ChatApiResponse>(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const validation = validateChatRequest(payload);

  if (!validation.ok) {
    return errorResponse(400, "INVALID_REQUEST", validation.error);
  }

  const runtimeConfig = getChatbotConfig();

  if (!runtimeConfig.openAiApiKey) {
    return errorResponse(500, "CONFIG_ERROR", "OPENAI_API_KEY is not configured.");
  }

  try {
    const response = await generateOpenAIReply({
      apiKey: runtimeConfig.openAiApiKey,
      model: runtimeConfig.model,
      history: validation.data.history,
      message: validation.data.message,
      systemPrompt: [
        exampleChatbotConfig.systemPrompt,
        "",
        `Rendering mode: ${exampleDemoLandingPage.renderingMode}.`,
        `Visitor locale hint: ${validation.data.locale}.`,
        `Primary CTA: ${exampleDemoLandingPage.persistentCta.label} (${exampleDemoLandingPage.persistentCta.href}).`,
        "Keep answers concise and default to Greek unless the user clearly writes in English.",
        "Never invent pricing, outcomes, or additional clinicians.",
        "",
        "Knowledge pack markdown:",
        exampleKnowledgePack.markdown,
      ].join("\n"),
    });

    return NextResponse.json<ChatApiResponse>({
      ok: true,
      reply: response.reply,
      cta: {
        href: exampleDemoLandingPage.persistentCta.href,
        label: exampleDemoLandingPage.persistentCta.label,
      },
      meta: {
        model: response.model,
        brandName: "Athens Dental Clinic",
        provider: "openai",
      },
    });
  } catch (error) {
    if (error instanceof OpenAIProviderError) {
      return errorResponse(
        error.status && error.status >= 400 && error.status < 500 ? error.status : 502,
        "PROVIDER_ERROR",
        error.message,
      );
    }

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong while generating a preview reply.");
  }
}
