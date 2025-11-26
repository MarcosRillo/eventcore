import apiClient from '@/services/apiClient'
import {
  getLocations,
  getActiveLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../location.service'
import { Location, LocationPagination } from '@/types/location.types'
import { AxiosResponse } from 'axios'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('location.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLocations', () => {
    it('should fetch paginated locations with default params', async () => {
      const mockResponse: LocationPagination = {
        data: [
          { id: 1, name: 'Teatro San Martín', address: 'Av. Corrientes 1530', city: 'CABA', province: 'Buenos Aires', country: 'Argentina', capacity: 500 },
          { id: 2, name: 'Centro Cultural Kirchner', address: 'Sarmiento 151', city: 'CABA', province: 'Buenos Aires', country: 'Argentina', capacity: 1000 },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 2,
          per_page: 15,
          from: 1,
          to: 2,
        },
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      const axiosResponse: AxiosResponse<LocationPagination> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

      const result = await getLocations()

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
          search: '',
          is_active: undefined,
        },
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch locations with custom pagination params', async () => {
      const mockResponse: LocationPagination = {
        data: [],
        meta: {
          current_page: 2,
          last_page: 5,
          total: 100,
          per_page: 20,
          from: 21,
          to: 40,
        },
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=5',
          prev: 'http://api.example.com/locations?page=1',
          next: 'http://api.example.com/locations?page=3',
        },
      }

      const axiosResponse: AxiosResponse<LocationPagination> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

      await getLocations({ page: 2, per_page: 20 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 2,
          per_page: 20,
          search: '',
          is_active: undefined,
        },
      })
    })

    it('should fetch locations with search filter', async () => {
      const mockResponse: LocationPagination = {
        data: [
          { id: 1, name: 'Teatro San Martín', address: 'Av. Corrientes 1530', city: 'CABA', province: 'Buenos Aires', country: 'Argentina', capacity: 500 },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 1,
          per_page: 15,
          from: 1,
          to: 1,
        },
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      const axiosResponse: AxiosResponse<LocationPagination> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

      await getLocations({ search: 'Teatro' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
          search: 'Teatro',
          is_active: undefined,
        },
      })
    })

    it('should fetch only active locations when is_active filter is true', async () => {
      const mockResponse: LocationPagination = {
        data: [
          { id: 1, name: 'Active Location', address: 'Address 1', city: 'City', province: 'Province', country: 'Argentina', capacity: 100 },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 1,
          per_page: 15,
          from: 1,
          to: 1,
        },
        links: {
          first: 'http://api.example.com/locations?page=1',
          last: 'http://api.example.com/locations?page=1',
          prev: null,
          next: null,
        },
      }

      const axiosResponse: AxiosResponse<LocationPagination> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

      await getLocations({ is_active: true })

      expect(mockApiClient.get).toHaveBeenCalledWith('/locations', {
        params: {
          page: 1,
          per_page: 15,
          search: '',
          is_active: true,
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
        { id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', province: 'Province', country: 'Argentina', capacity: 100 },
        { id: 2, name: 'Location 2', address: 'Address 2', city: 'City 2', province: 'Province', country: 'Argentina', capacity: 200 },
      ]

      const axiosResponse: AxiosResponse<{ data: Location[] }> = {
        data: { data: mockLocations },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

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
      const mockLocation: Location = {
        id: 1,
        name: 'Teatro San Martín',
        address: 'Av. Corrientes 1530',
        city: 'CABA',
        province: 'Buenos Aires',
        country: 'Argentina',
        capacity: 500,
        description: 'Historic theater',
      }

      const axiosResponse: AxiosResponse<{ data: Location }> = {
        data: { data: mockLocation },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(axiosResponse)

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
        province: 'Mendoza',
        country: 'Argentina',
        capacity: 300,
      }

      const createdLocation: Location = {
        id: 3,
        ...newLocationData,
      }

      const axiosResponse: AxiosResponse<{ data: Location }> = {
        data: { data: createdLocation },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      }

      mockApiClient.post.mockResolvedValueOnce(axiosResponse)

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
        province: 'Province',
        country: 'Argentina',
        capacity: 50,
        description: 'Optional description',
        latitude: -34.6037,
        longitude: -58.3816,
      }

      const createdLocation: Location = {
        id: 4,
        ...newLocationData,
      }

      const axiosResponse: AxiosResponse<{ data: Location }> = {
        data: { data: createdLocation },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      }

      mockApiClient.post.mockResolvedValueOnce(axiosResponse)

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
        province: '',
        country: '',
        capacity: 0,
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
        capacity: 600,
      }

      const updatedLocation: Location = {
        id: 1,
        name: 'Updated Theater',
        address: 'Updated Address 456',
        city: 'Updated City',
        province: 'Buenos Aires',
        country: 'Argentina',
        capacity: 600,
      }

      const axiosResponse: AxiosResponse<{ data: Location }> = {
        data: { data: updatedLocation },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.put.mockResolvedValueOnce(axiosResponse)

      const result = await updateLocation(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/locations/1', updateData)
      expect(result).toEqual(updatedLocation)
      expect(result.name).toBe('Updated Theater')
      expect(result.capacity).toBe(600)
    })

    it('should update location with partial fields', async () => {
      const updateData = {
        capacity: 450,
      }

      const updatedLocation: Location = {
        id: 1,
        name: 'Teatro San Martín',
        address: 'Av. Corrientes 1530',
        city: 'CABA',
        province: 'Buenos Aires',
        country: 'Argentina',
        capacity: 450,
      }

      const axiosResponse: AxiosResponse<{ data: Location }> = {
        data: { data: updatedLocation },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.put.mockResolvedValueOnce(axiosResponse)

      const result = await updateLocation(1, updateData)

      expect(result.capacity).toBe(450)
    })

    it('should handle errors when updating location', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Not found'))

      await expect(updateLocation(999, { name: 'Test' })).rejects.toThrow('Not found')
    })
  })

  describe('deleteLocation', () => {
    it('should delete a location successfully', async () => {
      const axiosResponse: AxiosResponse<void> = {
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any,
      }

      mockApiClient.delete.mockResolvedValueOnce(axiosResponse)

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
