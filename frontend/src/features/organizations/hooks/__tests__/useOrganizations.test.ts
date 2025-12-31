/**
 * useOrganizations Hook Tests
 * Tests for organization management hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'

import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import organizationService from '@/features/organizations/services/organization.service'
import type { Organization, PaginationMeta } from '@/features/organizations/types/organization.types'

// Mock the service
jest.mock('@/features/organizations/services/organization.service')
const mockService = organizationService as jest.Mocked<typeof organizationService>

// Suppress React 19 useTransition act() warnings in tests
// This is a known issue with React 19's useTransition and testing-library
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('A suspended resource finished loading inside a test')
    ) {
      return // Suppress this specific warning
    }
    originalConsoleError(...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})

// Helper to create mock organization
const createMockOrganization = (overrides: Partial<Organization> = {}): Organization => ({
  id: 1,
  name: 'Test Organization',
  cuit: '30-12345678-9',
  description: 'A test organization',
  slug: 'test-organization',
  trust_level: 1,
  parent_id: 1,
  status_id: 1,
  type_id: 2,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  deleted_at: null,
  events_total: 10,
  events_published: 5,
  events_pending: 3,
  events_rejected: 2,
  status: {
    id: 1,
    status_code: 'active',
    status_name: 'Activo',
    description: 'Organization is active',
    can_create_events: true,
  },
  type: {
    id: 2,
    type_code: 'event_organizer',
    type_name: 'Organizador de Eventos',
    description: 'Event organizer organization',
    hierarchy_level: 2,
  },
  users: [],
  ...overrides,
})

// Helper to create mock pagination
const createMockPagination = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 2,
  from: 1,
  to: 2,
  path: 'http://api.example.com/organizations',
  links: [],
  ...overrides,
})

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for initial fetch
    mockService.getOrganizations.mockResolvedValue({
      data: [],
      pagination: createMockPagination({ total: 0 }),
    })
  })

  describe('initialization', () => {
    it('should initialize with correct default state', async () => {
      // Act
      const { result } = renderHook(() => useOrganizations())

      // Assert - initial state before fetch
      expect(result.current.organizations).toEqual([])
      expect(result.current.pagination).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.togglingId).toBeNull()
      expect(result.current.selectedOrganization).toBeNull()
      expect(result.current.loadingDetail).toBe(false)

      // Wait for effect to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should initialize with correct default filters', async () => {
      // Act
      const { result } = renderHook(() => useOrganizations())

      // Assert
      expect(result.current.filters.status).toBe('all')
      expect(result.current.filters.per_page).toBe(15)
      expect(result.current.filters.page).toBe(1)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should fetch organizations on mount', async () => {
      // Arrange
      const mockOrganizations = [
        createMockOrganization({ id: 1, name: 'Org 1' }),
        createMockOrganization({ id: 2, name: 'Org 2' }),
      ]
      const mockPagination = createMockPagination({ total: 2 })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: mockOrganizations,
        pagination: mockPagination,
      })

      // Act
      const { result } = renderHook(() => useOrganizations())

      // Assert
      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(2)
      })

      expect(mockService.getOrganizations).toHaveBeenCalledTimes(1)
      expect(result.current.organizations[0].name).toBe('Org 1')
      expect(result.current.organizations[1].name).toBe('Org 2')
      expect(result.current.pagination?.total).toBe(2)
    })
  })

  describe('fetchOrganizations', () => {
    it('should update organizations and pagination on successful fetch', async () => {
      // Arrange
      const mockOrganizations = [createMockOrganization({ id: 1 })]
      const mockPagination = createMockPagination({ total: 1, current_page: 2 })

      mockService.getOrganizations.mockResolvedValue({
        data: mockOrganizations,
        pagination: mockPagination,
      })

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert
      expect(result.current.organizations).toHaveLength(1)
      expect(result.current.pagination?.current_page).toBe(2)
      expect(result.current.pagination?.total).toBe(1)
      expect(result.current.error).toBeNull()
    })

    it('should set error state on fetch failure', async () => {
      // Arrange
      mockService.getOrganizations.mockRejectedValueOnce(new Error('Network error'))

      // Act
      const { result } = renderHook(() => useOrganizations())

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar las organizaciones')
      })

      expect(result.current.organizations).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should clear error before fetching', async () => {
      // Arrange
      mockService.getOrganizations
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({
          data: [createMockOrganization()],
          pagination: createMockPagination(),
        })

      // Act
      const { result } = renderHook(() => useOrganizations())

      // Wait for first error
      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar las organizaciones')
      })

      // Trigger another fetch
      await act(async () => {
        await result.current.fetchOrganizations({ page: 2 })
      })

      // Assert - error should be cleared
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleToggleStatus', () => {
    it('should call service and update organizations list', async () => {
      // Arrange
      const originalOrg = createMockOrganization({ id: 1, status: { id: 1, status_code: 'active', status_name: 'Activo', description: '', can_create_events: true } })
      const updatedOrg = createMockOrganization({ id: 1, status: { id: 2, status_code: 'suspended', status_name: 'Suspendido', description: '', can_create_events: false } })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: [originalOrg],
        pagination: createMockPagination(),
      })
      mockService.toggleOrganizationStatus.mockResolvedValueOnce(updatedOrg)

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.handleToggleStatus(1)
      })

      // Assert
      expect(success).toBe(true)
      expect(mockService.toggleOrganizationStatus).toHaveBeenCalledWith(1)
      expect(result.current.organizations[0].status.status_code).toBe('suspended')
      expect(result.current.togglingId).toBeNull()
    })

    it('should set togglingId during operation', async () => {
      // Arrange
      let resolveToggle: (value: Organization) => void = () => {}
      const togglePromise = new Promise<Organization>((resolve) => {
        resolveToggle = resolve
      })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: [createMockOrganization({ id: 5 })],
        pagination: createMockPagination(),
      })
      mockService.toggleOrganizationStatus.mockReturnValueOnce(togglePromise)

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      // Start toggle without awaiting
      act(() => {
        result.current.handleToggleStatus(5)
      })

      // Assert - togglingId should be set
      expect(result.current.togglingId).toBe(5)

      // Resolve and complete
      await act(async () => {
        resolveToggle(createMockOrganization({ id: 5 }))
      })

      expect(result.current.togglingId).toBeNull()
    })

    it('should return false and set error on toggle failure', async () => {
      // Arrange
      mockService.getOrganizations.mockResolvedValueOnce({
        data: [createMockOrganization({ id: 1 })],
        pagination: createMockPagination(),
      })
      mockService.toggleOrganizationStatus.mockRejectedValueOnce(new Error('Toggle failed'))

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.handleToggleStatus(1)
      })

      // Assert
      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al cambiar el estado de la organización')
      expect(result.current.togglingId).toBeNull()
    })

    it('should also update selectedOrganization if it is the same', async () => {
      // Arrange
      const originalOrg = createMockOrganization({ id: 1, status: { id: 1, status_code: 'active', status_name: 'Activo', description: '', can_create_events: true } })
      const updatedOrg = createMockOrganization({ id: 1, status: { id: 2, status_code: 'suspended', status_name: 'Suspendido', description: '', can_create_events: false } })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: [originalOrg],
        pagination: createMockPagination(),
      })
      mockService.getOrganization.mockResolvedValueOnce(originalOrg)
      mockService.toggleOrganizationStatus.mockResolvedValueOnce(updatedOrg)

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      // First view detail to set selectedOrganization
      await act(async () => {
        await result.current.handleViewDetail(1)
      })

      expect(result.current.selectedOrganization?.status.status_code).toBe('active')

      // Now toggle status
      await act(async () => {
        await result.current.handleToggleStatus(1)
      })

      // Assert - selectedOrganization should also be updated
      expect(result.current.selectedOrganization?.status.status_code).toBe('suspended')
    })
  })

  describe('handleViewDetail', () => {
    it('should load organization details and set selectedOrganization', async () => {
      // Arrange
      const detailOrg = createMockOrganization({
        id: 1,
        name: 'Detailed Org',
        users: [{ id: 1, name: 'User 1', email: 'user1@example.com' }],
      })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: [createMockOrganization({ id: 1 })],
        pagination: createMockPagination(),
      })
      mockService.getOrganization.mockResolvedValueOnce(detailOrg)

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      await act(async () => {
        await result.current.handleViewDetail(1)
      })

      // Assert
      expect(mockService.getOrganization).toHaveBeenCalledWith(1)
      expect(result.current.selectedOrganization?.name).toBe('Detailed Org')
      expect(result.current.selectedOrganization?.users).toHaveLength(1)
      expect(result.current.loadingDetail).toBe(false)
    })

    it('should set error on view detail failure', async () => {
      // Arrange
      mockService.getOrganizations.mockResolvedValueOnce({
        data: [],
        pagination: createMockPagination(),
      })
      mockService.getOrganization.mockRejectedValueOnce(new Error('Not found'))

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.handleViewDetail(999)
      })

      // Assert
      expect(result.current.error).toBe('Error al cargar el detalle de la organización')
      expect(result.current.selectedOrganization).toBeNull()
      expect(result.current.loadingDetail).toBe(false)
    })
  })

  describe('handleCloseDetail', () => {
    it('should clear selectedOrganization', async () => {
      // Arrange
      const detailOrg = createMockOrganization({ id: 1 })

      mockService.getOrganizations.mockResolvedValueOnce({
        data: [createMockOrganization({ id: 1 })],
        pagination: createMockPagination(),
      })
      mockService.getOrganization.mockResolvedValueOnce(detailOrg)

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      // Open detail
      await act(async () => {
        await result.current.handleViewDetail(1)
      })

      expect(result.current.selectedOrganization).not.toBeNull()

      // Close detail
      act(() => {
        result.current.handleCloseDetail()
      })

      // Assert
      expect(result.current.selectedOrganization).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should update filters and trigger refetch', async () => {
      // Arrange
      mockService.getOrganizations
        .mockResolvedValueOnce({
          data: [createMockOrganization({ id: 1 }), createMockOrganization({ id: 2 })],
          pagination: createMockPagination({ total: 2 }),
        })
        .mockResolvedValueOnce({
          data: [createMockOrganization({ id: 1 })],
          pagination: createMockPagination({ total: 1 }),
        })

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(2)
      })

      // Update filters
      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      // Assert - filters should be updated
      expect(result.current.filters.status).toBe('active')

      // Wait for refetch
      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1)
      })

      expect(mockService.getOrganizations).toHaveBeenCalledTimes(2)
    })

    it('should merge new filters with existing filters', async () => {
      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Update only search
      act(() => {
        result.current.setFilters({ search: 'hotel' })
      })

      // Assert - other filters should remain
      expect(result.current.filters.search).toBe('hotel')
      expect(result.current.filters.status).toBe('all')
      expect(result.current.filters.per_page).toBe(15)
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Arrange
      mockService.getOrganizations.mockRejectedValueOnce(new Error('Error'))

      // Act
      const { result } = renderHook(() => useOrganizations())

      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar las organizaciones')
      })

      act(() => {
        result.current.clearError()
      })

      // Assert
      expect(result.current.error).toBeNull()
    })
  })
})
