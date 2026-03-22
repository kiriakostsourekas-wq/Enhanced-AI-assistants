import Link from "next/link";

import { ChatDemo } from "@/components/sections/chat-demo";
import { Reveal } from "@/components/ui/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { siteConfig } from "@/lib/site-content";

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

      <section className="section section-contrast">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="The problem"
              title="Where your business loses bookings"
              description="Most lost bookings happen after the inquiry arrives."
            />
          </Reveal>
          <div className="pain-grid">
            {siteConfig.painPoints.map((item, index) => (
              <Reveal className="pain-card card" delay={index * 0.06} key={item.title}>
                <span className="pain-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions left-aligned" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="The solution"
              title="A better path from inquiry to appointment"
              description="Respond faster, qualify better, and guide more leads into the calendar."
            />
          </Reveal>
          <div className="solution-grid">
            {siteConfig.solutionPoints.map((item, index) => (
              <Reveal className="solution-card card" delay={index * 0.06} key={item.title}>
                <div className="icon-badge">{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions left-aligned" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <SectionIntro
              align="center"
              eyebrow="How it works"
              title="Fast for the client. Useful for the business."
              description="The flow is simple: answer, qualify, and move the lead toward booking."
            />
          </Reveal>
          <div className="process-grid process-commercial-grid">
            {siteConfig.processSteps.map((step, index) => (
              <Reveal className="process-card card" delay={index * 0.08} key={step.number}>
                <span className="process-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="AI demos"
              title="See demos for real service businesses"
              description="Preview how the assistant can handle common booking and lead-capture situations."
            />
          </Reveal>
          <div className="demo-grid">
            {siteConfig.aiDemos.map((demo, index) => (
              <Reveal className="demo-card card" delay={index * 0.05} key={demo.title}>
                <div className="demo-card-top">
                  <div>
                    <h3>{demo.title}</h3>
                    <p className="demo-audience">{demo.audience}</p>
                  </div>
                  <span className="demo-badge">AI Demo</span>
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
                <Link className="button button-primary demo-card-cta" href={siteConfig.primaryCta.href}>
                  Book a Demo
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions left-aligned" delay={0.1}>
            <Link className="button button-primary" href="/industries">
              View All AI Demos
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-contrast">
        <div className="container benefits-layout">
          <Reveal>
            <SectionIntro
              eyebrow="Benefits"
              title="What this improves"
              description="Less delay. Less admin. More booked appointments."
            />
          </Reveal>
          <div className="benefit-grid">
            {siteConfig.benefits.map((benefit, index) => (
              <Reveal className="benefit-card card" delay={index * 0.06} key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions left-aligned" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="Trust and credibility"
              title="Execution-focused and commercially grounded"
              description="Built to help service businesses respond faster and convert more of the inquiries they already have."
            />
          </Reveal>

          <div className="credibility-grid">
            {siteConfig.credibilityPoints.map((item, index) => (
              <Reveal className="credibility-card card" delay={index * 0.06} key={item.title}>
                <span className="panel-label">Why it matters</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </Reveal>
            ))}
          </div>

          <div className="quote-grid quote-grid-tight">
            {siteConfig.testimonials.map((testimonial, index) => (
              <Reveal className="quote-card card" delay={0.12 + index * 0.06} key={testimonial.author}>
                <p>“{testimonial.quote}”</p>
                <div className="quote-author">
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="section-actions left-aligned" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-banner card">
            <div>
              <span className="eyebrow">Ready to improve your booking flow?</span>
              <h2>Book a demo and see how this could fit your business.</h2>
              <p>
                We will review where leads are being lost and how a better website and booking
                system can help.
              </p>
            </div>
            <div className="cta-actions">
              <Link className="button button-primary" href={siteConfig.primaryCta.href}>
                Book a Demo
              </Link>
              <Link className="button button-secondary inverted" href="/solutions">
                View Services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
