import { NextResponse } from "next/server";
import { OpenAIProviderError } from "@/lib/chatbot/providers/openai";
import type { ChatApiResponse } from "@/lib/chatbot/types";
import { validateChatRequest } from "@/lib/chatbot/validation";
import {
  DemoPreviewChatError,
  generateClinicDemoAssistantReply,
} from "@/lib/antigravity/demo-site/chat-service";

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

export async function POST(
  request: Request,
  context: { params: Promise<{ campaignSlug: string; prospectSlug: string }> },
) {
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

  const params = await context.params;

  try {
    const result = await generateClinicDemoAssistantReply({
      campaignSlug: params.campaignSlug,
      prospectSlug: params.prospectSlug,
      history: validation.data.history,
      locale: validation.data.locale,
      message: validation.data.message,
    });

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
    if (error instanceof DemoPreviewChatError) {
      return errorResponse(500, "CONFIG_ERROR", error.message);
    }

    if (error instanceof OpenAIProviderError) {
      return errorResponse(
        error.status && error.status >= 400 && error.status < 500 ? error.status : 502,
        "PROVIDER_ERROR",
        error.message,
      );
    }

    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return errorResponse(404, "PREVIEW_NOT_FOUND", "Preview assets were not found for this clinic demo.");
    }

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong while generating a preview reply.");
  }
}
