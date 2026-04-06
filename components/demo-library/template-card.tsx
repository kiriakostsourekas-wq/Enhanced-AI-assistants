import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import type { TemplateCatalogEntry } from "@/lib/demo-library/template-catalog";

type DemoTemplateCardProps = {
  template: TemplateCatalogEntry;
  href: string;
  badge: string;
  actionLabel: string;
  showsLabel: string;
  handlesLabel: string;
  outcomeLabel: string;
  delay?: number;
  featured?: boolean;
};

export function DemoTemplateCard({
  template,
  href,
  badge,
  actionLabel,
  showsLabel,
  handlesLabel,
  outcomeLabel,
  delay = 0,
  featured = false,
}: DemoTemplateCardProps) {
  return (
    <Reveal delay={delay}>
      <Link
        aria-label={`${actionLabel}: ${template.title}`}
        className={`demo-card card demo-card-link${featured ? " demo-card-featured" : ""}`}
        href={href}
      >
        <div className="demo-card-top">
          <div>
            <h3>{template.title}</h3>
            <p className="demo-audience">{template.audienceLabel}</p>
          </div>
          <span className="demo-badge" style={{ background: `${template.accentColor}18`, color: template.accentColor }}>
            {badge}
          </span>
        </div>

        <div className="demo-card-body">
          <div>
            <span className="demo-card-label">{showsLabel}</span>
            <p>{template.description}</p>
          </div>

          <div>
            <span className="demo-card-label">{handlesLabel}</span>
            <div className="demo-chip-list">
              {template.recommendedFor.map((item) => (
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
            <strong className="demo-outcome">{template.bestFor}</strong>
          </div>
          <span className="demo-card-action">{actionLabel}</span>
        </div>
      </Link>
    </Reveal>
  );
}
