import { NextResponse } from "next/server";

import { OpenAIProviderError } from "@/lib/chatbot/providers/openai";
import { ChatbotConfigError, generateWebsiteAssistantReply } from "@/lib/chatbot/service";
import type { ChatApiResponse } from "@/lib/chatbot/types";
import { validateChatRequest } from "@/lib/chatbot/validation";

export const runtime = "nodejs";

function errorResponse(
  status: number,
  code: string,
  message: string,
) {
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

  try {
    const result = await generateWebsiteAssistantReply(validation.data);

    return NextResponse.json<ChatApiResponse>({
      ok: true,
      reply: result.reply,
      cta: result.cta,
      meta: {
        model: result.model,
        brandName: result.brandName,
        provider: result.provider,
      },
    });
  } catch (error) {
    if (error instanceof ChatbotConfigError) {
      return errorResponse(500, "CONFIG_ERROR", error.message);
    }

    if (error instanceof OpenAIProviderError) {
      return errorResponse(
        error.status && error.status >= 400 && error.status < 500 ? error.status : 502,
        "PROVIDER_ERROR",
        error.message,
      );
    }

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong while generating a reply.");
  }
}
