/**
 * Admin Dashboard Page
 *
 * Main admin page for event approval and management.
 * Fetches initial stats and events server-side for better performance.
 * Reads status filter from URL searchParams.
 */

import type { Metadata } from 'next'

import { AdminDashboardContainer } from '@/features/approval/components/smart/AdminDashboardContainer'
import { adminEventService } from '@/features/approval/services/admin-event.service'
import { adminStatsService } from '@/features/approval/services/admin-stats.service'

export const metadata: Metadata = {
  title: 'Panel de Aprobación - Admin',
  description: 'Panel de administración para aprobación de eventos',
  robots: { index: false, follow: false }
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || null

  // Fetch stats and events server-side in parallel
  const [initialStats, initialEvents] = await Promise.all([
    adminStatsService.getSummary().catch(() => null),
    adminEventService.getAll({ status: statusFilter }).catch(() => ({
      data: [],
      meta: { current_page: 1, total: 0 }
    }))
  ])

  return (
    <AdminDashboardContainer
      initialStats={initialStats}
      initialEvents={initialEvents}
      initialStatusFilter={statusFilter}
    />
  )
}
