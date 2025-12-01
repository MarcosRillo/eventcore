/**
 * Tests for useEventForm hook
 * Updated for 3NF schema (Nov 30, 2025)
 */

import type { FormEvent } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useEventForm } from '../useEventForm'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import * as categoryService from '@/features/categories/services/category.service'
import * as locationService from '@/features/locations/services/location.service'

jest.mock('@/features/organizer/services/organizer-event.service')
jest.mock('@/features/categories/services/category.service')
jest.mock('@/features/locations/services/location.service')

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
}
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

/**
 * Creates a mock FormEvent for testing form submissions
 */
const createMockFormEvent = (): FormEvent => {
  const mockEvent = {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    isPropagationStopped: jest.fn(() => false),
    persist: jest.fn(),
    currentTarget: document.createElement('form'),
    target: document.createElement('form'),
    bubbles: false,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),
    type: 'submit',
    nativeEvent: new Event('submit'),
    isDefaultPrevented: jest.fn(() => false),
  } as FormEvent

  return mockEvent
}

describe('useEventForm', () => {
  const mockCategories = [
    { id: 1, name: 'Música' },
    { id: 2, name: 'Gastronomía' },
  ]

  const mockLocations = [
    { id: 1, name: 'Plaza Independencia' },
    { id: 2, name: 'Parque 9 de Julio' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.push.mockClear()
    mockRouter.back.mockClear()

    ;(categoryService.getCategories as jest.Mock).mockResolvedValue({
      data: mockCategories,
    })
    ;(locationService.getLocations as jest.Mock).mockResolvedValue({
      data: { data: mockLocations },
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty form data in create mode', async () => {
      const { result } = renderHook(() => useEventForm())

      expect(result.current.formData.title).toBe('')
      expect(result.current.formData.description).toBe('')
      expect(result.current.formData.location_ids).toEqual([])
      expect(result.current.isEditMode).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.initialLoading).toBe(false)

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should set isEditMode to true when eventId is provided', async () => {
      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          start_date: '2030-12-01T10:00',
          locations: [{ id: 1, name: 'Location 1' }],
        },
      })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }))

      expect(result.current.isEditMode).toBe(true)
      expect(result.current.initialLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.initialLoading).toBe(false)
      })
    })

    it('should load categories and locations on mount', async () => {
      renderHook(() => useEventForm())

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })
    })

    it('should set categories and locations from API response', async () => {
      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
        expect(result.current.locations).toEqual(mockLocations)
      })
    })
  })

  describe('handleChange', () => {
    it('should update form data when field value changes', async () => {
      const { result } = renderHook(() => useEventForm())

      act(() => {
        result.current.handleChange('title', 'New Event Title')
      })

      expect(result.current.formData.title).toBe('New Event Title')

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should update boolean fields correctly', async () => {
      const { result } = renderHook(() => useEventForm())

      act(() => {
        result.current.handleChange('virtual_transmission', true)
      })

      expect(result.current.formData.virtual_transmission).toBe(true)

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should update number fields correctly', async () => {
      const { result } = renderHook(() => useEventForm())

      act(() => {
        result.current.handleChange('category_id', 5)
      })

      expect(result.current.formData.category_id).toBe(5)

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should update array fields correctly', async () => {
      const { result } = renderHook(() => useEventForm())

      act(() => {
        result.current.handleChange('location_ids', [1, 2])
      })

      expect(result.current.formData.location_ids).toEqual([1, 2])

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should clear field error when field value changes', async () => {
      const { result } = renderHook(() => useEventForm())

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      await waitFor(() => {
        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.handleChange('title', 'Valid Title')
      })

      expect(result.current.errors.title).toBeUndefined()

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })
  })

  describe('handleSubmit - validation', () => {
    it('should prevent submission and show errors when form is invalid', async () => {
      const { result } = renderHook(() => useEventForm())

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
      expect(organizerEventService.createEvent).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should show error for missing title', async () => {
      const { result } = renderHook(() => useEventForm())

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.title).toBe('El título es requerido')

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should show error for missing description', async () => {
      const { result } = renderHook(() => useEventForm())

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.description).toBe('La descripción es requerida')

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })

    it('should show error for missing start_date', async () => {
      const { result } = renderHook(() => useEventForm())

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.start_date).toBe('La fecha de inicio es requerida')

      await waitFor(() => {
        expect(result.current.categories.length).toBeGreaterThan(0)
      })
    })
  })

  describe('handleSubmit - create mode', () => {
    it('should call createEvent when form is valid', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(organizerEventService.createEvent).toHaveBeenCalled()
    })

    it('should set loading to true during submission', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({ data: { id: 1 } }), 100)
        })
      )

      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      act(() => {
        result.current.handleSubmit(createMockFormEvent())
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 500 })
    })

    it('should navigate on success when onSuccess callback is not provided', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/organizer/events')
    })

    it('should call onSuccess callback when provided', async () => {
      const onSuccess = jest.fn()
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm({ onSuccess }))

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should set error when API call fails', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.general).toBe('Error creating event')
    })
  })

  describe('handleSubmit - edit mode', () => {
    it('should call updateEvent when in edit mode', async () => {
      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          title: 'Original Title',
          description: 'Original Description',
          start_date: '2030-12-01T10:00',
          end_date: '2030-12-01T18:00',
          category_id: 1,
          locations: [{ id: 1, name: 'Location 1' }],
        },
      })
      ;(organizerEventService.updateEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }))

      await waitFor(() => {
        expect(result.current.formData.title).toBe('Original Title')
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleChange('title', 'Updated Title')
        result.current.handleChange('description', 'Updated Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('category_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(organizerEventService.updateEvent).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ id: 1 })
      )
    })
  })

  describe('handleCancel', () => {
    it('should call router.back when onCancel is not provided', async () => {
      const { result } = renderHook(() => useEventForm())

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleCancel()
      })

      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('should call onCancel callback when provided', async () => {
      const onCancel = jest.fn()
      const { result } = renderHook(() => useEventForm({ onCancel }))

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
      })

      act(() => {
        result.current.handleCancel()
      })

      expect(onCancel).toHaveBeenCalled()
      expect(mockRouter.back).not.toHaveBeenCalled()
    })
  })

  describe('Edit Mode - Load Event', () => {
    it('should load event data when eventId is provided', async () => {
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        start_date: '2030-12-01T10:00',
        end_date: '2030-12-01T18:00',
        category_id: 1,
        locations: [{ id: 2, name: 'Location 2' }],
        featured_image: 'https://example.com/image.jpg',
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: mockEvent,
      })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }))

      await waitFor(() => {
        expect(result.current.formData.title).toBe('Test Event')
        expect(result.current.formData.description).toBe('Test Description')
        expect(result.current.formData.category_id).toBe(1)
        expect(result.current.formData.location_ids).toEqual([2])
        expect(result.current.formData.featured_image).toBe('https://example.com/image.jpg')
      })
    })

    it('should set error when loading event fails', async () => {
      ;(organizerEventService.getEvent as jest.Mock).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useEventForm({ eventId: 1 }))

      await waitFor(() => {
        expect(result.current.errors.general).toBe('Error loading event data')
      })
    })

    it('should set initialLoading to false after loading', async () => {
      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          title: 'Test',
          locations: [],
        },
      })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }))

      expect(result.current.initialLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.initialLoading).toBe(false)
      })
    })
  })
})
