import { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://innfill.in').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '/',
    '/how-it-works',
    '/services',
    '/events',
    '/earnings',
    '/orders',
    '/login',
    '/register',
    '/privacy-policy',
    '/terms-of-service',
    '/profile',
    '/settings',
    '/sync',
    '/contact',
  ];

  const routes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date().toISOString(),
  }));

  // Add dynamic placeholders (if you later want to programmatically append dynamic rows)
  // e.g. routes.push({ url: `${SITE_URL}/services/your-service-slug`, lastModified: new Date().toISOString() })

  return routes;
}
