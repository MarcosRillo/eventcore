'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_internal_approval', label: 'Pendiente Aprobación' },
  { value: 'approved_internal', label: 'Aprobado Interno' },
  { value: 'published', label: 'Publicado' },
  { value: 'requires_changes', label: 'Requiere Cambios' },
  { value: 'rejected', label: 'Rechazado' }
];

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  draft: 'default',
  pending_internal_approval: 'warning',
  approved_internal: 'info',
  published: 'success',
  requires_changes: 'warning',
  rejected: 'danger'
};

export default function OrganizerEventsPage() {
  const router = useRouter();
  const {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePerPage
  } = useOrganizerEvents();

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ status: status || undefined });
  };

  const handleView = (eventId: number) => {
    router.push(`/organizer/events/${eventId}`);
  };

  const handleEdit = (eventId: number) => {
    router.push(`/organizer/events/${eventId}/edit`);
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      // TODO: Implementar delete en organizerService
      console.log('Delete event:', eventId);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleCreate = () => {
    router.push('/organizer/events/create');
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los eventos de tu organización
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por título..."
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                Buscar
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status || ''}
              onChange={(value: string | number) => handleStatusChange(String(value))}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.category?.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>{new Date(event.start_date).toLocaleDateString('es-AR')}</div>
                  {event.end_date && (
                    <div className="text-gray-500">
                      a {new Date(event.end_date).toLocaleDateString('es-AR')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {event.location?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={STATUS_VARIANTS[event.status?.status_code] || 'default'}>
                    {event.status?.name}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(event.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(event.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
                {pagination.total} eventos
              </div>

              <div className="flex items-center gap-4">
                {/* Per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Por página:</span>
                  <Select
                    value={pagination.perPage.toString()}
                    onChange={(value: string | number) => changePerPage(Number(value))}
                    options={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' }
                    ]}
                    className="w-20"
                  />
                </div>

                {/* Page navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {events.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">
            No hay eventos que coincidan con los filtros seleccionados
          </p>
          {(filters.search || filters.status) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchInput('');
                updateFilters({ search: undefined, status: undefined });
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
