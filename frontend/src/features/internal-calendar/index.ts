/**
 * Internal Calendar Feature - Main Barrel Export
 *
 * Internal calendar for entity admins and staff.
 */

// Hooks
export { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents'

// Services
export { getInternalStats } from '@/features/internal-calendar/services/internal-calendar-stats.service'
export { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service'

// Types
export * from '@/features/internal-calendar/types/internal-calendar.types'
