import { FaqAccordion } from "@/components/sections/faq-accordion";
import { ClinicDemoChatPanel } from "@/components/antigravity/clinic-demo-chat-panel";
import type { DemoLandingPage } from "@/lib/antigravity/schemas";

type ClinicDemoPageProps = {
  landingPage: DemoLandingPage;
};

export function ClinicDemoPage({ landingPage }: ClinicDemoPageProps) {
  return (
    <div className="antigravity-preview-root" data-antigravity-preview-root>
      <div className="ag-demo-shell">
        <section className="ag-demo-hero">
          <div className="ag-demo-container ag-demo-hero-grid">
            <div className="ag-demo-hero-copy">
              <span className="eyebrow">{landingPage.hero.eyebrow}</span>
              <h1>{landingPage.hero.headline}</h1>
              <p className="ag-demo-hero-description">{landingPage.hero.subheadline}</p>

              <div className="ag-demo-hero-actions">
                <a className="button button-primary" href={landingPage.hero.primaryCta.href}>
                  {landingPage.hero.primaryCta.label}
                </a>
                {landingPage.hero.secondaryCta ? (
                  <a className="button button-secondary" href={landingPage.hero.secondaryCta.href}>
                    {landingPage.hero.secondaryCta.label}
                  </a>
                ) : null}
              </div>

              {landingPage.modeNotice ? (
                <div className="ag-demo-mode-note">
                  <strong>Concept demo mode</strong>
                  <p>{landingPage.modeNotice}</p>
                </div>
              ) : null}

              {landingPage.hero.badges.length > 0 ? (
                <div className="ag-demo-badge-row">
                  {landingPage.hero.badges.map((badge) => (
                    <span className="ag-demo-badge" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}

              {landingPage.hero.stats.length > 0 ? (
                <div className="ag-demo-hero-stats">
                  {landingPage.hero.stats.map((stat) => (
                    <div className="ag-demo-stat-card" key={`${stat.label}:${stat.value}`}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="ag-demo-hero-visual">
              {landingPage.hero.imageUrl ? (
                <div className="ag-demo-hero-image card">
                  <img alt={landingPage.hero.imageAlt ?? landingPage.title} src={landingPage.hero.imageUrl} />
                </div>
              ) : (
                <div className="ag-demo-proof-card card">
                  <p className="eyebrow">Commercial upside</p>
                  <h2>Τι βελτιώνει αυτό το demo</h2>
                  <ul className="ag-demo-list">
                    {landingPage.improvementHighlights.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="ag-demo-section">
          <div className="ag-demo-container">
            <div className="section-intro">
              <span className="eyebrow">Services overview</span>
              <h2>Ξεκάθαρη παρουσίαση υπηρεσιών και ειδικότητας</h2>
              <p>Η δομή παραμένει Greek-first και δίνει άμεσο context πριν ο επισκέπτης χαθεί σε γενικές πληροφορίες.</p>
            </div>

            <div className="ag-demo-grid ag-demo-grid-services">
              {landingPage.services.map((service) => (
                <article className="card ag-demo-card" key={service.title}>
                  <h3>{service.title}</h3>
                  {service.detail ? <p>{service.detail}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ag-demo-section ag-demo-section-muted">
          <div className="ag-demo-container">
            <div className="section-intro">
              <span className="eyebrow">Trust & credibility</span>
              <h2>Σήματα εμπιστοσύνης που βοηθούν τον ασθενή να προχωρήσει</h2>
              <p>Η ενότητα αυτή φέρνει πιο μπροστά τα επαληθευμένα στοιχεία που αυξάνουν εμπιστοσύνη και μειώνουν δισταγμό.</p>
            </div>

            <div className="ag-demo-grid ag-demo-grid-trust">
              {landingPage.trustItems.length > 0 ? (
                landingPage.trustItems.map((item) => (
                  <article className="card ag-demo-card ag-demo-card-compact" key={item}>
                    <p>{item}</p>
                  </article>
                ))
              ) : (
                landingPage.improvementHighlights.map((item) => (
                  <article className="card ag-demo-card ag-demo-card-compact" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {landingPage.doctorCards.length > 0 ? (
          <section className="ag-demo-section">
            <div className="ag-demo-container">
              <div className="section-intro">
                <span className="eyebrow">Doctors & team</span>
                <h2>Άνθρωποι, πρόσωπα και ειδικότητα</h2>
                <p>Όταν υπάρχουν επαληθευμένα στοιχεία ομάδας, το demo τα προβάλλει με καθαρότερο hierarchy και ισχυρότερη αξιοπιστία.</p>
              </div>

              <div className="ag-demo-grid ag-demo-grid-doctors">
                {landingPage.doctorCards.map((doctor) => (
                  <article className="card ag-demo-card" key={doctor.name}>
                    <h3>{doctor.name}</h3>
                    {doctor.role ? <p className="ag-demo-card-meta">{doctor.role}</p> : null}
                    {doctor.bio ? <p>{doctor.bio}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {landingPage.testimonials.length > 0 ? (
          <section className="ag-demo-section ag-demo-section-muted">
            <div className="ag-demo-container">
              <div className="section-intro">
                <span className="eyebrow">Testimonials</span>
                <h2>Κοινωνική απόδειξη χωρίς θόρυβο</h2>
                <p>Το demo δίνει χώρο σε πραγματικά αποσπάσματα μόνο όταν έχουν εξαχθεί με επαρκή αξιοπιστία.</p>
              </div>

              <div className="ag-demo-grid ag-demo-grid-testimonials">
                {landingPage.testimonials.map((testimonial) => (
                  <blockquote className="card ag-demo-quote" key={testimonial.quote}>
                    <p>“{testimonial.quote}”</p>
                    {testimonial.source ? <footer>{testimonial.source}</footer> : null}
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {landingPage.faqs.length > 0 ? (
          <section className="ag-demo-section">
            <div className="ag-demo-container">
              <div className="section-intro">
                <span className="eyebrow">FAQ</span>
                <h2>Συχνές ερωτήσεις σε mobile-friendly μορφή</h2>
                <p>Οι συχνές ερωτήσεις αποκτούν καλύτερο scanning και βοηθούν τον ασθενή να αποφασίσει χωρίς να χαθεί σε μεγάλες σελίδες.</p>
              </div>

              <div className="ag-demo-faq-shell card">
                <FaqAccordion
                  items={landingPage.faqs.map((item) => ({
                    question: item.question,
                    answer: item.answer ?? "Η απάντηση θα επιβεβαιωθεί από την ομάδα της κλινικής πριν το live rollout.",
                  }))}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="ag-demo-section ag-demo-section-dark">
          <div className="ag-demo-container ag-demo-two-column">
            <ClinicDemoChatPanel chatbot={landingPage.chatbot} />

            <section className="ag-demo-contact card" id="contact">
              <div className="ag-demo-chat-header">
                <div>
                  <p className="eyebrow">Contact & location</p>
                  <h3>Εύκολη επικοινωνία από mobile και desktop</h3>
                </div>
              </div>

              <div className="ag-demo-contact-list">
                {landingPage.contactItems.map((item) => (
                  <div className="ag-demo-contact-row" key={`${item.label}:${item.value}`}>
                    <span>{item.label}</span>
                    {item.href ? <a href={item.href}>{item.value}</a> : <strong>{item.value}</strong>}
                  </div>
                ))}
              </div>

              {landingPage.map ? (
                <div className="ag-demo-map-shell">
                  {landingPage.map.embedUrl ? (
                    <iframe
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={landingPage.map.embedUrl}
                      title={landingPage.map.title}
                    />
                  ) : null}
                  <div className="ag-demo-map-copy">
                    <strong>{landingPage.map.title}</strong>
                    {landingPage.map.helperText ? <p>{landingPage.map.helperText}</p> : null}
                    {landingPage.map.linkUrl ? (
                      <a className="button button-secondary inverted" href={landingPage.map.linkUrl} target="_blank" rel="noreferrer">
                        Άνοιγμα στο Google Maps
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>

        <footer className="ag-demo-footer">
          <div className="ag-demo-container ag-demo-footer-grid">
            <div>
              <span className="eyebrow">Verified footer</span>
              <p>{landingPage.footer.note}</p>
            </div>

            <div className="ag-demo-footer-details">
              {landingPage.footer.contactItems.map((item) => (
                <div key={`${item.label}:${item.value}`}>
                  <span>{item.label}</span>
                  {item.href ? <a href={item.href}>{item.value}</a> : <strong>{item.value}</strong>}
                </div>
              ))}
              {landingPage.footer.locationNote ? (
                <div>
                  <span>Τοποθεσία</span>
                  <strong>{landingPage.footer.locationNote}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </footer>

        <div className="ag-demo-sticky-cta">
          <div className="ag-demo-sticky-copy">
            <strong>{landingPage.title}</strong>
            <span>{landingPage.renderingMode === "live_demo" ? "Live demo" : "Concept demo"}</span>
          </div>
          <a className="button button-primary" href={landingPage.persistentCta.href}>
            {landingPage.persistentCta.label}
          </a>
        </div>
      </div>
    </div>
  );
}
