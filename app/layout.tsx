import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteChatWidget } from "@/components/layout/site-chat-widget";
import { getHtmlLang } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { siteConfig } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://northlineai.demo"),
  title: {
    default: `${siteConfig.brandName} | Quality Websites With Integrated Chat`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <html lang={getHtmlLang(locale)}>
      <body>
        <div className="site-shell">
          <SiteHeader locale={locale} siteContent={siteContent} />
          <main className="page-shell">{children}</main>
          <SiteFooter siteContent={siteContent} />
          <SiteChatWidget content={siteContent.widget} locale={locale} />
        </div>
      </body>
    </html>
  );
}
