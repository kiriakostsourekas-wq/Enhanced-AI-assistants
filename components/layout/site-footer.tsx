import Link from "next/link";

import type { SiteContent } from "@/lib/site-content";

type SiteFooterProps = {
  siteContent: SiteContent;
};

export function SiteFooter({ siteContent }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand-mark footer-brand" href="/">
            <span
              aria-hidden="true"
              className="brand-symbol"
              style={{ overflow: "hidden", background: "transparent", boxShadow: "0 12px 24px rgba(14, 91, 94, 0.2)" }}
            >
              <img alt="" height={40} src="/favicon.svg" style={{ display: "block", width: "100%", height: "100%" }} width={40} />
            </span>
            <span className="brand-text">
              <strong>{siteContent.brandName}</strong>
              <small>{siteContent.brandStatement}</small>
            </span>
          </Link>
          <p className="footer-copy">{siteContent.footer.description}</p>
        </div>

        <div>
          <p className="footer-heading">{siteContent.footerLabels.pages}</p>
          <div className="footer-links">
            {siteContent.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="footer-heading">{siteContent.footerLabels.contact}</p>
          <div className="footer-links">
            <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
            <a href={`tel:${siteContent.contact.phone.replace(/[^+\d]/g, "")}`}>
              {siteContent.contact.phone}
            </a>
            <span>{siteContent.contact.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
