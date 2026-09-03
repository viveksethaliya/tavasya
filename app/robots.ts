import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
      {
        userAgent: ['meta-externalagent', 'meta-webindexer', 'Jetpack', 'WordPress.com'],
        disallow: '/',
      },
    ],
    sitemap: 'https://www.tavasyamachines.com/sitemap.xml',
  }
}
