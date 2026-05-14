/**
 * Organization Service Tests
 * Tests for organization API service functions
 */

import {
  getOrganization,
  getOrganizations,
  toggleOrganizationStatus,
} from '@/features/organizations/services/organization.service'
import type { Organization } from '@/features/organizations/types/organization.types'
import apiClient from '@/services/apiClient'
import { createMockPaginationMeta } from '@/test-utils/factories'

// Mock apiClient
jest.mock('@/services/apiClient')
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

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
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: { id: 1, role_code: 'admin', role_name: 'Admin' },
    },
  ],
  ...overrides,
})

// Helper to create mock pagination
const createMockPagination = createMockPaginationMeta

describe('organization.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrganizations', () => {
    it('should return paginated list of organizations without filters', async () => {
      // Arrange
      const mockOrganizations = [
        createMockOrganization({ id: 1, name: 'Org 1' }),
        createMockOrganization({ id: 2, name: 'Org 2' }),
      ]
      const mockPagination = createMockPagination({ total: 2 })

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: mockOrganizations,
          pagination: mockPagination,
        },
      })

      // Act
      const result = await getOrganizations()

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Org 1')
      expect(result.data[1].name).toBe('Org 2')
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.current_page).toBe(1)
    })

    it('should apply search filter to URL', async () => {
      // Arrange
      const mockOrganizations = [createMockOrganization({ name: 'Hotel Tucumán' })]
      const mockPagination = createMockPagination({ total: 1 })

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: mockOrganizations,
          pagination: mockPagination,
        },
      })

      // Act
      const result = await getOrganizations({ search: 'hotel' })

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations?search=hotel')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Hotel Tucumán')
      expect(result.pagination.total).toBe(1)
    })

    it('should apply status filter to URL when not "all"', async () => {
      // Arrange
      const mockOrganizations = [
        createMockOrganization({
          status: {
            id: 1,
            status_code: 'active',
            status_name: 'Activo',
            description: '',
            can_create_events: true
          }
        }),
      ]
      const mockPagination = createMockPagination({ total: 1 })

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: mockOrganizations,
          pagination: mockPagination,
        },
      })

      // Act
      const result = await getOrganizations({ status: 'active' })

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations?status=active')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].status.status_code).toBe('active')
    })

    it('should NOT apply status filter when "all"', async () => {
      // Arrange
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: [],
          pagination: createMockPagination({ total: 0 }),
        },
      })

      // Act
      await getOrganizations({ status: 'all' })

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations')
    })

    it('should apply pagination parameters to URL', async () => {
      // Arrange
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: [],
          pagination: createMockPagination({ current_page: 3, per_page: 20 }),
        },
      })

      // Act
      const result = await getOrganizations({ page: 3, per_page: 20 })

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations?per_page=20&page=3')
      expect(result.pagination.current_page).toBe(3)
      expect(result.pagination.per_page).toBe(20)
    })

    it('should apply multiple filters to URL', async () => {
      // Arrange
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: [createMockOrganization()],
          pagination: createMockPagination(),
        },
      })

      // Act
      await getOrganizations({ search: 'hotel', status: 'suspended', page: 2, per_page: 10 })

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/organizations?search=hotel&status=suspended&per_page=10&page=2'
      )
    })

    it('should propagate errors from API', async () => {
      // Arrange
      const error = new Error('Network error')
      mockApiClient.get.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(getOrganizations()).rejects.toThrow('Network error')
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('getOrganization', () => {
    it('should return organization by ID', async () => {
      // Arrange
      const mockOrganization = createMockOrganization({ id: 123, name: 'Specific Org' })

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: mockOrganization,
        },
      })

      // Act
      const result = await getOrganization(123)

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations/123')
      expect(result.id).toBe(123)
      expect(result.name).toBe('Specific Org')
      expect(result.cuit).toBe('30-12345678-9')
      expect(result.status.status_code).toBe('active')
    })

    it('should include user details in response', async () => {
      // Arrange
      const mockOrganization = createMockOrganization({
        users: [
          { id: 1, name: 'User 1', email: 'user1@example.com', role: { id: 1, role_code: 'admin', role_name: 'Admin' } },
          { id: 2, name: 'User 2', email: 'user2@example.com', role: { id: 2, role_code: 'staff', role_name: 'Staff' } },
        ],
      })

      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockOrganization },
      })

      // Act
      const result = await getOrganization(1)

      // Assert
      expect(result.users).toHaveLength(2)
      expect(result.users[0].name).toBe('User 1')
      expect(result.users[0].role?.role_code).toBe('admin')
      expect(result.users[1].name).toBe('User 2')
      expect(result.users[1].role?.role_code).toBe('staff')
    })

    it('should include event metrics in response', async () => {
      // Arrange
      const mockOrganization = createMockOrganization({
        events_total: 50,
        events_published: 30,
        events_pending: 15,
        events_rejected: 5,
      })

      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockOrganization },
      })

      // Act
      const result = await getOrganization(1)

      // Assert
      expect(result.events_total).toBe(50)
      expect(result.events_published).toBe(30)
      expect(result.events_pending).toBe(15)
      expect(result.events_rejected).toBe(5)
    })

    it('should propagate 404 errors', async () => {
      // Arrange
      const error = { response: { status: 404 }, message: 'Not found' }
      mockApiClient.get.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(getOrganization(999)).rejects.toEqual(error)
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations/999')
    })
  })

  describe('toggleOrganizationStatus', () => {
    it('should toggle status from active to suspended', async () => {
      // Arrange
      const updatedOrg = createMockOrganization({
        id: 1,
        status: {
          id: 2,
          status_code: 'suspended',
          status_name: 'Suspendido',
          description: 'Organization is suspended',
          can_create_events: false,
        },
      })

      mockApiClient.patch.mockResolvedValueOnce({
        data: { data: updatedOrg },
      })

      // Act
      const result = await toggleOrganizationStatus(1)

      // Assert
      expect(mockApiClient.patch).toHaveBeenCalledWith('/organizations/1/status')
      expect(result.id).toBe(1)
      expect(result.status.status_code).toBe('suspended')
      expect(result.status.can_create_events).toBe(false)
    })

    it('should toggle status from suspended to active', async () => {
      // Arrange
      const updatedOrg = createMockOrganization({
        id: 2,
        status: {
          id: 1,
          status_code: 'active',
          status_name: 'Activo',
          description: 'Organization is active',
          can_create_events: true,
        },
      })

      mockApiClient.patch.mockResolvedValueOnce({
        data: { data: updatedOrg },
      })

      // Act
      const result = await toggleOrganizationStatus(2)

      // Assert
      expect(mockApiClient.patch).toHaveBeenCalledWith('/organizations/2/status')
      expect(result.status.status_code).toBe('active')
      expect(result.status.can_create_events).toBe(true)
    })

    it('should propagate errors from API', async () => {
      // Arrange
      const error = { response: { status: 403 }, message: 'Forbidden' }
      mockApiClient.patch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(toggleOrganizationStatus(1)).rejects.toEqual(error)
      expect(mockApiClient.patch).toHaveBeenCalledTimes(1)
    })
  })
})
