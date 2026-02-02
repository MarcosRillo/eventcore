/**
 * Organizer Dashboard Page
 *
 * Main landing page for organizers. Displays stats, event list,
 * and provides access to all organizer functionality.
 */

import { Suspense } from 'react'

import { OrganizerDashboardContainer } from '@/features/organizer-dashboard'
import { LoadingSpinner } from '@/shared/components/feedback'

// Loading fallback for dashboard
const DashboardSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Cargando dashboard..." />
  </div>
)

/**
 *
 */
export default function OrganizerDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OrganizerDashboardContainer />
    </Suspense>
  )
}
