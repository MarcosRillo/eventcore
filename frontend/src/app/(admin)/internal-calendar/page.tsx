/**
 * Admin Calendar Page
 *
 * Internal calendar for entity admins and staff.
 * Shows approved internal events, pending public approval, and published events.
 */

import { InternalCalendarContainer } from '@/features/internal-calendar/components/smart/InternalCalendarContainer'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario Interno</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vista de eventos aprobados para calendario interno y público
        </p>
      </div>

      <InternalCalendarContainer />
    </div>
  )
}
