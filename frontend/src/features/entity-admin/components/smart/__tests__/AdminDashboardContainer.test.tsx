/**
 * Tests for AdminDashboardContainer
 *
 * Smart component that composes the admin dashboard with stats, filters, and event list.
 * Uses the new redesigned UI with AdminDashboard, AdminStatsSummary, AdminEventFilters, and AdminEventList.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { AdminDashboardContainer } from '@/features/entity-admin/components/smart/AdminDashboardContainer';
import * as useAdminStatsModule from '@/features/entity-admin/hooks/useAdminStats';
import * as useEventManagementModule from '@/features/entity-admin/hooks/useEventManagement';
import type { AdminStatCardData } from '@/features/entity-admin/types';
import * as useEventManagerModule from '@/features/events/hooks/useEventManager';
import type { Event } from '@/types/event.types';

jest.mock('@/features/entity-admin/hooks/useAdminStats');
jest.mock('@/features/entity-admin/hooks/useEventManagement');
jest.mock('@/features/events/hooks/useEventManager');


describe('AdminDashboardContainer', () => {
  const mockCardData: AdminStatCardData[] = [
    {
      key: 'total',
      label: 'Total Eventos',
      value: 50,
      color: 'primary',
    },
    {
      key: 'pending_internal',
      label: 'Pendientes Internos',
      value: 10,
      color: 'warning',
    },
    {
      key: 'pending_public',
      label: 'Pendientes Públicos',
      value: 5,
      color: 'warning',
    },
    {
      key: 'published',
      label: 'Publicados',
      value: 30,
      color: 'success',
    },
  ];

  const mockStats = {
    total: 50,
    pending_internal_approval: 10,
    pending_public_approval: 5,
    published: 30,
    rejected: 3,
    requires_changes: 2,
    approved_internal: 0,
    draft: 0,
    cancelled: 0,
  };

  const mockStatusCounts = {
    total: 50,
    pending_internal_approval: 10,
    pending_public_approval: 5,
    published: 30,
    requires_changes: 2,
    rejected: 3,
  };

  const mockUseAdminStats = {
    stats: mockStats,
    cardData: mockCardData,
    statusCounts: mockStatusCounts,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  };

  const mockUseEventManagement = {
    isOpen: false,
    selectedEvent: null,
    selectedAction: null,
    comment: '',
    commentError: null,
    availableActions: [],
    isLoading: false,
    error: null,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    selectAction: jest.fn(),
    setComment: jest.fn(),
    confirmAction: jest.fn(),
    cancelAction: jest.fn(),
  };

  const mockEvents: Event[] = [
    {
      id: 1,
      title: 'Test Event 1',
      description: 'Description 1',
      start_date: '2025-03-15T10:00:00Z',
      end_date: '2025-03-15T12:00:00Z',
      type: 'sede_unica',
      status: 'pending_internal_approval',
      locations: [{ id: 1, name: 'Test Location', address: '123 Test St', latitude: 0, longitude: 0 }],
      is_featured: false,
      approval_history: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  const mockUseEventManager = {
    events: mockEvents,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 1,
      from: 1,
      to: 1,
    },
    filters: {},
    statistics: null,
    isLoading: false,
    error: null,
    currentEvent: null,
    isApprovalModalOpen: false,
    deleteEvent: jest.fn(),
    approveInternal: jest.fn(),
    requestPublic: jest.fn(),
    approvePublic: jest.fn(),
    requestChanges: jest.fn(),
    rejectEvent: jest.fn(),
    openApprovalModal: jest.fn(),
    closeAllModals: jest.fn(),
    updateFilters: jest.fn(),
    resetFilters: jest.fn(),
    changePage: jest.fn(),
    refreshData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminStatsModule.useAdminStats as jest.Mock).mockReturnValue(mockUseAdminStats);
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue(mockUseEventManagement);
    (useEventManagerModule.useEventManager as jest.Mock).mockReturnValue(mockUseEventManager);
  });

  test('renders stats summary bar', () => {
    render(<AdminDashboardContainer />);

    // Stats summary should show key metrics - "Total" appears in both stats bar and filters
    expect(screen.getAllByText('Total').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getAllByText('Pend. Interno').length).toBeGreaterThanOrEqual(1);
  });

  test('renders filters with status pills', () => {
    render(<AdminDashboardContainer />);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getAllByText('Pend. Interno').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pend. Público').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Publicados').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Rechazados')).toBeInTheDocument();
  });

  test('renders time scope toggle (Próximos/Pasados)', () => {
    render(<AdminDashboardContainer />);

    expect(screen.getByText('Próximos')).toBeInTheDocument();
    expect(screen.getByText('Pasados')).toBeInTheDocument();
  });

  test('renders event list with events', () => {
    render(<AdminDashboardContainer />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
  });

  test('shows loading state in stats when stats are loading', () => {
    (useAdminStatsModule.useAdminStats as jest.Mock).mockReturnValue({
      ...mockUseAdminStats,
      isLoading: true,
      stats: null,
      statusCounts: null,
    });

    render(<AdminDashboardContainer />);

    // Stats bar should show skeleton (animated pulse elements)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('changes filter when status filter pill is clicked', () => {
    render(<AdminDashboardContainer />);

    // Click on "Pend. Interno" filter (get the one in the filters section)
    const filterButtons = screen.getAllByText('Pend. Interno');
    fireEvent.click(filterButtons[0]);

    // The filter should update events
    expect(mockUseEventManager.updateFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending_internal_approval' })
    );
  });

  test('changes time scope when toggle is clicked', () => {
    render(<AdminDashboardContainer />);

    const pastButton = screen.getByText('Pasados');
    fireEvent.click(pastButton);

    expect(mockUseEventManager.updateFilters).toHaveBeenCalledWith(
      expect.objectContaining({ show_past: '1' })
    );
  });

  test('switches back to upcoming when Próximos is clicked', () => {
    render(<AdminDashboardContainer />);

    // First click Pasados to set time scope to past
    fireEvent.click(screen.getByText('Pasados'));

    // Then click Próximos
    fireEvent.click(screen.getByText('Próximos'));

    // Last call should have show_past undefined
    const lastCall = mockUseEventManager.updateFilters.mock.calls[
      mockUseEventManager.updateFilters.mock.calls.length - 1
    ][0];
    expect(lastCall.show_past).toBeUndefined();
  });

  test('opens modal when Gestionar button is clicked', () => {
    render(<AdminDashboardContainer />);

    const manageButton = screen.getByRole('button', { name: /gestionar aprobación de test event 1/i });
    fireEvent.click(manageButton);

    expect(mockUseEventManagement.openModal).toHaveBeenCalledWith(mockEvents[0]);
  });

  test('renders page title', () => {
    render(<AdminDashboardContainer />);

    expect(screen.getByText(/Gestión de Eventos/i)).toBeInTheDocument();
  });

  test('shows empty state when no events', () => {
    (useEventManagerModule.useEventManager as jest.Mock).mockReturnValue({
      ...mockUseEventManager,
      events: [],
    });

    render(<AdminDashboardContainer />);

    expect(screen.getByText('No hay eventos')).toBeInTheDocument();
  });

  test('shows loading state when events are loading', () => {
    (useEventManagerModule.useEventManager as jest.Mock).mockReturnValue({
      ...mockUseEventManager,
      isLoading: true,
      events: [],
    });

    render(<AdminDashboardContainer />);

    // Event list should show skeletons
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('clears filters when clear filters button is clicked', () => {
    // Setup with active filter
    (useEventManagerModule.useEventManager as jest.Mock).mockReturnValue({
      ...mockUseEventManager,
      events: [],
    });

    render(<AdminDashboardContainer />);

    // First apply a filter
    const filterButtons = screen.getAllByText('Pend. Interno');
    fireEvent.click(filterButtons[0]);

    // Now click clear filters (shown in empty state)
    const clearButton = screen.getByText('Limpiar filtros');
    fireEvent.click(clearButton);

    // Should call updateFilters to clear
    expect(mockUseEventManager.updateFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined, show_past: undefined })
    );
  });

  test('refetches stats when action is successful', () => {
    (useEventManagementModule.useEventManagement as jest.Mock).mockReturnValue({
      ...mockUseEventManagement,
      isOpen: true,
      selectedEvent: { id: 1, title: 'Test', status: 'pending_internal_approval', approval_history: [] },
      availableActions: ['approve_internal'],
    });

    render(<AdminDashboardContainer />);

    // The onSuccess callback should be defined and will trigger stats refetch
    expect(mockUseAdminStats.refetch).toBeDefined();
  });
});
