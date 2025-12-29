import { renderHook, waitFor } from '@testing-library/react'

import { useLandingData } from '@/features/landing/hooks/useLandingData'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

// Mock the service
jest.mock('@/features/public-calendar/services/public-events.service', () => ({
  publicEventsService: {
    getFeatured: jest.fn(),
    getEventTypes: jest.fn()
  }
}))

describe('useLandingData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockEvents = [{ id: 1, title: 'Event 1' }]
    const mockEventTypes = [
      { id: 1, name: 'Cultural', is_active: true },
      { id: 2, name: 'Business', is_active: true }
    ]

    ;(publicEventsService.getFeatured as jest.Mock).mockResolvedValue({ data: mockEvents })
    ;(publicEventsService.getEventTypes as jest.Mock).mockResolvedValue({ data: mockEventTypes })

    const { result } = renderHook(() => useLandingData())

    // Initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    // Wait for data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.featuredEvents).toEqual(mockEvents)
    expect(result.current.eventTypes).toEqual(mockEventTypes)
    expect(result.current.error).toBeNull()
  })

  it('should handle errors', async () => {
    ;(publicEventsService.getFeatured as jest.Mock).mockRejectedValue(new Error('Network error'))
    ;(publicEventsService.getEventTypes as jest.Mock).mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useLandingData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load landing data')
    expect(result.current.featuredEvents).toEqual([])
    expect(result.current.eventTypes).toEqual([])
  })

  it('should fetch event types on mount', async () => {
    const mockEventTypes = [
      { id: 1, name: 'Cultural', is_active: true },
      { id: 2, name: 'Business', is_active: true }
    ]

    ;(publicEventsService.getFeatured as jest.Mock).mockResolvedValue({ data: [] })
    ;(publicEventsService.getEventTypes as jest.Mock).mockResolvedValue({ data: mockEventTypes })

    const { result } = renderHook(() => useLandingData())

    await waitFor(() => {
      expect(result.current.eventTypes).toEqual(mockEventTypes)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
