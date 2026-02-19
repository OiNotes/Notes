import type { MetadataRoute } from 'next';
import { getAllPeopleSlugs } from '@/lib/mdx';

/**
 * Sitemap generation for SEO.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oi-notes.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/music`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/dive`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/branch`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic note pages
  let noteSlugs: string[] = [];
  try {
    noteSlugs = await getAllPeopleSlugs();
  } catch {
    // Content directory may not exist in all environments
  }

  const noteRoutes: MetadataRoute.Sitemap = noteSlugs.map((slug) => ({
    url: `${baseUrl}/notes/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...noteRoutes];
}
