import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useAuth } from '@/context/AuthContext';
import { useEventTypeManager } from '@/features/event-types/hooks/useEventTypeManager';
import * as eventTypeService from '@/features/event-types/services/eventType.service';
import type { EventType } from '@/types/eventType.types';

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}));

jest.mock('@/context/AuthContext');

jest.mock('@/features/event-types/services/eventType.service', () => ({
  deleteEventType: jest.fn(),
}));

import { apiFetcher } from '@/lib/swr/fetcher';

const mockedFetcher = apiFetcher as jest.Mock;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedDeleteEventType = eventTypeService.deleteEventType as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useEventTypeManager', () => {
  const mockEventType1: EventType = {
    id: 1,
    name: 'Conferencia',
    color: '#3B82F6',
    entity_id: 1,
    is_active: true,
    subtypes_count: 3,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  const mockEventType2: EventType = {
    id: 2,
    name: 'Taller',
    color: '#10B981',
    entity_id: 1,
    is_active: false,
    subtypes_count: 0,
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  };

  const mockResponse = {
    data: [mockEventType1, mockEventType2],
    meta: {
      current_page: 1,
      last_page: 2,
      per_page: 10,
      total: 15,
      from: 1,
      to: 10,
      path: 'http://api.example.com/event-types',
      links: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: { id: 1, name: 'Admin', role_code: 'platform_admin' as const, description: 'Admin', permissions: [] },
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      token: 'mock-token',
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      canAccess: jest.fn(),
      getUserPermissions: jest.fn().mockReturnValue([]),
      canManageEvents: jest.fn(),
      canApproveEvents: jest.fn(),
      canAccessAdmin: jest.fn(),
      canManageUsers: jest.fn(),
      canManageOrganization: jest.fn(),
      canViewAnalytics: jest.fn(),
    });

    mockedFetcher.mockResolvedValue(mockResponse);
    mockedDeleteEventType.mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filterStatus).toBe('all');
      expect(result.current.currentPage).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('should fetch event types on mount when authenticated', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedFetcher).toHaveBeenCalled();
      expect(result.current.eventTypes).toHaveLength(2);
    });

    it('should not fetch when not authenticated', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        clearError: jest.fn(),
        refreshUser: jest.fn(),
        hasRole: jest.fn(),
        canAccess: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      });

      renderHook(() => useEventTypeManager(), { wrapper });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFetcher).not.toHaveBeenCalled();
    });

    it('should not fetch while auth is loading', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        user: null,
        token: null,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        clearError: jest.fn(),
        refreshUser: jest.fn(),
        hasRole: jest.fn(),
        canAccess: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      });

      renderHook(() => useEventTypeManager(), { wrapper });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFetcher).not.toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should update search term', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSearchChange('test');
      });

      expect(result.current.searchTerm).toBe('test');
    });

    it('should debounce search requests', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.handleSearchChange('t');
        result.current.handleSearchChange('te');
        result.current.handleSearchChange('tes');
        result.current.handleSearchChange('test');
      });

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalledWith(
          expect.stringContaining('search=test')
        );
      });
    });
  });

  describe('filter functionality', () => {
    it('should update filter status to active', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleFilterChange('active');
      });

      expect(result.current.filterStatus).toBe('active');
    });

    it('should update filter status to inactive', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleFilterChange('inactive');
      });

      expect(result.current.filterStatus).toBe('inactive');
    });

    it('should reset to all filter', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleFilterChange('active');
      });

      act(() => {
        result.current.handleFilterChange('all');
      });

      expect(result.current.filterStatus).toBe('all');
    });
  });

  describe('pagination', () => {
    it('should update current page', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should fetch data for new page', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.changePage(3);
      });

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalledWith(
          expect.stringContaining('page=3')
        );
      });
    });

    it('should return pagination object', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.eventTypes.length).toBeGreaterThan(0);
      });

      expect(result.current.pagination).toBeDefined();
      expect(result.current.pagination?.current_page).toBe(1);
      expect(result.current.pagination?.total).toBe(15);
    });
  });

  describe('delete event type', () => {
    it('should delete event type successfully', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDeleteEventType(1);
      });

      expect(mockedDeleteEventType).toHaveBeenCalledWith(1);
    });

    it('should perform optimistic update on delete', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.eventTypes.length;

      await act(async () => {
        await result.current.handleDeleteEventType(1);
      });

      expect(result.current.eventTypes.length).toBeLessThanOrEqual(initialLength);
    });

    it('should handle delete error and throw', async () => {
      mockedDeleteEventType.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.handleDeleteEventType(1);
        })
      ).rejects.toThrow('Error al eliminar el tipo de evento');
    });
  });

  describe('optimistic updates', () => {
    it('should add event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newEventType: EventType = {
        id: 3,
        name: 'New Type',
        color: '#3B82F6',
        entity_id: 1,
        is_active: true,
        subtypes_count: 0,
        created_at: '2025-01-03T00:00:00.000Z',
        updated_at: '2025-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addEventType(newEventType);
      });

      expect(result.current.eventTypes).toContainEqual(newEventType);
    });

    it('should update event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateEventType(1, { name: 'Updated Name' });
      });

      const updatedType = result.current.eventTypes.find(et => et.id === 1);
      expect(updatedType?.name).toBe('Updated Name');
    });

    it('should remove event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.removeEventType(1);
      });

      const removedType = result.current.eventTypes.find(et => et.id === 1);
      expect(removedType).toBeUndefined();
    });
  });

  describe('statistics', () => {
    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.eventTypes.length).toBeGreaterThan(0);
      });

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats.active).toBe(1);
      expect(result.current.stats.inactive).toBe(1);
      expect(result.current.stats.total).toBe(15);
    });

    it('should update stats when data changes', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.removeEventType(1);
      });

      expect(result.current.stats.active).toBe(0);
      expect(result.current.stats.inactive).toBe(1);
    });
  });

  describe('reset filters', () => {
    it('should reset all filters to defaults', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSearchChange('test');
        result.current.handleFilterChange('active');
        result.current.handlePageChange(3);
      });

      expect(result.current.searchTerm).toBe('test');
      expect(result.current.filterStatus).toBe('active');
      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filterStatus).toBe('all');
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('refresh data', () => {
    it('should refresh data on demand', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount = mockedFetcher.mock.calls.length;

      act(() => {
        result.current.refreshData();
      });

      await waitFor(() => {
        expect(mockedFetcher.mock.calls.length).toBeGreaterThan(callCount);
      });
    });
  });

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockedFetcher.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('setFilters', () => {
    it('should set multiple filters at once', async () => {
      const { result } = renderHook(() => useEventTypeManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({ search: 'test', status: 'active', page: 2 });
      });

      expect(result.current.searchTerm).toBe('test');
      expect(result.current.filterStatus).toBe('active');
      expect(result.current.currentPage).toBe(2);
    });
  });
});
