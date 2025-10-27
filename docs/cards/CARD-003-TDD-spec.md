# CARD-003: Event List Widget - TDD Specification
**Created:** October 27, 2025  
**Priority:** High  
**Estimated Time:** 2.5-3 hours with Claude Code  
**Methodology:** Test-Driven Development (TDD)

---

## 🎯 OBJECTIVE

Implement a comprehensive event list widget for the organizer dashboard that displays paginated events with filtering, actions, and empty states - following strict TDD methodology.

**Success Criteria:**
- 10-12 tests written FIRST (RED phase)
- All tests passing (GREEN phase)
- Clean, maintainable code (REFACTOR phase)
- Visual verification in browser
- Zero regressions in existing 104 frontend tests

---

## 📋 FEATURE REQUIREMENTS

### Core Functionality
1. **Event List Display**
   - Show all events for current organizer
   - Display key event info: title, date, status, location
   - Responsive table/card layout
   - Loading state during data fetch

2. **Pagination**
   - Show 10 events per page (configurable)
   - Page navigation controls
   - Total count display
   - Current page indicator

3. **Status Filtering**
   - Filter by: All, Draft, Pending, Approved, Rejected, Published
   - Active filter indicator
   - Clear filters option
   - Preserve filters across pagination

4. **Event Actions**
   - View: Navigate to event detail
   - Edit: Navigate to edit form
   - Delete: Confirm dialog + API call
   - Action buttons with icons

5. **Empty States**
   - No events at all: "Create your first event"
   - No events matching filter: "No events found"
   - Different CTAs for each scenario

6. **Error Handling**
   - API failure states
   - Network error recovery
   - User-friendly error messages

---

## 🧪 TDD METHODOLOGY

### Phase 1: RED (Tests First) - 45 minutes
Write 10-12 failing tests covering all functionality:
1. Component renders with loading state
2. Fetches and displays events on mount
3. Shows pagination controls when needed
4. Handles status filter changes
5. Paginates correctly (next/prev)
6. Shows empty state when no events
7. Shows filtered empty state
8. Handles edit action
9. Handles delete action with confirmation
10. Handles view action
11. Displays error state on API failure
12. Loading state during operations

### Phase 2: GREEN (Implementation) - 75 minutes
Implement minimum code to make all tests pass:
- OrganizerEventList component (dumb)
- OrganizerEventListContainer (smart)
- useOrganizerEvents hook
- Event service methods (if missing)
- Types/interfaces

### Phase 3: REFACTOR (Polish) - 30 minutes
- Extract reusable components (if any)
- Optimize performance (memoization)
- Improve accessibility
- Clean up code
- Update documentation

---

## 🏗️ ARCHITECTURE

### Component Structure

```
src/features/organizer/
├── components/
│   ├── dumb/
│   │   ├── OrganizerEventList.tsx          # Presentational
│   │   └── OrganizerEventListItem.tsx      # Individual event row/card
│   └── smart/
│       └── OrganizerEventListContainer.tsx # Logic container
├── hooks/
│   └── useOrganizerEvents.ts              # Data fetching + filtering
├── services/
│   └── organizer-event.service.ts         # API calls (if needed)
└── __tests__/
    └── OrganizerEventList.test.tsx        # 10-12 tests
```

### Data Flow

```
OrganizerEventListContainer
    ↓ (uses)
useOrganizerEvents hook
    ↓ (calls)
organizerEventService
    ↓ (fetches)
GET /api/v1/organizer/events
    ↓ (returns)
{ events: Event[], pagination: {...} }
    ↓ (renders)
OrganizerEventList (dumb)
    ↓ (renders items)
OrganizerEventListItem × N
```

---

## 🧪 TEST SUITE SPECIFICATION

### File: `src/features/organizer/__tests__/OrganizerEventList.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrganizerEventListContainer } from '../components/smart/OrganizerEventListContainer'
import * as organizerEventService from '../services/organizer-event.service'

jest.mock('../services/organizer-event.service')

describe('OrganizerEventList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render & Loading', () => {
    // Test 1: Shows loading state initially
    test('should display loading state on initial render', () => {
      // ARRANGE
      (organizerEventService.getEvents as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves (stays loading)
      )

      // ACT
      render(<OrganizerEventListContainer />)

      // ASSERT
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    // Test 2: Fetches events on mount
    test('should fetch and display events on mount', async () => {
      // ARRANGE
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

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 2, per_page: 10, current_page: 1 }
      })

      // ACT
      render(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Festival de Jazz')).toBeInTheDocument()
        expect(screen.getByText('Expo Gastronómica')).toBeInTheDocument()
      })

      expect(organizerEventService.getEvents).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        status: null
      })
    })
  })

  describe('Pagination', () => {
    // Test 3: Shows pagination controls when needed
    test('should display pagination controls when total > per_page', async () => {
      // ARRANGE
      const mockEvents = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 25, per_page: 10, current_page: 1, last_page: 3 }
      })

      // ACT
      render(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/1.*3/)).toBeInTheDocument() // "Page 1 of 3"
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    // Test 4: Handles next page navigation
    test('should navigate to next page when next button clicked', async () => {
      // ARRANGE
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

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: mockPage1,
          pagination: { total: 15, per_page: 10, current_page: 1, last_page: 2 }
        })
        .mockResolvedValueOnce({
          data: mockPage2,
          pagination: { total: 15, per_page: 10, current_page: 2, last_page: 2 }
        })

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Event 11')).toBeInTheDocument()
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 2,
          per_page: 10,
          status: null
        })
      })
    })
  })

  describe('Status Filtering', () => {
    // Test 5: Handles status filter change
    test('should filter events by status when filter selected', async () => {
      // ARRANGE
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' },
        { id: 2, title: 'Event 2', status: 'pending', event_date: '2025-11-16', location: 'Loc' }
      ]

      const publishedEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: allEvents,
          pagination: { total: 2, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: publishedEvents,
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
      })

      // Select "Published" filter
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'published' } })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.queryByText('Event 2')).not.toBeInTheDocument()
      })

      expect(organizerEventService.getEvents).toHaveBeenLastCalledWith({
        page: 1,
        per_page: 10,
        status: 'published'
      })
    })
  })

  describe('Empty States', () => {
    // Test 6: Shows empty state when no events
    test('should display "no events" empty state', async () => {
      // ARRANGE
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: [],
        pagination: { total: 0, per_page: 10, current_page: 1 }
      })

      // ACT
      render(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/no events yet/i)).toBeInTheDocument()
        expect(screen.getByText(/create your first event/i)).toBeInTheDocument()
      })
    })

    // Test 7: Shows filtered empty state
    test('should display "no matching events" when filter returns empty', async () => {
      // ARRANGE
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: allEvents,
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: [],
          pagination: { total: 0, per_page: 10, current_page: 1 }
        })

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      // Apply filter that returns no results
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'rejected' } })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/no events found/i)).toBeInTheDocument()
        expect(screen.getByText(/try a different filter/i)).toBeInTheDocument()
      })
    })
  })

  describe('Event Actions', () => {
    // Test 8: Handles edit action
    test('should navigate to edit page when edit button clicked', async () => {
      // ARRANGE
      const mockPush = jest.fn()
      jest.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }))

      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const editButton = screen.getByLabelText(/edit.*event 1/i)
      fireEvent.click(editButton)

      // ASSERT
      expect(mockPush).toHaveBeenCalledWith('/organizer/events/1/edit')
    })

    // Test 9: Handles delete action with confirmation
    test('should show confirmation dialog and delete event', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' },
        { id: 2, title: 'Event 2', status: 'draft', event_date: '2025-11-16', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: mockEvents,
          pagination: { total: 2, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: [mockEvents[1]],
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })

      ;(organizerEventService.deleteEvent as jest.Mock).mockResolvedValue({ success: true })

      // Mock window.confirm
      global.confirm = jest.fn(() => true)

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getByLabelText(/delete.*event 1/i)
      fireEvent.click(deleteButton)

      // ASSERT
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('delete')
      )

      await waitFor(() => {
        expect(organizerEventService.deleteEvent).toHaveBeenCalledWith(1)
        expect(screen.queryByText('Event 1')).not.toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
      })
    })

    // Test 10: Handles view action
    test('should navigate to event detail when view button clicked', async () => {
      // ARRANGE
      const mockPush = jest.fn()
      jest.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }))

      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const viewButton = screen.getByLabelText(/view.*event 1/i)
      fireEvent.click(viewButton)

      // ASSERT
      expect(mockPush).toHaveBeenCalledWith('/organizer/events/1')
    })
  })

  describe('Error Handling', () => {
    // Test 11: Displays error state on API failure
    test('should display error message when API call fails', async () => {
      // ARRANGE
      const mockError = new Error('Network error')
      ;(organizerEventService.getEvents as jest.Mock).mockRejectedValue(mockError)

      // Mock console.error to avoid noise in tests
      jest.spyOn(console, 'error').mockImplementation(() => {})

      // ACT
      render(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/error loading events/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    // Test 12: Shows loading state during delete operation
    test('should show loading state during delete operation', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      ;(organizerEventService.deleteEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      global.confirm = jest.fn(() => true)

      // ACT
      render(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getByLabelText(/delete.*event 1/i)
      fireEvent.click(deleteButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/deleting/i)).toBeInTheDocument()
      })
    })
  })
})
```

---

## 📝 IMPLEMENTATION GUIDE

### Step 1: Types/Interfaces (5 min)

```typescript
// src/features/organizer/types/event.types.ts
export interface OrganizerEvent {
  id: number
  title: string
  event_date: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  location: string
  category?: string
  created_at: string
  updated_at: string
}

export interface EventListParams {
  page?: number
  per_page?: number
  status?: string | null
}

export interface EventListResponse {
  data: OrganizerEvent[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}
```

### Step 2: Service Methods (10 min)

```typescript
// src/features/organizer/services/organizer-event.service.ts
import { apiClient } from '@/lib/apiClient'
import { EventListParams, EventListResponse, OrganizerEvent } from '../types/event.types'

export const getEvents = async (params: EventListParams): Promise<EventListResponse> => {
  const response = await apiClient.get<EventListResponse>('/organizer/events', { params })
  return response.data
}

export const deleteEvent = async (id: number): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/organizer/events/${id}`)
  return response.data
}
```

### Step 3: Custom Hook (20 min)

```typescript
// src/features/organizer/hooks/useOrganizerEvents.ts
import { useState, useEffect } from 'react'
import { getEvents, deleteEvent } from '../services/organizer-event.service'
import { OrganizerEvent, EventListParams } from '../types/event.types'

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const perPage = 10

  const fetchEvents = async (page = currentPage, status = statusFilter) => {
    setLoading(true)
    setError(null)

    try {
      const params: EventListParams = {
        page,
        per_page: perPage,
        status
      }

      const response = await getEvents(params)
      setEvents(response.data)
      setCurrentPage(response.pagination.current_page)
      setTotalPages(response.pagination.last_page)
      setTotal(response.pagination.total)
    } catch (err) {
      setError('Error loading events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchEvents(page)
  }

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to page 1
    fetchEvents(1, status)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(id)
      fetchEvents() // Refresh list
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Error deleting event')
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    events,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    statusFilter,
    isDeleting,
    handlePageChange,
    handleStatusFilter,
    handleDelete,
    retry: fetchEvents
  }
}
```

### Step 4: Dumb Component (25 min)

```typescript
// src/features/organizer/components/dumb/OrganizerEventList.tsx
import { OrganizerEvent } from '../../types/event.types'
import { OrganizerEventListItem } from './OrganizerEventListItem'

interface OrganizerEventListProps {
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  statusFilter: string | null
  isDeleting: boolean
  onPageChange: (page: number) => void
  onStatusFilter: (status: string | null) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onView: (id: number) => void
  onRetry: () => void
}

export const OrganizerEventList = ({
  events,
  loading,
  error,
  currentPage,
  totalPages,
  total,
  statusFilter,
  isDeleting,
  onPageChange,
  onStatusFilter,
  onEdit,
  onDelete,
  onView,
  onRetry
}: OrganizerEventListProps) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading events...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state - no events at all
  if (events.length === 0 && !statusFilter) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No events yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first event to get started
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Event
        </button>
      </div>
    )
  }

  // Empty state - no matching filter
  if (events.length === 0 && statusFilter) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No events found
        </h3>
        <p className="text-gray-500 mb-4">
          Try a different filter or create a new event
        </p>
        <button
          onClick={() => onStatusFilter(null)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter || ''}
            onChange={(e) => onStatusFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total: {total} events
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {events.map((event) => (
          <OrganizerEventListItem
            key={event.id}
            event={event}
            onEdit={() => onEdit(event.id)}
            onDelete={() => onDelete(event.id)}
            onView={() => onView(event.id)}
            disabled={isDeleting}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Deleting event...</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 5: Event List Item Component (15 min)

```typescript
// src/features/organizer/components/dumb/OrganizerEventListItem.tsx
import { OrganizerEvent } from '../../types/event.types'

interface OrganizerEventListItemProps {
  event: OrganizerEvent
  onEdit: () => void
  onDelete: () => void
  onView: () => void
  disabled?: boolean
}

export const OrganizerEventListItem = ({
  event,
  onEdit,
  onDelete,
  onView,
  disabled = false
}: OrganizerEventListItemProps) => {
  const statusColors = {
    draft: 'bg-gray-200 text-gray-700',
    pending: 'bg-yellow-200 text-yellow-800',
    approved: 'bg-green-200 text-green-800',
    rejected: 'bg-red-200 text-red-800',
    published: 'bg-blue-200 text-blue-800'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <div className="mt-1 space-y-1 text-sm text-gray-600">
          <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
          <p>Location: {event.location}</p>
        </div>
        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          disabled={disabled}
          aria-label={`View ${event.title}`}
          className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          View
        </button>

        <button
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit ${event.title}`}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Delete ${event.title}`}
          className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
```

### Step 6: Smart Container (10 min)

```typescript
// src/features/organizer/components/smart/OrganizerEventListContainer.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents'
import { OrganizerEventList } from '../dumb/OrganizerEventList'

export const OrganizerEventListContainer = () => {
  const router = useRouter()
  const {
    events,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    statusFilter,
    isDeleting,
    handlePageChange,
    handleStatusFilter,
    handleDelete,
    retry
  } = useOrganizerEvents()

  const handleEdit = (id: number) => {
    router.push(`/organizer/events/${id}/edit`)
  }

  const handleView = (id: number) => {
    router.push(`/organizer/events/${id}`)
  }

  return (
    <OrganizerEventList
      events={events}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      statusFilter={statusFilter}
      isDeleting={isDeleting}
      onPageChange={handlePageChange}
      onStatusFilter={handleStatusFilter}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onRetry={retry}
    />
  )
}
```

---

## ✅ ACCEPTANCE CRITERIA

### Functional
- [ ] Events display correctly with all fields
- [ ] Pagination works (next/prev, page indicators)
- [ ] Status filter updates list correctly
- [ ] Edit action navigates to edit page
- [ ] Delete action shows confirmation + removes event
- [ ] View action navigates to detail page
- [ ] Empty states display appropriately
- [ ] Error states show retry option

### Technical
- [ ] All 12 tests passing
- [ ] No regressions (104 existing tests still pass)
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Code follows smart/dumb pattern
- [ ] Proper error handling
- [ ] Loading states implemented

### Visual
- [ ] Responsive design works on mobile/desktop
- [ ] Status badges use appropriate colors
- [ ] Hover states on interactive elements
- [ ] Loading spinner visible during operations
- [ ] Smooth transitions

---

## 🚀 EXECUTION STEPS

### Phase 1: RED (45 min)
```bash
# 1. Create test file
touch frontend/src/features/organizer/__tests__/OrganizerEventList.test.tsx

# 2. Copy all 12 tests from specification

# 3. Run tests (should ALL FAIL)
cd frontend
npm test OrganizerEventList.test.tsx

# Expected: 12 failing tests ❌
```

### Phase 2: GREEN (75 min)
```bash
# 4. Create types
touch frontend/src/features/organizer/types/event.types.ts

# 5. Create/update service
touch frontend/src/features/organizer/services/organizer-event.service.ts

# 6. Create hook
touch frontend/src/features/organizer/hooks/useOrganizerEvents.ts

# 7. Create dumb components
mkdir -p frontend/src/features/organizer/components/dumb
touch frontend/src/features/organizer/components/dumb/OrganizerEventList.tsx
touch frontend/src/features/organizer/components/dumb/OrganizerEventListItem.tsx

# 8. Create smart container
mkdir -p frontend/src/features/organizer/components/smart
touch frontend/src/features/organizer/components/smart/OrganizerEventListContainer.tsx

# 9. Implement minimum code to pass tests

# 10. Run tests (should ALL PASS)
npm test OrganizerEventList.test.tsx

# Expected: 12 passing tests ✅
```

### Phase 3: REFACTOR (30 min)
```bash
# 11. Extract reusable components if needed
# 12. Add memoization for performance
# 13. Improve accessibility (ARIA labels)
# 14. Clean up code
# 15. Add JSDoc comments

# 16. Final test run
npm test

# Expected: 116 tests passing (104 existing + 12 new) ✅
```

### Phase 4: VISUAL TESTING (15 min)
```bash
# 17. Start dev server
npm run dev

# 18. Navigate to http://localhost:3000/organizer/events

# 19. Test manually:
# - List displays correctly
# - Pagination works
# - Filters work
# - Actions (edit/delete/view) work
# - Empty states display
# - Loading states show
# - Error states work
# - Responsive on mobile
```

### Phase 5: COMMIT (10 min)
```bash
# 20. Stage changes
git add .

# 21. Commit with metrics
git commit -m "feat(organizer): implement event list widget with TDD

TDD Phases:
- RED: 12 failing tests written
- GREEN: All tests passing
- REFACTOR: Code cleanup and optimization

Features:
- Paginated event list (10 per page)
- Status filtering (draft/pending/approved/rejected/published)
- Event actions (view/edit/delete)
- Empty states (no events, no results)
- Error handling and retry
- Loading states

Tests:
- 12 new tests (100% passing)
- Total: 116 tests (104 existing + 12 new)
- Coverage: Event list component + hook

Quality:
- TypeScript: 0 errors
- ESLint: 0 warnings
- Smart/Dumb pattern
- Zero regressions

Part of: CARD-003 - Event List Widget
Methodology: TDD (Test-Driven Development)
Time: 2.5 hours (45m RED + 75m GREEN + 30m REFACTOR + 15m visual)
Status: ✅ COMPLETE"

# 22. Push
git push origin main
```

---

## 📊 SUCCESS METRICS

### Tests
- **Before:** 104 tests passing
- **After:** 116 tests passing (+12)
- **Coverage:** Event list widget 100%

### Performance
- **Initial load:** < 500ms
- **Filter change:** < 200ms
- **Pagination:** < 200ms

### Code Quality
- **TypeScript errors:** 0
- **ESLint warnings:** 0
- **Component lines:** < 200 per file
- **Test assertions:** 24+ total

---

## 🔍 TROUBLESHOOTING

### Common Issues

**Issue:** Tests fail with "Cannot find module"
**Solution:** Check import paths, use `@/` aliases

**Issue:** Mock not working
**Solution:** Ensure jest.mock() is before test suite, check mock path

**Issue:** Component not rendering in tests
**Solution:** Check if async data is being awaited with `waitFor()`

**Issue:** Pagination not working
**Solution:** Verify API response structure matches expected format

**Issue:** Filter not resetting page
**Solution:** Ensure page is set to 1 when filter changes

---

## 📚 REFERENCES

- **Similar Implementation:** CARD-002 (Stats Widget)
- **Testing Pattern:** Jest + React Testing Library
- **Architecture:** Features-based, Smart/Dumb components
- **Commit Style:** Conventional Commits with metrics

---

**Created:** October 27, 2025  
**TDD Methodology:** RED → GREEN → REFACTOR  
**Estimated Completion:** 2.5-3 hours  
**Status:** Ready for implementation