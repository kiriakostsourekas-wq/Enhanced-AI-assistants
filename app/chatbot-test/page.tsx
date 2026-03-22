import type { Metadata } from "next";
import Link from "next/link";

import { ChatbotTestPanel } from "@/components/sections/chatbot-test-panel";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Chatbot Test",
  description: "Local test page for the website chatbot backend and OpenAI integration.",
};

export default function ChatbotTestPage() {
  return (
    <>
      <PageHero
        description="This page is a simple local test harness for the chatbot backend. It sends real requests to the local API route and uses the knowledge pack on the server."
        eyebrow="Local chatbot test"
        highlights={[
          "Calls the real /api/chat route",
          "Uses knowledge-pack.md on the server",
          "Keeps API keys server-side only",
        ]}
        primaryAction={{ label: siteConfig.primaryCta.label, href: siteConfig.primaryCta.href }}
        secondaryAction={{ label: "View solutions", href: "/solutions" }}
        title="Test the chatbot backend locally"
      />

      <section className="section">
        <div className="container chatbot-test-shell">
          <Reveal className="card chatbot-test-panel-card">
            <ChatbotTestPanel />
          </Reveal>

          <Reveal className="card chatbot-test-side-card" delay={0.08}>
            <p className="panel-label">What this V1 does</p>
            <h2>Business-aware replies with a clean local backend.</h2>
            <p>
              The assistant answers questions about the offer, stays within the knowledge pack, and
              can guide relevant visitors toward booking a demo.
            </p>

            <div className="detail-stack">
              <div>
                <strong>API route</strong>
                <p>
                  POST requests go to <code>/api/chat</code> with the latest message and optional
                  history.
                </p>
              </div>
              <div>
                <strong>Knowledge source</strong>
                <p>
                  Server-side business context is loaded from <code>knowledge-pack.md</code>.
                </p>
              </div>
              <div>
                <strong>Demo CTA</strong>
                <p>
                  The response includes a booking CTA using <code>NEXT_PUBLIC_DEMO_URL</code>.
                </p>
              </div>
            </div>

            <div className="chatbot-test-side-actions">
              <Link className="button button-primary" href={siteConfig.primaryCta.href}>
                Book a Demo
              </Link>
              <Link className="button button-secondary" href="/">
                Back to Home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
