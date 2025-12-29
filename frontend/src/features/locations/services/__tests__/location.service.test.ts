import { AxiosResponse } from 'axios'

import {
  getLocations,
  getActiveLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '@/features/locations/services/location.service'
import apiClient from '@/services/apiClient'
import { Location, LocationPagination } from '@/types/location.types'


// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Helper to create mock axios response
const createMockResponse = <T>(data: T, status = 200, statusText = 'OK'): AxiosResponse<T> => ({
  data,
  status,
  statusText,
  headers: {},
  config: { headers: {} } as AxiosResponse['config'],
})

// Helper to create a valid Location mock (simplified for Tucumán Tourism)
const createMockLocation = (overrides: Partial<Location> & { id: number; name: string }): Location => ({
  address: 'Default Address 123',
  city: 'Default City',
  state: 'Tucumán',
  country: 'Argentina',
  is_active: true,
  entity_id: 1,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

// Helper to create valid PaginationMeta
const createMockMeta = (overrides: Partial<{
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}> = {}) => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
  path: 'http://api.example.com/locations',
  links: [],
  ...overrides,
})

describe('location.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLocations', () => {
    it('should fetch paginated locations with default params', async () => {
      const mockResponse: LocationPagination = {
        data: [
          createMockLocation({ id: 1, name: 'Centro de Convenciones Tucumán', address: 'Av. Soldati 330', city: 'San Miguel de Tucumán', state: 'Tucumán' }),
          createMockLocation({ id: 2, name: 'Parque 9 de Julio', address: 'Av. Aconquija s/n', city: 'San Miguel de Tucumán', state: 'Tucumán' }),
        ],
        meta: createMockMeta({ current_page: 1, last_page: 1, total: 2, per_page: 15, from: 1, to: 2 }),
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await getLocations()

      // Without search or is_active, only page and per_page are sent
      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
        },
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch locations with custom pagination params', async () => {
      const mockResponse: LocationPagination = {
        data: [],
        meta: createMockMeta({ current_page: 2, last_page: 5, total: 100, per_page: 20, from: 21, to: 40 }),
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=5',
          prev: 'http://api.example.com/locations?page=1',
          next: 'http://api.example.com/locations?page=3',
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      await getLocations({ page: 2, per_page: 20 })

      // Without search or is_active, only pagination params are sent
      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 2,
          per_page: 20,
        },
      })
    })

    it('should fetch locations with search filter', async () => {
      const mockResponse: LocationPagination = {
        data: [
          createMockLocation({ id: 1, name: 'Centro de Convenciones Tucumán', address: 'Av. Soldati 330', city: 'San Miguel de Tucumán', state: 'Tucumán' }),
        ],
        meta: createMockMeta({ current_page: 1, last_page: 1, total: 1, per_page: 15, from: 1, to: 1 }),
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      await getLocations({ search: 'Centro' })

      // Search param is included when provided
      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
          search: 'Centro',
        },
      })
    })

    it('should fetch only active locations when is_active filter is true', async () => {
      const mockResponse: LocationPagination = {
        data: [
          createMockLocation({ id: 1, name: 'Active Location', address: 'Address 1', city: 'San Miguel de Tucumán', state: 'Tucumán' }),
        ],
        meta: createMockMeta({ current_page: 1, last_page: 1, total: 1, per_page: 15, from: 1, to: 1 }),
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      await getLocations({ is_active: true })

      // Active param is included when explicitly set
      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
          active: true,
        },
      })
    })

    it('should handle errors when fetching locations', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(getLocations()).rejects.toThrow('Network error')
    })
  })

  describe('getActiveLocations', () => {
    it('should fetch all active locations without pagination', async () => {
      const mockLocations: Location[] = [
        createMockLocation({ id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', state: 'Province', max_capacity: 100 }),
        createMockLocation({ id: 2, name: 'Location 2', address: 'Address 2', city: 'City 2', state: 'Province', max_capacity: 200 }),
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockLocations }))

      const result = await getActiveLocations()

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations/active')
      expect(result).toEqual(mockLocations)
      expect(result).toHaveLength(2)
    })

    it('should handle errors when fetching active locations', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(getActiveLocations()).rejects.toThrow('Forbidden')
    })
  })

  describe('getLocation', () => {
    it('should fetch a single location by ID', async () => {
      const mockLocation = createMockLocation({
        id: 1,
        name: 'Teatro San Martín',
        address: 'Av. Corrientes 1530',
        city: 'CABA',
        state: 'Buenos Aires',
        max_capacity: 500,
        description: 'Historic theater',
      })

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockLocation }))

      const result = await getLocation(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations/1')
      expect(result).toEqual(mockLocation)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Teatro San Martín')
    })

    it('should handle errors when fetching single location', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(getLocation(999)).rejects.toThrow('Not found')
    })
  })

  describe('createLocation', () => {
    it('should create a new location', async () => {
      const newLocationData = {
        name: 'New Theater',
        address: 'New Address 123',
        city: 'Mendoza',
        state: 'Mendoza',
        country: 'Argentina',
        max_capacity: 300,
        features: [] as string[],
        is_active: true,
        entity_id: 1,
      }

      const createdLocation = createMockLocation({
        id: 3,
        name: 'New Theater',
        address: 'New Address 123',
        city: 'Mendoza',
        state: 'Mendoza',
        max_capacity: 300,
      })

      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: createdLocation }, 201, 'Created'))

      const result = await createLocation(newLocationData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/locations', newLocationData)
      expect(result).toEqual(createdLocation)
      expect(result.id).toBe(3)
      expect(result.name).toBe('New Theater')
    })

    it('should create location with optional fields', async () => {
      const newLocationData = {
        name: 'Minimal Location',
        address: 'Address',
        city: 'City',
        state: 'Province',
        country: 'Argentina',
        max_capacity: 50,
        description: 'Optional description',
        latitude: -34.6037,
        longitude: -58.3816,
        features: [] as string[],
        is_active: true,
        entity_id: 1,
      }

      const createdLocation = createMockLocation({
        id: 4,
        name: 'Minimal Location',
        address: 'Address',
        city: 'City',
        state: 'Province',
        max_capacity: 50,
        description: 'Optional description',
        latitude: -34.6037,
        longitude: -58.3816,
      })

      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: createdLocation }, 201, 'Created'))

      const result = await createLocation(newLocationData)

      expect(result.description).toBe('Optional description')
      expect(result.latitude).toBe(-34.6037)
      expect(result.longitude).toBe(-58.3816)
    })

    it('should handle errors when creating location', async () => {
      const newLocationData = {
        name: 'Invalid Location',
        address: '',
        city: '',
        state: '',
        country: '',
        max_capacity: 0,
        features: [] as string[],
        is_active: true,
        entity_id: 1,
      }

      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(createLocation(newLocationData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateLocation', () => {
    it('should update an existing location with all fields', async () => {
      const updateData = {
        name: 'Updated Theater',
        address: 'Updated Address 456',
        city: 'Updated City',
        max_capacity: 600,
      }

      const updatedLocation = createMockLocation({
        id: 1,
        name: 'Updated Theater',
        address: 'Updated Address 456',
        city: 'Updated City',
        state: 'Buenos Aires',
        max_capacity: 600,
      })

      mockApiClient.put.mockResolvedValueOnce(createMockResponse({ data: updatedLocation }))

      const result = await updateLocation(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/locations/1', updateData)
      expect(result).toEqual(updatedLocation)
      expect(result.name).toBe('Updated Theater')
      expect(result.max_capacity).toBe(600)
    })

    it('should update location with partial fields', async () => {
      const updateData = {
        max_capacity: 450,
      }

      const updatedLocation = createMockLocation({
        id: 1,
        name: 'Teatro San Martín',
        address: 'Av. Corrientes 1530',
        city: 'CABA',
        state: 'Buenos Aires',
        max_capacity: 450,
      })

      mockApiClient.put.mockResolvedValueOnce(createMockResponse({ data: updatedLocation }))

      const result = await updateLocation(1, updateData)

      expect(result.max_capacity).toBe(450)
    })

    it('should handle errors when updating location', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Not found'))

      await expect(updateLocation(999, { name: 'Test' })).rejects.toThrow('Not found')
    })
  })

  describe('deleteLocation', () => {
    it('should delete a location successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce(createMockResponse(undefined, 204, 'No Content'))

      await expect(deleteLocation(1)).resolves.not.toThrow()

      expect(mockApiClient.delete).toHaveBeenCalledWith('/locations/1')
    })

    it('should handle errors when deleting location', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete location with active events'))

      await expect(deleteLocation(1)).rejects.toThrow('Cannot delete location with active events')
    })

    it('should handle 404 error when deleting non-existent location', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Not found'))

      await expect(deleteLocation(999)).rejects.toThrow('Not found')
    })
  })
})
