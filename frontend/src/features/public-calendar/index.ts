/**
 * Public Calendar Feature - Main Barrel Export
 *
 * Public-facing calendar and event display.
 */

// Hooks
export { useCalendarEvents } from '@/features/public-calendar/hooks/useCalendarEvents'
export { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
export { useSanitizedHTML } from '@/features/public-calendar/hooks/useSanitizedHTML'

// Services
export { publicEventsService } from '@/features/public-calendar/services/public-events.service'

// Types
export * from '@/features/public-calendar/types/public-calendar.types'
