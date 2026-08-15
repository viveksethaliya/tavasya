import { MetadataRoute } from 'next'
import { PRODUCTS } from '@/data/products'

const BASE = 'https://tavasyamachines.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/about', '/contact', '/products'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.6,
  }))

  const productPages = PRODUCTS.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages]
}
