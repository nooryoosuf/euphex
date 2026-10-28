import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContentProvider } from "@/components/content";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { PageviewTracker } from "@/components/analytics/PageviewTracker";
import { LaunchGate } from "@/components/layout/LaunchGate";
import { siteConfig } from "@/config/site";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const viewport = {
  themeColor: "#07090D",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.org.url),
  title: {
    default: "Euphex",
    template: "%s | Euphex",
  },
  description: siteConfig.org.description,
  keywords: ["Euphex", "Aurex", "MLBB", "Mobile Legends", "esports", "Maldives", "euphex.mv"],
  authors: [{ name: siteConfig.org.fullName }],
  creator: siteConfig.org.fullName,
  openGraph: {
    title: siteConfig.org.fullName,
    description: siteConfig.org.description,
    url: siteConfig.org.url,
    siteName: siteConfig.org.fullName,
    type: "website",
    locale: "en_US",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: siteConfig.org.fullName }],
  },
  twitter: {
    card: "summary",
    title: siteConfig.org.fullName,
    description: siteConfig.org.description,
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: siteConfig.org.fullName,
    url: siteConfig.org.url,
    logo: `${siteConfig.org.url}/icon-512.png`,
    description: siteConfig.org.description,
    sport: siteConfig.org.game,
    sameAs: [siteConfig.socials.instagram, siteConfig.socials.tiktok],
  };
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#07090D] text-[#F2F4F8]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <LaunchGate />
        <Navbar />
        <ContentProvider>
          <main id="main" className="flex-1">
            {children}
          </main>
        </ContentProvider>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <CloudflareAnalytics />
        <PageviewTracker />
      </body>
    </html>
  );
}
