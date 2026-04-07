import type { CSSProperties } from "react";
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

type Rgb = {
  r: number;
  g: number;
  b: number;
};

function parseHexColor(value: string): Rgb | null {
  const normalized = value.trim().replace("#", "");

  if (/^[\da-f]{3}$/i.test(normalized)) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16),
      g: Number.parseInt(normalized[1] + normalized[1], 16),
      b: Number.parseInt(normalized[2] + normalized[2], 16),
    };
  }

  if (/^[\da-f]{6}$/i.test(normalized)) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }

  return null;
}

function mixRgb(from: Rgb, to: Rgb, weight: number): Rgb {
  return {
    r: Math.round(from.r + (to.r - from.r) * weight),
    g: Math.round(from.g + (to.g - from.g) * weight),
    b: Math.round(from.b + (to.b - from.b) * weight),
  };
}

function rgbToCss({ r, g, b }: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbaToCss({ r, g, b }: Rgb, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminanceChannel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: Rgb) {
  return (
    0.2126 * relativeLuminanceChannel(color.r) +
    0.7152 * relativeLuminanceChannel(color.g) +
    0.0722 * relativeLuminanceChannel(color.b)
  );
}

function createBadgeStyle(accentColor: string): CSSProperties {
  const accent = parseHexColor(accentColor) ?? { r: 125, g: 224, b: 207 };
  const white = { r: 255, g: 255, b: 255 };
  const luminance = relativeLuminance(accent);
  const textLift = luminance < 0.08 ? 0.9 : luminance < 0.18 ? 0.78 : luminance < 0.3 ? 0.62 : 0.28;
  const surfaceLift = luminance < 0.18 ? 0.42 : luminance < 0.3 ? 0.3 : 0.14;
  const borderLift = Math.max(surfaceLift + 0.08, 0.24);
  const textColor = mixRgb(accent, white, textLift);
  const backgroundColor = mixRgb(accent, white, surfaceLift);
  const borderColor = mixRgb(accent, white, borderLift);

  return {
    "--demo-badge-bg": rgbaToCss(backgroundColor, luminance < 0.18 ? 0.22 : 0.16),
    "--demo-badge-border": rgbaToCss(borderColor, 0.3),
    "--demo-badge-color": rgbToCss(textColor),
    "--demo-badge-shadow": rgbaToCss(accent, 0.12),
  } as CSSProperties;
}

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
          <span className="demo-badge" style={createBadgeStyle(template.accentColor)}>
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
