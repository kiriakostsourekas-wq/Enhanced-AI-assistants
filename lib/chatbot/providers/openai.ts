import type { ChatMessage } from "@/lib/chatbot/types";

type OpenAIRequestMessage = {
  role: "system" | ChatMessage["role"];
  content: string;
};

type OpenAIChatCompletionResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GenerateReplyArgs = {
  apiKey: string;
  model: string;
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
};

export class OpenAIProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "OpenAIProviderError";
  }
}

function extractAssistantText(payload: OpenAIChatCompletionResponse) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (item.type === "text" ? item.text?.trim() || "" : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

export async function generateOpenAIReply({
  apiKey,
  model,
  message,
  history,
  systemPrompt,
}: GenerateReplyArgs) {
  const messages: OpenAIRequestMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });

  const payload = (await response.json().catch(() => null)) as OpenAIChatCompletionResponse | null;

  if (!response.ok) {
    throw new OpenAIProviderError(
      payload?.error?.message || "OpenAI request failed.",
      response.status,
    );
  }

  const reply = payload ? extractAssistantText(payload) : "";

  if (!reply) {
    throw new OpenAIProviderError("OpenAI returned an empty assistant reply.", response.status);
  }

  return {
    model: payload?.model || model,
    reply,
  };
}
