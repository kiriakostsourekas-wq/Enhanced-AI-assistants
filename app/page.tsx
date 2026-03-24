import Link from "next/link";

import { ChatDemo } from "@/components/sections/chat-demo";
import { Reveal } from "@/components/ui/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent, type SiteContent } from "@/lib/site-content";

type HomeDemo = SiteContent["aiDemos"][number];

function HomeDemoCard({
  cardActionLabel,
  demoLinkHref,
  demo,
  badge,
  delay,
  featured = false,
  handlesLabel,
  outcomeLabel,
  showsLabel,
}: {
  cardActionLabel: string;
  demoLinkHref: string;
  demo: HomeDemo;
  badge: string;
  delay: number;
  featured?: boolean;
  handlesLabel: string;
  outcomeLabel: string;
  showsLabel: string;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        aria-label={`${cardActionLabel}: ${demo.title}`}
        className={`demo-card card demo-card-link${featured ? " demo-card-featured" : ""}`}
        href={demoLinkHref}
      >
        <div className="demo-card-top">
          <div>
            <h3>{demo.title}</h3>
            <p className="demo-audience">{demo.audience}</p>
          </div>
          <span className="demo-badge">{badge}</span>
        </div>

        <div className="demo-card-body">
          <div>
            <span className="demo-card-label">{showsLabel}</span>
            <p>{demo.summary}</p>
          </div>

          <div>
            <span className="demo-card-label">{handlesLabel}</span>
            <div className="demo-chip-list">
              {demo.handles.map((item) => (
                <span className="mini-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="demo-card-footer">
          <div>
            <span className="demo-card-label">{outcomeLabel}</span>
            <strong className="demo-outcome">{demo.outcome}</strong>
          </div>
          <span className="demo-card-action">{cardActionLabel}</span>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);
  const featuredDemoTitles = new Set<string>(siteContent.homepage.demos.featuredTitles);
  const featuredDemos = siteContent.aiDemos.filter((demo) => featuredDemoTitles.has(demo.title));
  const primaryDemo = featuredDemos[0];
  const supportingDemos = featuredDemos.slice(1);
  const testimonial = siteContent.testimonials[1];
  const primaryCtaHref = siteContent.primaryCta.href;
  const demoLinkHref = siteContent.homepage.demos.linkHref;

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
              eyebrow={siteContent.homepage.demos.eyebrow}
              title={siteContent.homepage.demos.title}
              description={siteContent.homepage.demos.description}
            />
          </Reveal>

          <div className="home-demo-stage">
            {primaryDemo ? (
              <HomeDemoCard
                badge={siteContent.homepage.demos.featuredBadge}
                cardActionLabel={siteContent.homepage.demos.cardActionLabel}
                delay={0.04}
                demo={primaryDemo}
                demoLinkHref={demoLinkHref}
                featured
                handlesLabel={siteContent.homepage.demos.handlesLabel}
                outcomeLabel={siteContent.homepage.demos.outcomeLabel}
                showsLabel={siteContent.homepage.demos.showsLabel}
              />
            ) : null}

            <div className="home-demo-stack">
              {supportingDemos.map((demo, index) => (
                <HomeDemoCard
                  badge={siteContent.homepage.demos.useCaseBadge}
                  cardActionLabel={siteContent.homepage.demos.cardActionLabel}
                  delay={0.1 + index * 0.05}
                  demo={demo}
                  demoLinkHref={demoLinkHref}
                  handlesLabel={siteContent.homepage.demos.handlesLabel}
                  key={demo.title}
                  outcomeLabel={siteContent.homepage.demos.outcomeLabel}
                  showsLabel={siteContent.homepage.demos.showsLabel}
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
