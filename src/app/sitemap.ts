import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pmiiuinsgd.site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/landasan-hukum`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic routes for published articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });

    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/berita/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching sitemap articles:', error);
  }

  // Dynamic routes for published gallery albums
  let galleryRoutes: MetadataRoute.Sitemap = [];
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, eventDate: true },
    });

    galleryRoutes = albums.map((album) => ({
      url: `${baseUrl}/galeri/${album.slug}`,
      lastModified: album.updatedAt || album.eventDate || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching sitemap gallery albums:', error);
  }

  return [...staticRoutes, ...articleRoutes, ...galleryRoutes];
}
