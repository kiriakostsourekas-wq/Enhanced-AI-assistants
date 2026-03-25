import { normalizeLocale } from "@/lib/i18n";
import type { ChatMessage, ChatRequestPayload } from "@/lib/chatbot/types";

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 2_000;

function isValidRole(value: unknown): value is ChatMessage["role"] {
  return value === "user" || value === "assistant";
}

function normalizeContent(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
    return null;
  }

  return trimmed;
}

export function validateChatRequest(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false as const,
      error: "Request body must be a JSON object.",
    };
  }

  const { history, locale, message } = payload as Partial<ChatRequestPayload>;
  const normalizedMessage = normalizeContent(message);
  const normalizedLocale = normalizeLocale(locale);

  if (!normalizedMessage) {
    return {
      ok: false as const,
      error: `Message is required and must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    };
  }

  if (history === undefined) {
    return {
      ok: true as const,
      data: {
        locale: normalizedLocale,
        message: normalizedMessage,
        history: [],
      },
    };
  }

  if (!Array.isArray(history)) {
    return {
      ok: false as const,
      error: "History must be an array when provided.",
    };
  }

  if (history.length > MAX_HISTORY_MESSAGES) {
    return {
      ok: false as const,
      error: `History can include at most ${MAX_HISTORY_MESSAGES} messages.`,
    };
  }

  const normalizedHistory: ChatMessage[] = [];

  for (const item of history) {
    if (!item || typeof item !== "object") {
      return {
        ok: false as const,
        error: "Each history item must be an object with role and content.",
      };
    }

    const role = (item as Partial<ChatMessage>).role;
    const content = normalizeContent((item as Partial<ChatMessage>).content);

    if (!isValidRole(role) || !content) {
      return {
        ok: false as const,
        error: "Each history item must include a valid role and non-empty content.",
      };
    }

    normalizedHistory.push({ role, content });
  }

  return {
    ok: true as const,
    data: {
      locale: normalizedLocale,
      message: normalizedMessage,
      history: normalizedHistory,
    },
  };
}
