import Link from "next/link";

import { siteConfig } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand-mark footer-brand" href="/">
            <span className="brand-symbol">N</span>
            <span className="brand-text">
              <strong>{siteConfig.brandName}</strong>
              <small>{siteConfig.brandStatement}</small>
            </span>
          </Link>
          <p className="footer-copy">
            Northline builds AI assistants, lead capture systems, booking flows, and modern
            websites for appointment-based businesses that want more inquiries turning into booked
            appointments.
          </p>
        </div>

        <div>
          <p className="footer-heading">Pages</p>
          <div className="footer-links">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="footer-heading">Contact</p>
          <div className="footer-links">
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            <a href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`}>
              {siteConfig.contact.phone}
            </a>
            <span>{siteConfig.contact.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
