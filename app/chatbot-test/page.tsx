import type { Metadata } from "next";
import Link from "next/link";

import { ChatbotTestPanel } from "@/components/sections/chatbot-test-panel";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Chatbot Test",
  description: "Local test page for the website chatbot backend and OpenAI integration.",
};

export default async function ChatbotTestPage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <>
      <PageHero
        description={siteContent.chatbotTestPage.hero.description}
        eyebrow={siteContent.chatbotTestPage.hero.eyebrow}
        highlights={siteContent.chatbotTestPage.hero.highlights}
        panelLabel={siteContent.common.includedInApproachLabel}
        primaryAction={{ label: siteContent.primaryCta.label, href: siteContent.primaryCta.href }}
        secondaryAction={siteContent.chatbotTestPage.hero.secondaryAction}
        title={siteContent.chatbotTestPage.hero.title}
      />

      <section className="section">
        <div className="container chatbot-test-shell">
          <Reveal className="card chatbot-test-panel-card">
            <ChatbotTestPanel content={siteContent.chatbotTestPanel} />
          </Reveal>

          <Reveal className="card chatbot-test-side-card" delay={0.08}>
            <p className="panel-label">{siteContent.chatbotTestPage.sideCard.panelLabel}</p>
            <h2>{siteContent.chatbotTestPage.sideCard.title}</h2>
            <p>{siteContent.chatbotTestPage.sideCard.description}</p>

            <div className="detail-stack">
              <div>
                <strong>{siteContent.chatbotTestPage.sideCard.apiRouteTitle}</strong>
                <p>{siteContent.chatbotTestPage.sideCard.apiRouteBody}</p>
              </div>
              <div>
                <strong>{siteContent.chatbotTestPage.sideCard.knowledgeSourceTitle}</strong>
                <p>{siteContent.chatbotTestPage.sideCard.knowledgeSourceBody}</p>
              </div>
              <div>
                <strong>{siteContent.chatbotTestPage.sideCard.demoCtaTitle}</strong>
                <p>{siteContent.chatbotTestPage.sideCard.demoCtaBody}</p>
              </div>
            </div>

            <div className="chatbot-test-side-actions">
              <Link className="button button-primary" href={siteContent.primaryCta.href}>
                {siteContent.chatbotTestPage.sideCard.ctaLabel}
              </Link>
              <Link className="button button-secondary" href="/">
                {siteContent.chatbotTestPage.sideCard.backHomeLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
