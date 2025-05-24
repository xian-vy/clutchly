import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/','/c'],
      disallow: ['/dashboard/', '/auth/' , '/api'], 
    },
    sitemap: 'https://clutchly.vercel.app/sitemap.xml',
  }
} 