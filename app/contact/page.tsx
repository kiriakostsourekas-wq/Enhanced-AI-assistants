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
        description="Tell us about your current inquiry flow, response speed, and booking process. This local version keeps the form demo-friendly while showing the type of intake experience the business could use."
        eyebrow="Contact"
        highlights={siteConfig.contactExpectations}
        primaryAction={{ label: "Start Your Demo Request", href: "#demo-form" }}
        secondaryAction={{ label: "Back to homepage", href: "/" }}
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
