/**
 * Organizer Dashboard Component (Presentational)
 *
 * Main dashboard UI integrating stats summary, unified filters, and event list.
 */

import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

import { OrganizerEventFilters } from '@/features/organizer/components/dumb/OrganizerEventFilters'
import { OrganizerEventListItem } from '@/features/organizer/components/dumb/OrganizerEventListItem'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types'
import { EventPreviewCardSkeletons } from '@/shared/components/display'
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/form'
import { EventGrid, PageHeader } from '@/shared/components/layout'
import type { StatBarItem } from '@/shared/components/stats'
import { StatsBar } from '@/shared/components/stats'
import Pagination from '@/shared/components/tables/Pagination'

interface OrganizerDashboardProps {
  stats: OrganizerStats | null
  statsLoading: boolean
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  activeFilter: string | null
  showPast: boolean
  currentPage: number
  totalPages: number
  onFilterChange: (status: string | null) => void
  onShowPastChange: (isPast: boolean) => void
  onPageChange: (page: number) => void
  onSuccess: (deletedEventId?: number) => void
  onEdit: (id: number) => void
  onView: (id: number) => void
}

function buildStatsItems(stats: OrganizerStats): StatBarItem[] {
  return [
    { value: stats.total_events, label: 'Total eventos', icon: <Calendar className="w-5 h-5" /> },
    { value: stats.upcoming_events, label: 'Proximos', icon: <Clock className="w-5 h-5" /> },
    { value: stats.past_events, label: 'Pasados', icon: <CheckCircle2 className="w-5 h-5" /> },
    { value: stats.pending_internal, label: 'Pendientes', icon: <AlertCircle className="w-5 h-5" /> },
    { value: stats.requires_changes, label: 'Req. cambios', icon: <AlertTriangle className="w-5 h-5" /> },
  ]
}

export const OrganizerDashboard = ({
  stats,
  statsLoading,
  events,
  loading,
  error,
  activeFilter,
  showPast,
  currentPage,
  totalPages,
  onFilterChange,
  onShowPastChange,
  onPageChange,
  onSuccess,
  onEdit,
  onView
}: OrganizerDashboardProps) => {
  const statusCounts = stats ? {
    total: stats.total_events,
    draft: stats.draft,
    pending_internal: stats.pending_internal,
    approved_internal: stats.approved_internal,
    published: stats.published,
    requires_changes: stats.requires_changes,
    rejected: stats.rejected,
  } : null

  return (
    <div>
      {/* Stats Summary Bar */}
      <StatsBar
        items={stats ? buildStatsItems(stats) : []}
        loading={statsLoading}
        skeletonCount={5}
        ariaLabel="Resumen de estadisticas"
      />

      <main className="container mx-auto px-4 max-w-7xl" role="main">
        {/* Header Section */}
        <div className="mb-6 mt-6">
          <PageHeader
            title="Mis Eventos"
            subtitle="Gestiona tus eventos y su proceso de aprobacion"
            action={
              <Link href="/organizer/create" aria-label="Crear nuevo evento">
                <Button variant="primary" size="lg">
                  + Crear Evento
                </Button>
              </Link>
            }
          />
        </div>

        {/* Unified Filters */}
        <OrganizerEventFilters
          activeStatus={activeFilter}
          timeScope={showPast ? 'past' : 'upcoming'}
          onStatusChange={onFilterChange}
          onTimeScopeChange={(scope) => onShowPastChange(scope === 'past')}
          statusCounts={statusCounts}
        />

        {/* Event List Section */}
        <div>
          {loading ? (
            <EventGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={6} className="p-4">
              <div
                role="status"
                aria-live="polite"
                aria-label="Cargando eventos"
                className="contents"
              >
                <EventPreviewCardSkeletons count={6} />
              </div>
            </EventGrid>
          ) : error ? (
            <EmptyState
              icon={EmptyStateIcons.inbox}
              title="Error al cargar eventos"
              description={error}
              size="md"
              className="py-12"
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={EmptyStateIcons.calendar}
              title={activeFilter ? "No hay eventos con este filtro" : "Aun no tienes eventos"}
              description={activeFilter
                ? "Prueba cambiando los filtros o crea un nuevo evento"
                : "Comienza creando tu primer evento para verlo aqui"
              }
              size="lg"
              className="py-16"
              action={
                <Link href="/organizer/create">
                  <Button variant="primary" size="lg">
                    + Crear Evento
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <EventGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={6} className="p-4">
                {events.map((event) => (
                  <OrganizerEventListItem
                    key={event.id}
                    event={event}
                    onEdit={() => onEdit(event.id)}
                    onView={() => onView(event.id)}
                    onSuccess={onSuccess}
                  />
                ))}
              </EventGrid>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border-t border-neutral-200 px-4 py-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
