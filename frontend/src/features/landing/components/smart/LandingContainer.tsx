'use client';

/**
 * Landing Container
 * Smart component that renders landing page with server-fetched data
 */

'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { FeaturedEventsSection } from '@/features/landing/components/dumb/FeaturedEventsSection'
import { HeroSection } from '@/features/landing/components/dumb/HeroSection'
import { EventType,PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

// Below-the-fold components - lazy loaded for better initial page load
const CategoriesSection = dynamic(
  () => import('@/features/landing/components/dumb/CategoriesSection').then(mod => ({ default: mod.CategoriesSection })),
  { loading: () => <div className="py-20 bg-white" /> }
)

const OrganizersSection = dynamic(
  () => import('@/features/landing/components/dumb/OrganizersSection').then(mod => ({ default: mod.OrganizersSection })),
  { loading: () => <div className="py-16 bg-primary-600" /> }
)

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
    <div className="min-h-screen bg-white">
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
    </div>
  )
}
