"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/site-content";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

type SiteHeaderProps = {
  locale: Locale;
  siteContent: SiteContent;
};

export function SiteHeader({ locale, siteContent }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="container header-bar">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol">N</span>
          <span className="brand-text">
            <strong>{siteContent.brandName}</strong>
            <small>{siteContent.tagline}</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label={siteContent.navigation.primaryLabel}>
          {siteContent.nav.map((item) => (
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
          <div aria-label={siteContent.navigation.switcherLabel} className="language-switcher" role="group">
            {(["en", "gr"] as const).map((language) => (
              <button
                aria-pressed={locale === language}
                className={`language-option${locale === language ? " is-active" : ""}`}
                disabled={isPending}
                key={language}
                type="button"
                onClick={() => handleLocaleChange(language)}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>

          <Link className="button button-primary header-cta" href={siteContent.headerCta.href}>
            {siteContent.headerCta.label}
          </Link>
          <button
            aria-expanded={menuOpen}
            aria-label={siteContent.navigation.toggleMenuLabel}
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
        <nav className="mobile-nav" aria-label={siteContent.navigation.mobileLabel}>
          {siteContent.nav.map((item) => (
            <Link
              key={item.href}
              className={`mobile-link${isActiveRoute(pathname, item.href) ? " is-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="button button-primary mobile-cta" href={siteContent.headerCta.href}>
            {siteContent.headerCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
