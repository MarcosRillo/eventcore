import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useLocationManager } from '@/features/locations/hooks/useLocationManager';
import * as locationService from '@/features/locations/services/location.service';

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}));

jest.mock('@/features/locations/services/location.service', () => ({
  deleteLocation: jest.fn(),
}));

import { apiFetcher } from '@/lib/swr/fetcher';

const mockedFetcher = apiFetcher as jest.Mock;
const mockedDeleteLocation = locationService.deleteLocation as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useLocationManager', () => {
  const mockLocations = [
    {
      id: 1,
      name: 'Teatro San Martín',
      address: 'Av. Corrientes 1530',
      city: 'CABA',
      country: 'Argentina',
      is_active: true,
      max_capacity: 500,
      entity_id: 1,
      features: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Centro Cultural Kirchner',
      address: 'Sarmiento 151',
      city: 'CABA',
      country: 'Argentina',
      is_active: false,
      max_capacity: 1000,
      entity_id: 1,
      features: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  const mockResponse = {
    data: mockLocations,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 2,
      from: 1,
      to: 2,
      path: 'http://api.example.com/locations',
      links: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetcher.mockResolvedValue(mockResponse);
  });

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filterStatus).toBe('all');
      expect(result.current.currentPage).toBe(1);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should fetch locations on mount', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedFetcher).toHaveBeenCalled();
      expect(result.current.locations).toHaveLength(2);
    });

    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.total).toBe(2);
      expect(result.current.stats.active).toBe(1);
      expect(result.current.stats.inactive).toBe(1);
    });
  });

  describe('search functionality', () => {
    it('should update search term immediately', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSearchChange('Teatro');
      });

      expect(result.current.searchTerm).toBe('Teatro');
    });

    it('should fetch with debounced search param', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.handleSearchChange('Teatro');
      });

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalledWith(
          expect.stringContaining('search=Teatro')
        );
      });
    });
  });

  describe('filter functionality', () => {
    it('should update filter status', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleFilterChange('active');
      });

      expect(result.current.filterStatus).toBe('active');
    });

    it('should fetch with is_active=true for active filter', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.handleFilterChange('active');
      });

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalledWith(
          expect.stringContaining('is_active=true')
        );
      });
    });

    it('should fetch with is_active=false for inactive filter', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.handleFilterChange('inactive');
      });

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalledWith(
          expect.stringContaining('is_active=false')
        );
      });
    });
  });

  describe('pagination', () => {
    it('should update current page', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should return pagination data', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toBeDefined();
      expect(result.current.pagination?.current_page).toBe(1);
      expect(result.current.pagination?.total).toBe(2);
    });
  });

  describe('delete functionality', () => {
    it('should call deleteLocation service', async () => {
      mockedDeleteLocation.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDeleteLocation(1);
      });

      expect(mockedDeleteLocation).toHaveBeenCalledWith(1);
    });

    it('should throw error when delete fails', async () => {
      mockedDeleteLocation.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.handleDeleteLocation(1);
        })
      ).rejects.toThrow('Error al eliminar ubicación');
    });
  });

  describe('optimistic updates', () => {
    it('should add location via addLocation', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newLocation = {
        id: 3,
        name: 'New Location',
        address: 'New Address',
        city: 'New City',
        country: 'Argentina',
        is_active: true,
        max_capacity: 100,
        entity_id: 1,
        features: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      act(() => {
        result.current.addLocation(newLocation);
      });

      expect(result.current.locations).toContainEqual(newLocation);
    });

    it('should update location via updateLocation', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateLocation(1, { name: 'Updated Name' });
      });

      const updatedLocation = result.current.locations.find(l => l.id === 1);
      expect(updatedLocation?.name).toBe('Updated Name');
    });

    it('should remove location via removeLocation', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.locations).toHaveLength(2);

      act(() => {
        result.current.removeLocation(1);
      });

      expect(result.current.locations).toHaveLength(1);
      expect(result.current.locations.find(l => l.id === 1)).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should set error when fetch fails', async () => {
      mockedFetcher.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('refresh functionality', () => {
    it('should refetch data when refreshData is called', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

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

  describe('reset filters', () => {
    it('should reset all filters', async () => {
      const { result } = renderHook(() => useLocationManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSearchChange('Teatro');
        result.current.handleFilterChange('active');
      });

      expect(result.current.searchTerm).toBe('Teatro');
      expect(result.current.filterStatus).toBe('active');

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filterStatus).toBe('all');
    });
  });
});
