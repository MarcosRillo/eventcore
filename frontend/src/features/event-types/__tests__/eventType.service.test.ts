/**
 * EventType Service Tests
 *
 * Tests for all CRUD operations on event types.
 * Covers success scenarios, error handling, and edge cases.
 *
 * Created: December 2, 2025
 */

import {
  createEventType,
  deleteEventType,
  getActiveEventTypes,
  getEventType,
  getEventTypes,
  searchEventTypes,
  toggleEventTypeStatus,
  updateEventType,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service'
import apiClient from '@/services/apiClient'
import type { CreateEventTypeData, EventType, EventTypePagination, UpdateEventTypeData } from '@/types/eventType.types'

// Mock apiClient
jest.mock('@/services/apiClient')

describe('eventType.service', () => {
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

  // Sample event types for testing
  const mockEventType: EventType = {
    id: 1,
    name: 'Conferencia',
    color: '#3B82F6',
    entity_id: 1,
    is_active: true,
    subtypes_count: 3,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockEventType2: EventType = {
    id: 2,
    name: 'Taller',
    color: '#10B981',
    entity_id: 1,
    is_active: false,
    subtypes_count: 0,
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  }

  const mockPaginationResponse: EventTypePagination = {
    data: [mockEventType, mockEventType2],
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
    links: {
      first: 'http://api.example.com/event-types?page=1',
      last: 'http://api.example.com/event-types?page=2',
      prev: null,
      next: 'http://api.example.com/event-types?page=2',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEventTypes', () => {
    it('should fetch paginated event types with default params', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const result = await getEventTypes()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types?')
      expect(result).toEqual(mockPaginationResponse)
      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(15)
    })

    it('should fetch event types with all query params', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const params = {
        page: 2,
        per_page: 20,
        search: 'conf',
        active: true,
      }

      const result = await getEventTypes(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types?page=2&per_page=20&search=conf&active=true'
      )
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(result.data).toHaveLength(2)
      expect(result.meta.current_page).toBe(1)
    })

    it('should handle inactive filter', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const result = await getEventTypes({ active: false })

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types?active=false')
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockPaginationResponse)
      expect(result.data).toBeDefined()
    })

    it('should handle empty results', async () => {
      const emptyResponse: EventTypePagination = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: null,
          to: null,
          path: 'http://api.example.com/event-types',
          links: [],
        },
        links: { first: null, last: null, prev: null, next: null },
      }
      mockedApiClient.get.mockResolvedValue({ data: emptyResponse })

      const result = await getEventTypes({ search: 'nonexistent' })

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })

    it('should handle API error', async () => {
      const error = new Error('Network error')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEventTypes()).rejects.toThrow('Network error')
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types?')
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('getEventType', () => {
    it('should fetch single event type by id', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockEventType })

      const result = await getEventType(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/1')
      expect(result).toEqual(mockEventType)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Conferencia')
    })

    it('should fetch event type with large id', async () => {
      const largeIdType = { ...mockEventType, id: 999999 }
      mockedApiClient.get.mockResolvedValue({ data: largeIdType })

      const result = await getEventType(999999)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/999999')
      expect(result.id).toBe(999999)
    })

    it('should handle not found error', async () => {
      const error = new Error('Event type not found')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEventType(999)).rejects.toThrow('Event type not found')
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/999')
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('createEventType', () => {
    it('should create event type with name only', async () => {
      const createData: CreateEventTypeData = { name: 'Seminario' }
      const createdType = { ...mockEventType, id: 3, name: 'Seminario' }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdType },
      })

      const result = await createEventType(createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types', {
        name: 'Seminario',
        is_active: true,
      })
      expect(result.name).toBe('Seminario')
      expect(result.is_active).toBe(true)
    })

    it('should create event type with is_active false', async () => {
      const createData: CreateEventTypeData = { name: 'Borrador', is_active: false }
      const createdType = { ...mockEventType, id: 4, name: 'Borrador', is_active: false }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdType },
      })

      const result = await createEventType(createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types', {
        name: 'Borrador',
        is_active: false,
      })
      expect(result.is_active).toBe(false)
    })

    it('should create event type with explicit is_active true', async () => {
      const createData: CreateEventTypeData = { name: 'Activo', is_active: true }
      const createdType = { ...mockEventType, id: 5, name: 'Activo', is_active: true }

      mockedApiClient.post.mockResolvedValue({
        data: { data: createdType },
      })

      const result = await createEventType(createData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types', {
        name: 'Activo',
        is_active: true,
      })
      expect(result.is_active).toBe(true)
    })

    it('should handle validation error from API', async () => {
      const error = new Error('Validation failed')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(createEventType({ name: '' })).rejects.toThrow('Validation failed')
      expect(mockedApiClient.post).toHaveBeenCalledWith('/event-types', {
        name: '',
        is_active: true,
      })
      expect(mockedApiClient.post).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateEventType', () => {
    it('should update event type name', async () => {
      const updateData: UpdateEventTypeData = { name: 'Conferencia Actualizada' }
      const updatedType = { ...mockEventType, name: 'Conferencia Actualizada' }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedType },
      })

      const result = await updateEventType(1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1', {
        name: 'Conferencia Actualizada',
        is_active: undefined,
      })
      expect(result.name).toBe('Conferencia Actualizada')
    })

    it('should update event type is_active status', async () => {
      const updateData: UpdateEventTypeData = { is_active: false }
      const updatedType = { ...mockEventType, is_active: false }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedType },
      })

      const result = await updateEventType(1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1', {
        name: undefined,
        is_active: false,
      })
      expect(result.is_active).toBe(false)
    })

    it('should update both name and is_active', async () => {
      const updateData: UpdateEventTypeData = { name: 'Nuevo Nombre', is_active: true }
      const updatedType = { ...mockEventType, name: 'Nuevo Nombre', is_active: true }

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedType },
      })

      const result = await updateEventType(1, updateData)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1', {
        name: 'Nuevo Nombre',
        is_active: true,
      })
      expect(result.name).toBe('Nuevo Nombre')
      expect(result.is_active).toBe(true)
    })

    it('should handle update error', async () => {
      const error = new Error('Update failed')
      mockedApiClient.put.mockRejectedValue(error)

      await expect(updateEventType(1, { name: 'Test' })).rejects.toThrow('Update failed')
      expect(mockedApiClient.put).toHaveBeenCalledWith('/event-types/1', {
        name: 'Test',
        is_active: undefined,
      })
      expect(mockedApiClient.put).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteEventType', () => {
    it('should delete event type by id', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: { message: 'Deleted' } })

      await expect(deleteEventType(1)).resolves.not.toThrow()

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/event-types/1')
    })

    it('should handle 404 not found error', async () => {
      const error = {
        response: { status: 404, data: { message: 'Not found' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventType(999)).rejects.toThrow(
        'El tipo de evento no existe o ya fue eliminado.'
      )
    })

    it('should handle 403 forbidden error', async () => {
      const error = {
        response: { status: 403, data: { message: 'Forbidden' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventType(1)).rejects.toThrow(
        'No tienes permiso para eliminar este tipo de evento.'
      )
    })

    it('should handle 409 conflict error (has subtypes)', async () => {
      const error = {
        response: { status: 409, data: { message: 'Has subtypes' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventType(1)).rejects.toThrow(
        'No se puede eliminar el tipo de evento porque tiene subtipos asociados.'
      )
    })

    it('should handle generic error with API message', async () => {
      const error = {
        response: { status: 500, data: { message: 'Internal server error' } },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventType(1)).rejects.toThrow('Internal server error')
    })

    it('should handle generic error without API message', async () => {
      const error = {
        response: { status: 500, data: {} },
      }
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEventType(1)).rejects.toThrow(
        'Error al eliminar el tipo de evento. Inténtalo de nuevo.'
      )
    })
  })

  describe('toggleEventTypeStatus', () => {
    it('should toggle event type status from active to inactive', async () => {
      const toggledType = { ...mockEventType, is_active: false }

      mockedApiClient.patch.mockResolvedValue({
        data: { data: toggledType },
      })

      const result = await toggleEventTypeStatus(1)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/event-types/1/toggle-status')
      expect(result.is_active).toBe(false)
    })

    it('should toggle event type status from inactive to active', async () => {
      const toggledType = { ...mockEventType2, is_active: true }

      mockedApiClient.patch.mockResolvedValue({
        data: { data: toggledType },
      })

      const result = await toggleEventTypeStatus(2)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/event-types/2/toggle-status')
      expect(result.is_active).toBe(true)
    })

    it('should handle toggle error', async () => {
      const error = new Error('Toggle failed')
      mockedApiClient.patch.mockRejectedValue(error)

      await expect(toggleEventTypeStatus(1)).rejects.toThrow('Toggle failed')
      expect(mockedApiClient.patch).toHaveBeenCalledWith('/event-types/1/toggle-status')
      expect(mockedApiClient.patch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getActiveEventTypes', () => {
    it('should fetch active event types as array', async () => {
      const activeTypes = [mockEventType]

      mockedApiClient.get.mockResolvedValue({
        data: { data: activeTypes },
      })

      const result = await getActiveEventTypes()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/active')
      expect(result).toHaveLength(1)
      expect(result[0].is_active).toBe(true)
    })

    it('should handle direct array response format', async () => {
      const activeTypes = [mockEventType]

      mockedApiClient.get.mockResolvedValue({
        data: activeTypes, // Direct array, not wrapped
      })

      const result = await getActiveEventTypes()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Conferencia')
    })

    it('should return empty array when no active types', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [] },
      })

      const result = await getActiveEventTypes()

      expect(result).toHaveLength(0)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/active')
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle API error', async () => {
      const error = new Error('Fetch failed')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getActiveEventTypes()).rejects.toThrow('Fetch failed')
      expect(mockedApiClient.get).toHaveBeenCalledWith('/event-types/active')
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('searchEventTypes', () => {
    it('should search event types with query', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      const result = await searchEventTypes('conf')

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types?page=1&per_page=15&search=conf'
      )
      expect(result).toEqual(mockPaginationResponse)
    })

    it('should search with custom page', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockPaginationResponse })

      await searchEventTypes('taller', 3)

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/event-types?page=3&per_page=15&search=taller'
      )
    })

    it('should handle empty search results', async () => {
      const emptyResponse: EventTypePagination = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: null,
          to: null,
          path: 'http://api.example.com/event-types',
          links: [],
        },
        links: { first: null, last: null, prev: null, next: null },
      }
      mockedApiClient.get.mockResolvedValue({ data: emptyResponse })

      const result = await searchEventTypes('nonexistent')

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })
  })

  describe('validateEventTypeData', () => {
    it('should return no errors for valid data', () => {
      const validData: CreateEventTypeData = { name: 'Conferencia' }

      const errors = validateEventTypeData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should return error for empty name', () => {
      const invalidData: CreateEventTypeData = { name: '' }

      const errors = validateEventTypeData(invalidData)

      expect(errors).toContain('El nombre del tipo de evento es obligatorio')
    })

    it('should return error for whitespace-only name', () => {
      const invalidData: CreateEventTypeData = { name: '   ' }

      const errors = validateEventTypeData(invalidData)

      expect(errors).toContain('El nombre del tipo de evento es obligatorio')
    })

    it('should return error for name too short', () => {
      const invalidData: CreateEventTypeData = { name: 'A' }

      const errors = validateEventTypeData(invalidData)

      expect(errors).toContain('El nombre debe tener al menos 2 caracteres')
    })

    it('should return error for name too long', () => {
      const longName = 'A'.repeat(256)
      const invalidData: CreateEventTypeData = { name: longName }

      const errors = validateEventTypeData(invalidData)

      expect(errors).toContain('El nombre no puede exceder 255 caracteres')
    })

    it('should validate update data with name', () => {
      const updateData: UpdateEventTypeData = { name: 'Valid Name' }

      const errors = validateEventTypeData(updateData)

      expect(errors).toHaveLength(0)
    })

    it('should skip name validation if not provided in update', () => {
      const updateData: UpdateEventTypeData = { is_active: false }

      const errors = validateEventTypeData(updateData)

      expect(errors).toHaveLength(0)
    })

    it('should accept minimum valid name length', () => {
      const validData: CreateEventTypeData = { name: 'AB' }

      const errors = validateEventTypeData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should accept maximum valid name length', () => {
      const maxName = 'A'.repeat(255)
      const validData: CreateEventTypeData = { name: maxName }

      const errors = validateEventTypeData(validData)

      expect(errors).toHaveLength(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle CRUD lifecycle', async () => {
      // Create
      const createData: CreateEventTypeData = { name: 'Test Type' }
      const createdType = { ...mockEventType, id: 10, name: 'Test Type' }
      mockedApiClient.post.mockResolvedValueOnce({ data: { data: createdType } })
      const created = await createEventType(createData)
      expect(created.id).toBe(10)

      // Read
      mockedApiClient.get.mockResolvedValueOnce({ data: createdType })
      const fetched = await getEventType(10)
      expect(fetched.name).toBe('Test Type')

      // Update
      const updateData: UpdateEventTypeData = { name: 'Updated Type' }
      const updatedType = { ...createdType, name: 'Updated Type' }
      mockedApiClient.put.mockResolvedValueOnce({ data: { data: updatedType } })
      const updated = await updateEventType(10, updateData)
      expect(updated.name).toBe('Updated Type')

      // Delete
      mockedApiClient.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } })
      await expect(deleteEventType(10)).resolves.not.toThrow()
    })

    it('should handle search and filter workflow', async () => {
      // Initial list
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPaginationResponse })
      const initial = await getEventTypes()
      expect(initial.meta.total).toBe(15)

      // Search
      const searchResponse = { ...mockPaginationResponse, data: [mockEventType], meta: { ...mockPaginationResponse.meta, total: 1 } }
      mockedApiClient.get.mockResolvedValueOnce({ data: searchResponse })
      const searched = await searchEventTypes('Conferencia')
      expect(searched.meta.total).toBe(1)

      // Filter active
      mockedApiClient.get.mockResolvedValueOnce({ data: searchResponse })
      const filtered = await getEventTypes({ active: true })
      expect(filtered.data[0].is_active).toBe(true)
    })
  })
})
