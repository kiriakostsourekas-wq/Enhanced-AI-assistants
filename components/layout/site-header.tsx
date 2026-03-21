"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site-content";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="container header-bar">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol">N</span>
          <span className="brand-text">
            <strong>{siteConfig.brandName}</strong>
            <small>{siteConfig.tagline}</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              className={`nav-link${isActiveRoute(pathname, item.href) ? " is-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="button button-primary header-cta" href={siteConfig.primaryCta.href}>
            {siteConfig.primaryCta.label}
          </Link>
          <button
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className={`mobile-toggle${menuOpen ? " is-open" : ""}`}
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-panel${menuOpen ? " is-open" : ""}`}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              className={`mobile-link${isActiveRoute(pathname, item.href) ? " is-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="button button-primary mobile-cta" href={siteConfig.primaryCta.href}>
            {siteConfig.primaryCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
