export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export type ChatRequestPayload = {
  message: string;
  history?: ChatMessage[];
};

export type DemoCta = {
  label: string;
  href: string;
};

export type ChatSuccessResponse = {
  ok: true;
  reply: string;
  cta: DemoCta;
  meta: {
    model: string;
    brandName: string;
    provider: "openai";
  };
};

export type ChatErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ChatApiResponse = ChatSuccessResponse | ChatErrorResponse;
