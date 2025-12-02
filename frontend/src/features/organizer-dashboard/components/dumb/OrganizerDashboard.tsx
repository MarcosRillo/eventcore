/**
 * Organizer Dashboard Component (Presentational)
 *
 * Main dashboard UI integrating stats, filters, and event list.
 */

import Link from 'next/link'
import { OrganizerQuickFilters } from '@/features/organizer/components/dumb/OrganizerQuickFilters'
import { OrganizerEventListItem } from '@/features/organizer/components/dumb/OrganizerEventListItem'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types'

interface OrganizerDashboardProps {
  stats: OrganizerStats | null
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  activeFilter: string | null
  currentPage: number
  totalPages: number
  onFilterChange: (status: string | null) => void
  onPageChange: (page: number) => void
  onSuccess: () => void
}

export const OrganizerDashboard = ({
  stats,
  events,
  loading,
  error,
  activeFilter,
  currentPage,
  totalPages,
  onFilterChange,
  onPageChange,
  onSuccess
}: OrganizerDashboardProps) => {
  return (
    <main className="container mx-auto px-4 max-w-7xl" role="main">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Mis Eventos</h1>
          <p className="text-neutral-600 mt-1">Gestiona tus eventos y su proceso de aprobación</p>
        </div>
        <Link
          href="/organizer/create"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          aria-label="Crear nuevo evento"
        >
          + Crear Evento
        </Link>
      </div>

      {/* Stats Section */}
      {stats && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          data-testid="stats-grid"
        >
          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-neutral-500">Total Eventos</h3>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total_events}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-neutral-500">Pendientes</h3>
              <p className="text-3xl font-bold text-warning-600 mt-2">{stats.pending_internal}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-neutral-500">Aprobados</h3>
              <p className="text-3xl font-bold text-success-600 mt-2">{stats.approved_internal}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-neutral-500">Publicados</h3>
              <p className="text-3xl font-bold text-info-600 mt-2">{stats.published}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-neutral-500">Requiere Cambios</h3>
              <p className="text-3xl font-bold text-danger-600 mt-2">{stats.requires_changes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <OrganizerQuickFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* Event List Section */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 flex justify-center" role="status" aria-label="Loading events">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-danger-600">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-600 mb-4">No se encontraron eventos</p>
            <Link
              href="/organizer/create"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              aria-label="Crear tu primer evento"
            >
              Crear tu Primer Evento
            </Link>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-2">
              {events.map((event) => (
                <OrganizerEventListItem
                  key={event.id}
                  event={event}
                  onEdit={() => {}}
                  onView={() => {}}
                  onSuccess={onSuccess}
                />
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
