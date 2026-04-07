import { FaqAccordion } from "@/components/sections/faq-accordion";
import { ClinicDemoChatPanel } from "@/components/antigravity/clinic-demo-chat-panel";
import type {
  DemoLandingPage,
  DemoLandingPageMediaItem,
  DesignSectionKind,
  NormalizedDesignSchema,
  NormalizedDesignSection,
} from "@/lib/antigravity/schemas";

type ClinicDemoPageProps = {
  landingPage: DemoLandingPage;
  designSchema?: NormalizedDesignSchema;
};

type ContentSectionKind = Exclude<DesignSectionKind, "hero" | "footer">;

const FALLBACK_DESIGN_SCHEMA: NormalizedDesignSchema = {
  version: "v1",
  generatedAt: new Date(0).toISOString(),
  designId: "legacy-default",
  themeVariant: "calm_conversion",
  voice: "local_trust",
  hero: {
    type: "split_insight",
    visualFocus: "Legacy fallback hero",
    rationale: "Fallback layout for older preview artifacts.",
  },
  ctaStrategy: {
    primaryGoal: "demo_request",
    layout: "paired_buttons",
    persistentStyle: "dark_float",
  },
  trustTreatment: "proof_tiles",
  servicesLayout: "card_grid",
  teamLayout: "profile_grid",
  galleryLayout: "mosaic",
  faqPlacement: "after_services",
  contactPlacement: "dark_split",
  mapPlacement: "contact_panel",
  mobileHints: [],
  sectionOrder: ["hero", "gallery", "services", "trust", "team", "testimonials", "faq", "summary", "chat", "contact", "footer"],
  sections: [
    { kind: "gallery", variant: "mosaic", surface: "transparent", emphasis: "story", eyebrow: "Clinic visuals", title: "Visual context", description: "Real clinic visuals when available." },
    { kind: "services", variant: "card_grid", surface: "transparent", emphasis: "conversion", eyebrow: "Services", title: "Υπηρεσίες", description: "Επαληθευμένες υπηρεσίες και ειδικότητα." },
    { kind: "trust", variant: "proof_tiles", surface: "muted", emphasis: "trust", eyebrow: "Trust", title: "Εμπιστοσύνη", description: "Σήματα αξιοπιστίας και ιατρικής εμπιστοσύνης." },
    { kind: "team", variant: "profile_grid", surface: "transparent", emphasis: "trust", eyebrow: "Doctors & team", title: "Ομάδα", description: "Πρόσωπα και ειδικότητα όπου υπάρχουν επαληθευμένα στοιχεία." },
    { kind: "testimonials", variant: "quote_cards", surface: "muted", emphasis: "trust", eyebrow: "Testimonials", title: "Κοινωνική απόδειξη", description: "Μόνο όταν υπάρχουν επαληθευμένα αποσπάσματα." },
    { kind: "faq", variant: "accordion", surface: "transparent", emphasis: "utility", eyebrow: "FAQ", title: "Συχνές ερωτήσεις", description: "Σύντομες απαντήσεις για καλύτερο scanning." },
    { kind: "summary", variant: "critique_cards", surface: "highlight", emphasis: "conversion", eyebrow: "Why this redesign", title: "Γιατί αυτό το demo", description: "Σύνοψη critique και verified context." },
    { kind: "chat", variant: "assistant_panel", surface: "dark", emphasis: "utility", eyebrow: "Embedded chatbot", title: "Chatbot", description: "Greek-first βοηθός επίδειξης." },
    { kind: "contact", variant: "dark_split", surface: "dark", emphasis: "conversion", eyebrow: "Contact", title: "Επικοινωνία", description: "Επαληθευμένα στοιχεία επικοινωνίας και τοποθεσίας." },
    { kind: "footer", variant: "verified_footer", surface: "dark", emphasis: "utility", eyebrow: "Verified footer", title: "Footer", description: "Footer με επαληθευμένα στοιχεία." },
  ],
  critiqueResponses: [
    {
      weaknessTitle: "Legacy fallback",
      designMove: "Fallback schema keeps the preview renderable until redesign artifacts are regenerated.",
      sectionTarget: "summary",
    },
  ],
  designSummary: "Fallback preview schema for legacy artifacts.",
  provenance: landingPageProvenance(),
};

function landingPageProvenance() {
  return [
    {
      sourceType: "stage_output" as const,
      uri: "fallback:legacy-default",
      label: "legacy_fallback_design_schema",
      retrievedAt: new Date(0).toISOString(),
    },
  ];
}

function sectionConfig(designSchema: NormalizedDesignSchema, kind: DesignSectionKind): NormalizedDesignSection | undefined {
  return designSchema.sections.find((section) => section.kind === kind) ?? FALLBACK_DESIGN_SCHEMA.sections.find((section) => section.kind === kind);
}

function insertSection(order: ContentSectionKind[], kind: ContentSectionKind, afterKinds: ContentSectionKind[]) {
  if (order.includes(kind)) {
    return order;
  }

  for (const afterKind of afterKinds) {
    const index = order.indexOf(afterKind);

    if (index >= 0) {
      return [...order.slice(0, index + 1), kind, ...order.slice(index + 1)];
    }
  }

  return [...order, kind];
}

function effectiveSectionOrder(landingPage: DemoLandingPage, designSchema: NormalizedDesignSchema): ContentSectionKind[] {
  let order = designSchema.sectionOrder.filter((kind): kind is ContentSectionKind => kind !== "hero" && kind !== "footer");

  if (designSchema.trustTreatment === "quote_band" && landingPage.testimonials.length > 0) {
    order = order.filter((kind) => kind !== "testimonials");
  }

  if (landingPage.mediaGallery.length >= 2) {
    order = order.includes("gallery") ? order : ["gallery", ...order];
  }

  if (landingPage.doctorCards.length > 0) {
    order = insertSection(order, "team", ["trust", "services", "gallery"]);
  }

  if (landingPage.testimonials.length > 0 && designSchema.trustTreatment !== "quote_band") {
    order = insertSection(order, "testimonials", ["team", "trust", "services"]);
  }

  if (landingPage.faqs.length > 0) {
    order = insertSection(order, "faq", ["services", "team", "testimonials"]);
  }

  return order;
}

function sectionClassName(surface: NormalizedDesignSection["surface"] | undefined) {
  switch (surface) {
    case "muted":
      return "ag-demo-section ag-demo-section-muted";
    case "highlight":
      return "ag-demo-section ag-demo-section-highlight";
    case "dark":
      return "ag-demo-section ag-demo-section-dark";
    default:
      return "ag-demo-section";
  }
}

function SectionIntro({ section }: { section?: NormalizedDesignSection }) {
  if (!section?.eyebrow && !section?.title && !section?.description) {
    return null;
  }

  return (
    <div className="section-intro">
      {section?.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
      {section?.title ? <h2>{section.title}</h2> : null}
      {section?.description ? <p>{section.description}</p> : null}
    </div>
  );
}

function mediaWithoutHero(landingPage: DemoLandingPage) {
  return landingPage.mediaGallery.filter((item) => item.url !== landingPage.hero.imageUrl);
}

function MediaFigure({ item, className }: { item?: DemoLandingPageMediaItem; className?: string }) {
  if (!item) {
    return null;
  }

  return (
    <figure className={className ? `ag-demo-media-figure ${className}` : "ag-demo-media-figure"}>
      <img alt={item.alt ?? item.caption ?? "Clinic visual"} src={item.url} />
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  );
}

function HeroVisual({ landingPage, designSchema }: { landingPage: DemoLandingPage; designSchema: NormalizedDesignSchema }) {
  const supportingMedia = mediaWithoutHero(landingPage).slice(0, 3);

  if (designSchema.hero.type === "split_image" && landingPage.hero.imageUrl) {
    return (
      <div className="ag-demo-hero-collage card">
        <MediaFigure
          item={{
            url: landingPage.hero.imageUrl,
            alt: landingPage.hero.imageAlt,
            caption: landingPage.mediaGallery.find((item) => item.url === landingPage.hero.imageUrl)?.caption,
            emphasis: "clinic",
          }}
          className="ag-demo-hero-collage-main"
        />
        {supportingMedia.length > 0 ? (
          <div className="ag-demo-hero-collage-rail">
            {supportingMedia.map((item) => (
              <MediaFigure className="ag-demo-hero-collage-thumb" item={item} key={item.url} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (designSchema.hero.type === "split_contact") {
    return (
      <div className="ag-demo-proof-card card ag-demo-proof-card-contact">
        <p className="eyebrow">Primary actions</p>
        <h2>Επικοινωνία πιο μπροστά</h2>
        <div className="ag-demo-contact-list ag-demo-contact-list-compact">
          {landingPage.contactItems.slice(0, 4).map((item) => (
            <div className="ag-demo-contact-row" key={`${item.label}:${item.value}`}>
              <span>{item.label}</span>
              {item.href ? <a href={item.href}>{item.value}</a> : <strong>{item.value}</strong>}
            </div>
          ))}
        </div>
        {supportingMedia[0] ? <MediaFigure className="ag-demo-proof-inline-media" item={supportingMedia[0]} /> : null}
      </div>
    );
  }

  if (designSchema.hero.type === "split_credentials") {
    const portrait = landingPage.doctorCards.find((card) => card.imageUrl)?.imageUrl ?? landingPage.hero.imageUrl;
    const proofItems =
      landingPage.doctorCards[0]?.facts.length > 0
        ? landingPage.doctorCards[0].facts
        : (landingPage.trustItems.length > 0 ? landingPage.trustItems : landingPage.doctorCards.map((card) => card.name)).slice(0, 4);

    return (
      <div className="ag-demo-proof-card card ag-demo-proof-card-credentials">
        {portrait ? (
          <div className="ag-demo-portrait-wrap">
            <img alt={landingPage.hero.imageAlt ?? landingPage.title} src={portrait} />
          </div>
        ) : null}
        <p className="eyebrow">Trust signals</p>
        <h2>Εξειδίκευση και αξιοπιστία</h2>
        <ul className="ag-demo-list">
          {proofItems.map((item) => (
            <li key={item}>
              <strong>{item}</strong>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="ag-demo-proof-card card">
      {supportingMedia[0] ? <MediaFigure className="ag-demo-proof-inline-media" item={supportingMedia[0]} /> : null}
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
  );
}

function GallerySection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  if (landingPage.mediaGallery.length < 2) {
    return null;
  }

  const items = landingPage.mediaGallery.slice(0, 4);

  if (designSchema.galleryLayout === "portrait_stack") {
    const [featured, ...rest] = items;

    return (
      <section className={sectionClassName(section?.surface)} id="gallery">
        <div className="ag-demo-container">
          <SectionIntro section={section} />
          <div className="ag-demo-gallery-stack">
            <MediaFigure className="ag-demo-gallery-feature" item={featured} />
            <div className="ag-demo-gallery-rail">
              {rest.map((item) => (
                <MediaFigure className="ag-demo-gallery-rail-item" item={item} key={item.url} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (designSchema.galleryLayout === "service_triptych") {
    const [featured, secondary, tertiary] = items;

    return (
      <section className={sectionClassName(section?.surface)} id="gallery">
        <div className="ag-demo-container">
          <SectionIntro section={section} />
          <div className="ag-demo-gallery-triptych">
            <MediaFigure className="ag-demo-gallery-feature" item={featured} />
            <div className="ag-demo-gallery-column">
              <MediaFigure className="ag-demo-gallery-rail-item" item={secondary} />
              <MediaFigure className="ag-demo-gallery-rail-item" item={tertiary} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName(section?.surface)} id="gallery">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className={`ag-demo-gallery-grid ${designSchema.galleryLayout === "editorial_strip" ? "ag-demo-gallery-grid-editorial" : ""}`}>
          {items.map((item, index) => (
            <MediaFigure className={index === 0 ? "ag-demo-gallery-large" : "ag-demo-gallery-small"} item={item} key={item.url} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  if (landingPage.services.length === 0) {
    return null;
  }

  if (designSchema.servicesLayout === "feature_split") {
    const [featured, ...rest] = landingPage.services;

    return (
      <section className={sectionClassName(section?.surface)} id="services">
        <div className="ag-demo-container">
          <SectionIntro section={section} />
          <div className="ag-demo-feature-split">
            <article className="card ag-demo-card ag-demo-card-featured">
              {featured.imageUrl ? (
                <MediaFigure
                  item={{ url: featured.imageUrl, alt: featured.imageAlt, caption: featured.eyebrow, emphasis: "service" }}
                  className="ag-demo-service-media"
                />
              ) : null}
              {featured.eyebrow ? <span className="ag-demo-card-kicker">{featured.eyebrow}</span> : null}
              <h3>{featured.title}</h3>
              {featured.detail ? <p>{featured.detail}</p> : null}
            </article>
            <div className="ag-demo-grid ag-demo-grid-services ag-demo-grid-services-compact">
              {rest.map((service) => (
                <article className="card ag-demo-card" key={service.title}>
                  {service.imageUrl ? (
                    <MediaFigure
                      item={{ url: service.imageUrl, alt: service.imageAlt, caption: service.eyebrow, emphasis: "service" }}
                      className="ag-demo-service-media"
                    />
                  ) : null}
                  {service.eyebrow ? <span className="ag-demo-card-kicker">{service.eyebrow}</span> : null}
                  <h3>{service.title}</h3>
                  {service.detail ? <p>{service.detail}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (designSchema.servicesLayout === "stacked_list") {
    return (
      <section className={sectionClassName(section?.surface)} id="services">
        <div className="ag-demo-container">
          <SectionIntro section={section} />
          <div className="ag-demo-service-stack">
            {landingPage.services.map((service, index) => (
              <article className="card ag-demo-card ag-demo-service-row" key={service.title}>
                <span className="ag-demo-service-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {service.eyebrow ? <span className="ag-demo-card-kicker">{service.eyebrow}</span> : null}
                  <h3>{service.title}</h3>
                  {service.detail ? <p>{service.detail}</p> : null}
                </div>
                {service.imageUrl ? (
                  <MediaFigure
                    item={{ url: service.imageUrl, alt: service.imageAlt, caption: service.eyebrow, emphasis: "service" }}
                    className="ag-demo-service-row-media"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName(section?.surface)} id="services">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className="ag-demo-grid ag-demo-grid-services">
          {landingPage.services.map((service, index) => (
            <article className={`card ag-demo-card ${index === 0 ? "ag-demo-card-services-lead" : ""}`} key={service.title}>
              {service.imageUrl ? (
                <MediaFigure
                  item={{ url: service.imageUrl, alt: service.imageAlt, caption: service.eyebrow, emphasis: "service" }}
                  className="ag-demo-service-media"
                />
              ) : null}
              {service.eyebrow ? <span className="ag-demo-card-kicker">{service.eyebrow}</span> : null}
              <h3>{service.title}</h3>
              {service.detail ? <p>{service.detail}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  const trustItems = landingPage.trustItems.length > 0 ? landingPage.trustItems : landingPage.improvementHighlights.map((item) => item.title);
  const testimonials = landingPage.testimonials.slice(0, 4);
  const showDoctorSpotlight = designSchema.trustTreatment === "doctor_spotlight" && landingPage.doctorCards.length > 0;
  const showQuoteBand = designSchema.trustTreatment === "quote_band" && testimonials.length > 0;
  const showTrustGrid =
    trustItems.length > 0 &&
    (designSchema.trustTreatment === "doctor_spotlight" ||
      designSchema.trustTreatment === "proof_tiles" ||
      designSchema.trustTreatment === "credential_grid" ||
      (designSchema.trustTreatment === "quote_band" && testimonials.length === 0));

  if (trustItems.length === 0 && landingPage.testimonials.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName(section?.surface)} id="trust">
      <div className="ag-demo-container">
        <SectionIntro section={section} />

        {showDoctorSpotlight ? (
          <div className="ag-demo-trust-spotlight">
            <article className="card ag-demo-card ag-demo-card-featured">
              {landingPage.doctorCards[0]?.imageUrl ? (
                <MediaFigure
                  item={{
                    url: landingPage.doctorCards[0].imageUrl,
                    alt: landingPage.doctorCards[0].imageAlt,
                    caption: landingPage.doctorCards[0].name,
                    emphasis: "portrait",
                  }}
                  className="ag-demo-doctor-media"
                />
              ) : null}
              <h3>{landingPage.doctorCards[0]?.name}</h3>
              {landingPage.doctorCards[0]?.role ? <p className="ag-demo-card-meta">{landingPage.doctorCards[0].role}</p> : null}
              {landingPage.doctorCards[0]?.bio ? <p>{landingPage.doctorCards[0].bio}</p> : null}
              {landingPage.doctorCards[0]?.facts.length ? (
                <ul className="ag-demo-inline-list">
                  {landingPage.doctorCards[0].facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              ) : null}
            </article>
            <div className="ag-demo-grid ag-demo-grid-trust">
              {trustItems.slice(0, 4).map((item) => (
                <article className="card ag-demo-card ag-demo-card-compact" key={item}>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {showQuoteBand ? (
          <div className="ag-demo-grid ag-demo-grid-testimonials">
            {testimonials.map((testimonial) => (
              <blockquote className="card ag-demo-quote" key={testimonial.quote}>
                <p>“{testimonial.quote}”</p>
                {testimonial.source ? <footer>{testimonial.source}</footer> : null}
              </blockquote>
            ))}
          </div>
        ) : null}

        {showTrustGrid ? (
          <div className="ag-demo-grid ag-demo-grid-trust">
            {trustItems.slice(0, 6).map((item) => (
              <article className="card ag-demo-card ag-demo-card-compact" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StorySection({ landingPage, section }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection }) {
  const contextSection = landingPage.sections[1] ?? landingPage.sections[0];
  const media = landingPage.mediaGallery[0];

  return (
    <section className={sectionClassName(section?.surface)} id="story">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className="ag-demo-story-grid">
          <article className="card ag-demo-card ag-demo-card-featured">
            <h3>{landingPage.headline}</h3>
            <p>{landingPage.subheadline}</p>
          </article>
          <article className="card ag-demo-card">
            {media ? <MediaFigure className="ag-demo-story-media" item={media} /> : null}
            <h3>{contextSection.heading}</h3>
            <p>{contextSection.body}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function TeamSection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  if (landingPage.doctorCards.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName(section?.surface)} id="team">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className={`ag-demo-grid ${designSchema.teamLayout === "credentials_stack" ? "ag-demo-team-stack" : "ag-demo-grid-doctors"}`}>
          {landingPage.doctorCards.map((doctor) => (
            <article className="card ag-demo-card" key={doctor.name}>
              {doctor.imageUrl ? (
                <MediaFigure
                  item={{ url: doctor.imageUrl, alt: doctor.imageAlt, caption: doctor.name, emphasis: "portrait" }}
                  className="ag-demo-doctor-media"
                />
              ) : null}
              <h3>{doctor.name}</h3>
              {doctor.role ? <p className="ag-demo-card-meta">{doctor.role}</p> : null}
              {doctor.bio ? <p>{doctor.bio}</p> : null}
              {doctor.facts.length > 0 ? (
                <ul className="ag-demo-inline-list">
                  {doctor.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ landingPage, section }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection }) {
  if (landingPage.testimonials.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName(section?.surface)} id="testimonials">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
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
  );
}

function FaqSection({ landingPage, section }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection }) {
  if (landingPage.faqs.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName(section?.surface)} id="faq">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
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
  );
}

function SummarySection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  return (
    <section className={sectionClassName(section?.surface)} id="summary">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className="ag-demo-summary-grid">
          {landingPage.sections.map((item) => (
            <article className="card ag-demo-card" key={item.heading}>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
            </article>
          ))}
          {designSchema.critiqueResponses.map((item) => (
            <article className="card ag-demo-card ag-demo-card-compact" key={item.weaknessTitle}>
              <strong>{item.weaknessTitle}</strong>
              <p>{item.designMove}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatSection({ landingPage, section }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection }) {
  return (
    <section className={sectionClassName(section?.surface)} id="chatbot">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <ClinicDemoChatPanel chatbot={landingPage.chatbot} />
      </div>
    </section>
  );
}

function ContactSection({ landingPage, section, designSchema }: { landingPage: DemoLandingPage; section?: NormalizedDesignSection; designSchema: NormalizedDesignSchema }) {
  return (
    <section className={sectionClassName(section?.surface)} id="contact">
      <div className="ag-demo-container">
        <SectionIntro section={section} />
        <div className={designSchema.contactPlacement === "dark_split" ? "ag-demo-contact-split" : "ag-demo-contact-single"}>
          <section className="ag-demo-contact card">
            <div className="ag-demo-chat-header">
              <div>
                <p className="eyebrow">Contact & location</p>
                <h3>{section?.title ?? "Εύκολη επικοινωνία από mobile και desktop"}</h3>
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
          </section>

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
                  <a className="button button-secondary inverted" href={landingPage.map.linkUrl} rel="noreferrer" target="_blank">
                    Άνοιγμα στο Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function renderSection(kind: DesignSectionKind, landingPage: DemoLandingPage, designSchema: NormalizedDesignSchema) {
  const section = sectionConfig(designSchema, kind);

  switch (kind) {
    case "gallery":
      return <GallerySection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    case "services":
      return <ServicesSection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    case "trust":
      return <TrustSection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    case "story":
      return <StorySection key={kind} landingPage={landingPage} section={section} />;
    case "team":
      return <TeamSection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    case "testimonials":
      return <TestimonialsSection key={kind} landingPage={landingPage} section={section} />;
    case "faq":
      return <FaqSection key={kind} landingPage={landingPage} section={section} />;
    case "summary":
      return <SummarySection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    case "chat":
      return <ChatSection key={kind} landingPage={landingPage} section={section} />;
    case "contact":
      return <ContactSection key={kind} landingPage={landingPage} section={section} designSchema={designSchema} />;
    default:
      return null;
  }
}

export function ClinicDemoPage({ landingPage, designSchema }: ClinicDemoPageProps) {
  const schema = designSchema ?? FALLBACK_DESIGN_SCHEMA;
  const orderedContentSections = effectiveSectionOrder(landingPage, schema);

  return (
    <div
      className="antigravity-preview-root"
      data-antigravity-preview-root
      data-ag-theme={schema.themeVariant}
      data-ag-hero={schema.hero.type}
      data-ag-services-layout={schema.servicesLayout}
    >
      <div className="ag-demo-shell">
        <section className={`ag-demo-hero ag-demo-hero-${schema.hero.type}`}>
          <div className="ag-demo-container ag-demo-hero-grid">
            <div className="ag-demo-hero-copy">
              {landingPage.hero.logoUrl ? (
                <div className="ag-demo-hero-brand">
                  <img alt={landingPage.hero.logoAlt ?? landingPage.title} src={landingPage.hero.logoUrl} />
                </div>
              ) : null}
              <span className="eyebrow">{landingPage.hero.eyebrow}</span>
              <h1>{landingPage.hero.headline}</h1>
              <p className="ag-demo-hero-description">{landingPage.hero.subheadline}</p>

              <div className={`ag-demo-hero-actions ag-demo-hero-actions-${schema.ctaStrategy.layout}`}>
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
              <HeroVisual landingPage={landingPage} designSchema={schema} />
            </div>
          </div>
        </section>

        {orderedContentSections.map((kind) => renderSection(kind, landingPage, schema))}

        <footer className="ag-demo-footer">
          <div className="ag-demo-container ag-demo-footer-grid">
            <div>
              <span className="eyebrow">{sectionConfig(schema, "footer")?.eyebrow ?? "Verified footer"}</span>
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
      </div>

      <div className={`ag-demo-sticky-cta ${schema.ctaStrategy.persistentStyle === "soft_float" ? "ag-demo-sticky-cta-soft" : ""}`}>
        <div className="ag-demo-sticky-copy">
          <strong>{landingPage.title}</strong>
          <span>{landingPage.renderingMode === "live_demo" ? "Live demo" : "Concept demo"}</span>
        </div>
        <a className="button button-primary" href={landingPage.persistentCta.href}>
          {landingPage.persistentCta.label}
        </a>
      </div>
    </div>
  );
}
