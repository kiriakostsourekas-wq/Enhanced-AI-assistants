import type { Metadata } from "next";

import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Book Demo",
  description:
    "Book a demo to review your current inquiry flow, booking friction, and how Northline could help turn more leads into appointments.",
};

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <>
      <PageHero
        description={siteContent.contactPage.hero.description}
        eyebrow={siteContent.contactPage.hero.eyebrow}
        highlights={siteContent.contactExpectations}
        panelLabel={siteContent.common.includedInApproachLabel}
        primaryAction={{ label: siteContent.contactPage.hero.primaryActionLabel, href: siteContent.primaryCta.href }}
        secondaryAction={{ label: siteContent.contactPage.hero.secondaryActionLabel, href: "#demo-form" }}
        title={siteContent.contactPage.hero.title}
      />

      <section className="section" id="demo-form">
        <div className="container">
          <Reveal>
            <ContactForm content={siteContent.contactForm} locale={locale} primaryCtaHref={siteContent.primaryCta.href} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
