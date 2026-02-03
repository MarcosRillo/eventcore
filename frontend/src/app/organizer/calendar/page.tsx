/**
 * Organizer Calendar Page
 *
 * Internal calendar for organizers to view their organization's approved events.
 * Shows approved internal events, pending public approval, and published events.
 * Features: Grid/Calendar view toggle, event cards, stats bar.
 */

import { InternalCalendarPageContainer } from '@/features/internal-calendar/components/smart/InternalCalendarPageContainer'

/**
 *
 */
export default function CalendarPage() {
  return <InternalCalendarPageContainer basePath="/organizer/calendar" />
}
