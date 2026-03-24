import Link from "next/link";

import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <section className="section">
      <div className="container">
        <div className="card empty-state">
          <span className="eyebrow">404</span>
          <h1>{siteContent.notFoundPage.title}</h1>
          <p>{siteContent.notFoundPage.description}</p>
          <Link className="button button-primary" href="/">
            {siteContent.notFoundPage.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
