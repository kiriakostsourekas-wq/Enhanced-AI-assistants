import type { Metadata } from "next";

import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Book Demo",
  description:
    "Book a demo to review your current inquiry flow, booking friction, and how Northline could help turn more leads into appointments.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        description="Book directly on the calendar or send a short inquiry through the form below. Northline is starting in Greece and focused on appointment-based businesses that want more inquiries turning into appointments."
        eyebrow="Contact"
        highlights={siteConfig.contactExpectations}
        primaryAction={{ label: "Book Instantly on Calendly", href: siteConfig.primaryCta.href }}
        secondaryAction={{ label: "Use inquiry form", href: "#demo-form" }}
        title="Book a demo and review where more appointments could be won"
      />

      <section className="section" id="demo-form">
        <div className="container">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
