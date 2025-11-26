/**
 * Landing Types
 * Type definitions for landing page components
 */

import { PublicEvent, Category } from '@/features/public-calendar/types/public-calendar.types'

export interface LandingData {
  featuredEvents: PublicEvent[]
  categories: Category[]
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
  categories: Category[]
  loading: boolean
  onCategoryClick: (categoryId: number) => void
}
