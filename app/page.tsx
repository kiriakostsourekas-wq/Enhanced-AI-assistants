import Link from "next/link";

import { DemoTemplateCard } from "@/components/demo-library/template-card";
import { ChatDemo } from "@/components/sections/chat-demo";
import { Reveal } from "@/components/ui/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { getTemplateCatalog } from "@/lib/demo-library/template-catalog";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

const DEMO_SECTION_COPY = {
  en: {
    eyebrow: "Core demo sites",
    title: "The website demos now live inside the main site.",
    description:
      "These are the read-only Virtual Pros website templates surfaced directly in Northline, so we can use them as the stable base for niche-specific sites with an integrated chatbot.",
    cardActionLabel: "Open template",
    featuredBadge: "Featured",
    useCaseBadge: "Core template",
    handlesLabel: "Built for",
    outcomeLabel: "Best fit",
    showsLabel: "Template direction",
  },
  gr: {
    eyebrow: "Βασικά demo sites",
    title: "Τα website demos υπάρχουν πλέον μέσα στο ίδιο το main site.",
    description:
      "Τα read-only website templates του Virtual Pros προβάλλονται πλέον απευθείας μέσα στη Northline, ώστε να λειτουργούν ως σταθερή βάση για niche-specific sites με ενσωματωμένο chatbot.",
    cardActionLabel: "Άνοιγμα template",
    featuredBadge: "Προτεινόμενο",
    useCaseBadge: "Core template",
    handlesLabel: "Κατάλληλο για",
    outcomeLabel: "Καλύτερη χρήση",
    showsLabel: "Κατεύθυνση template",
  },
} as const;

export default async function HomePage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);
  const demoSectionCopy = DEMO_SECTION_COPY[locale];
  const templates = await getTemplateCatalog();
  const featuredTemplates = templates.filter((template) => template.featured);
  const primaryTemplate = featuredTemplates[0] ?? templates[0];
  const supportingTemplates = featuredTemplates.slice(1, 3);
  const testimonial = siteContent.testimonials[1];
  const primaryCtaHref = siteContent.primaryCta.href;

  return (
    <>
      <section className="section hero hero-commercial">
        <div className="container hero-commercial-grid">
          <Reveal className="hero-commercial-copy">
            <span className="hero-kicker">{siteContent.hero.kicker}</span>
            <span className="eyebrow">{siteContent.hero.eyebrow}</span>
            <h1>{siteContent.hero.headline}</h1>
            <p className="hero-description">{siteContent.hero.description}</p>
            <p className="hero-supporting-line">{siteContent.hero.audienceLine}</p>

            <div className="hero-actions">
              <Link className="button button-primary button-strong" href={primaryCtaHref}>
                {siteContent.hero.primaryActionLabel}
              </Link>
              <Link className="button button-secondary hero-secondary-link" href={siteContent.hero.secondaryActionHref}>
                {siteContent.hero.secondaryActionLabel}
              </Link>
            </div>

            <div className="hero-scan-points">
              {siteContent.hero.scanPoints.map((point) => (
                <span className="hero-scan-chip" key={point}>
                  {point}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="hero-commercial-demo" delay={0.08}>
            <ChatDemo content={siteContent.chatDemo} />
          </Reveal>
        </div>
      </section>

      <section className="section section-contrast home-problem-section">
        <div className="container home-problem-layout">
          <Reveal>
            <SectionIntro
              eyebrow={siteContent.homepage.problem.eyebrow}
              title={siteContent.homepage.problem.title}
              description={siteContent.homepage.problem.description}
            />
          </Reveal>

          <Reveal className="problem-summary-card card" delay={0.08}>
            {siteContent.painPoints.map((item, index) => (
              <div className="problem-summary-item" key={item.title}>
                <span className="problem-summary-index">0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-dark home-solution-section" id="home-process">
        <div className="container home-solution-layout">
          <Reveal className="home-solution-copy">
            <SectionIntro
              eyebrow={siteContent.homepage.solution.eyebrow}
              title={siteContent.homepage.solution.title}
              description={siteContent.homepage.solution.description}
            />

            <div className="solution-list">
              {siteContent.solutionPoints.slice(0, 3).map((item) => (
                <div className="solution-list-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>

            <div className="section-actions left-aligned home-mid-cta">
              <Link className="button button-primary" href={primaryCtaHref}>
                {siteContent.homepage.solution.ctaLabel}
              </Link>
            </div>
          </Reveal>

          <Reveal className="flow-panel card" delay={0.08}>
            <span className="panel-label">{siteContent.homepage.solution.processPanelLabel}</span>
            <div className="flow-step-list">
              {siteContent.processSteps.map((step) => (
                <div className="flow-step-row" key={step.number}>
                  <span className="flow-step-number">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section home-demo-section" id="real-scenarios">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow={demoSectionCopy.eyebrow}
              title={demoSectionCopy.title}
              description={demoSectionCopy.description}
            />
          </Reveal>

          <div className="home-demo-stage">
            {primaryTemplate ? (
              <DemoTemplateCard
                actionLabel={demoSectionCopy.cardActionLabel}
                badge={demoSectionCopy.featuredBadge}
                delay={0.04}
                featured
                handlesLabel={demoSectionCopy.handlesLabel}
                href={primaryTemplate.pageHref}
                outcomeLabel={demoSectionCopy.outcomeLabel}
                showsLabel={demoSectionCopy.showsLabel}
                template={primaryTemplate}
              />
            ) : null}

            <div className="home-demo-stack">
              {supportingTemplates.map((template, index) => (
                <DemoTemplateCard
                  actionLabel={demoSectionCopy.cardActionLabel}
                  badge={demoSectionCopy.useCaseBadge}
                  delay={0.1 + index * 0.05}
                  handlesLabel={demoSectionCopy.handlesLabel}
                  href={template.pageHref}
                  key={template.slug}
                  outcomeLabel={demoSectionCopy.outcomeLabel}
                  showsLabel={demoSectionCopy.showsLabel}
                  template={template}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-contrast home-proof-section">
        <div className="container home-proof-layout">
          <Reveal>
            <SectionIntro
              eyebrow={siteContent.homepage.proof.eyebrow}
              title={siteContent.homepage.proof.title}
              description={siteContent.homepage.proof.description}
            />

            <div className="trust-point-list">
              {siteContent.credibilityPoints.map((item) => (
                <div className="trust-point" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="trust-results-card card" delay={0.08}>
            <span className="panel-label">{siteContent.homepage.proof.resultsTitle}</span>
            <h3>{siteContent.homepage.proof.resultsDescription}</h3>

            <div className="trust-benefit-list">
              {siteContent.benefits.map((benefit) => (
                <div className="trust-benefit-row" key={benefit.title}>
                  <strong>{benefit.title}</strong>
                  <span>{benefit.copy}</span>
                </div>
              ))}
            </div>

            <div className="trust-quote-block">
              <p>“{testimonial.quote}”</p>
              <div className="quote-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>

            <div className="section-actions left-aligned home-proof-cta">
              <Link className="button button-primary" href={primaryCtaHref}>
                {siteContent.homepage.proof.ctaLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-banner card cta-banner-tight">
            <div>
              <span className="eyebrow">{siteContent.homepage.finalCta.eyebrow}</span>
              <h2>{siteContent.homepage.finalCta.title}</h2>
              <p>{siteContent.homepage.finalCta.description}</p>
            </div>
            <div className="cta-actions">
              <Link className="button button-primary" href={primaryCtaHref}>
                {siteContent.homepage.finalCta.buttonLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
