/**
 * Organizer Dashboard Component (Presentational)
 *
 * Main dashboard UI integrating stats, filters, and event list.
 */

import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react'
import Link from 'next/link'

import { EventViewTabs } from '@/features/organizer/components/dumb/EventViewTabs'
import { OrganizerEventListItem } from '@/features/organizer/components/dumb/OrganizerEventListItem'
import { OrganizerQuickFilters } from '@/features/organizer/components/dumb/OrganizerQuickFilters'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types'
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState'
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner'
import { Button } from '@/shared/components/form'
import StatCard from '@/shared/components/stats/StatCard'
import Pagination from '@/shared/components/tables/Pagination'

interface OrganizerDashboardProps {
  stats: OrganizerStats | null
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
  onSuccess: () => void
  onEdit: (id: number) => void
  onView: (id: number) => void
}

export const OrganizerDashboard = ({
  stats,
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
  return (
    <main className="container mx-auto px-4 max-w-7xl" role="main">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Mis Eventos</h1>
          <p className="text-neutral-600 mt-1">Gestiona tus eventos y su proceso de aprobación</p>
        </div>
        <Link href="/organizer/create" aria-label="Crear nuevo evento">
          <Button variant="primary" size="lg">
            + Crear Evento
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      {stats && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
          data-testid="stats-grid"
        >
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            value={stats.total_events}
            label="Total Eventos"
            variant="default"
          />
          <StatCard
            icon={<CalendarClock className="w-5 h-5" />}
            value={stats.upcoming_events}
            label="Próximos"
            variant="primary"
          />
          <StatCard
            icon={<CalendarCheck className="w-5 h-5" />}
            value={stats.past_events}
            label="Pasados"
            variant="default"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            value={stats.pending_internal}
            label="Pendientes"
            variant="warning"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            value={stats.approved_internal}
            label="Aprobados"
            variant="success"
          />
          <StatCard
            icon={<Globe className="w-5 h-5" />}
            value={stats.published}
            label="Publicados"
            variant="info"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            value={stats.requires_changes}
            label="Requiere Cambios"
            variant="error"
          />
        </div>
      )}

      {/* Filters */}
      <OrganizerQuickFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* Date Filter Tabs */}
      <EventViewTabs
        activeTab={showPast ? 'past' : 'upcoming'}
        onTabChange={(tab) => onShowPastChange(tab === 'past')}
        upcomingCount={stats?.upcoming_events}
        pastCount={stats?.past_events}
      />

      {/* Event List Section */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 flex justify-center animate-fadeIn" role="status" aria-label="Cargando eventos">
            <LoadingSpinner size="lg" text="Cargando eventos..." />
          </div>
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
            title={activeFilter ? "No hay eventos con este filtro" : "Aún no tienes eventos"}
            description={activeFilter
              ? "Prueba cambiando los filtros o crea un nuevo evento"
              : "Comienza creando tu primer evento para verlo aquí"
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
            <div className="p-4 space-y-2">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-slideInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <OrganizerEventListItem
                    event={event}
                    onEdit={() => onEdit(event.id)}
                    onView={() => onView(event.id)}
                    onSuccess={onSuccess}
                  />
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-neutral-200 px-4 py-3">
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
  )
}
