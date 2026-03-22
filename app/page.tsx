import Link from "next/link";

import { ChatDemo } from "@/components/sections/chat-demo";
import { Reveal } from "@/components/ui/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { siteConfig } from "@/lib/site-content";

const featuredDemoTitles = new Set<string>(siteConfig.homepage.demos.featuredTitles);

const featuredDemos = siteConfig.aiDemos.filter((demo) => featuredDemoTitles.has(demo.title));
const primaryDemo = featuredDemos[0];
const supportingDemos = featuredDemos.slice(1);
const testimonial = siteConfig.testimonials[1];

export default function HomePage() {
  return (
    <>
      <section className="section hero hero-commercial">
        <div className="container hero-commercial-grid">
          <Reveal className="hero-commercial-copy">
            <span className="hero-kicker">{siteConfig.hero.kicker}</span>
            <span className="eyebrow">AI booking systems for service businesses</span>
            <h1>{siteConfig.hero.headline}</h1>
            <p className="hero-description">{siteConfig.hero.description}</p>

            <div className="hero-actions">
              <Link className="button button-primary button-strong" href={siteConfig.primaryCta.href}>
                {siteConfig.primaryCta.label}
              </Link>
              <Link className="button button-secondary" href={siteConfig.secondaryCta.href}>
                {siteConfig.secondaryCta.label}
              </Link>
            </div>

            <p className="hero-supporting-line">{siteConfig.hero.audienceLine}</p>

            <div className="hero-scan-points">
              {siteConfig.hero.scanPoints.map((point) => (
                <span className="hero-scan-chip" key={point}>
                  {point}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="hero-commercial-demo" delay={0.08}>
            <ChatDemo />
          </Reveal>
        </div>
      </section>

      <section className="section section-contrast home-problem-section">
        <div className="container home-problem-layout">
          <Reveal>
            <SectionIntro
              eyebrow={siteConfig.homepage.problem.eyebrow}
              title={siteConfig.homepage.problem.title}
              description={siteConfig.homepage.problem.description}
            />
          </Reveal>

          <Reveal className="problem-summary-card card" delay={0.08}>
            {siteConfig.painPoints.map((item, index) => (
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

      <section className="section section-dark home-solution-section">
        <div className="container home-solution-layout">
          <Reveal className="home-solution-copy">
            <SectionIntro
              eyebrow={siteConfig.homepage.solution.eyebrow}
              title={siteConfig.homepage.solution.title}
              description={siteConfig.homepage.solution.description}
            />

            <div className="solution-list">
              {siteConfig.solutionPoints.slice(0, 3).map((item) => (
                <div className="solution-list-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>

            <div className="section-actions left-aligned home-mid-cta">
              <Link className="button button-primary" href={siteConfig.primaryCta.href}>
                Book a Demo
              </Link>
            </div>
          </Reveal>

          <Reveal className="flow-panel card" delay={0.08}>
            <span className="panel-label">How it works</span>
            <div className="flow-step-list">
              {siteConfig.processSteps.map((step) => (
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

      <section className="section home-demo-section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow={siteConfig.homepage.demos.eyebrow}
              title={siteConfig.homepage.demos.title}
              description={siteConfig.homepage.demos.description}
            />
          </Reveal>

          <div className="home-demo-stage">
            {primaryDemo ? (
              <Reveal className="demo-card card demo-card-featured" delay={0.04}>
                <div className="demo-card-top">
                  <div>
                    <h3>{primaryDemo.title}</h3>
                    <p className="demo-audience">{primaryDemo.audience}</p>
                  </div>
                  <span className="demo-badge">Featured</span>
                </div>
                <p>{primaryDemo.summary}</p>
                <div className="demo-chip-list">
                  {primaryDemo.handles.map((item) => (
                    <span className="mini-pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <strong className="demo-outcome">{primaryDemo.outcome}</strong>
              </Reveal>
            ) : null}

            <div className="home-demo-stack">
              {supportingDemos.map((demo, index) => (
                <Reveal className="demo-card card" delay={0.1 + index * 0.05} key={demo.title}>
                  <div className="demo-card-top">
                    <div>
                      <h3>{demo.title}</h3>
                      <p className="demo-audience">{demo.audience}</p>
                    </div>
                    <span className="demo-badge">Use Case</span>
                  </div>
                  <p>{demo.summary}</p>
                  <div className="demo-chip-list">
                    {demo.handles.map((item) => (
                      <span className="mini-pill" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <strong className="demo-outcome">{demo.outcome}</strong>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-contrast home-proof-section">
        <div className="container home-proof-layout">
          <Reveal>
            <SectionIntro
              eyebrow={siteConfig.homepage.proof.eyebrow}
              title={siteConfig.homepage.proof.title}
              description={siteConfig.homepage.proof.description}
            />

            <div className="trust-point-list">
              {siteConfig.credibilityPoints.map((item) => (
                <div className="trust-point" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="trust-results-card card" delay={0.08}>
            <span className="panel-label">{siteConfig.homepage.proof.resultsTitle}</span>
            <h3>{siteConfig.homepage.proof.resultsDescription}</h3>

            <div className="trust-benefit-list">
              {siteConfig.benefits.map((benefit) => (
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
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-banner card cta-banner-tight">
            <div>
              <span className="eyebrow">{siteConfig.homepage.finalCta.eyebrow}</span>
              <h2>{siteConfig.homepage.finalCta.title}</h2>
              <p>{siteConfig.homepage.finalCta.description}</p>
            </div>
            <div className="cta-actions">
              <Link className="button button-primary" href={siteConfig.primaryCta.href}>
                Book a Demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
