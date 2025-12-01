import apiClient from '@/services/apiClient'
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  submitForReview,
  duplicateEvent,
} from '../organizer-event.service'
import type { CreateEventDto, UpdateEventDto } from '@/features/organizer/types/event.types'

jest.mock('@/services/apiClient')

describe('organizer-event.service', () => {
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEvents', () => {
    it('should fetch events list with params', async () => {
      const mockResponse = {
        data: [
          { id: 1, title: 'Event 1' },
          { id: 2, title: 'Event 2' },
        ],
        current_page: 1,
        last_page: 2,
        total: 15,
        per_page: 10,
      }

      mockedApiClient.get.mockResolvedValue({ data: mockResponse })

      const params = { page: 1, per_page: 10, status: 'draft' }
      const result = await getEvents(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizer/events', { params })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch events with null status', async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
      }

      mockedApiClient.get.mockResolvedValue({ data: mockResponse })

      const params = { page: 1, per_page: 10, status: null }
      const result = await getEvents(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizer/events', { params })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API error', async () => {
      const error = new Error('Network error')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEvents({ page: 1, per_page: 10, status: null })).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('getEvent', () => {
    it('should fetch single event by id', async () => {
      const mockEvent = {
        data: {
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          status: 'draft',
        },
      }

      mockedApiClient.get.mockResolvedValue({ data: mockEvent })

      const result = await getEvent(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizer/events/1')
      expect(result).toEqual(mockEvent)
    })

    it('should fetch event with large id', async () => {
      const mockEvent = { data: { id: 999999, title: 'Event' } }
      mockedApiClient.get.mockResolvedValue({ data: mockEvent })

      const result = await getEvent(999999)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizer/events/999999')
      expect(result).toEqual(mockEvent)
    })

    it('should handle not found error', async () => {
      const error = new Error('Event not found')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(getEvent(999)).rejects.toThrow('Event not found')
    })
  })

  describe('createEvent', () => {
    it('should create new event with all fields', async () => {
      const newEvent = {
        title: 'New Event',
        description: 'Event Description',
        start_date: '2030-12-01T10:00:00',
        end_date: '2030-12-01T18:00:00',
        category_id: 1,
        location_ids: [1, 2],
        edition_number: '10ma Edición',
        virtual_transmission: true,
        maps_url: 'https://maps.google.com/test',
      }

      const mockResponse = { data: { id: 1, ...newEvent } }
      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await createEvent(newEvent)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events', newEvent)
      expect(result).toEqual(mockResponse)
    })

    it('should create event with minimal fields', async () => {
      const newEvent: Partial<CreateEventDto> = {
        title: 'Minimal Event',
        description: 'Description',
        start_date: '2030-12-01T10:00:00',
        category_id: 1,
        location_ids: [1],
      }

      const mockResponse = { data: { id: 2, ...newEvent } }
      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await createEvent(newEvent as CreateEventDto)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events', newEvent)
      expect(result).toEqual(mockResponse)
    })

    it('should handle validation error', async () => {
      const error = new Error('Validation failed')
      mockedApiClient.post.mockRejectedValue(error)

      const invalidEvent: Partial<CreateEventDto> = { title: '' }
      await expect(createEvent(invalidEvent as CreateEventDto)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateEvent', () => {
    it('should update event with all fields', async () => {
      const updateData: Partial<UpdateEventDto> = {
        id: 1,
        title: 'Updated Event',
        description: 'Updated Description',
        start_date: '2030-12-15T10:00:00',
        category_id: 2,
        location_ids: [3],
        edition_number: '11va Edición',
        virtual_transmission: false,
      }

      const mockResponse = { data: updateData }
      mockedApiClient.put.mockResolvedValue({ data: mockResponse })

      const result = await updateEvent(1, updateData as UpdateEventDto)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/organizer/events/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should update single field only', async () => {
      const updateData: Partial<UpdateEventDto> = { title: 'New Title Only' }
      const mockResponse = { data: { id: 1, ...updateData } }

      mockedApiClient.put.mockResolvedValue({ data: mockResponse })

      const result = await updateEvent(1, updateData as UpdateEventDto)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/organizer/events/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update error', async () => {
      const error = new Error('Update failed')
      mockedApiClient.put.mockRejectedValue(error)

      const invalidUpdate: Partial<UpdateEventDto> = { title: 'Test' }
      await expect(updateEvent(1, invalidUpdate as UpdateEventDto)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteEvent', () => {
    it('should delete event by id', async () => {
      const mockResponse = { success: true }
      mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

      const result = await deleteEvent(1)

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/organizer/events/1')
      expect(result).toEqual(mockResponse)
    })

    it('should delete event with large id', async () => {
      const mockResponse = { success: true }
      mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

      const result = await deleteEvent(999999)

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/organizer/events/999999')
      expect(result).toEqual(mockResponse)
    })

    it('should handle delete error', async () => {
      const error = new Error('Delete failed')
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEvent(1)).rejects.toThrow('Delete failed')
    })

    it('should handle not found on delete', async () => {
      const error = new Error('Event not found')
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(deleteEvent(999)).rejects.toThrow('Event not found')
    })
  })

  describe('submitForReview', () => {
    it('should submit event for review by id', async () => {
      const mockResponse = {
        message: 'Event submitted for review',
        status: 'pending_internal_approval',
        event: {
          id: 1,
          title: 'Event',
          status: 'pending_internal_approval',
        },
      }

      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await submitForReview(1)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events/1/submit')
      expect(result).toEqual(mockResponse)
    })

    it('should submit event with large id', async () => {
      const mockResponse = {
        message: 'Event submitted for review',
        status: 'pending_internal_approval',
        event: { id: 999999, status: 'pending_internal_approval' }
      }
      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await submitForReview(999999)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events/999999/submit')
      expect(result).toEqual(mockResponse)
    })

    it('should handle submit validation error', async () => {
      const error = new Error('Missing required fields')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(submitForReview(1)).rejects.toThrow('Missing required fields')
    })

    it('should handle submit forbidden error', async () => {
      const error = new Error('Only draft events can be submitted')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(submitForReview(1)).rejects.toThrow('Only draft events can be submitted')
    })
  })

  describe('duplicateEvent', () => {
    it('should duplicate event by id', async () => {
      const mockResponse = {
        data: {
          id: 2,
          title: 'Event (Copy)',
          description: 'Original description',
          status: 'draft',
        },
      }

      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await duplicateEvent(1)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events/1/duplicate')
      expect(result).toEqual(mockResponse)
    })

    it('should duplicate event with large id', async () => {
      const mockResponse = { data: { id: 1000000, title: 'Duplicated Event' } }
      mockedApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await duplicateEvent(999999)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events/999999/duplicate')
      expect(result).toEqual(mockResponse)
    })

    it('should handle duplicate error', async () => {
      const error = new Error('Duplication failed')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(duplicateEvent(1)).rejects.toThrow('Duplication failed')
    })

    it('should handle not found on duplicate', async () => {
      const error = new Error('Event not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(duplicateEvent(999)).rejects.toThrow('Event not found')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle full CRUD lifecycle', async () => {
      // Create
      const createResponse = { data: { id: 1, title: 'New Event' } }
      mockedApiClient.post.mockResolvedValueOnce({ data: createResponse })
      const createData: Partial<CreateEventDto> = { title: 'New Event', description: 'Desc' }
      await createEvent(createData as CreateEventDto)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizer/events', expect.any(Object))

      // Read
      const getResponse = { data: { id: 1, title: 'New Event' } }
      mockedApiClient.get.mockResolvedValueOnce({ data: getResponse })
      await getEvent(1)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizer/events/1')

      // Update
      const updateResponse = { data: { id: 1, title: 'Updated Event' } }
      mockedApiClient.put.mockResolvedValueOnce({ data: updateResponse })
      const updateData: Partial<UpdateEventDto> = { title: 'Updated Event' }
      await updateEvent(1, updateData as UpdateEventDto)
      expect(mockedApiClient.put).toHaveBeenCalledWith('/organizer/events/1', expect.any(Object))

      // Delete
      const deleteResponse = { success: true }
      mockedApiClient.delete.mockResolvedValueOnce({ data: deleteResponse })
      await deleteEvent(1)
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/organizer/events/1')
    })

    it('should handle network errors consistently', async () => {
      const networkError = new Error('Network error')

      mockedApiClient.get.mockRejectedValue(networkError)
      await expect(getEvents({ page: 1, per_page: 10, status: null })).rejects.toThrow()

      mockedApiClient.post.mockRejectedValue(networkError)
      const emptyEvent: Partial<CreateEventDto> = {}
      await expect(createEvent(emptyEvent as CreateEventDto)).rejects.toThrow()

      mockedApiClient.put.mockRejectedValue(networkError)
      const emptyUpdate: Partial<UpdateEventDto> = {}
      await expect(updateEvent(1, emptyUpdate as UpdateEventDto)).rejects.toThrow()

      mockedApiClient.delete.mockRejectedValue(networkError)
      await expect(deleteEvent(1)).rejects.toThrow()
    })
  })
})
