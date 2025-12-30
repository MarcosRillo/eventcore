/**
 * Landing Container
 * Smart component that renders landing page with server-fetched data
 */

'use client'

import { useRouter } from 'next/navigation'

import {
  HeroSection,
  FeaturedEventsSection,
  CategoriesSection,
  OrganizersSection
} from '@/features/landing/components/dumb'
import { PublicEvent, EventType } from '@/features/public-calendar/types/public-calendar.types'

interface LandingContainerProps {
  initialFeaturedEvents: PublicEvent[]
  initialEventTypes: EventType[]
}

export const LandingContainer = ({
  initialFeaturedEvents,
  initialEventTypes
}: LandingContainerProps) => {
  const router = useRouter()

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

      {/* Featured Events Section */}
      <FeaturedEventsSection
        events={initialFeaturedEvents}
        loading={false}
        onEventClick={handleEventClick}
        onViewAllClick={handleViewAllClick}
      />

      {/* Categories Section */}
      <CategoriesSection
        eventTypes={initialEventTypes}
        loading={false}
        onCategoryClick={handleEventTypeClick}
      />

      {/* Organizers CTA Section */}
      <OrganizersSection />
    </main>
  )
}
