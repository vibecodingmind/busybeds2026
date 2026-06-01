import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/settings/', '/dashboard/', '/owner/'],
      },
    ],
    sitemap: 'https://busybeds.com/sitemap.xml',
  };
}
