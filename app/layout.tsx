import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteChatWidget } from "@/components/layout/site-chat-widget";
import { siteConfig } from "@/lib/site-content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://northlineai.demo"),
  title: {
    default: `${siteConfig.brandName} | AI Booking Assistants for SMBs`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <SiteHeader />
          <main className="page-shell">{children}</main>
          <SiteFooter />
          <SiteChatWidget />
        </div>
      </body>
    </html>
  );
}
