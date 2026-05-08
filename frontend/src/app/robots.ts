import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventcore.dev'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/organizer', '/api', '/api-test'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
