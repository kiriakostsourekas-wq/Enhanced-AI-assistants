import { assertSafeUrl } from "@/lib/antigravity/runtime/utils";

export type WebsiteProbeResult =
  | { ok: true; url: string; finalUrl: string; statusCode: number; domain: string }
  | { ok: false; url: string; reason: string };

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function fetchWithTimeout(url: string, method: "HEAD" | "GET", timeoutMs: number) {
  const { signal, clear } = timeoutSignal(timeoutMs);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      headers: {
        "user-agent": "Antigravity Discovery Bot/1.0 (+https://northline.ai)",
      },
      signal,
    });
  } finally {
    clear();
  }
}

export async function probeWebsite(url: string): Promise<WebsiteProbeResult> {
  try {
    assertSafeUrl(url);
  } catch (error) {
    return {
      ok: false,
      url,
      reason: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    let response = await fetchWithTimeout(url, "HEAD", 4_000);

    if (response.status === 405 || response.status === 403) {
      response = await fetchWithTimeout(url, "GET", 5_500);
    }

    if (!response.ok) {
      return {
        ok: false,
        url,
        reason: `HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      url,
      finalUrl: response.url,
      statusCode: response.status,
      domain: new URL(response.url).hostname.toLowerCase().replace(/^www\./, ""),
    };
  } catch (error) {
    return {
      ok: false,
      url,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
