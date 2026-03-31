import { createHash } from "node:crypto";
import type { FactSource } from "@/lib/antigravity/schemas";

function isPrivateIpv4(hostname: string) {
  return (
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

export function assertSafeUrl(url: string) {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported crawl protocol: ${parsed.protocol}`);
  }

  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    isPrivateIpv4(hostname)
  ) {
    throw new Error(`Unsafe crawl target: ${hostname}`);
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function nowIso() {
  return new Date().toISOString();
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || undefined;
}

export function extractMetaDescription(html: string) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() || undefined;
}

export function extractLinks(html: string, baseUrl: string) {
  const results: Array<{ href: string; label?: string }> = [];
  const matches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);

  for (const match of matches) {
    const rawHref = match[1]?.trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      continue;
    }

    try {
      const href = new URL(rawHref, baseUrl).toString();
      const label = match[2]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined;
      results.push({ href, label });
    } catch {
      continue;
    }
  }

  return results.slice(0, 50);
}

export function buildFactSource(partial: Omit<FactSource, "retrievedAt"> & { retrievedAt?: string }): FactSource {
  return {
    ...partial,
    retrievedAt: partial.retrievedAt ?? nowIso(),
  };
}
