export const LOCALE_COOKIE_NAME = "northline-locale";
export const SUPPORTED_LOCALES = ["en", "gr"] as const;
export const DEFAULT_LOCALE = "en";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "gr" ? "gr" : DEFAULT_LOCALE;
}

export function getHtmlLang(locale: Locale) {
  return locale === "gr" ? "el" : "en";
}
