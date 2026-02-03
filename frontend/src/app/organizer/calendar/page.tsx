/**
 * Organizer Calendar Page
 *
 * Internal calendar for organizers to view their organization's approved events.
 * Shows approved internal events, pending public approval, and published events.
 * Features: Grid/Calendar view toggle, event cards, stats bar.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'

import { InternalCalendarPageContainer } from '@/features/internal-calendar/components/smart/InternalCalendarPageContainer'

export const metadata: Metadata = {
  title: 'Calendario - Organizador',
  description: 'Calendario de eventos de la organización',
  robots: { index: false, follow: false }
}

/**
 *
 */
export default function CalendarPage() {
  return (
    <Suspense>
      <InternalCalendarPageContainer basePath="/organizer/calendar" />
    </Suspense>
  )
}
