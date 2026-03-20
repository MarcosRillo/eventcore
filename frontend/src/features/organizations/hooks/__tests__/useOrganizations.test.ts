/**
 * useOrganizations Hook Tests
 * Tests for organization management hook (SWR-based)
 */

import { act, renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { useAuth } from '@/context/AuthContext'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import {
  getOrganization,
  toggleOrganizationStatus,
} from '@/features/organizations/services/organization.service'
import type {
  Organization,
  OrganizationsResponse,
  PaginationMeta,
} from '@/features/organizations/types/organization.types'
import { useDebounce } from '@/hooks/useDebounce'

// Mock SWR and dependencies
jest.mock('swr')
jest.mock('@/context/AuthContext')
jest.mock('@/hooks/useDebounce')
jest.mock('@/features/organizations/services/organization.service')

const mockGetOrganization = getOrganization as jest.MockedFunction<typeof getOrganization>
const mockToggleOrganizationStatus = toggleOrganizationStatus as jest.MockedFunction<typeof toggleOrganizationStatus>

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>

// Suppress React 19 useTransition act() warnings in tests
let errorSpy: jest.SpyInstance

beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('A suspended resource finished loading inside a test')
    ) {
      return // Suppress this specific warning
    }
    // Call through to original for other errors
    errorSpy.mock.calls.push(args)
  })
})

afterAll(() => {
  errorSpy.mockRestore()
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
  ...overrides,
})

// Helper to create mock SWR response data
const createMockSWRData = (
  organizations: Organization[] = [],
  pagination?: Partial<PaginationMeta>,
): OrganizationsResponse => ({
  success: true,
  message: 'OK',
  data: organizations,
  pagination: createMockPagination(pagination),
})

// Default mock mutate function
const mockMutate = jest.fn()

// Helper to create auth mock value
function createAuthMock(overrides: Partial<{ isAuthenticated: boolean; isLoading: boolean }> = {}) {
  return {
    isAuthenticated: true,
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
    ...overrides,
  } as unknown as ReturnType<typeof useAuth>
}

// Helper to setup default mocks
function setupDefaultMocks(swrOverrides: Partial<ReturnType<typeof useSWR>> = {}) {
  mockUseAuth.mockReturnValue(createAuthMock())

  mockUseDebounce.mockImplementation((value) => value)

  mockUseSWR.mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: mockMutate,
    ...swrOverrides,
  } as ReturnType<typeof useSWR>)
}

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupDefaultMocks()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useOrganizations())

      expect(result.current.organizations).toEqual([])
      expect(result.current.pagination).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.togglingId).toBeNull()
      expect(result.current.selectedOrganization).toBeNull()
      expect(result.current.loadingDetail).toBe(false)
    })

    it('should initialize with correct default filters', () => {
      const { result } = renderHook(() => useOrganizations())

      expect(result.current.filters.status).toBe('all')
      expect(result.current.filters.per_page).toBe(15)
      expect(result.current.filters.page).toBe(1)
    })

    it('should return organizations from SWR data', () => {
      const mockOrganizations = [
        createMockOrganization({ id: 1, name: 'Org 1' }),
        createMockOrganization({ id: 2, name: 'Org 2' }),
      ]

      setupDefaultMocks({
        data: createMockSWRData(mockOrganizations, { total: 2 }),
      })

      const { result } = renderHook(() => useOrganizations())

      expect(result.current.organizations).toHaveLength(2)
      expect(result.current.organizations[0].name).toBe('Org 1')
      expect(result.current.organizations[1].name).toBe('Org 2')
      expect(result.current.pagination?.total).toBe(2)
    })

    it('should pass null key when not authenticated', () => {
      mockUseAuth.mockReturnValue(createAuthMock({ isAuthenticated: false }))

      renderHook(() => useOrganizations())

      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { keepPreviousData: true })
    })

    it('should pass null key when auth is loading', () => {
      mockUseAuth.mockReturnValue(createAuthMock({ isAuthenticated: true, isLoading: true }))

      renderHook(() => useOrganizations())

      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { keepPreviousData: true })
    })
  })

  describe('loading state', () => {
    it('should reflect SWR isLoading state', () => {
      setupDefaultMocks({ isLoading: true })

      const { result } = renderHook(() => useOrganizations())

      expect(result.current.loading).toBe(true)
    })

    it('should not be loading when SWR has data', () => {
      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization()]),
        isLoading: false,
      })

      const { result } = renderHook(() => useOrganizations())

      expect(result.current.loading).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should show SWR error as user-friendly message', () => {
      setupDefaultMocks({
        error: new Error('Network error'),
      })

      const { result } = renderHook(() => useOrganizations())

      expect(result.current.error).toBe('Error al cargar las organizaciones')
    })
  })

  describe('fetchOrganizations', () => {
    it('should call mutate for revalidation', async () => {
      const { result } = renderHook(() => useOrganizations())

      await act(async () => {
        await result.current.fetchOrganizations()
      })

      expect(mockMutate).toHaveBeenCalled()
    })
  })

  describe('handleToggleStatus', () => {
    it('should call toggleOrganizationStatus and mutate', async () => {
      const updatedOrg = createMockOrganization({
        id: 1,
        status: { id: 2, status_code: 'suspended', status_name: 'Suspendido', description: '', can_create_events: false },
      })

      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization({ id: 1 })]),
      })

      mockToggleOrganizationStatus.mockResolvedValueOnce(updatedOrg)
      mockMutate.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useOrganizations())

      let success: boolean = false
      await act(async () => {
        success = await result.current.handleToggleStatus(1)
      })

      expect(success).toBe(true)
      expect(mockToggleOrganizationStatus).toHaveBeenCalledWith(1)
      expect(mockMutate).toHaveBeenCalled()
      expect(result.current.togglingId).toBeNull()
    })

    it('should set togglingId during operation', async () => {
      let resolveToggle: (value: Organization) => void = () => {}
      const togglePromise = new Promise<Organization>((resolve) => {
        resolveToggle = resolve
      })

      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization({ id: 5 })]),
      })

      mockToggleOrganizationStatus.mockReturnValueOnce(togglePromise)

      const { result } = renderHook(() => useOrganizations())

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
      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization({ id: 1 })]),
      })

      mockToggleOrganizationStatus.mockRejectedValueOnce(new Error('Toggle failed'))

      const { result } = renderHook(() => useOrganizations())

      let success: boolean = true
      await act(async () => {
        success = await result.current.handleToggleStatus(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al cambiar el estado de la organizacion')
      expect(result.current.togglingId).toBeNull()
    })

    it('should also update selectedOrganization if it is the same', async () => {
      const originalOrg = createMockOrganization({
        id: 1,
        status: { id: 1, status_code: 'active', status_name: 'Activo', description: '', can_create_events: true },
      })
      const updatedOrg = createMockOrganization({
        id: 1,
        status: { id: 2, status_code: 'suspended', status_name: 'Suspendido', description: '', can_create_events: false },
      })

      setupDefaultMocks({
        data: createMockSWRData([originalOrg]),
      })

      mockGetOrganization.mockResolvedValueOnce(originalOrg)
      mockToggleOrganizationStatus.mockResolvedValueOnce(updatedOrg)
      mockMutate.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useOrganizations())

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
      const detailOrg = createMockOrganization({
        id: 1,
        name: 'Detailed Org',
        users: [{ id: 1, name: 'User 1', email: 'user1@example.com' }],
      })

      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization({ id: 1 })]),
      })

      mockGetOrganization.mockResolvedValueOnce(detailOrg)

      const { result } = renderHook(() => useOrganizations())

      await act(async () => {
        await result.current.handleViewDetail(1)
      })

      expect(mockGetOrganization).toHaveBeenCalledWith(1)
      expect(result.current.selectedOrganization?.name).toBe('Detailed Org')
      expect(result.current.selectedOrganization?.users).toHaveLength(1)
      expect(result.current.loadingDetail).toBe(false)
    })

    it('should set error on view detail failure', async () => {
      setupDefaultMocks()

      mockGetOrganization.mockRejectedValueOnce(new Error('Not found'))

      const { result } = renderHook(() => useOrganizations())

      await act(async () => {
        await result.current.handleViewDetail(999)
      })

      expect(result.current.error).toBe('Error al cargar el detalle de la organizacion')
      expect(result.current.selectedOrganization).toBeNull()
      expect(result.current.loadingDetail).toBe(false)
    })
  })

  describe('handleCloseDetail', () => {
    it('should clear selectedOrganization', async () => {
      const detailOrg = createMockOrganization({ id: 1 })

      setupDefaultMocks({
        data: createMockSWRData([createMockOrganization({ id: 1 })]),
      })

      mockGetOrganization.mockResolvedValueOnce(detailOrg)

      const { result } = renderHook(() => useOrganizations())

      // Open detail
      await act(async () => {
        await result.current.handleViewDetail(1)
      })

      expect(result.current.selectedOrganization).not.toBeNull()

      // Close detail
      act(() => {
        result.current.handleCloseDetail()
      })

      expect(result.current.selectedOrganization).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useOrganizations())

      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      expect(result.current.filters.status).toBe('active')
    })

    it('should merge new filters with existing filters', () => {
      const { result } = renderHook(() => useOrganizations())

      act(() => {
        result.current.setFilters({ search: 'hotel' })
      })

      expect(result.current.filters.search).toBe('hotel')
      expect(result.current.filters.status).toBe('all')
      expect(result.current.filters.per_page).toBe(15)
    })
  })

  describe('clearError', () => {
    it('should clear local error state', async () => {
      setupDefaultMocks()

      mockToggleOrganizationStatus.mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useOrganizations())

      // Trigger an error through toggle
      await act(async () => {
        await result.current.handleToggleStatus(1)
      })

      expect(result.current.error).toBe('Error al cambiar el estado de la organizacion')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
