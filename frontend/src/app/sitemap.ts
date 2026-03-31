import type { MetadataRoute } from 'next'

import publicApiClient from '@/services/publicApiClient'
import type { Event } from '@/types/event.types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventostucuman.gob.ar'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register-request`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic event pages
  try {
    const response = await publicApiClient.get<{ data: Event[] }>('/public/events', {
      params: { per_page: 500 },
    })
    const events = response.data.data

    const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${baseUrl}/calendar/${event.id}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...eventPages]
  } catch {
    // If API is unavailable, return static pages only
    return staticPages
  }
}
