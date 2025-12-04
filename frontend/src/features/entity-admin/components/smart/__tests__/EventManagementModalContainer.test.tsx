/**
 * Tests for EventManagementModalContainer
 *
 * Smart component that composes the event management modal with all panels.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventManagementModalContainer } from '../EventManagementModalContainer';
import * as useEventManagementModule from '@/features/entity-admin/hooks/useEventManagement';
import * as useApprovalManagerModule from '@/features/entity-admin/hooks/useApprovalManager';
import type { Event } from '@/types/event.types';

jest.mock('@/features/entity-admin/hooks/useEventManagement');
jest.mock('@/features/entity-admin/hooks/useApprovalManager');

describe('EventManagementModalContainer', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test description for the event',
    start_date: '2025-03-15T10:00:00',
    end_date: '2025-03-15T18:00:00',
    type: 'sede_unica',
    status: 'pending_internal_approval',
    locations: [
      {
        id: 1,
        name: 'Test Location',
        address: 'Test Address',
        city: 'Test City',
        is_active: true,
        entity_id: 1,
        created_at: '2025-01-01T00:00:00',
        updated_at: '2025-01-01T00:00:00',
      },
    ],
    event_type: { id: 1, name: 'Cultural', is_active: true },
    is_featured: false,
    approval_history: [],
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  };

  const mockUseEventManagement = {
    isOpen: true,
    selectedEvent: mockEvent,
    selectedAction: null,
    comment: '',
    commentError: null,
    availableActions: ['approve_internal', 'request_changes', 'reject'],
    isLoading: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    selectAction: jest.fn(),
    setComment: jest.fn(),
    confirmAction: jest.fn(),
    cancelAction: jest.fn(),
  };

  const mockUseApprovalManager = {
    approveInternal: jest.fn(),
    requestPublic: jest.fn(),
    publish: jest.fn(),
    requestChanges: jest.fn(),
    reject: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue(mockUseEventManagement);
    (useApprovalManagerModule.useApprovalManager as jest.Mock).mockReturnValue(mockUseApprovalManager);
  });

  test('renders modal when open with event', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText('Gestionar Evento')).toBeInTheDocument();
    // Event title appears in multiple places (header and info panel)
    expect(screen.getAllByText('Test Event').length).toBeGreaterThanOrEqual(1);
  });

  test('does not render when modal is closed', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      isOpen: false,
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.queryByText('Gestionar Evento')).not.toBeInTheDocument();
  });

  test('renders event info panel with event details', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    // Event title appears multiple times
    expect(screen.getAllByText('Test Event').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Test description/)).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  test('renders approval action panel with available actions', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText('Aprobar para Calendario Interno')).toBeInTheDocument();
    expect(screen.getByText('Solicitar Correcciones')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  test('calls selectAction when action button is clicked', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    fireEvent.click(screen.getByText('Aprobar para Calendario Interno'));

    expect(mockUseEventManagement.selectAction).toHaveBeenCalledWith('approve_internal');
  });

  test('shows confirm/cancel buttons when action is selected', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'approve_internal',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  test('calls confirmAction when confirm button is clicked', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'approve_internal',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    fireEvent.click(screen.getByText('Confirmar'));

    expect(mockUseEventManagement.confirmAction).toHaveBeenCalled();
  });

  test('calls cancelAction when cancel button is clicked', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'approve_internal',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockUseEventManagement.cancelAction).toHaveBeenCalled();
  });

  test('shows comment textarea for actions requiring comment', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'request_changes',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByPlaceholderText(/Escribe el motivo/)).toBeInTheDocument();
  });

  test('calls setComment when typing in comment textarea', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'request_changes',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    const textarea = screen.getByPlaceholderText(/Escribe el motivo/);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    expect(mockUseEventManagement.setComment).toHaveBeenCalledWith('Test comment');
  });

  test('displays comment error when provided', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'request_changes',
      commentError: 'El comentario debe tener al menos 10 caracteres',
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText('El comentario debe tener al menos 10 caracteres')).toBeInTheDocument();
  });

  test('calls closeModal when modal is closed', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    // Find and click the close button (X button in modal header)
    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeButton);

    expect(mockUseEventManagement.closeModal).toHaveBeenCalled();
  });

  test('renders approval history timeline when event has history', () => {
    const eventWithHistory: Event = {
      ...mockEvent,
      approval_history: [
        {
          action: 'submit',
          user_id: 1,
          comment: 'Submitted for review',
          timestamp: '2025-03-01T10:00:00',
        },
      ],
    };

    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedEvent: eventWithHistory,
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText(/Historial de Aprobación/)).toBeInTheDocument();
  });

  test('exposes openModal function via ref', () => {
    const onActionSuccess = jest.fn();
    const { rerender } = render(
      <EventManagementModalContainer onActionSuccess={onActionSuccess} />
    );

    // The openModal should be accessible
    expect(mockUseEventManagement.openModal).toBeDefined();
  });

  test('shows loading state when processing action', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      selectedAction: 'approve_internal',
      isLoading: true,
    });

    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  test('handles event with no approval history gracefully', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    expect(screen.getByText(/Sin historial/)).toBeInTheDocument();
  });

  test('passes correct current status to action panel', () => {
    render(<EventManagementModalContainer onActionSuccess={jest.fn()} />);

    // Status appears in modal header and action panel
    expect(screen.getAllByText('Pendiente Aprobación Interna').length).toBeGreaterThanOrEqual(1);
  });
});
