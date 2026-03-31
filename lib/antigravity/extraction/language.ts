import type { LanguageAssessment, LanguageCode } from "@/lib/antigravity/schemas";

export function normalizeExtractionText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function greekCharacterRatio(value: string) {
  const greekCount = (value.match(/\p{Script=Greek}/gu) ?? []).length;
  const latinCount = (value.match(/[A-Za-z]/g) ?? []).length;
  const total = greekCount + latinCount;

  return total === 0 ? 0 : greekCount / total;
}

export function detectLanguageCode(value: string): LanguageCode {
  const ratio = greekCharacterRatio(value);
  const latinCount = (value.match(/[A-Za-z]/g) ?? []).length;
  const greekCount = (value.match(/\p{Script=Greek}/gu) ?? []).length;

  if (greekCount === 0 && latinCount === 0) {
    return "unknown";
  }

  if (ratio >= 0.75) {
    return "el";
  }

  if (ratio <= 0.15) {
    return "en";
  }

  return "mixed";
}

export function detectLanguageAssessment(value: string, rationaleContext: string): LanguageAssessment {
  const normalized = normalizeExtractionText(value);
  const ratio = greekCharacterRatio(normalized);
  const language = detectLanguageCode(normalized);

  const confidence =
    language === "unknown"
      ? 0.3
      : language === "mixed"
        ? 0.72
        : ratio >= 0.85 || ratio <= 0.05
          ? 0.94
          : 0.84;

  const rationale =
    language === "el"
      ? `${rationaleContext} is predominantly Greek.`
      : language === "en"
        ? `${rationaleContext} is predominantly English or Latin-script.`
        : language === "mixed"
          ? `${rationaleContext} mixes Greek and English content.`
          : `${rationaleContext} did not contain enough language signal to classify confidently.`;

  return {
    language,
    confidence,
    rationale,
  };
}
