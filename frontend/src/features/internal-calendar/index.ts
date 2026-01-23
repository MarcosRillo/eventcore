/**
 * Internal Calendar Feature - Main Barrel Export
 *
 * Internal calendar for entity admins and staff.
 */

// Components - Dumb
export { ExportCalendarButton } from '@/features/internal-calendar/components/dumb/ExportCalendarButton'
export { QRCodeModal } from '@/features/internal-calendar/components/dumb/QRCodeModal'

// Hooks
export { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents'

// Services
export { getInternalStats } from '@/features/internal-calendar/services/internal-calendar-stats.service'
export { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service'

// Utils
export { downloadICS, downloadSingleEventICS, generateICS } from '@/features/internal-calendar/utils/icsGenerator'

// Types
export * from '@/features/internal-calendar/types/internal-calendar.types'
