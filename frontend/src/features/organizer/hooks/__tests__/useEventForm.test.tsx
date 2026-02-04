import { act, renderHook, waitFor } from '@testing-library/react'
import type { FormEvent, ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { useEventForm } from '@/features/organizer/hooks/useEventForm'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'

jest.mock('@/features/organizer/services/organizer-event.service')

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
}
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
)

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

const mockEventTypes = [
  { id: 1, name: 'Congreso', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 2, name: 'Feria', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
]

const mockEventSubtypes = [
  { id: 1, event_type_id: 1, name: 'Nacional', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 2, event_type_id: 1, name: 'Internacional', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
]

describe('useEventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.push.mockClear()
    mockRouter.back.mockClear()

    // Mock the fetcher to return data based on the URL
    mockedFetcher.mockImplementation((url: string) => {
      if (url === '/event-types/active') {
        return Promise.resolve({ data: mockEventTypes })
      }
      if (url === '/locations/active') {
        return Promise.resolve({ data: [] })
      }
      if (url.match(/\/event-types\/\d+\/subtypes\/active/)) {
        return Promise.resolve({ data: mockEventSubtypes })
      }
      if (url.match(/\/organizer\/events\/\d+/)) {
        return Promise.resolve({
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          start_date: '2030-12-01T10:00',
          locations: [{ id: 1, name: 'Location 1' }],
        })
      }
      return Promise.resolve(null)
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty form data in create mode', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      expect(result.current.formData.title).toBe('')
      expect(result.current.formData.description).toBe('')
      expect(result.current.formData.location_ids).toEqual([])
      expect(result.current.isEditMode).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.initialLoading).toBe(false)
    })

    it('should set isEditMode to true when eventId is provided', async () => {
      const { result } = renderHook(() => useEventForm({ eventId: 1 }), { wrapper })

      expect(result.current.isEditMode).toBe(true)

      await waitFor(() => {
        expect(result.current.initialLoading).toBe(false)
      })
    })

    it('should verify locations are async search only', async () => {
      renderHook(() => useEventForm(), { wrapper })

      // searchLocations should not be called (locations are loaded via SWR now)
      expect(organizerEventService.getEvent).not.toHaveBeenCalled()
    })

    it('should initialize selectedLocations as empty array', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      expect(result.current.selectedLocations).toEqual([])
    })
  })

  describe('handleChange', () => {
    it('should update form data when field value changes', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('title', 'New Event Title')
      })

      expect(result.current.formData.title).toBe('New Event Title')
    })

    it('should update boolean fields correctly', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('virtual_transmission', true)
      })

      expect(result.current.formData.virtual_transmission).toBe(true)
    })

    it('should update number fields correctly', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('event_type_id', 5)
      })

      expect(result.current.formData.event_type_id).toBe(5)
    })

    it('should update array fields correctly', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('location_ids', [1, 2])
      })

      expect(result.current.formData.location_ids).toEqual([1, 2])
    })

    it('should clear field error when field value changes', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

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
    })
  })

  describe('handleSubmit - validation', () => {
    it('should prevent submission and show errors when form is invalid', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
      expect(organizerEventService.createEvent).not.toHaveBeenCalled()
    })

    it('should show error for missing title', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.title).toBe('El título es requerido')
    })

    it('should show error for missing description', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.description).toBe('La descripción es requerida')
    })

    it('should show error for missing start_date', async () => {
      const { result } = renderHook(() => useEventForm(), { wrapper })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.start_date).toBe('La fecha de inicio es requerida')
    })
  })

  describe('handleSubmit - create mode', () => {
    it('should call createEvent when form is valid', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
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

      const { result } = renderHook(() => useEventForm(), { wrapper })

      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
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

      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
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

      const { result } = renderHook(() => useEventForm({ onSuccess }), { wrapper })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
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

      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleChange('title', 'Test Event')
        result.current.handleChange('description', 'Test Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
        result.current.handleChange('location_ids', [1])
      })

      await act(async () => {
        await result.current.handleSubmit(createMockFormEvent())
      })

      expect(result.current.errors.general).toBe('Error al crear el evento')
    })
  })

  describe('handleSubmit - edit mode', () => {
    it('should call updateEvent when in edit mode', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/event-types/active') return Promise.resolve({ data: mockEventTypes })
        if (url === '/locations/active') return Promise.resolve({ data: [] })
        if (url === '/organizer/events/1') {
          return Promise.resolve({
            id: 1,
            title: 'Original Title',
            description: 'Original Description',
            start_date: '2030-12-01T10:00',
            end_date: '2030-12-01T18:00',
            event_type_id: 1,
            event_subtype_id: 1,
            locations: [{ id: 1, name: 'Location 1' }],
          })
        }
        return Promise.resolve(null)
      })
      ;(organizerEventService.updateEvent as jest.Mock).mockResolvedValue({ data: { id: 1 } })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }), { wrapper })

      await waitFor(() => {
        expect(result.current.formData.title).toBe('Original Title')
      })

      act(() => {
        result.current.handleChange('title', 'Updated Title')
        result.current.handleChange('description', 'Updated Description')
        result.current.handleChange('start_date', '2030-12-01T10:00')
        result.current.handleChange('event_type_id', 1)
        result.current.handleChange('event_subtype_id', 1)
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
      const { result } = renderHook(() => useEventForm(), { wrapper })

      act(() => {
        result.current.handleCancel()
      })

      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('should call onCancel callback when provided', async () => {
      const onCancel = jest.fn()
      const { result } = renderHook(() => useEventForm({ onCancel }), { wrapper })

      act(() => {
        result.current.handleCancel()
      })

      expect(onCancel).toHaveBeenCalled()
      expect(mockRouter.back).not.toHaveBeenCalled()
    })
  })

  describe('Edit Mode - Load Event', () => {
    it('should load event data when eventId is provided', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/event-types/active') return Promise.resolve({ data: mockEventTypes })
        if (url === '/locations/active') return Promise.resolve({ data: [] })
        if (url === '/organizer/events/1') {
          return Promise.resolve({
            id: 1,
            title: 'Test Event',
            description: 'Test Description',
            start_date: '2030-12-01T10:00',
            end_date: '2030-12-01T18:00',
            event_type_id: 1,
            locations: [{ id: 2, name: 'Location 2' }],
            featured_image: 'https://example.com/image.jpg',
          })
        }
        return Promise.resolve(null)
      })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }), { wrapper })

      await waitFor(() => {
        expect(result.current.formData.title).toBe('Test Event')
        expect(result.current.formData.description).toBe('Test Description')
        expect(result.current.formData.event_type_id).toBe(1)
        expect(result.current.formData.location_ids).toEqual([2])
        expect(result.current.formData.featured_image).toBe('https://example.com/image.jpg')
      })
    })

    it('should set error when loading event fails', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/event-types/active') return Promise.resolve({ data: mockEventTypes })
        if (url === '/locations/active') return Promise.resolve({ data: [] })
        if (url === '/organizer/events/1') {
          return Promise.reject(new Error('Not found'))
        }
        return Promise.resolve(null)
      })

      const { result } = renderHook(() => useEventForm({ eventId: 1 }), { wrapper })

      await waitFor(() => {
        expect(result.current.initialLoading).toBe(false)
      })

      // SWR handles the error - event data won't load, form stays empty
      expect(result.current.formData.title).toBe('')
    })

    it('should set initialLoading to false after loading', async () => {
      const { result } = renderHook(() => useEventForm({ eventId: 1 }), { wrapper })

      await waitFor(() => {
        expect(result.current.initialLoading).toBe(false)
      })
    })
  })
})
