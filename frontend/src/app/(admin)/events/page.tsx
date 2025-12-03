'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClockIcon, CheckCircleIcon, ShareIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types/event.types';
import { useEventManager } from '@/features/events/hooks/useEventManager';
import { useApprovalManager } from '@/features/entity-admin/hooks';
import {
  EventFiltersBar,
} from '@/features/events/components';
import { DashboardModeView, EventTableContainer, ApprovalModalContainer } from '@/features/entity-admin';
import { EventDetailModal } from '@/components/ui';
import { Pagination, ConfirmDialog, PromptDialog } from '@/components/ui';
import { ErrorAlert } from '@/shared/components/alerts';
import { StatsCard, StatsGrid } from '@/shared/components/stats';

type ViewMode = 'table' | 'dashboard';

export default function EventsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Dialog states for replacing native dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  // Double-level approval workflow hook
  const {
    approveInternal: workflowApproveInternal,
    requestPublicApproval: workflowRequestPublicApproval,
    publishEvent: workflowPublishEvent,
    requestChanges: workflowRequestChanges,
    rejectEvent: workflowRejectEvent,
    isLoading: approvalLoading,
    error: approvalError,
    clearError: clearApprovalError,
  } = useApprovalManager();

  const {
    // State
    events,
    pagination,
    filters,
    statistics,
    isLoading,
    error,
    currentEvent,
    isApprovalModalOpen,

    // CRUD operations (only delete for admin - organizers create/edit)
    deleteEvent,

    // Approval workflow
    approveInternal,
    requestPublic,
    approvePublic,
    requestChanges,
    rejectEvent,

    // Actions
    openApprovalModal,
    closeAllModals,
    updateFilters,
    resetFilters,
    changePage,
    refreshData,
  } = useEventManager();

  // Determine default view mode based on user role
  const shouldShowDashboardByDefault = useCallback(() => {
    const userRole = user?.role?.role_code;
    return userRole === 'entity_admin' || userRole === 'entity_staff';
  }, [user?.role?.role_code]);

  // Set default view mode based on user role
  useEffect(() => {
    if (user) {
      const defaultMode = shouldShowDashboardByDefault() ? 'dashboard' : 'table';
      setViewMode(defaultMode);
    }
  }, [user, shouldShowDashboardByDefault]);
  
  const handleSelectEvent = (event: Event) => {
    // In table mode, open detail modal
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleViewDetail = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsDetailModalOpen(true);
    }
  };

  const closeDetailModal = () => {
    setSelectedEvent(null);
    setIsDetailModalOpen(false);
    clearApprovalError();
  };

  const handleApprovalAction = (event: Event) => {
    openApprovalModal(event);
  };

  // Double-level approval handlers
  const handleApproveInternal = async (event: Event) => {
    const updatedEvent = await workflowApproveInternal(event.id, 'Aprobado para calendario interno');
    if (updatedEvent) {
      refreshData(); // Refresh events list
    }
  };

  const handleRequestPublicApproval = async (event: Event) => {
    setPromptDialog({
      isOpen: true,
      title: 'Solicitud de Aprobación Pública',
      message: 'Ingresa un comentario opcional para la solicitud de aprobación:',
      defaultValue: '',
      onConfirm: async (comment: string) => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        const updatedEvent = await workflowRequestPublicApproval(event.id, comment || 'Solicitud de aprobación para calendario público');
        if (updatedEvent) {
          refreshData();
        }
      },
    });
  };

  const handlePublishEvent = async (event: Event) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Publicación',
      message: '¿Estás seguro de que quieres publicar este evento en el calendario público?',
      variant: 'success',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const updatedEvent = await workflowPublishEvent(event.id);
        if (updatedEvent) {
          refreshData();
        }
      },
    });
  };

  // Legacy handler for backward compatibility
  const handleApproveEvent = async (event: Event) => {
    return handleApproveInternal(event);
  };

  const handleRequestChangesEvent = async (event: Event) => {
    setPromptDialog({
      isOpen: true,
      title: 'Solicitar Cambios',
      message: 'Ingresa los cambios solicitados:',
      onConfirm: async (feedback: string) => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        if (!feedback.trim()) return;

        const updatedEvent = await workflowRequestChanges(event.id, feedback);
        if (updatedEvent) {
          refreshData();
        }
      },
    });
  };

  const handleRejectEvent = async (event: Event) => {
    setPromptDialog({
      isOpen: true,
      title: 'Rechazar Evento',
      message: 'Ingresa el motivo del rechazo:',
      onConfirm: (reason: string) => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        if (!reason.trim()) return;

        // Show confirmation after getting the reason
        setConfirmDialog({
          isOpen: true,
          title: 'Confirmar Rechazo',
          message: '¿Estás seguro de que quieres rechazar este evento?',
          variant: 'danger',
          onConfirm: async () => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            const updatedEvent = await workflowRejectEvent(event.id, reason);
            if (updatedEvent) {
              refreshData();
            }
          },
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Gestión de Eventos</h1>
            <p className="mt-2 text-neutral-600">
              {shouldShowDashboardByDefault()
                ? 'Dashboard de gestión y aprobación de eventos'
                : 'Administra y supervisa todos los eventos de la organización'
              }
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'dashboard'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
              title="Vista Dashboard"
              aria-label="Vista Dashboard"
            >
              <Squares2X2Icon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
              title="Vista Tabla"
              aria-label="Vista Tabla"
            >
              <ViewColumnsIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Approval Error Notification */}
        {approvalError && (
          <div className="mb-6">
            <ErrorAlert
              message={approvalError.message}
              title="Error en la operación"
              details={approvalError.details}
              onDismiss={clearApprovalError}
            />
          </div>
        )}

        {/* Statistics */}
        {statistics && (
          <div className="mb-8">
            <StatsGrid columns={4}>
              <StatsCard
                label="Total Eventos"
                value={statistics.total}
                icon={<CheckCircleIcon className="w-5 h-5" />}
                color="primary"
              />
              <StatsCard
                label="Pendientes"
                value={statistics.draft}
                icon={<ClockIcon className="w-5 h-5" />}
                color="warning"
              />
              <StatsCard
                label="Próximos"
                value={statistics.upcoming}
                icon={<CheckCircleIcon className="w-5 h-5" />}
                color="success"
              />
              <StatsCard
                label="Públicos"
                value={statistics.published}
                icon={<ShareIcon className="w-5 h-5" />}
                color="success"
              />
            </StatsGrid>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              onRetry={refreshData}
            />
          </div>
        )}

        {/* Conditional View Rendering */}
        {viewMode === 'dashboard' ? (
          /* Dashboard Mode View */
          <DashboardModeView
            events={events}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
            onDeleteEvent={deleteEvent}
            onApproveInternal={handleApproveInternal}
            onRequestPublicApproval={handleRequestPublicApproval}
            onPublishEvent={handlePublishEvent}
            onRequestChanges={handleRequestChangesEvent}
            onRejectEvent={handleRejectEvent}
            // Legacy compatibility
            onApproveEvent={handleApproveEvent}
          />
        ) : (
          /* Table Mode View (Original) */
          <>
            {/* Filters */}
            <EventFiltersBar
              filters={filters}
              onFiltersChange={updateFilters}
              sections={[]}
              onClearFilters={resetFilters}
            />

            {/* Events table */}
            <div className="bg-white shadow-sm rounded-lg">
              <EventTableContainer
                events={events}
                isLoading={isLoading}
                onSelectEvent={handleSelectEvent}
                onDeleteEvent={deleteEvent}
                onApprovalAction={handleApprovalAction}
              />

              {/* Pagination */}
              {pagination && (
                <div className="border-t border-neutral-200 px-6">
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={changePage}
                    showInfo={true}
                    totalItems={pagination.total}
                    itemsFrom={pagination.from ?? undefined}
                    itemsTo={pagination.to ?? undefined}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        <ApprovalModalContainer
          isOpen={isApprovalModalOpen}
          event={currentEvent}
          onClose={closeAllModals}
          onSuccess={() => {
            closeAllModals();
            refreshData();
          }}
          onApproveInternal={approveInternal}
          onRequestPublic={requestPublic}
          onApprovePublic={approvePublic}
          onRequestChanges={requestChanges}
          onReject={rejectEvent}
        />

        <EventDetailModal
          isOpen={isDetailModalOpen}
          event={selectedEvent}
          onClose={closeDetailModal}
          onDelete={deleteEvent}
          onApproveInternal={async (event) => {
            await handleApproveInternal(event);
            closeDetailModal();
          }}
          onRequestPublicApproval={async (event) => {
            await handleRequestPublicApproval(event);
            closeDetailModal();
          }}
          onPublishEvent={async (event) => {
            await handlePublishEvent(event);
            closeDetailModal();
          }}
          onRequestChanges={async (event) => {
            await handleRequestChangesEvent(event);
            closeDetailModal();
          }}
          onReject={async (event) => {
            await handleRejectEvent(event);
            closeDetailModal();
          }}
          // Legacy compatibility
          onApprove={async (event) => {
            await handleApproveEvent(event);
            closeDetailModal();
          }}
        />

        {/* Dialog Components */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          loading={approvalLoading}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

        <PromptDialog
          isOpen={promptDialog.isOpen}
          title={promptDialog.title}
          message={promptDialog.message}
          defaultValue={promptDialog.defaultValue}
          required={true}
          loading={approvalLoading}
          onConfirm={promptDialog.onConfirm}
          onCancel={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}
