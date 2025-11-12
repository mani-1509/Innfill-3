import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://innfill.in').replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    default: 'INNFILL - Connect, Create, Collaborate',
    template: '%s | INNFILL',
  },
  description: 'Fast, reliable freelancing that finds opportunities and connects you at scale.',
  applicationName: 'INNFILL',
  authors: [{ name: 'Innfill', url: SITE_URL }],
  openGraph: {
    title: 'INNFILL - Connect, Create, Collaborate',
    description: 'Fast, reliable freelancing that finds opportunities and connects you at scale.',
    url: SITE_URL,
    siteName: 'INNFILL',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'INNFILL',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INNFILL - Connect, Create, Collaborate',
    description: 'Fast, reliable freelancing that finds opportunities and connects you at scale.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
