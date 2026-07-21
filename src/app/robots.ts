import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pmiiuinsgd.or.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/berita',
        '/berita/*',
        '/galeri',
        '/galeri/*',
        '/landasan-hukum',
      ],
      disallow: [
        '/login',
        '/dashboard',
        '/dashboard/*',
        '/exam',
        '/exam/*',
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
