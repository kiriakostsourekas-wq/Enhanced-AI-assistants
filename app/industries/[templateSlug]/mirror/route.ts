import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildClinicDemoProfile } from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";
import { getSiteContent, siteConfig } from "@/lib/site-content";

type MirrorRouteProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

export const runtime = "nodejs";

const NORTHLINE_ICON_PATH = "/favicon.svg";
const NORTHLINE_FAVICON_PATH = "/favicon.svg?v=2";
const NORTHLINE_DEMO_HOST = "northlineai.demo";

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

function replaceTitle(html: string, title: string) {
  const escapedTitle = escapeHtml(title);

  if (/<title>.*?<\/title>/i.test(html)) {
    return html.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle}</title>`);
  }

  return html.replace("<head>", `<head><title>${escapedTitle}</title>`);
}

function injectNorthlineFavicon(html: string) {
  if (/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i.test(html)) {
    return html.replace(
      /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i,
      `<link rel="icon" type="image/svg+xml" href="${NORTHLINE_FAVICON_PATH}" sizes="any">`,
    );
  }

  return html.replace(
    "<head>",
    `<head><link rel="icon" type="image/svg+xml" href="${NORTHLINE_FAVICON_PATH}" sizes="any">`,
  );
}

function scrubRawVendorBranding(html: string, profile?: Awaited<ReturnType<typeof buildClinicDemoProfile>>) {
  const brandName = siteConfig.brandName;
  const previewTail =
    profile?.businessName
      ? `Review the tailored preview prepared for ${profile.businessName}.`
      : "Review the tailored Northline preview.";

  return html
    .replace(/This is a demo site for/gi, "This is a preview site prepared by")
    .replace(/Please contact us to discuss our solution for your business/gi, previewTail)
    .replace(/Virtual Pros/gi, brandName)
    .replace(/virtualpros\.com/gi, NORTHLINE_DEMO_HOST);
}

function stripVendorChatPayload(html: string) {
  const escapedChatLoaderPattern = /\\u003Cscript[\s\S]*?(?:beta\.leadconnectorhq\.com\/loader\.js|chat-widget\/loader\.js|data-widget-id)[\s\S]*?\\u003C\/script>/gi;
  const literalChatLoaderPattern = /<script\b(?=[^>]*(?:beta\.leadconnectorhq\.com\/loader\.js|chat-widget\/loader\.js|data-widget-id))[\s\S]*?<\/script>/gi;

  return html
    .replace(escapedChatLoaderPattern, "")
    .replace(literalChatLoaderPattern, "");
}

function injectNorthlineBranding(html: string, profile?: Awaited<ReturnType<typeof buildClinicDemoProfile>>) {
  const brandName = siteConfig.brandName;
  const brandSubtitle = profile
    ? `Preview tailored for ${profile.businessName}`
    : "Northline demo preview";
  const scrubbedHeadline = profile
    ? `This is a preview site prepared by ${brandName} for ${profile.businessName}.`
    : `This is a preview site prepared by ${brandName}.`;
  const logoMarkup = `
<a class="northline-demo-wordmark" href="/" aria-label="${escapeHtml(brandName)}">
  <span class="northline-demo-wordmark-icon">
    <img alt="" height="40" src="${NORTHLINE_ICON_PATH}" width="40">
  </span>
  <span class="northline-demo-wordmark-copy">
    <strong>${escapeHtml(brandName)}</strong>
    <small>${escapeHtml(siteConfig.tagline)}</small>
  </span>
</a>`;

  const injectedMarkup = `
<style id="northline-demo-brand-style">
  #northline-demo-brand-hub {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: min(320px, calc(100vw - 36px));
    pointer-events: none;
  }

  #northline-demo-brand-hub > * {
    pointer-events: auto;
  }

  .northline-demo-brand-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 244, 238, 0.96)),
      radial-gradient(circle at top right, rgba(13, 102, 97, 0.16), transparent 38%);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
    color: #16202b;
    font: 13px/1.45 Inter, Arial, sans-serif;
  }

  .northline-demo-brand-card p {
    margin: 0;
    color: #4b5563;
  }

  .northline-demo-brand-card strong {
    color: #0f172a;
  }

  .northline-demo-brand-chip {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(13, 102, 97, 0.1);
    color: #0d6661;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .northline-demo-wordmark {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    text-decoration: none;
    color: inherit;
  }

  .branding .logo > :not(.northline-demo-wordmark) {
    display: none !important;
  }

  .northline-demo-wordmark-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 12px 24px rgba(14, 91, 94, 0.2);
  }

  .northline-demo-wordmark-icon img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .northline-demo-wordmark-copy {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .northline-demo-wordmark-copy strong {
    font-size: 0.98rem;
    letter-spacing: -0.02em;
  }

  .northline-demo-wordmark-copy small {
    color: #6b7280;
    font-size: 0.76rem;
  }

  @media (max-width: 820px) {
    #northline-demo-brand-hub {
      top: 12px;
      left: 12px;
      max-width: min(280px, calc(100vw - 24px));
    }

    .northline-demo-brand-card {
      padding: 10px 12px;
    }

    .northline-demo-wordmark-copy small,
    .northline-demo-brand-card p {
      font-size: 0.72rem;
    }
  }
</style>
<script id="northline-demo-brand-script">
  (() => {
    const brandName = ${JSON.stringify(brandName)};
    const brandDomain = ${JSON.stringify(NORTHLINE_DEMO_HOST)};
    const scrubbedHeadline = ${JSON.stringify(scrubbedHeadline)};
    const logoMarkup = ${JSON.stringify(logoMarkup)};
    const vendorPattern = /virtual\\s*pros|this is a demo site for|please contact us to discuss our solution|virtualpros\\.com|app\\.gohighlevel\\.com\\/v2\\/preview/gi;

    function scrubText(root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes = [];

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const value = node.nodeValue || "";

        if (vendorPattern.test(value)) {
          textNodes.push(node);
        }

        vendorPattern.lastIndex = 0;
      }

      for (const node of textNodes) {
        const original = node.nodeValue || "";
        let next = original;

        if (/this is a demo site for/i.test(original) || /please contact us to discuss our solution/i.test(original)) {
          next = scrubbedHeadline;
        } else {
          next = next
            .replace(/virtual\\s*pros/gi, brandName)
            .replace(/virtualpros\\.com/gi, brandDomain)
            .replace(/app\\.gohighlevel\\.com\\/v2\\/preview/gi, brandDomain);
        }

        if (next !== original) {
          node.nodeValue = next;
        }
      }
    }

    function replaceLogoSlots() {
      document.querySelectorAll(".branding .logo").forEach((slot) => {
        if (slot.querySelector(".northline-demo-wordmark")) {
          return;
        }

        slot.innerHTML = logoMarkup;
      });
    }

    function neutralizeVendorLinks() {
      document.querySelectorAll('a[href*="virtualpros.com"], a[href*="app.gohighlevel.com/v2/preview"]').forEach((anchor) => {
        if (anchor.classList.contains("northline-demo-wordmark")) {
          return;
        }

        anchor.setAttribute("href", "#");
        anchor.removeAttribute("target");
      });
    }

    function patchFavicon() {
      document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
        if (link.getAttribute("href") !== ${JSON.stringify(NORTHLINE_FAVICON_PATH)}) {
          link.setAttribute("href", ${JSON.stringify(NORTHLINE_FAVICON_PATH)});
          link.setAttribute("type", "image/svg+xml");
          link.setAttribute("sizes", "any");
        }
      });
    }

    function patchTitle() {
      const title = document.querySelector("title");

      if (!title) {
        return;
      }

      const original = title.textContent || "";
      const next = original
        .replace(/virtual\\s*pros/gi, brandName)
        .replace(/virtualpros\\.com/gi, brandDomain);

      if (next !== original) {
        title.textContent = next;
      }
    }

    function patch() {
      if (!document.body) {
        return;
      }

      replaceLogoSlots();
      neutralizeVendorLinks();
      patchFavicon();
      patchTitle();
      scrubText(document.body);
    }

    let frame = 0;
    function schedulePatch() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        patch();
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedulePatch, { once: true });
    } else {
      schedulePatch();
    }

    window.addEventListener("load", schedulePatch, { once: true });
    window.setTimeout(schedulePatch, 600);
    window.setTimeout(schedulePatch, 1800);

    const observer = new MutationObserver(schedulePatch);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 8000);
  })();
</script>
<div id="northline-demo-brand-hub">
  <div class="northline-demo-brand-card">
    <span class="northline-demo-brand-chip">Northline preview</span>
    ${logoMarkup}
    <p><strong>${escapeHtml(brandSubtitle)}</strong></p>
  </div>
</div>`;

  return html.replace("<body>", `<body>${injectedMarkup}`);
}

function injectLenaWidget(html: string, locale: "en" | "gr") {
  const siteContent = getSiteContent(locale);
  const widget = siteContent.widget;
  const ctaHref = siteContent.primaryCta.href;

  const widgetMarkup = `
<style id="northline-lena-widget-style">
  #northline-lena-widget-root {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 2147483646;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    pointer-events: none;
  }

  #northline-lena-widget-root > * {
    pointer-events: auto;
  }

  .northline-lena-launcher {
    display: inline-grid;
    place-items: center;
    width: 4.35rem;
    height: 4.35rem;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    background: linear-gradient(135deg, #2c8f67, #1f6f53);
    color: #ffffff;
    box-shadow: 0 24px 52px rgba(31, 111, 83, 0.3);
    cursor: pointer;
    transition:
      transform 180ms ease,
      opacity 180ms ease,
      box-shadow 180ms ease;
  }

  .northline-lena-launcher:hover {
    transform: translateY(-2px);
    box-shadow: 0 28px 62px rgba(31, 111, 83, 0.36);
  }

  .northline-lena-launcher.is-hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px);
  }

  .northline-lena-launcher svg {
    width: 1.78rem;
    height: 1.78rem;
  }

  .northline-lena-panel {
    position: fixed;
    right: 18px;
    bottom: 18px;
    width: min(24.5rem, calc(100vw - 24px));
    height: min(42rem, calc(100vh - 24px));
    opacity: 0;
    transform: translateY(28px);
    transform-origin: right bottom;
    pointer-events: none;
    transition:
      opacity 200ms ease,
      transform 200ms ease;
  }

  .northline-lena-panel.is-open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .northline-lena-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid #d9e3f2;
    background: #ffffff;
    box-shadow: 0 28px 80px rgba(20, 39, 68, 0.2);
  }

  .northline-lena-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.95rem;
    padding: 1rem;
    background: linear-gradient(135deg, #267b5d, #184d3b);
  }

  .northline-lena-avatar,
  .northline-lena-message-avatar {
    border-radius: 999px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .northline-lena-avatar {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(255, 255, 255, 0.22);
  }

  .northline-lena-message-avatar {
    width: 2.25rem;
    height: 2.25rem;
    margin-top: 0.18rem;
    border: 2px solid #ffffff;
    box-shadow: 0 10px 22px rgba(16, 31, 56, 0.12);
  }

  .northline-lena-avatar img,
  .northline-lena-message-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 16%;
    display: block;
  }

  .northline-lena-header-copy {
    min-width: 0;
    text-align: center;
  }

  .northline-lena-header-copy strong {
    display: block;
    color: #ffffff;
    font-size: 1.12rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .northline-lena-header-copy span {
    display: block;
    margin-top: 0.18rem;
    color: rgba(255, 255, 255, 0.76);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .northline-lena-collapse {
    position: relative;
    width: 2.4rem;
    height: 2.4rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    flex-shrink: 0;
  }

  .northline-lena-collapse span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.72rem;
    height: 2px;
    border-radius: 999px;
    background: #ffffff;
  }

  .northline-lena-collapse span:first-child {
    transform: translate(-78%, -32%) rotate(45deg);
  }

  .northline-lena-collapse span:last-child {
    transform: translate(-22%, -32%) rotate(-45deg);
  }

  .northline-lena-thread {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1rem;
    min-height: 0;
    overflow: auto;
    padding: 1.2rem 1rem 1rem;
    background: linear-gradient(180deg, #f4f8f5 0%, #ffffff 42%);
  }

  .northline-lena-row {
    display: flex;
    align-items: flex-end;
    gap: 0.72rem;
  }

  .northline-lena-row-user {
    justify-content: flex-end;
  }

  .northline-lena-message {
    max-width: min(84%, 18rem);
    padding: 0.98rem 1rem;
    border-radius: 22px;
  }

  .northline-lena-message-assistant {
    border: 1px solid #d9e4dc;
    border-bottom-left-radius: 10px;
    background: #edf4ef;
    color: #1d2b43;
  }

  .northline-lena-message-user {
    border-bottom-right-radius: 10px;
    background: linear-gradient(135deg, #2c8f67, #1f6f53);
    box-shadow: 0 14px 30px rgba(31, 111, 83, 0.18);
    color: #ffffff;
  }

  .northline-lena-message p {
    margin: 0;
    color: inherit;
    font-size: 0.97rem;
    line-height: 1.55;
  }

  .northline-lena-message-loading {
    min-width: 5rem;
  }

  .northline-lena-typing {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
  }

  .northline-lena-typing span {
    width: 0.44rem;
    height: 0.44rem;
    border-radius: 999px;
    background: #6d8577;
    animation: northline-lena-blink 1.2s infinite ease-in-out;
  }

  .northline-lena-typing span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .northline-lena-typing span:nth-child(3) {
    animation-delay: 0.3s;
  }

  .northline-lena-error {
    display: none;
    margin: 0 1rem 1rem;
    padding: 0.86rem 0.94rem;
    border: 1px solid #f2c8c3;
    border-radius: 18px;
    background: #fff2f0;
  }

  .northline-lena-error.is-visible {
    display: block;
  }

  .northline-lena-error strong {
    display: block;
    color: #ba4b42;
    font-size: 0.84rem;
  }

  .northline-lena-error p {
    margin: 0.35rem 0 0;
    color: #ba4b42;
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .northline-lena-cta {
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.78rem 1rem 0.88rem;
    border-top: 1px solid #e1eae4;
    background: rgba(255, 255, 255, 0.96);
  }

  .northline-lena-cta.is-visible {
    display: flex;
  }

  .northline-lena-cta span {
    color: #66766c;
    font-size: 0.82rem;
    line-height: 1.4;
  }

  .northline-lena-cta a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.45rem;
    padding: 0 0.95rem;
    border: 1px solid #d5e1d8;
    border-radius: 999px;
    background: #edf4ef;
    color: #184d3b;
    font-size: 0.84rem;
    font-weight: 700;
    white-space: nowrap;
    text-decoration: none;
  }

  .northline-lena-composer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.7rem;
    padding: 0 1rem 1rem;
    border-top: 1px solid #e1eae4;
    background: #ffffff;
  }

  .northline-lena-composer.has-cta {
    border-top: 0;
  }

  .northline-lena-composer.is-closed {
    background: linear-gradient(180deg, #ffffff 0%, #f7faf8 100%);
  }

  .northline-lena-input {
    width: 100%;
    min-height: 3.05rem;
    border: 1px solid #d5e1d8;
    border-radius: 18px;
    background: #ffffff;
    color: #1c2b43;
    padding: 0 1rem;
    outline: none;
    font: inherit;
  }

  .northline-lena-input::placeholder {
    color: #839287;
  }

  .northline-lena-input:disabled {
    border-color: #dbe5de;
    background: #f4f7f5;
    color: #7a897f;
    cursor: not-allowed;
  }

  .northline-lena-input:focus {
    border-color: #8ac0a3;
    box-shadow: 0 0 0 4px rgba(44, 143, 103, 0.12);
  }

  .northline-lena-send {
    min-width: 4.55rem;
    min-height: 3.05rem;
    padding: 0 1rem;
    border: none;
    border-radius: 18px;
    background: linear-gradient(135deg, #267b5d, #184d3b);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    letter-spacing: -0.02em;
    box-shadow: 0 12px 24px rgba(31, 111, 83, 0.2);
  }

  .northline-lena-send:disabled {
    opacity: 0.72;
    cursor: not-allowed;
    box-shadow: none;
  }

  @keyframes northline-lena-blink {
    0%, 80%, 100% {
      transform: scale(0.7);
      opacity: 0.55;
    }

    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 700px) {
    #northline-lena-widget-root,
    .northline-lena-panel {
      right: 12px;
      bottom: 12px;
    }

    .northline-lena-panel {
      width: min(24.5rem, calc(100vw - 24px));
      height: min(39rem, calc(100vh - 24px));
    }
  }
</style>
<div id="northline-lena-widget-root">
  <div class="northline-lena-panel" id="northline-lena-panel" aria-hidden="true">
    <div class="northline-lena-shell">
      <div class="northline-lena-header">
        <span class="northline-lena-avatar" aria-hidden="true">
          <img alt="" src="/lena-avatar.jpg">
        </span>
        <div class="northline-lena-header-copy">
          <strong>${escapeHtml(widget.headerTitle)}</strong>
          <span>Lena</span>
        </div>
        <button class="northline-lena-collapse" id="northline-lena-close" type="button" aria-label="${escapeHtml(widget.minimizeLabel)}">
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="northline-lena-thread" id="northline-lena-thread" aria-live="polite"></div>
      <div class="northline-lena-error" id="northline-lena-error">
        <strong>${escapeHtml(widget.connectionIssueTitle)}</strong>
        <p>${escapeHtml(widget.connectionIssueDescription)}</p>
      </div>
      <div class="northline-lena-cta" id="northline-lena-cta">
        <span>${escapeHtml(widget.ctaPrompt)}</span>
        <a href="${escapeHtml(ctaHref)}" id="northline-lena-cta-link">${escapeHtml(widget.ctaLabel)}</a>
      </div>
      <form class="northline-lena-composer" id="northline-lena-form">
        <label>
          <span class="sr-only">${escapeHtml(widget.inputLabel)}</span>
          <input
            class="northline-lena-input"
            id="northline-lena-input"
            name="northline-lena-message"
            type="text"
            autocomplete="off"
            placeholder="${escapeHtml(widget.inputPlaceholder)}"
          >
        </label>
        <button class="northline-lena-send" id="northline-lena-send" type="submit">${escapeHtml(widget.sendLabel)}</button>
      </form>
    </div>
  </div>
  <button
    class="northline-lena-launcher"
    id="northline-lena-launcher"
    type="button"
    aria-controls="northline-lena-panel"
    aria-expanded="false"
    aria-label="${escapeHtml(widget.launcherLabelClosed)}"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4.75c-4.418 0-8 3.09-8 6.902 0 2.292 1.296 4.323 3.288 5.577l-.54 3.021 2.95-1.626c.738.164 1.51.25 2.302.25 4.418 0 8-3.09 8-6.902s-3.582-6.902-8-6.902Z"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <circle cx="9" cy="11.75" r="1" fill="currentColor" />
      <circle cx="12" cy="11.75" r="1" fill="currentColor" />
      <circle cx="15" cy="11.75" r="1" fill="currentColor" />
    </svg>
    <span class="sr-only">${escapeHtml(widget.launcherLabelClosed)}</span>
  </button>
</div>
<script id="northline-lena-widget-script">
  (() => {
    const locale = ${JSON.stringify(locale)};
    const content = ${JSON.stringify(widget)};
    const initialCtaHref = ${JSON.stringify(ctaHref)};
    const initialAssistantMessage = ${JSON.stringify(widget.initialAssistantMessage)};
    const limitReachedMessage = ${JSON.stringify(widget.limitReachedMessage)};
    const maxUserMessages = 6;
    const historyLimit = 8;
    const openStateStorageKey = ${JSON.stringify(`northline-lena-mirror-open:${locale}`)};
    const sessionStorageKey = ${JSON.stringify(`northline-lena-mirror-session:${locale}`)};
    const vendorUrlPattern = /leadconnectorhq\\.com|virtualpros\\.com|chat-widget\\/loader\\.js/i;
    const vendorTextPattern = /powered by virtual pros|virtual pros/i;
    const launcher = document.getElementById("northline-lena-launcher");
    const panel = document.getElementById("northline-lena-panel");
    const thread = document.getElementById("northline-lena-thread");
    const form = document.getElementById("northline-lena-form");
    const input = document.getElementById("northline-lena-input");
    const send = document.getElementById("northline-lena-send");
    const errorBox = document.getElementById("northline-lena-error");
    const ctaRow = document.getElementById("northline-lena-cta");
    const ctaLink = document.getElementById("northline-lena-cta-link");
    const closeButton = document.getElementById("northline-lena-close");
    const state = {
      ctaHref: initialCtaHref,
      input: "",
      isOpen: false,
      isSubmitting: false,
      isConversationClosed: false,
      messages: [],
      error: null,
    };

    function removeVendorArtifacts() {
      document.querySelectorAll('script[src], iframe[src], [data-widget-id]').forEach((node) => {
        const value =
          node.getAttribute("src") ||
          node.getAttribute("data-resources-url") ||
          node.getAttribute("href") ||
          "";

        if (vendorUrlPattern.test(value)) {
          node.remove();
        }
      });

      document.querySelectorAll("a, button, div, span, p").forEach((node) => {
        const text = (node.textContent || "").replace(/\\s+/g, " ").trim();

        if (!text || !vendorTextPattern.test(text)) {
          return;
        }

        const fixedAncestor = node.closest('[style*="position: fixed"], [style*="position:fixed"]');
        if (fixedAncestor) {
          fixedAncestor.remove();
          return;
        }

        if (text.toLowerCase() === "powered by virtual pros") {
          node.remove();
        }
      });
    }

    function patchDomInsertions() {
      if (window.__northlineVendorPatchApplied) {
        return;
      }

      window.__northlineVendorPatchApplied = true;
      const originalAppendChild = Node.prototype.appendChild;
      const originalInsertBefore = Node.prototype.insertBefore;

      function shouldBlock(node) {
        if (!(node instanceof Element)) {
          return false;
        }

        const value =
          node.getAttribute("src") ||
          node.getAttribute("href") ||
          node.getAttribute("data-resources-url") ||
          "";

        if (vendorUrlPattern.test(value)) {
          return true;
        }

        return Boolean(node.querySelector?.('script[src*="leadconnectorhq"], iframe[src*="leadconnectorhq"], [data-widget-id]'));
      }

      Node.prototype.appendChild = function appendChild(node) {
        if (shouldBlock(node)) {
          return node;
        }

        return originalAppendChild.call(this, node);
      };

      Node.prototype.insertBefore = function insertBefore(node, child) {
        if (shouldBlock(node)) {
          return node;
        }

        return originalInsertBefore.call(this, node, child);
      };
    }

    function patchVendorAiButtons() {
      document.querySelectorAll("a, button").forEach((node) => {
        const text = (node.textContent || "").replace(/\\s+/g, " ").trim().toLowerCase();

        if (!text.includes("ai agent")) {
          return;
        }

        const mainHeading = node.querySelector(".main-heading-button");
        const subHeading = node.querySelector(".sub-heading-button");
        const nextLabel = locale === "gr" ? "Μιλήστε με τη Lena" : "Chat with Lena";
        const nextSubLabel = locale === "gr" ? "Άμεση συνομιλία με τη Northline" : "Live chat with Northline";

        if (mainHeading) {
          mainHeading.textContent = nextLabel;
        } else {
          node.textContent = nextLabel;
        }

        if (subHeading) {
          subHeading.textContent = nextSubLabel;
        }

        if (node.tagName === "A") {
          node.setAttribute("href", "#northline-lena");
          node.removeAttribute("target");
        }

        if (!node.dataset.northlineLenaBound) {
          node.dataset.northlineLenaBound = "true";
          node.addEventListener("click", (event) => {
            event.preventDefault();
            openWidget();
          });
        }
      });
    }

    function loadState() {
      try {
        const openState = window.sessionStorage.getItem(openStateStorageKey);
        state.isOpen = openState === "open";

        const raw = window.sessionStorage.getItem(sessionStorageKey);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        state.ctaHref = typeof parsed.ctaHref === "string" && parsed.ctaHref ? parsed.ctaHref : initialCtaHref;
        state.isConversationClosed = Boolean(parsed.isConversationClosed);
        state.messages = Array.isArray(parsed.messages) ? parsed.messages.filter((item) => {
          return item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string";
        }) : [];
      } catch {
        window.sessionStorage.removeItem(openStateStorageKey);
        window.sessionStorage.removeItem(sessionStorageKey);
      }
    }

    function persistState() {
      window.sessionStorage.setItem(openStateStorageKey, state.isOpen ? "open" : "closed");
      window.sessionStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
          ctaHref: state.ctaHref,
          isConversationClosed: state.isConversationClosed,
          messages: state.messages,
        }),
      );
    }

    function displayMessages() {
      return state.messages.length > 0 ? state.messages : [{ role: "assistant", content: initialAssistantMessage }];
    }

    function renderMessages() {
      const rows = displayMessages().map((message) => {
        const isAssistant = message.role === "assistant";
        return \`
          <div class="northline-lena-row northline-lena-row-\${message.role}">
            \${isAssistant ? '<span class="northline-lena-message-avatar" aria-hidden="true"><img alt="" src="/lena-avatar.jpg"></span>' : ""}
            <div class="northline-lena-message northline-lena-message-\${message.role}">
              <p>\${escapeHtmlHtml(message.content)}</p>
            </div>
          </div>
        \`;
      }).join("");

      const loadingRow = state.isSubmitting
        ? \`
          <div class="northline-lena-row northline-lena-row-assistant">
            <span class="northline-lena-message-avatar" aria-hidden="true"><img alt="" src="/lena-avatar.jpg"></span>
            <div class="northline-lena-message northline-lena-message-assistant northline-lena-message-loading">
              <div class="northline-lena-typing" aria-label="\${escapeHtmlHtml(content.typingLabel)}">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        \`
        : "";

      thread.innerHTML = rows + loadingRow;
      thread.scrollTop = thread.scrollHeight;
    }

    function renderError() {
      errorBox.classList.toggle("is-visible", Boolean(state.error));
      if (state.error) {
        const paragraph = errorBox.querySelector("p");
        if (paragraph) {
          paragraph.textContent = state.error;
        }
      } else {
        const paragraph = errorBox.querySelector("p");
        if (paragraph) {
          paragraph.textContent = content.connectionIssueDescription;
        }
      }
    }

    function renderCta() {
      const shouldShow = Boolean(state.ctaHref) && (state.messages.length > 1 || Boolean(state.error));
      ctaRow.classList.toggle("is-visible", shouldShow);
      ctaLink.setAttribute("href", state.ctaHref || initialCtaHref);
      ctaLink.textContent = content.ctaLabel;
    }

    function renderComposer() {
      input.value = state.input;
      input.disabled = state.isSubmitting || state.isConversationClosed;
      input.placeholder = state.isConversationClosed ? content.closedInputPlaceholder : content.inputPlaceholder;
      send.disabled = state.isSubmitting || state.isConversationClosed;
      send.textContent = state.isConversationClosed ? content.closedSendLabel : state.isSubmitting ? "..." : content.sendLabel;
      form.classList.toggle("has-cta", ctaRow.classList.contains("is-visible"));
      form.classList.toggle("is-closed", state.isConversationClosed);
    }

    function renderOpenState() {
      panel.classList.toggle("is-open", state.isOpen);
      panel.setAttribute("aria-hidden", String(!state.isOpen));
      launcher.classList.toggle("is-hidden", state.isOpen);
      launcher.setAttribute("aria-expanded", String(state.isOpen));
      launcher.setAttribute("aria-label", state.isOpen ? content.launcherLabelOpen : content.launcherLabelClosed);
    }

    function render() {
      renderOpenState();
      renderMessages();
      renderError();
      renderCta();
      renderComposer();
      persistState();
    }

    function openWidget() {
      state.isOpen = true;
      render();
    }

    function closeWidget() {
      state.isOpen = false;
      render();
    }

    function countUserMessages() {
      return state.messages.filter((message) => message.role === "user").length;
    }

    async function submitMessage(message) {
      const trimmed = message.trim();
      if (!trimmed || state.isSubmitting || state.isConversationClosed) {
        return;
      }

      const userMessage = { role: "user", content: trimmed };
      const nextUserMessageCount = countUserMessages() + 1;

      if (nextUserMessageCount >= maxUserMessages) {
        state.input = "";
        state.error = null;
        state.messages = [...state.messages, userMessage, { role: "assistant", content: limitReachedMessage }];
        state.isConversationClosed = true;
        render();
        return;
      }

      state.isSubmitting = true;
      state.error = null;
      state.input = "";
      state.messages = [...state.messages, userMessage];
      render();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locale,
            message: trimmed,
            history: state.messages.slice(0, -1).slice(-historyLimit),
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || !payload.ok) {
          throw new Error(payload?.ok === false ? payload.error.message : content.connectionIssueDescription);
        }

        state.ctaHref = payload.cta?.href || initialCtaHref;
        state.messages = [...state.messages, { role: "assistant", content: payload.reply }];
      } catch (error) {
        state.messages = state.messages.slice(0, -1);
        state.input = trimmed;
        state.error = error instanceof Error && error.message ? error.message : content.connectionIssueDescription;
      } finally {
        state.isSubmitting = false;
        render();
      }
    }

    function escapeHtmlHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    launcher.addEventListener("click", openWidget);
    closeButton.addEventListener("click", closeWidget);
    input.addEventListener("input", (event) => {
      state.input = event.currentTarget.value;
      persistState();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitMessage(input.value);
    });

    patchDomInsertions();
    loadState();
    removeVendorArtifacts();
    patchVendorAiButtons();
    render();
    window.openNorthlineLena = openWidget;

    const observer = new MutationObserver(() => {
      removeVendorArtifacts();
      patchVendorAiButtons();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 20000);
    window.setTimeout(removeVendorArtifacts, 1200);
    window.setTimeout(patchVendorAiButtons, 1200);
  })();
</script>`;

  return html.replace("</body>", `${widgetMarkup}</body>`);
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
  <span class="northline-overlay-kicker">Northline preview</span>
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
    html = injectNorthlineFavicon(html);

    const { searchParams } = new URL(request.url);
    const leadSlug = searchParams.get("lead");
    let matchedProfile: Awaited<ReturnType<typeof buildClinicDemoProfile>> | undefined;
    const widgetLocale: "en" | "gr" = leadSlug ? "gr" : "en";

    if (leadSlug) {
      try {
        const profile = await buildClinicDemoProfile(leadSlug);

        if (profile && profile.template.slug === template.slug) {
          matchedProfile = profile;
          html = injectLeadOverlay(html, profile);
        }
      } catch (error) {
        console.error(`Failed to build clinic demo profile for "${leadSlug}".`, error);
      }
    }

    html = scrubRawVendorBranding(html, matchedProfile);
    html = stripVendorChatPayload(html);
    html = injectNorthlineBranding(html, matchedProfile);
    html = injectLenaWidget(html, widgetLocale);
    html = replaceTitle(
      html,
      matchedProfile
        ? `${matchedProfile.businessName} Preview | ${siteConfig.brandName}`
        : `${template.title} Demo | ${siteConfig.brandName}`,
    );

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
