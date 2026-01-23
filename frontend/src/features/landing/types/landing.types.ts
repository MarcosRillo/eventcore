/**
 * Landing Types
 * Type definitions for landing page components
 */

import { EventType,PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

export interface LandingData {
  featuredEvents: PublicEvent[]
  eventTypes: EventType[]
  loading: boolean
  error: string | null
}

export interface HeroSectionProps {
  onExploreClick: () => void
}

export interface FeaturedEventsSectionProps {
  events: PublicEvent[]
  loading: boolean
  onEventClick: (eventId: number) => void
  onViewAllClick: () => void
}

export interface CategoriesSectionProps {
  eventTypes: EventType[]
  loading: boolean
  onCategoryClick: (categoryId: number) => void
}
