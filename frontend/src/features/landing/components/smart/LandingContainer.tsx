/**
 * Landing Container
 * Smart component that connects useLandingData hook with landing components
 */

'use client'

import { useRouter } from 'next/navigation'

import {
  HeroSection,
  FeaturedEventsSection,
  CategoriesSection,
  OrganizersSection
} from '@/features/landing/components/dumb'
import { useLandingData } from '@/features/landing/hooks/useLandingData'

export const LandingContainer = () => {
  const router = useRouter()
  const { featuredEvents, eventTypes, loading, error } = useLandingData()

  const handleExploreClick = (): void => {
    router.push('/calendar')
  }

  const handleEventClick = (eventId: number): void => {
    router.push(`/calendar/${eventId}`)
  }

  const handleViewAllClick = (): void => {
    router.push('/calendar')
  }

  const handleEventTypeClick = (eventTypeId: number): void => {
    router.push(`/calendar?event_type_id=${eventTypeId}`)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection onExploreClick={handleExploreClick} />

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Featured Events Section */}
      <FeaturedEventsSection
        events={featuredEvents}
        loading={loading}
        onEventClick={handleEventClick}
        onViewAllClick={handleViewAllClick}
      />

      {/* Categories Section */}
      <CategoriesSection
        eventTypes={eventTypes}
        loading={loading}
        onCategoryClick={handleEventTypeClick}
      />

      {/* Organizers CTA Section */}
      <OrganizersSection />
    </main>
  )
}
