import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildClinicDemoProfile } from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type MirrorRouteProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectBaseHref(html: string, baseHref: string) {
  if (html.includes("<base ")) {
    return html;
  }

  return html.replace("<head>", `<head><base href="${baseHref}">`);
}

function injectLeadOverlay(html: string, profile: Awaited<ReturnType<typeof buildClinicDemoProfile>>) {
  if (!profile) {
    return html;
  }

  const contactMarkup = profile.contactItems
    .slice(0, 3)
    .map((item) =>
      item.href
        ? `<a href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}: ${escapeHtml(item.value)}</a>`
        : `<span>${escapeHtml(item.label)}: ${escapeHtml(item.value)}</span>`,
    )
    .join("");
  const chipMarkup = profile.overlayChips.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  const serviceMarkup = profile.overlayServices.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const overlayMarkup = `
<style id="northline-template-overlay-style">
  #northline-template-overlay {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 2147483647;
    width: min(360px, calc(100vw - 36px));
    padding: 16px 16px 14px;
    border-radius: 20px;
    border: 1px solid rgba(15, 23, 42, 0.16);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 247, 241, 0.95)),
      radial-gradient(circle at top right, rgba(14, 91, 94, 0.12), transparent 35%);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
    color: #16202b;
    font: 13px/1.45 Inter, Arial, sans-serif;
  }

  #northline-template-overlay strong,
  #northline-template-overlay b {
    color: #0f172a;
  }

  #northline-template-overlay .northline-overlay-kicker {
    display: block;
    margin-bottom: 6px;
    color: #0e5b5e;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  #northline-template-overlay h1 {
    margin: 0;
    font-size: 20px;
    line-height: 1.05;
  }

  #northline-template-overlay p {
    margin: 10px 0 0;
    color: #415061;
  }

  #northline-template-overlay .northline-overlay-chips,
  #northline-template-overlay .northline-overlay-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  #northline-template-overlay .northline-overlay-chips span,
  #northline-template-overlay .northline-overlay-links span,
  #northline-template-overlay .northline-overlay-links a {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(14, 91, 94, 0.08);
    color: #16353d;
    text-decoration: none;
    font-weight: 600;
  }

  #northline-template-overlay ul {
    margin: 12px 0 0;
    padding-left: 18px;
  }

  #northline-template-overlay li + li {
    margin-top: 4px;
  }
</style>
<div id="northline-template-overlay">
  <span class="northline-overlay-kicker">Northline clinic layer</span>
  <h1>${escapeHtml(profile.businessName)}</h1>
  <p>${escapeHtml(profile.summary)}</p>
  <div class="northline-overlay-chips">${chipMarkup}</div>
  ${contactMarkup ? `<div class="northline-overlay-links">${contactMarkup}</div>` : ""}
  ${serviceMarkup ? `<ul>${serviceMarkup}</ul>` : ""}
</div>`;

  return html.replace("<body>", `<body>${overlayMarkup}`);
}

export async function GET(request: Request, { params }: MirrorRouteProps) {
  const resolvedParams = await params;
  const template = await getTemplateBySlug(resolvedParams.templateSlug);

  if (!template) {
    return new Response("Template not found.", { status: 404 });
  }

  const htmlPath = path.join(process.cwd(), "virtualprosmax", template.slug, "mirror", "index.html");

  try {
    let html = await readFile(htmlPath, "utf8");
    html = injectBaseHref(html, `/industries/${template.slug}/mirror/`);

    const { searchParams } = new URL(request.url);
    const leadSlug = searchParams.get("lead");

    if (leadSlug) {
      try {
        const profile = await buildClinicDemoProfile(leadSlug);

        if (profile && profile.template.slug === template.slug) {
          html = injectLeadOverlay(html, profile);
          html = html.replace("<title>", `<title>${escapeHtml(profile.businessName)} | `);
        }
      } catch (error) {
        console.error(`Failed to build clinic demo profile for "${leadSlug}".`, error);
      }
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new Response("Mirror not found.", { status: 404 });
    }

    throw error;
  }
}
