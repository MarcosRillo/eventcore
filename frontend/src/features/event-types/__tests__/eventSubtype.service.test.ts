/**
 * EventSubtype Service Tests
 *
 * Tests for all CRUD operations on event subtypes.
 * Covers success scenarios, error handling, and edge cases.
 *
 * Created: December 2, 2025
 */

import apiClient from '@/services/apiClient'
import {
  getEventSubtypes,
  getEventSubtype,
  createEventSubtype,
  updateEventSubtype,
  deleteEventSubtype,
  toggleEventSubtypeStatus,
  getActiveEventSubtypes,
  searchEventSubtypes,
  validateEventSubtypeData,
} from '../services/eventSubtype.service'
import type { EventSubtype, EventSubtypePagination, CreateEventSubtypeData, UpdateEventSubtypeData } from '@/types/eventType.types'

// Mock apiClient
jest.mock('@/services/apiClient')

describe('eventSubtype.service', () => {
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

  // Sample event subtypes for testing
  const mockEventSubtype: EventSubtype = {
    id: 1,
    event_type_id: 1,
    name: 'Congreso Nacional',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockEventSubtype2: EventSubtype = {
    id: 2,
    event_type_id: 1,
    name: 'Congreso Internacional',
    is_active: false,
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  }

  const mockPaginationResponse: EventSubtypePagination = {
    data: [mockEventSubtype, mockEventSubtype2],
    current_page: 1,
    last_page: 2,
    per_page: 10,
    total: 15,
    from: 1,
    to: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEventSubtypes', () => {
    it('should fetch paginated event subtypes with default params', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const result = await getEventSubtypes(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes?')
      expect(result).toEqual(mockPaginationResponse)
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(15)
    })

    it('should fetch event subtypes with all query params', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const params = {
        page: 2,
        per_page: 20,
        search: 'nacional',
        active: true,
      }

      await getEventSubtypes(1, params)

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types/1/subtypes?page=2&per_page=20&search=nacional&active=true'
      )
    })

    it('should handle inactive filter', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      await getEventSubtypes(1, { active: false })

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes?active=false')
    })

    it('should handle different event type ids', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      await getEventSubtypes(5)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/5/subtypes?')
    })

    it('should handle empty results', async () => {
      const emptyResponse: EventSubtypePagination = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      }
      mockedApiClient.get.mockResolvedValue({ data: emptyResponse })

      const result = await getEventSubtypes(1, { search: 'nonexistent' })

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should handle API error', async () => {
      const error = new Error('Network error')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEventSubtypes(1)).rejects.toThrow('Network error')
    })
  })

  describe('getEventSubtype', () => {
    it('should fetch single event subtype by id', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockEventSubtype })

      const result = await getEventSubtype(1, 1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes/1')
      expect(result).toEqual(mockEventSubtype)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Congreso Nacional')
    })

    it('should fetch event subtype with large id', async () => {
      const largeIdSubtype = { ...mockEventSubtype, id: 999999 }
      mockedApiClient.get.mockResolvedValue({ data: largeIdSubtype })

      const result = await getEventSubtype(1, 999999)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes/999999')
      expect(result.id).toBe(999999)
    })

    it('should handle not found error', async () => {
      const error = new Error('Event subtype not found')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEventSubtype(1, 999)).rejects.toThrow('Event subtype not found')
    })
  })

  describe('createEventSubtype', () => {
    it('should create event subtype with name only', async () => {
      const createData: CreateEventSubtypeData = { name: 'Seminario Regional' }
      const createdSubtype = { ...mockEventSubtype, id: 3, name: 'Seminario Regional' }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdSubtype },
      })

      const result = await createEventSubtype(1, createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types/1/subtypes', {
        name: 'Seminario Regional',
        is_active: true,
      })
      expect(result.name).toBe('Seminario Regional')
      expect(result.is_active).toBe(true)
    })

    it('should create event subtype with is_active false', async () => {
      const createData: CreateEventSubtypeData = { name: 'Borrador', is_active: false }
      const createdSubtype = { ...mockEventSubtype, id: 4, name: 'Borrador', is_active: false }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdSubtype },
      })

      const result = await createEventSubtype(1, createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types/1/subtypes', {
        name: 'Borrador',
        is_active: false,
      })
      expect(result.is_active).toBe(false)
    })

    it('should create event subtype for different parent type', async () => {
      const createData: CreateEventSubtypeData = { name: 'Taller Intensivo' }
      const createdSubtype = { ...mockEventSubtype, id: 5, event_type_id: 2, name: 'Taller Intensivo' }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdSubtype },
      })

      const result = await createEventSubtype(2, createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types/2/subtypes', {
        name: 'Taller Intensivo',
        is_active: true,
      })
      expect(result.event_type_id).toBe(2)
    })

    it('should handle validation error from API', async () => {
      const error = new Error('Validation failed')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(createEventSubtype(1, { name: '' })).rejects.toThrow('Validation failed')
    })
  })

  describe('updateEventSubtype', () => {
    it('should update event subtype name', async () => {
      const updateData: UpdateEventSubtypeData = { name: 'Congreso Actualizado' }
      const updatedSubtype = { ...mockEventSubtype, name: 'Congreso Actualizado' }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedSubtype },
      })

      const result = await updateEventSubtype(1, 1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1/subtypes/1', {
        name: 'Congreso Actualizado',
        is_active: undefined,
      })
      expect(result.name).toBe('Congreso Actualizado')
    })

    it('should update event subtype is_active status', async () => {
      const updateData: UpdateEventSubtypeData = { is_active: false }
      const updatedSubtype = { ...mockEventSubtype, is_active: false }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedSubtype },
      })

      const result = await updateEventSubtype(1, 1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1/subtypes/1', {
        name: undefined,
        is_active: false,
      })
      expect(result.is_active).toBe(false)
    })

    it('should update both name and is_active', async () => {
      const updateData: UpdateEventSubtypeData = { name: 'Nuevo Nombre', is_active: true }
      const updatedSubtype = { ...mockEventSubtype, name: 'Nuevo Nombre', is_active: true }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedSubtype },
      })

      const result = await updateEventSubtype(1, 1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1/subtypes/1', {
        name: 'Nuevo Nombre',
        is_active: true,
      })
      expect(result.name).toBe('Nuevo Nombre')
      expect(result.is_active).toBe(true)
    })

    it('should handle update error', async () => {
      const error = new Error('Update failed')
      mockedApiClient.put.mockRejectedValue(error)

      await expect(updateEventSubtype(1, 1, { name: 'Test' })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteEventSubtype', () => {
    it('should delete event subtype by id', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: { message: 'Deleted' } })

      await expect(deleteEventSubtype(1, 1)).resolves.not.toThrow()

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/event-types/1/subtypes/1')
    })

    it('should handle 404 not found error', async () => {
      const error = {
        response: { status: 404, data: { message: 'Not found' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventSubtype(1, 999)).rejects.toThrow(
        'El subtipo de evento no existe o ya fue eliminado.'
      )
    })

    it('should handle 403 forbidden error', async () => {
      const error = {
        response: { status: 403, data: { message: 'Forbidden' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventSubtype(1, 1)).rejects.toThrow(
        'No tienes permiso para eliminar este subtipo de evento.'
      )
    })

    it('should handle 409 conflict error (has events)', async () => {
      const error = {
        response: { status: 409, data: { message: 'Has events' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventSubtype(1, 1)).rejects.toThrow(
        'No se puede eliminar el subtipo porque tiene eventos asociados.'
      )
    })

    it('should handle generic error with API message', async () => {
      const error = {
        response: { status: 500, data: { message: 'Internal server error' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventSubtype(1, 1)).rejects.toThrow('Internal server error')
    })

    it('should handle generic error without API message', async () => {
      const error = {
        response: { status: 500, data: {} },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventSubtype(1, 1)).rejects.toThrow(
        'Error al eliminar el subtipo de evento. Inténtalo de nuevo.'
      )
    })
  })

  describe('toggleEventSubtypeStatus', () => {
    it('should toggle event subtype status from active to inactive', async () => {
      const toggledSubtype = { ...mockEventSubtype, is_active: false }

      mockedApiClient.patch.mockResolvedValue({
        data: { data: toggledSubtype },
      })

      const result = await toggleEventSubtypeStatus(1, 1)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/event-types/1/subtypes/1/toggle-status')
      expect(result.is_active).toBe(false)
    })

    it('should toggle event subtype status from inactive to active', async () => {
      const toggledSubtype = { ...mockEventSubtype2, is_active: true }

      mockedApiClient.patch.mockResolvedValue({
        data: { data: toggledSubtype },
      })

      const result = await toggleEventSubtypeStatus(1, 2)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/event-types/1/subtypes/2/toggle-status')
      expect(result.is_active).toBe(true)
    })

    it('should handle toggle error', async () => {
      const error = new Error('Toggle failed')
      mockedApiClient.patch.mockRejectedValue(error)

      await expect(toggleEventSubtypeStatus(1, 1)).rejects.toThrow('Toggle failed')
    })
  })

  describe('getActiveEventSubtypes', () => {
    it('should fetch active event subtypes for a parent type', async () => {
      const activeSubtypes = [mockEventSubtype]

      mockedApiClient.get.mockResolvedValue({
        data: { data: activeSubtypes },
      })

      const result = await getActiveEventSubtypes(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes/active')
      expect(result).toHaveLength(1)
      expect(result[0].is_active).toBe(true)
    })

    it('should handle direct array response format', async () => {
      const activeSubtypes = [mockEventSubtype]

      mockedApiClient.get.mockResolvedValue({
        data: activeSubtypes, // Direct array, not wrapped
      })

      const result = await getActiveEventSubtypes(1)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Congreso Nacional')
    })

    it('should fetch for different parent type', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [] },
      })

      await getActiveEventSubtypes(5)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/5/subtypes/active')
    })

    it('should return empty array when no active subtypes', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [] },
      })

      const result = await getActiveEventSubtypes(1)

      expect(result).toHaveLength(0)
    })

    it('should handle API error', async () => {
      const error = new Error('Fetch failed')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getActiveEventSubtypes(1)).rejects.toThrow('Fetch failed')
    })
  })

  describe('searchEventSubtypes', () => {
    it('should search event subtypes with query', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const result = await searchEventSubtypes(1, 'nacional')

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types/1/subtypes?page=1&per_page=15&search=nacional'
      )
      expect(result).toEqual(mockPaginationResponse)
    })

    it('should search with custom page', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      await searchEventSubtypes(1, 'internacional', 3)

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types/1/subtypes?page=3&per_page=15&search=internacional'
      )
    })

    it('should search in different parent type', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      await searchEventSubtypes(5, 'test')

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types/5/subtypes?page=1&per_page=15&search=test'
      )
    })

    it('should handle empty search results', async () => {
      const emptyResponse: EventSubtypePagination = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
      }
      mockedApiClient.get.mockResolvedValue({ data: emptyResponse })

      const result = await searchEventSubtypes(1, 'nonexistent')

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('validateEventSubtypeData', () => {
    it('should return no errors for valid data', () => {
      const validData: CreateEventSubtypeData = { name: 'Congreso Nacional' }

      const errors = validateEventSubtypeData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should return error for empty name', () => {
      const invalidData: CreateEventSubtypeData = { name: '' }

      const errors = validateEventSubtypeData(invalidData)

      expect(errors).toContain('El nombre del subtipo es obligatorio')
    })

    it('should return error for whitespace-only name', () => {
      const invalidData: CreateEventSubtypeData = { name: '   ' }

      const errors = validateEventSubtypeData(invalidData)

      expect(errors).toContain('El nombre del subtipo es obligatorio')
    })

    it('should return error for name too short', () => {
      const invalidData: CreateEventSubtypeData = { name: 'A' }

      const errors = validateEventSubtypeData(invalidData)

      expect(errors).toContain('El nombre debe tener al menos 2 caracteres')
    })

    it('should return error for name too long', () => {
      const longName = 'A'.repeat(256)
      const invalidData: CreateEventSubtypeData = { name: longName }

      const errors = validateEventSubtypeData(invalidData)

      expect(errors).toContain('El nombre no puede exceder 255 caracteres')
    })

    it('should validate update data with name', () => {
      const updateData: UpdateEventSubtypeData = { name: 'Valid Name' }

      const errors = validateEventSubtypeData(updateData)

      expect(errors).toHaveLength(0)
    })

    it('should skip name validation if not provided in update', () => {
      const updateData: UpdateEventSubtypeData = { is_active: false }

      const errors = validateEventSubtypeData(updateData)

      expect(errors).toHaveLength(0)
    })

    it('should accept minimum valid name length', () => {
      const validData: CreateEventSubtypeData = { name: 'AB' }

      const errors = validateEventSubtypeData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should accept maximum valid name length', () => {
      const maxName = 'A'.repeat(255)
      const validData: CreateEventSubtypeData = { name: maxName }

      const errors = validateEventSubtypeData(validData)

      expect(errors).toHaveLength(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle CRUD lifecycle', async () => {
      // Create
      const createData: CreateEventSubtypeData = { name: 'Test Subtype' }
      const createdSubtype = { ...mockEventSubtype, id: 10, name: 'Test Subtype' }
      mockedApiClient.post.mockResolvedValueOnce({ data: { data: createdSubtype } })
      const created = await createEventSubtype(1, createData)
      expect(created.id).toBe(10)

      // Read
      mockedApiClient.get.mockResolvedValueOnce({ data: createdSubtype })
      const fetched = await getEventSubtype(1, 10)
      expect(fetched.name).toBe('Test Subtype')

      // Update
      const updateData: UpdateEventSubtypeData = { name: 'Updated Subtype' }
      const updatedSubtype = { ...createdSubtype, name: 'Updated Subtype' }
      mockedApiClient.put.mockResolvedValueOnce({ data: { data: updatedSubtype } })
      const updated = await updateEventSubtype(1, 10, updateData)
      expect(updated.name).toBe('Updated Subtype')

      // Delete
      mockedApiClient.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } })
      await expect(deleteEventSubtype(1, 10)).resolves.not.toThrow()
    })

    it('should handle search and filter workflow', async () => {
      // Initial list
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPaginationResponse })
      const initial = await getEventSubtypes(1)
      expect(initial.total).toBe(15)

      // Search
      const searchResponse = { ...mockPaginationResponse, data: [mockEventSubtype], total: 1 }
      mockedApiClient.get.mockResolvedValueOnce({ data: searchResponse })
      const searched = await searchEventSubtypes(1, 'Nacional')
      expect(searched.total).toBe(1)

      // Filter active
      mockedApiClient.get.mockResolvedValueOnce({ data: searchResponse })
      const filtered = await getEventSubtypes(1, { active: true })
      expect(filtered.data[0].is_active).toBe(true)
    })

    it('should handle parent type relationship correctly', async () => {
      // Fetch subtypes for type 1
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPaginationResponse })
      await getEventSubtypes(1)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1/subtypes?')

      // Fetch subtypes for type 2
      const type2Response = { ...mockPaginationResponse, data: [] }
      mockedApiClient.get.mockResolvedValueOnce({ data: type2Response })
      await getEventSubtypes(2)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/2/subtypes?')

      // Create subtype for type 1
      mockedApiClient.post.mockResolvedValueOnce({ data: { data: mockEventSubtype } })
      await createEventSubtype(1, { name: 'Test' })
      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types/1/subtypes', {
        name: 'Test',
        is_active: true,
      })
    })
  })
})
