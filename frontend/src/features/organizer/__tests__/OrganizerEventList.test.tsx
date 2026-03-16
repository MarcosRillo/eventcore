import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { OrganizerEventListContainer } from '@/features/organizer/components/smart/OrganizerEventListContainer'
import { ToastProvider } from '@/shared/context'

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/organizer/dashboard',
}))

// Mock next/image - filter non-DOM props to avoid React warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, style, loading }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} className={className as string} style={style as React.CSSProperties} loading={loading as "lazy" | "eager" | undefined} />
  },
}))

// Helper to render with providers (SWRConfig + ToastProvider)
const renderWithProviders = (component: React.ReactElement) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>{children}</ToastProvider>
    </SWRConfig>
  )
  return render(component, { wrapper: Wrapper })
}

describe('OrganizerEventList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  describe('Initial Render & Loading', () => {
    test('should display loading state on initial render', () => {
      // Never resolves — stays loading
      mockedFetcher.mockImplementation(() => new Promise(() => {}))

      const { container } = renderWithProviders(<OrganizerEventListContainer />)

      // Loading now uses skeleton cards with pulse animation
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
    })

    test('should fetch and display events on mount', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Festival de Jazz',
          event_date: '2025-11-15',
          status: 'published',
          location: 'Plaza Independencia'
        },
        {
          id: 2,
          title: 'Expo Gastronómica',
          event_date: '2025-12-01',
          status: 'pending',
          location: 'Parque 9 de Julio'
        }
      ]

      mockedFetcher.mockResolvedValue({
        data: mockEvents,
        current_page: 1,
        last_page: 1,
        total: 2,
        per_page: 10
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Festival de Jazz')).toBeInTheDocument()
        expect(screen.getByText('Expo Gastronómica')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    test('should display pagination controls when total > per_page', async () => {
      const mockEvents = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      mockedFetcher.mockResolvedValue({
        data: mockEvents,
        current_page: 1,
        last_page: 3,
        total: 25,
        per_page: 10
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText(/1.*3/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
      })
    })

    test('should navigate to next page when next button clicked', async () => {
      const mockPage1 = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      const mockPage2 = Array.from({ length: 5 }, (_, i) => ({
        id: i + 11,
        title: `Event ${i + 11}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          return Promise.resolve({
            data: mockPage1,
            current_page: 1,
            last_page: 2,
            total: 15,
            per_page: 10
          })
        }
        return Promise.resolve({
          data: mockPage2,
          current_page: 2,
          last_page: 2,
          total: 15,
          per_page: 10
        })
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))

      await waitFor(() => {
        expect(screen.getByText('Event 11')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filtering', () => {
    test('should filter events by status when filter selected', async () => {
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' },
        { id: 2, title: 'Event 2', status: 'pending', event_date: '2025-11-16', location: 'Loc' }
      ]

      const publishedEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          return Promise.resolve({
            data: allEvents,
            current_page: 1,
            last_page: 1,
            total: 2,
            per_page: 10
          })
        }
        return Promise.resolve({
          data: publishedEvents,
          current_page: 1,
          last_page: 1,
          total: 1,
          per_page: 10
        })
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
      })

      // Select "Published" filter
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'published' } })

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.queryByText('Event 2')).not.toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    test('should display "no events" empty state', async () => {
      mockedFetcher.mockResolvedValue({
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText(/no tienes eventos/i)).toBeInTheDocument()
        expect(screen.getByText(/crea tu primer evento/i)).toBeInTheDocument()
      })
    })

    test('should display "no matching events" when filter returns empty', async () => {
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          return Promise.resolve({
            data: allEvents,
            current_page: 1,
            last_page: 1,
            total: 1,
            per_page: 10
          })
        }
        return Promise.resolve({
          data: [],
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10
        })
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      // Apply filter that returns no results
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'rejected' } })

      await waitFor(() => {
        expect(screen.getByText(/no se encontraron eventos/i)).toBeInTheDocument()
        expect(screen.getByText(/prueba con un filtro diferente/i)).toBeInTheDocument()
      })
    })
  })

  describe('Event Actions', () => {
    test('should navigate to edit page when edit button clicked', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' }
      ]

      mockedFetcher.mockResolvedValue({
        data: mockEvents,
        current_page: 1,
        last_page: 1,
        total: 1,
        per_page: 10
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const editButton = screen.getByLabelText(/editar.*event 1/i)
      fireEvent.click(editButton)

      expect(mockPush).toHaveBeenCalledWith('/organizer/1/edit')
    })

    test('should navigate to event detail when view button clicked', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      mockedFetcher.mockResolvedValue({
        data: mockEvents,
        current_page: 1,
        last_page: 1,
        total: 1,
        per_page: 10
      })

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const viewButton = screen.getByLabelText(/ver.*event 1/i)
      fireEvent.click(viewButton)

      expect(mockPush).toHaveBeenCalledWith('/organizer/1')
    })
  })

  describe('Error Handling', () => {
    test('should display error message when API call fails', async () => {
      mockedFetcher.mockRejectedValue(new Error('Network Error'))

      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
      })
    })
  })
})
