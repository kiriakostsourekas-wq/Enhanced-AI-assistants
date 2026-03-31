import type { SitePageType } from "@/lib/antigravity/schemas";

type Classification = {
  pageType: SitePageType;
  confidence: number;
  score: number;
};

const PAGE_TYPE_KEYWORDS: Record<Exclude<SitePageType, "generic">, RegExp[]> = {
  homepage: [/^\/?$/i, /\bhome\b/i],
  about: [/\babout\b/i, /\bprofile\b/i, /\bclinic\b/i, /\bdoctor\b/i, /\bbiography\b/i, /βιογρ/i, /σχετικ/i],
  services: [/\bservices?\b/i, /\btreatments?\b/i, /\bprocedures?\b/i, /\bspecialt/i, /\btherapy\b/i, /υπηρεσ/i],
  contact: [/\bcontact\b/i, /\bfind us\b/i, /\blocation\b/i, /\baddress\b/i, /\bmap\b/i, /επικοινων/i],
  booking: [/\bbook\b/i, /\bappointment\b/i, /\bschedule\b/i, /\breserve\b/i, /ραντεβ/i],
  team: [/\bteam\b/i, /\bdoctors?\b/i, /\bphysicians?\b/i, /\bstaff\b/i, /\bsurgeons?\b/i],
  faq: [/\bfaq\b/i, /\bquestions?\b/i, /\bq&a\b/i, /\bsupport\b/i, /συχν/i],
};

const PAGE_TYPE_BONUS: Record<Exclude<SitePageType, "generic">, number> = {
  homepage: 8,
  about: 6,
  services: 7,
  contact: 7,
  booking: 8,
  team: 6,
  faq: 5,
};

function scoreText(pageType: Exclude<SitePageType, "generic">, haystack: string) {
  return PAGE_TYPE_KEYWORDS[pageType].reduce((score, pattern) => score + (pattern.test(haystack) ? 1 : 0), 0);
}

function clampConfidence(score: number) {
  if (score >= 6) {
    return 0.95;
  }

  if (score >= 4) {
    return 0.88;
  }

  if (score >= 2) {
    return 0.74;
  }

  return 0.55;
}

export function classifyPage(args: {
  url: string;
  title?: string;
  h1?: string;
  text?: string;
  hint?: SitePageType;
}): Classification {
  const parsedUrl = new URL(args.url);
  const normalizedParts = [parsedUrl.pathname, parsedUrl.search, args.title, args.h1, args.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
    return {
      pageType: args.hint && args.hint !== "generic" ? args.hint : "homepage",
      confidence: args.hint && args.hint !== "generic" ? 0.85 : 0.96,
      score: 10,
    };
  }

  const candidates = (Object.keys(PAGE_TYPE_KEYWORDS) as Array<Exclude<SitePageType, "generic">>).map((pageType) => {
    const textScore = scoreText(pageType, normalizedParts);
    const hintBonus = args.hint === pageType ? 2 : 0;
    const pathBonus = PAGE_TYPE_KEYWORDS[pageType].some((pattern) => pattern.test(parsedUrl.pathname)) ? PAGE_TYPE_BONUS[pageType] : 0;
    const score = textScore + hintBonus + pathBonus;
    return {
      pageType,
      score,
    };
  });

  candidates.sort((left, right) => right.score - left.score);
  const top = candidates[0];

  if (!top || top.score <= 0) {
    return {
      pageType: args.hint ?? "generic",
      confidence: args.hint && args.hint !== "generic" ? 0.62 : 0.58,
      score: 0,
    };
  }

  return {
    pageType: top.pageType,
    confidence: clampConfidence(top.score),
    score: top.score,
  };
}

export function scoreCandidateLink(args: { href: string; label?: string }): Classification {
  return classifyPage({
    url: args.href,
    title: args.label,
  });
}
