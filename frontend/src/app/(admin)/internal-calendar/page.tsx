/**
 * Admin Calendar Page
 *
 * Internal calendar for entity admins and staff.
 * Shows approved internal events and published events.
 * Features: Grid/Calendar view toggle, event cards, calendar view with date-fns.
 */

import type { Metadata } from 'next'

import { InternalCalendarPageContainer } from '@/features/internal-calendar/components/smart/InternalCalendarPageContainer'

export const metadata: Metadata = {
  title: 'Calendario Interno - Admin',
  description: 'Calendario interno para administradores y staff',
  robots: { index: false, follow: false }
}

export default function CalendarPage() {
  return <InternalCalendarPageContainer basePath="/internal-calendar" />
}
