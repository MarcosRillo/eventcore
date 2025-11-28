import { renderHook, waitFor } from '@testing-library/react'
import { useLandingData } from '../useLandingData'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

// Mock the service
jest.mock('@/features/public-calendar/services/public-events.service', () => ({
  publicEventsService: {
    getFeatured: jest.fn(),
    getCategories: jest.fn()
  }
}))

describe('useLandingData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockEvents = [{ id: 1, title: 'Event 1' }]
    const mockCategories = [{ id: 1, name: 'Category 1' }]

    ;(publicEventsService.getFeatured as jest.Mock).mockResolvedValue({ data: mockEvents })
    ;(publicEventsService.getCategories as jest.Mock).mockResolvedValue({ data: mockCategories })

    const { result } = renderHook(() => useLandingData())

    // Initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    // Wait for data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.featuredEvents).toEqual(mockEvents)
    expect(result.current.categories).toEqual(mockCategories)
    expect(result.current.error).toBeNull()
  })

  it('should handle errors', async () => {
    ;(publicEventsService.getFeatured as jest.Mock).mockRejectedValue(new Error('Network error'))
    ;(publicEventsService.getCategories as jest.Mock).mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useLandingData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load landing data')
    expect(result.current.featuredEvents).toEqual([])
    expect(result.current.categories).toEqual([])
  })
})
