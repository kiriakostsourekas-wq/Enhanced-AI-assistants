import { siteConfig } from "@/lib/site-content";

const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const PLACEHOLDER_DEMO_URL = "[YOUR DEMO PAGE OR CALENDAR LINK]";

function normalizeDemoUrl(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === PLACEHOLDER_DEMO_URL) {
    return siteConfig.primaryCta.href;
  }

  return trimmed;
}

export function getChatbotConfig() {
  return {
    brandName: siteConfig.brandName,
    demoUrl: normalizeDemoUrl(process.env.NEXT_PUBLIC_DEMO_URL),
    model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    openAiApiKey: process.env.OPENAI_API_KEY?.trim() || "",
  };
}
