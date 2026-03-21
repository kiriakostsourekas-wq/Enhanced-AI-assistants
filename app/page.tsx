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
            <span className="eyebrow">Lead capture + booking systems</span>
            <h1>{siteConfig.hero.headline}</h1>
            <p className="hero-description">{siteConfig.hero.description}</p>

            <div className="hero-actions">
              <Link className="button button-primary" href={siteConfig.primaryCta.href}>
                {siteConfig.primaryCta.label}
              </Link>
              <Link className="button button-secondary" href={siteConfig.secondaryCta.href}>
                {siteConfig.secondaryCta.label}
              </Link>
            </div>

            <p className="hero-audience-line">{siteConfig.hero.audienceLine}</p>

            <div className="hero-mini-proof">
              {siteConfig.services.slice(0, 4).map((service) => (
                <div className="hero-mini-proof-item" key={service.title}>
                  <strong>{service.eyebrow}</strong>
                  <span>{service.title}</span>
                </div>
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
              title="Where appointment-based businesses lose bookings"
              description="The issue usually is not a lack of inquiries. It is what happens after the inquiry arrives."
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="The solution"
              title="A clearer path from inquiry to appointment"
              description="Northline helps businesses respond faster, qualify better, and guide more inquiries toward a booked next step."
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
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <SectionIntro
              align="center"
              eyebrow="How it works"
              title="Simple enough for the client. Useful enough for the business."
              description="The system is built to move from first response to booking without adding more manual work."
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="Industries"
              title="Built for appointment-driven service businesses"
              description="Northline is especially relevant where fast answers and clear next steps directly affect booked revenue."
            />
          </Reveal>
          <div className="industry-grid industry-commercial-grid">
            {siteConfig.industries.map((industry, index) => (
              <Reveal className="industry-card card" delay={index * 0.05} key={industry.name}>
                <div className="industry-card-top">
                  <h3>{industry.name}</h3>
                  <span className="industry-fit">{industry.assistantFit}</span>
                </div>
                <p>{industry.summary}</p>
                <div className="mini-pill-row">
                  {industry.examples.map((example) => (
                    <span className="mini-pill" key={example}>
                      {example}
                    </span>
                  ))}
                </div>
                <span className="industry-outcome">{industry.outcome}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-contrast">
        <div className="container benefits-layout">
          <Reveal>
            <SectionIntro
              eyebrow="Benefits"
              title="What this should improve"
              description="The value is practical: quicker response, more appointments, less admin, and a smoother client experience."
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="Trust and credibility"
              title="Commercially grounded. Built to execute."
              description="Northline is positioned around the operational side of growth: better first response, better lead capture, and a cleaner path into booked appointments."
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-banner card">
            <div>
              <span className="eyebrow">Ready to improve your booking flow?</span>
              <h2>Book a demo and see how the system could fit your business.</h2>
              <p>
                We will look at your current inquiry flow, where leads are being lost, and how a
                better website and booking system could help.
              </p>
            </div>
            <div className="cta-actions">
              <Link className="button button-primary" href="/contact">
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
