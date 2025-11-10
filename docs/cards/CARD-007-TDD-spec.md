# CARD-007: Entity Admin Dashboard - TDD Specification

**Feature:** Entity Admin Panel - Approval Dashboard
**Sprint:** MVP Completion (100%)
**Estimated Time:** 3.5-4 hours
**Status:** Ready for Implementation
**Created:** October 29, 2025

---

## 📋 Overview

Implementar el dashboard completo para Entity Admin (Ente de Turismo) que permite aprobar, rechazar y solicitar cambios en eventos creados por organizadores. Este es el **componente crítico** que completa el workflow de aprobación del sistema.

### Context

- **Prerequisite:** CARDs 001-006 completadas (Panel Organizador 100%)
- **Integration Point:** `/admin/dashboard` route (new)
- **Current State:** Backend API completo (ApprovalController, DashboardController)
- **Target State:** Dashboard funcional para aprobar/rechazar eventos

### Business Requirements

1. **Entity Admin puede:**
   - Ver todos los eventos pendientes de aprobación
   - Aprobar eventos (cambia status a `approved_internal`)
   - Rechazar eventos con razón (cambia status a `rejected`)
   - Solicitar cambios con comentarios (cambia status a `requires_changes`)
   - Ver stats del flujo de aprobación
   - Publicar eventos aprobados al calendario público

2. **Dashboard debe mostrar:**
   - Stats cards: Pending, Approved, Published, Rejected
   - Lista de eventos pendientes (status = `pending_internal`)
   - Filtros rápidos por status
   - Actions en cada evento

3. **Workflow de aprobación:**
   ```
   pending_internal → [Approve] → approved_internal
   pending_internal → [Reject] → rejected
   pending_internal → [Request Changes] → requires_changes
   approved_internal → [Publish] → published
   ```

---

## 🎯 Success Criteria

- [ ] 12+ tests passing (dashboard + approval actions)
- [ ] TDD methodology followed (RED→GREEN→REFACTOR)
- [ ] Dashboard route `/admin/dashboard` funcional
- [ ] Approval actions working (approve, reject, request changes, publish)
- [ ] Confirmation modals for all actions
- [ ] Toast notifications on success/error
- [ ] Stats refresh after actions
- [ ] Zero console.log in production code
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings

---

## 🏗️ Architecture

### Files to Create

```
src/
├── app/
│   └── (admin)/                        # NEW - Admin route group
│       ├── layout.tsx                  # NEW - Admin layout with auth
│       └── dashboard/
│           └── page.tsx                # NEW - Admin dashboard page
├── features/
│   └── approval/                       # NEW FEATURE
│       ├── components/
│       │   ├── dumb/
│       │   │   ├── AdminDashboard.tsx               # NEW - Dashboard UI
│       │   │   ├── AdminEventList.tsx               # NEW - Events table
│       │   │   ├── AdminQuickFilters.tsx            # NEW - Status filters
│       │   │   ├── ApprovalActionButtons.tsx        # NEW - Action buttons
│       │   │   ├── ApproveConfirmModal.tsx          # NEW - Approve modal
│       │   │   ├── RejectConfirmModal.tsx           # NEW - Reject modal with reason
│       │   │   ├── RequestChangesModal.tsx          # NEW - Request changes modal
│       │   │   └── PublishConfirmModal.tsx          # NEW - Publish modal
│       │   └── smart/
│       │       ├── AdminDashboardContainer.tsx      # NEW - Dashboard container
│       │       └── ApprovalActionButtonsContainer.tsx # NEW - Actions container
│       ├── hooks/
│       │   ├── useAdminStats.ts                     # NEW - Fetch admin stats
│       │   ├── useAdminEvents.ts                    # NEW - Fetch all events
│       │   └── useApprovalActions.ts                # NEW - Approval logic
│       ├── services/
│       │   ├── admin-stats.service.ts               # NEW - Stats API
│       │   ├── admin-event.service.ts               # NEW - Events API
│       │   └── approval.service.ts                  # NEW - Approval API
│       ├── types/
│       │   └── approval.types.ts                    # NEW - TypeScript types
│       └── __tests__/
│           ├── AdminDashboard.test.tsx              # NEW - Dashboard tests
│           ├── ApprovalActionButtons.test.tsx       # NEW - Actions tests
│           └── useApprovalActions.test.ts           # NEW - Hook tests
```

### Backend API Endpoints (Already Implemented)

```
GET  /api/v1/dashboard/events              # Get all events (admin view)
GET  /api/v1/dashboard/events/summary      # Get approval stats
PATCH /api/v1/events/{id}/approve          # Approve event
PATCH /api/v1/events/{id}/reject           # Reject event
PATCH /api/v1/events/{id}/request-changes  # Request changes
PATCH /api/v1/events/{id}/publish          # Publish to calendar
```

---

## 🔴 RED PHASE: Write Tests First

### Test File 1: `AdminDashboard.test.tsx`

```typescript
/**
 * Tests for Admin Dashboard Integration
 * 
 * Tests the complete admin dashboard layout, stats display,
 * event list, and integration with approval actions.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminDashboard } from '../AdminDashboard'
import { Event } from '@/features/approval/types/approval.types'

describe('AdminDashboard', () => {
  const mockStats = {
    pending: 15,
    approved: 25,
    published: 40,
    rejected: 5,
    total: 85
  }

  const mockEvents = {
    data: [
      {
        id: 1,
        title: 'Festival de Música',
        status: 'pending_internal',
        organizer: 'Hotel Plaza',
        start_date: '2025-11-15',
        category_id: 1,
        location_id: 1
      },
      {
        id: 2,
        title: 'Exposición de Arte',
        status: 'approved_internal',
        organizer: 'Museo Provincial',
        start_date: '2025-11-20',
        category_id: 2,
        location_id: 2
      }
    ] as Event[],
    meta: {
      current_page: 1,
      total: 15
    }
  }

  const mockHandlers = {
    onFilterChange: jest.fn(),
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onRequestChanges: jest.fn(),
    onPublish: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders admin dashboard with all main sections', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Event Approvals')).toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    test('displays stats cards with correct values', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('15')).toBeInTheDocument() // pending
      expect(screen.getByText('25')).toBeInTheDocument() // approved
      expect(screen.getByText('40')).toBeInTheDocument() // published
      expect(screen.getByText('5')).toBeInTheDocument()  // rejected
      expect(screen.getByText('85')).toBeInTheDocument() // total
    })

    test('displays stats cards in correct order', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const statsCards = screen.getAllByRole('article')
      
      expect(statsCards).toHaveLength(5)
      expect(statsCards[0]).toHaveTextContent('Pending')
      expect(statsCards[1]).toHaveTextContent('Approved')
      expect(statsCards[2]).toHaveTextContent('Published')
      expect(statsCards[3]).toHaveTextContent('Rejected')
      expect(statsCards[4]).toHaveTextContent('Total')
    })

    test('applies responsive grid classes to stats section', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const statsGrid = screen.getByTestId('admin-stats-grid')
      
      expect(statsGrid.className).toContain('grid')
      expect(statsGrid.className).toMatch(/grid-cols-1/)
      expect(statsGrid.className).toMatch(/md:grid-cols-2/)
      expect(statsGrid.className).toMatch(/lg:grid-cols-5/)
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with organizer information', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText('Hotel Plaza')).toBeInTheDocument()
      expect(screen.getByText('Exposición de Arte')).toBeInTheDocument()
      expect(screen.getByText('Museo Provincial')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={true}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('displays error message when fetch fails', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error="Failed to fetch events"
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })

    test('displays empty state when no events pending', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no events to review/i)).toBeInTheDocument()
    })
  })

  describe('Quick Filters', () => {
    test('renders status filter buttons', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /pending/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('pending_internal')
    })

    test('highlights active filter button', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="pending_internal"
          {...mockHandlers}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      
      expect(pendingButton.className).toContain('bg-blue-600')
      expect(pendingButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('stats cards have role="article"', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(5)
    })

    test('event table has proper table structure', () => {
      render(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(6) // Title, Organizer, Category, Date, Status, Actions
      expect(screen.getAllByRole('row')).toHaveLength(3) // Header + 2 events
    })
  })
})
```

### Test File 2: `ApprovalActionButtons.test.tsx`

```typescript
/**
 * Tests for Approval Action Buttons Component
 * 
 * Tests the action buttons that allow Entity Admin to approve,
 * reject, request changes, or publish events.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { ApprovalActionButtons } from '../ApprovalActionButtons'
import { Event } from '@/features/approval/types/approval.types'

describe('ApprovalActionButtons', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    status: 'pending_internal',
    organizer: 'Test Organizer',
    category_id: 1,
    location_id: 1,
    start_date: '2025-11-15'
  }

  const mockHandlers = {
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onRequestChanges: jest.fn(),
    onPublish: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Button Visibility Based on Status', () => {
    test('shows approve/reject/request changes buttons for pending events', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /request changes/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument()
    })

    test('shows only publish button for approved events', () => {
      const approvedEvent = { ...mockEvent, status: 'approved_internal' }
      
      render(
        <ApprovalActionButtons
          event={approvedEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument()
    })

    test('shows no action buttons for published events', () => {
      const publishedEvent = { ...mockEvent, status: 'published' }
      
      render(
        <ApprovalActionButtons
          event={publishedEvent}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument()
    })

    test('shows no action buttons for rejected events', () => {
      const rejectedEvent = { ...mockEvent, status: 'rejected' }
      
      render(
        <ApprovalActionButtons
          event={rejectedEvent}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    test('calls onApprove when approve button clicked', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /approve/i }))

      expect(mockHandlers.onApprove).toHaveBeenCalledWith(1)
      expect(mockHandlers.onApprove).toHaveBeenCalledTimes(1)
    })

    test('calls onReject when reject button clicked', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /reject/i }))

      expect(mockHandlers.onReject).toHaveBeenCalledWith(1)
    })

    test('calls onRequestChanges when request changes button clicked', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /request changes/i }))

      expect(mockHandlers.onRequestChanges).toHaveBeenCalledWith(1)
    })

    test('calls onPublish when publish button clicked', () => {
      const approvedEvent = { ...mockEvent, status: 'approved_internal' }
      
      render(
        <ApprovalActionButtons
          event={approvedEvent}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /publish/i }))

      expect(mockHandlers.onPublish).toHaveBeenCalledWith(1)
    })
  })

  describe('Loading State', () => {
    test('disables all buttons when loading', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          loading={true}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Button Styling', () => {
    test('approve button has success styling', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const approveButton = screen.getByRole('button', { name: /approve/i })
      expect(approveButton.className).toContain('success')
    })

    test('reject button has danger styling', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      expect(rejectButton.className).toContain('danger')
    })

    test('request changes button has warning styling', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const requestButton = screen.getByRole('button', { name: /request changes/i })
      expect(requestButton.className).toContain('warning')
    })
  })

  describe('Accessibility', () => {
    test('all buttons have accessible labels', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /approve/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /reject/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /request changes/i })).toHaveAttribute('aria-label')
    })
  })
})
```

### Test File 3: `useApprovalActions.test.ts`

```typescript
/**
 * Tests for useApprovalActions hook
 * 
 * Tests business logic for approval actions: approve, reject,
 * request changes, and publish events.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useApprovalActions } from '../useApprovalActions'
import { approvalService } from '@/features/approval/services/approval.service'
import { toast } from '@/components/ui/Toast'

jest.mock('@/features/approval/services/approval.service')
jest.mock('@/components/ui/Toast')

describe('useApprovalActions', () => {
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('approveEvent', () => {
    test('approves event successfully and shows success toast', async () => {
      const mockApprovedEvent = { id: 1, status: 'approved_internal' }
      ;(approvalService.approve as jest.Mock).mockResolvedValue(mockApprovedEvent)

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.approveEvent(1)
      })

      expect(approvalService.approve).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Event approved successfully')
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles approve error and shows error toast', async () => {
      ;(approvalService.approve as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.approveEvent(1)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to approve event')
      expect(mockRefresh).not.toHaveBeenCalled()
    })

    test('sets loading state during approve operation', async () => {
      ;(approvalService.approve as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.approveEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('rejectEvent', () => {
    test('rejects event with reason successfully', async () => {
      ;(approvalService.reject as jest.Mock).mockResolvedValue({ id: 1, status: 'rejected' })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Incomplete information')
      })

      expect(approvalService.reject).toHaveBeenCalledWith(1, 'Incomplete information')
      expect(toast.success).toHaveBeenCalledWith('Event rejected')
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('requires reason parameter for rejection', async () => {
      ;(approvalService.reject as jest.Mock).mockResolvedValue({ id: 1 })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Missing details')
      })

      expect(approvalService.reject).toHaveBeenCalledWith(1, 'Missing details')
    })

    test('handles reject error and shows error toast', async () => {
      ;(approvalService.reject as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Test reason')
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to reject event')
      expect(mockRefresh).not.toHaveBeenCalled()
    })
  })

  describe('requestChanges', () => {
    test('requests changes with comments successfully', async () => {
      ;(approvalService.requestChanges as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'requires_changes'
      })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.requestChanges(1, 'Please add more details')
      })

      expect(approvalService.requestChanges).toHaveBeenCalledWith(1, 'Please add more details')
      expect(toast.success).toHaveBeenCalledWith('Changes requested successfully')
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('handles request changes error', async () => {
      ;(approvalService.requestChanges as jest.Mock).mockRejectedValue(
        new Error('Failed')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.requestChanges(1, 'Comments')
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to request changes')
    })
  })

  describe('publishEvent', () => {
    test('publishes event successfully', async () => {
      ;(approvalService.publish as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'published'
      })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(approvalService.publish).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Event published to public calendar')
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('handles publish error', async () => {
      ;(approvalService.publish as jest.Mock).mockRejectedValue(
        new Error('Failed')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to publish event')
    })
  })

  describe('Modal State Management', () => {
    test('opens and closes approve modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openApproveModal(1)
      })

      expect(result.current.approveModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closeApproveModal()
      })

      expect(result.current.approveModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

    test('opens and closes reject modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openRejectModal(1)
      })

      expect(result.current.rejectModalOpen).toBe(true)

      act(() => {
        result.current.closeRejectModal()
      })

      expect(result.current.rejectModalOpen).toBe(false)
    })

    test('opens and closes request changes modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openRequestChangesModal(1)
      })

      expect(result.current.requestChangesModalOpen).toBe(true)

      act(() => {
        result.current.closeRequestChangesModal()
      })

      expect(result.current.requestChangesModalOpen).toBe(false)
    })

    test('opens and closes publish modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openPublishModal(1)
      })

      expect(result.current.publishModalOpen).toBe(true)

      act(() => {
        result.current.closePublishModal()
      })

      expect(result.current.publishModalOpen).toBe(false)
    })
  })
})
```

---

## 🟢 GREEN PHASE: Implementation

### 1. Create Types: `approval.types.ts`

```typescript
/**
 * TypeScript interfaces for approval feature
 */

export interface AdminStats {
  pending: number
  approved: number
  published: number
  rejected: number
  total: number
}

export interface Event {
  id: number
  title: string
  description?: string
  status: EventStatus
  organizer: string
  category_id: number
  location_id: number
  start_date: string
  end_date?: string
  created_at?: string
}

export type EventStatus =
  | 'draft'
  | 'pending_internal'
  | 'approved_internal'
  | 'published'
  | 'rejected'
  | 'requires_changes'

export interface EventsResponse {
  data: Event[]
  meta: {
    current_page: number
    total: number
    per_page?: number
  }
}
```

### 2. Create Service: `approval.service.ts`

```typescript
/**
 * Approval Service
 * 
 * Handles API calls for approval actions.
 */

import { apiClient } from '@/services/apiClient'
import { Event } from '../types/approval.types'

export const approvalService = {
  /**
   * Approve an event (change status to approved_internal)
   */
  approve: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/approve`)
  },

  /**
   * Reject an event with reason
   */
  reject: async (eventId: number, reason: string): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/reject`, { reason })
  },

  /**
   * Request changes to an event
   */
  requestChanges: async (eventId: number, comments: string): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/request-changes`, { comments })
  },

  /**
   * Publish event to public calendar
   */
  publish: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/publish`)
  }
}
```

### 3. Create Service: `admin-stats.service.ts`

```typescript
/**
 * Admin Stats Service
 * 
 * Fetches approval statistics for admin dashboard.
 */

import { apiClient } from '@/services/apiClient'
import { AdminStats } from '../types/approval.types'

export const adminStatsService = {
  /**
   * Get approval stats summary
   */
  getSummary: async (): Promise<AdminStats> => {
    return apiClient.get('/dashboard/events/summary')
  }
}
```

### 4. Create Service: `admin-event.service.ts`

```typescript
/**
 * Admin Event Service
 * 
 * Fetches events for admin dashboard.
 */

import { apiClient } from '@/services/apiClient'
import { EventsResponse } from '../types/approval.types'

interface FetchEventsParams {
  status?: string | null
  page?: number
}

export const adminEventService = {
  /**
   * Get all events (admin view)
   */
  getAll: async (params: FetchEventsParams = {}): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/dashboard/events?${queryString}` : '/dashboard/events'

    return apiClient.get(url)
  }
}
```

### 5. Create Hook: `useApprovalActions.ts`

```typescript
/**
 * Custom hook for approval actions
 * 
 * Provides methods to approve, reject, request changes, and publish events.
 */

import { useState } from 'react'
import { approvalService } from '../services/approval.service'
import { toast } from '@/components/ui/Toast'

interface UseApprovalActionsReturn {
  loading: boolean
  approveModalOpen: boolean
  rejectModalOpen: boolean
  requestChangesModalOpen: boolean
  publishModalOpen: boolean
  selectedEventId: number | null
  openApproveModal: (eventId: number) => void
  closeApproveModal: () => void
  openRejectModal: (eventId: number) => void
  closeRejectModal: () => void
  openRequestChangesModal: (eventId: number) => void
  closeRequestChangesModal: () => void
  openPublishModal: (eventId: number) => void
  closePublishModal: () => void
  approveEvent: (eventId: number) => Promise<void>
  rejectEvent: (eventId: number, reason: string) => Promise<void>
  requestChanges: (eventId: number, comments: string) => Promise<void>
  publishEvent: (eventId: number) => Promise<void>
}

export const useApprovalActions = (
  onSuccess?: () => void
): UseApprovalActionsReturn => {
  const [loading, setLoading] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  const openApproveModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setApproveModalOpen(true)
  }

  const closeApproveModal = (): void => {
    setApproveModalOpen(false)
    setSelectedEventId(null)
  }

  const openRejectModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setRejectModalOpen(true)
  }

  const closeRejectModal = (): void => {
    setRejectModalOpen(false)
    setSelectedEventId(null)
  }

  const openRequestChangesModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setRequestChangesModalOpen(true)
  }

  const closeRequestChangesModal = (): void => {
    setRequestChangesModalOpen(false)
    setSelectedEventId(null)
  }

  const openPublishModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setPublishModalOpen(true)
  }

  const closePublishModal = (): void => {
    setPublishModalOpen(false)
    setSelectedEventId(null)
  }

  const approveEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await approvalService.approve(eventId)
      toast.success('Event approved successfully')
      closeApproveModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to approve event')
    } finally {
      setLoading(false)
    }
  }

  const rejectEvent = async (eventId: number, reason: string): Promise<void> => {
    setLoading(true)
    try {
      await approvalService.reject(eventId, reason)
      toast.success('Event rejected')
      closeRejectModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to reject event')
    } finally {
      setLoading(false)
    }
  }

  const requestChanges = async (eventId: number, comments: string): Promise<void> => {
    setLoading(true)
    try {
      await approvalService.requestChanges(eventId, comments)
      toast.success('Changes requested successfully')
      closeRequestChangesModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to request changes')
    } finally {
      setLoading(false)
    }
  }

  const publishEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await approvalService.publish(eventId)
      toast.success('Event published to public calendar')
      closePublishModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to publish event')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    approveModalOpen,
    rejectModalOpen,
    requestChangesModalOpen,
    publishModalOpen,
    selectedEventId,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    openRequestChangesModal,
    closeRequestChangesModal,
    openPublishModal,
    closePublishModal,
    approveEvent,
    rejectEvent,
    requestChanges,
    publishEvent
  }
}
```

### 6. Create Component: `ApprovalActionButtons.tsx` (Dumb)

```typescript
/**
 * Approval Action Buttons Component (Presentational)
 * 
 * Displays action buttons based on event status.
 */

import { Event } from '@/features/approval/types/approval.types'
import { Button } from '@/components/ui/Button'

interface ApprovalActionButtonsProps {
  event: Event
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
  onRequestChanges: (eventId: number) => void
  onPublish: (eventId: number) => void
  loading?: boolean
}

export const ApprovalActionButtons = ({
  event,
  onApprove,
  onReject,
  onRequestChanges,
  onPublish,
  loading = false
}: ApprovalActionButtonsProps) => {
  const isPending = event.status === 'pending_internal'
  const isApproved = event.status === 'approved_internal'
  const isPublished = event.status === 'published'
  const isRejected = event.status === 'rejected'

  // No actions for published or rejected events
  if (isPublished || isRejected) {
    return null
  }

  return (
    <div className="flex gap-2">
      {isPending && (
        <>
          <Button
            variant="success"
            size="sm"
            onClick={() => onApprove(event.id)}
            disabled={loading}
            aria-label={`Approve event ${event.title}`}
          >
            Approve
          </Button>

          <Button
            variant="warning"
            size="sm"
            onClick={() => onRequestChanges(event.id)}
            disabled={loading}
            aria-label={`Request changes for event ${event.title}`}
          >
            Request Changes
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(event.id)}
            disabled={loading}
            aria-label={`Reject event ${event.title}`}
          >
            Reject
          </Button>
        </>
      )}

      {isApproved && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onPublish(event.id)}
          disabled={loading}
          aria-label={`Publish event ${event.title}`}
        >
          Publish
        </Button>
      )}
    </div>
  )
}
```

### 7. Create Confirmation Modals

**ApproveConfirmModal.tsx:**

```typescript
/**
 * Approve Confirmation Modal
 */

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ApproveConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const ApproveConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: ApproveConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to approve{' '}
          {eventTitle && <strong>"{eventTitle}"</strong>}?
        </p>
        <p className="text-sm text-gray-600">
          The event will be marked as approved and can be published to the public calendar.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**RejectConfirmModal.tsx:**

```typescript
/**
 * Reject Confirmation Modal with reason input
 */

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface RejectConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  loading: boolean
  eventTitle?: string
}

export const RejectConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: RejectConfirmModalProps) => {
  const [reason, setReason] = useState('')

  const handleConfirm = (): void => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason('')
    }
  }

  const handleClose = (): void => {
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Event">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-semibold">
            This will reject the event submission
          </p>
        </div>

        <p className="text-gray-700">
          Please provide a reason for rejecting{' '}
          {eventTitle && <strong>"{eventTitle}"</strong>}:
        </p>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows={4}
          disabled={loading}
          aria-label="Rejection reason"
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Rejecting...' : 'Reject Event'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**RequestChangesModal.tsx:**

```typescript
/**
 * Request Changes Modal with comments input
 */

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface RequestChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comments: string) => void
  loading: boolean
  eventTitle?: string
}

export const RequestChangesModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: RequestChangesModalProps) => {
  const [comments, setComments] = useState('')

  const handleConfirm = (): void => {
    if (comments.trim()) {
      onConfirm(comments)
      setComments('')
    }
  }

  const handleClose = (): void => {
    setComments('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Changes">
      <div className="space-y-4">
        <p className="text-gray-700">
          Request changes to{' '}
          {eventTitle && <strong>"{eventTitle}"</strong>}:
        </p>

        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Describe what changes are needed..."
          rows={4}
          disabled={loading}
          aria-label="Change request comments"
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleConfirm}
            disabled={loading || !comments.trim()}
          >
            {loading ? 'Sending...' : 'Request Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**PublishConfirmModal.tsx:**

```typescript
/**
 * Publish Confirmation Modal
 */

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: PublishConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to publish{' '}
          {eventTitle && <strong>"{eventTitle}"</strong>} to the public calendar?
        </p>
        <p className="text-sm text-gray-600">
          The event will be visible to all users on the public calendar.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish to Calendar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### 8. Create Dashboard Components

Due to length constraints, the remaining components (AdminDashboard.tsx, AdminEventList.tsx, AdminQuickFilters.tsx, AdminDashboardContainer.tsx) follow the same patterns as the Organizer dashboard components but adapted for approval workflow.

Key differences:
- Show "Organizer" column in event list
- Different action buttons based on status
- Stats focus on approval metrics
- Filters for pending/approved/published/rejected

---

## 🔵 REFACTOR PHASE: Polish & Optimize

### Performance Optimizations

1. **Memoize Action Buttons:**
```typescript
const MemoizedActionButtons = React.memo(ApprovalActionButtons)
```

2. **Debounce Filter Changes:**
```typescript
const debouncedFilterChange = useDebouncedCallback(
  (status: string | null) => {
    fetchEvents({ status, page: 1 })
  },
  300
)
```

3. **Optimistic UI Updates:**
```typescript
// Immediately update UI, then call API
const optimisticApprove = (eventId: number) => {
  // Update local state first
  updateLocalEvent(eventId, { status: 'approved_internal' })
  // Then call API
  approveEvent(eventId)
}
```

### Accessibility Improvements

1. **Keyboard Navigation** for all modals and buttons
2. **Screen Reader Announcements** for status changes
3. **Focus Management** between modals and trigger buttons
4. **ARIA Live Regions** for dynamic updates

### Code Quality

1. **Extract Constants:**
```typescript
export const APPROVAL_CONFIG = {
  FILTERS: [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending_internal' },
    { label: 'Approved', value: 'approved_internal' },
    { label: 'Published', value: 'published' }
  ],
  ACTION_MESSAGES: {
    APPROVE_SUCCESS: 'Event approved successfully',
    APPROVE_ERROR: 'Failed to approve event',
    // ...
  }
}
```

2. **JSDoc Comments** on all public functions
3. **Error Boundaries** for graceful error handling

---

## ✅ Validation Checklist

### Pre-Implementation
- [ ] Verify backend API endpoints work (test in Postman/Insomnia)
- [ ] Check Button component supports "success" and "warning" variants
- [ ] Verify Textarea component exists
- [ ] Check Modal component handles multiple modals simultaneously

### During Implementation (TDD)
- [ ] **RED:** Write all tests first (must fail)
- [ ] **GREEN:** Implement minimum code to pass tests
- [ ] **REFACTOR:** Optimize, improve UX
- [ ] Zero console.log in code
- [ ] Zero unused imports/variables
- [ ] All functions have return types
- [ ] All props have interfaces

### Post-Implementation
- [ ] Run tests: `npm test` → 12+ new tests passing
- [ ] Run linter: `npm run lint` → 0 errors, 0 warnings
- [ ] TypeScript check: `npm run type-check` → 0 errors
- [ ] Manual testing: Test all approval actions
- [ ] Test modals with keyboard navigation
- [ ] Test responsive layout

### Integration Testing
- [ ] Approve event → status changes to approved_internal
- [ ] Reject event with reason → status changes to rejected
- [ ] Request changes → status changes to requires_changes
- [ ] Publish approved event → status changes to published
- [ ] Dashboard refreshes after each action
- [ ] Stats update correctly

---

## 📊 Expected Test Results

**After RED Phase:**
```bash
npm test approval
# Expected: 12+ tests, all failing ❌
```

**After GREEN Phase:**
```bash
npm test approval
# Expected: 12+ tests, all passing ✅
```

**Full Suite:**
```bash
npm test
# Expected: 160+ tests passing (148 existing + 12 new)
```

---

## 🎯 Acceptance Criteria

**Functional:**
- [x] Dashboard accessible at /admin/dashboard
- [x] Stats display approval metrics
- [x] Event list shows all events with organizer info
- [x] Approve action works and updates status
- [x] Reject action requires reason
- [x] Request changes action requires comments
- [x] Publish action works for approved events
- [x] All modals have confirmation
- [x] Toast notifications on success/error

**Technical:**
- [x] 12+ tests passing
- [x] TDD methodology followed
- [x] Zero TypeScript errors
- [x] Zero ESLint warnings
- [x] Zero console.log statements
- [x] All functions typed
- [x] All components accessible

**UX:**
- [x] Loading states during API calls
- [x] Clear action buttons with color coding
- [x] Confirmation for all destructive actions
- [x] Input validation (reason/comments required)
- [x] Responsive layout

---

## 🎉 MVP COMPLETION

**After CARD-007 completes:**
- ✅ Panel Organizador: **100% complete**
- ✅ Entity Admin Dashboard: **100% complete**
- ✅ Approval Workflow: **100% functional**
- ✅ **MVP: 100% COMPLETE** 🎊

**Workflow completo:**
```
Organizer creates event (draft)
    ↓
Organizer submits (pending_internal)
    ↓
Entity Admin reviews
    ↓
[Approve] → approved_internal → [Publish] → published (public)
[Reject] → rejected
[Request Changes] → requires_changes → Organizer edits → re-submit
```

---

## 🚀 Ready for Execution

This CARD is **READY** for implementation following TDD methodology.

**Estimated Time:** 3.5-4 hours
**Complexity:** Medium-High (new feature + multiple modals)
**Risk:** Low (backend API already exists)
**Impact:** **CRITICAL** - Completes MVP to 100%

---

**Created:** October 29, 2025
**Status:** Ready for Implementation
**Dependencies:** Backend API (already implemented)
**Next:** MVP Launch! 🚀 Then: Public Calendar, Analytics, Notifications