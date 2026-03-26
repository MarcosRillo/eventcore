# CARD-005: Event Action Buttons - TDD Specification

**Feature:** Organizer Panel - Event Actions
**Sprint:** Panel Organizador MVP
**Estimated Time:** 3-3.5 hours
**Status:** Ready for Implementation
**Created:** October 29, 2025

---

## 📋 Overview

Implementar botones de acción para eventos en el Panel Organizador: **Publish**, **Duplicate**, y **Delete**. Cada acción debe tener confirmación apropiada y feedback visual al usuario.

### Context

- **Prerequisite:** CARD-004 completada (Event Form funcionando)
- **Integration Point:** OrganizerEventList component
- **Current State:** Event list muestra eventos pero sin acciones
- **Target State:** Event list con actions column y modales de confirmación

### Business Rules

1. **Publish Action:**
   - Solo disponible si event status = 'draft'
   - Cambia status a 'pending_internal'
   - Muestra confirmación antes de publicar
   - Toast de éxito/error

2. **Duplicate Action:**
   - Disponible para cualquier status
   - Crea nuevo evento con status 'draft'
   - Copia todos los campos excepto id, timestamps
   - Añade " (Copy)" al título

3. **Delete Action:**
   - Disponible para cualquier status
   - Muestra confirmación destructiva (red alert)
   - Soft delete (backend ya implementa)
   - Remueve de lista después de delete

---

## 🎯 Success Criteria

- [ ] 12+ tests passing (4 per action x 3 actions)
- [ ] TDD methodology followed (RED→GREEN→REFACTOR)
- [ ] Zero console.log in production code
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Modales de confirmación accesibles (ARIA labels)
- [ ] Loading states durante API calls
- [ ] Toast notifications en todas las acciones
- [ ] Integration con existing OrganizerEventList

---

## 🏗️ Architecture

### Files to Create

```
src/features/organizer/
├── components/
│   ├── dumb/
│   │   ├── EventActionButtons.tsx          # NEW - Presentational buttons
│   │   ├── PublishConfirmModal.tsx         # NEW - Publish confirmation
│   │   ├── DeleteConfirmModal.tsx          # NEW - Delete confirmation
│   │   └── DuplicateConfirmModal.tsx       # NEW - Duplicate confirmation (optional)
│   └── smart/
│       └── EventActionButtonsContainer.tsx # NEW - Container with logic
├── hooks/
│   └── useEventActions.ts                  # NEW - Actions logic
└── __tests__/
    ├── EventActionButtons.test.tsx         # NEW - Component tests
    └── useEventActions.test.ts             # NEW - Hook tests
```

### Files to Modify

```
src/features/organizer/
├── components/
│   └── dumb/
│       └── OrganizerEventList.tsx          # ADD actions column
└── hooks/
    └── useOrganizerEvents.ts               # ADD refresh after actions
```

---

## 🔴 RED PHASE: Write Tests First

### Test File 1: `EventActionButtons.test.tsx`

```typescript
/**
 * Tests for EventActionButtons component
 * 
 * Tests presentational component that displays action buttons
 * based on event status and handles user clicks.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { EventActionButtons } from '../EventActionButtons'
import { Event } from '@/features/organizer/types/event.types'

describe('EventActionButtons', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    status: 'draft',
    category_id: 1,
    location_id: 1,
    start_date: '2025-11-01',
    end_date: '2025-11-01'
  }

  const mockHandlers = {
    onPublish: jest.fn(),
    onDuplicate: jest.fn(),
    onDelete: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Publish Button', () => {
    test('renders publish button when event status is draft', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
    })

    test('does not render publish button when event is not draft', () => {
      const publishedEvent = { ...mockEvent, status: 'published' }
      
      render(
        <EventActionButtons 
          event={publishedEvent} 
          {...mockHandlers} 
        />
      )

      expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument()
    })

    test('calls onPublish with event id when publish button clicked', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /publish/i }))
      
      expect(mockHandlers.onPublish).toHaveBeenCalledWith(1)
      expect(mockHandlers.onPublish).toHaveBeenCalledTimes(1)
    })

    test('disables publish button when loading', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers}
          loading={true}
        />
      )

      const publishButton = screen.getByRole('button', { name: /publish/i })
      expect(publishButton).toBeDisabled()
    })
  })

  describe('Duplicate Button', () => {
    test('renders duplicate button for any event status', () => {
      const statuses = ['draft', 'pending_internal', 'published']
      
      statuses.forEach(status => {
        const { rerender } = render(
          <EventActionButtons 
            event={{ ...mockEvent, status }} 
            {...mockHandlers} 
          />
        )
        
        expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument()
        rerender(<></>)
      })
    })

    test('calls onDuplicate with event id when duplicate button clicked', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /duplicate/i }))
      
      expect(mockHandlers.onDuplicate).toHaveBeenCalledWith(1)
      expect(mockHandlers.onDuplicate).toHaveBeenCalledTimes(1)
    })

    test('disables duplicate button when loading', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers}
          loading={true}
        />
      )

      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      expect(duplicateButton).toBeDisabled()
    })
  })

  describe('Delete Button', () => {
    test('renders delete button for any event status', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    test('calls onDelete with event id when delete button clicked', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))
      
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(1)
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
    })

    test('delete button has danger styling', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton.className).toContain('danger')
    })

    test('disables delete button when loading', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers}
          loading={true}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('all buttons have accessible labels', () => {
      render(
        <EventActionButtons 
          event={mockEvent} 
          {...mockHandlers} 
        />
      )

      expect(screen.getByRole('button', { name: /publish/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /duplicate/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /delete/i })).toHaveAttribute('aria-label')
    })
  })
})
```

### Test File 2: `useEventActions.test.ts`

```typescript
/**
 * Tests for useEventActions hook
 * 
 * Tests business logic for event actions: publish, duplicate, delete.
 * Includes API calls, error handling, and state management.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useEventActions } from '../useEventActions'
import { organizerEventService } from '@/features/organizer/services/organizer-event.service'
import { toast } from '@/components/ui/Toast'

// Mock dependencies
jest.mock('@/features/organizer/services/organizer-event.service')
jest.mock('@/components/ui/Toast')

describe('useEventActions', () => {
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('publishEvent', () => {
    test('publishes event successfully and shows success toast', async () => {
      const mockPublishedEvent = { id: 1, status: 'pending_internal' }
      ;(organizerEventService.publish as jest.Mock).mockResolvedValue(mockPublishedEvent)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(organizerEventService.publish).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Event published successfully')
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles publish error and shows error toast', async () => {
      ;(organizerEventService.publish as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to publish event')
      expect(mockRefresh).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('sets loading state during publish operation', async () => {
      ;(organizerEventService.publish as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.publishEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('duplicateEvent', () => {
    test('duplicates event successfully and shows success toast', async () => {
      const mockOriginalEvent = {
        id: 1,
        title: 'Original Event',
        status: 'published'
      }
      const mockDuplicatedEvent = {
        id: 2,
        title: 'Original Event (Copy)',
        status: 'draft'
      }

      ;(organizerEventService.getById as jest.Mock).mockResolvedValue(mockOriginalEvent)
      ;(organizerEventService.create as jest.Mock).mockResolvedValue(mockDuplicatedEvent)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(organizerEventService.getById).toHaveBeenCalledWith(1)
      expect(organizerEventService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Original Event (Copy)',
          status: 'draft'
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Event duplicated successfully')
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('removes id and timestamps when duplicating', async () => {
      const mockOriginalEvent = {
        id: 1,
        title: 'Original Event',
        created_at: '2025-10-29T00:00:00Z',
        updated_at: '2025-10-29T00:00:00Z'
      }

      ;(organizerEventService.getById as jest.Mock).mockResolvedValue(mockOriginalEvent)
      ;(organizerEventService.create as jest.Mock).mockResolvedValue({ id: 2 })

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(organizerEventService.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          id: expect.anything(),
          created_at: expect.anything(),
          updated_at: expect.anything()
        })
      )
    })

    test('handles duplicate error and shows error toast', async () => {
      ;(organizerEventService.getById as jest.Mock).mockRejectedValue(
        new Error('Not found')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to duplicate event')
      expect(mockRefresh).not.toHaveBeenCalled()
    })
  })

  describe('deleteEvent', () => {
    test('deletes event successfully and shows success toast', async () => {
      ;(organizerEventService.delete as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.deleteEvent(1)
      })

      expect(organizerEventService.delete).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Event deleted successfully')
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles delete error and shows error toast', async () => {
      ;(organizerEventService.delete as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.deleteEvent(1)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to delete event')
      expect(mockRefresh).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('sets loading state during delete operation', async () => {
      ;(organizerEventService.delete as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.deleteEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Confirmation Modals', () => {
    test('opens and closes publish confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.openPublishModal(1)
      })

      expect(result.current.publishModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closePublishModal()
      })

      expect(result.current.publishModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

    test('opens and closes delete confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.openDeleteModal(1)
      })

      expect(result.current.deleteModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closeDeleteModal()
      })

      expect(result.current.deleteModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

    test('duplicate action does not require confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      // Should not have duplicate modal state
      expect(result.current).not.toHaveProperty('duplicateModalOpen')
    })
  })
})
```

---

## 🟢 GREEN PHASE: Implementation

### 1. Create Hook: `useEventActions.ts`

```typescript
/**
 * Custom hook for event action operations
 * 
 * Provides methods to publish, duplicate, and delete events
 * with confirmation modals, loading states, and toast notifications.
 */

import { useState } from 'react'
import { organizerEventService } from '@/features/organizer/services/organizer-event.service'
import { toast } from '@/components/ui/Toast'

interface UseEventActionsReturn {
  loading: boolean
  publishModalOpen: boolean
  deleteModalOpen: boolean
  selectedEventId: number | null
  openPublishModal: (eventId: number) => void
  closePublishModal: () => void
  openDeleteModal: (eventId: number) => void
  closeDeleteModal: () => void
  publishEvent: (eventId: number) => Promise<void>
  duplicateEvent: (eventId: number) => Promise<void>
  deleteEvent: (eventId: number) => Promise<void>
}

export const useEventActions = (
  onSuccess?: () => void
): UseEventActionsReturn => {
  const [loading, setLoading] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  const openPublishModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setPublishModalOpen(true)
  }

  const closePublishModal = (): void => {
    setPublishModalOpen(false)
    setSelectedEventId(null)
  }

  const openDeleteModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = (): void => {
    setDeleteModalOpen(false)
    setSelectedEventId(null)
  }

  const publishEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await organizerEventService.publish(eventId)
      toast.success('Event published successfully')
      closePublishModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to publish event')
    } finally {
      setLoading(false)
    }
  }

  const duplicateEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      // Fetch original event
      const originalEvent = await organizerEventService.getById(eventId)

      // Create duplicate with modified data
      const duplicateData = {
        ...originalEvent,
        title: `${originalEvent.title} (Copy)`,
        status: 'draft',
        // Remove fields that should not be duplicated
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        published_at: undefined,
        approved_at: undefined,
        approved_by: undefined
      }

      await organizerEventService.create(duplicateData)
      toast.success('Event duplicated successfully')
      onSuccess?.()
    } catch {
      toast.error('Failed to duplicate event')
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await organizerEventService.delete(eventId)
      toast.success('Event deleted successfully')
      closeDeleteModal()
      onSuccess?.()
    } catch {
      toast.error('Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    publishModalOpen,
    deleteModalOpen,
    selectedEventId,
    openPublishModal,
    closePublishModal,
    openDeleteModal,
    closeDeleteModal,
    publishEvent,
    duplicateEvent,
    deleteEvent
  }
}
```

### 2. Create Component: `EventActionButtons.tsx` (Dumb)

```typescript
/**
 * EventActionButtons Component (Presentational)
 * 
 * Displays action buttons for event: Publish, Duplicate, Delete.
 * Buttons visibility depends on event status.
 */

import { Event } from '@/features/organizer/types/event.types'
import { Button } from '@/components/ui/Button'

interface EventActionButtonsProps {
  event: Event
  onPublish: (eventId: number) => void
  onDuplicate: (eventId: number) => void
  onDelete: (eventId: number) => void
  loading?: boolean
}

export const EventActionButtons = ({
  event,
  onPublish,
  onDuplicate,
  onDelete,
  loading = false
}: EventActionButtonsProps) => {
  const canPublish = event.status === 'draft'

  return (
    <div className="flex gap-2">
      {canPublish && (
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

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onDuplicate(event.id)}
        disabled={loading}
        aria-label={`Duplicate event ${event.title}`}
      >
        Duplicate
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={() => onDelete(event.id)}
        disabled={loading}
        aria-label={`Delete event ${event.title}`}
      >
        Delete
      </Button>
    </div>
  )
}
```

### 3. Create Confirmation Modals

**PublishConfirmModal.tsx:**

```typescript
/**
 * Publish Confirmation Modal
 * 
 * Asks user to confirm publishing event.
 */

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}: PublishConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to publish this event? It will be submitted for internal approval.
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
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**DeleteConfirmModal.tsx:**

```typescript
/**
 * Delete Confirmation Modal
 * 
 * Asks user to confirm deleting event (destructive action).
 */

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Event">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-semibold">
            Warning: This action cannot be undone
          </p>
        </div>

        <p className="text-gray-700">
          Are you sure you want to delete{' '}
          {eventTitle && <strong>"{eventTitle}"</strong>}?
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
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### 4. Modify: `OrganizerEventList.tsx`

Add actions column to existing component:

```typescript
// Add this import
import { EventActionButtons } from './EventActionButtons'

// Inside the component, add actions column to table headers:
<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
  Actions
</th>

// Add actions column to table rows:
<td className="px-6 py-4 whitespace-nowrap text-right">
  <EventActionButtons
    event={event}
    onPublish={onPublish}
    onDuplicate={onDuplicate}
    onDelete={onDelete}
    loading={actionsLoading}
  />
</td>
```

### 5. Update Service: Add `publish` method if missing

In `organizer-event.service.ts`:

```typescript
export const organizerEventService = {
  // ... existing methods

  /**
   * Publish event (change status to pending_internal)
   */
  publish: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/organizer/events/${eventId}/publish`)
  },

  // ... existing methods
}
```

---

## 🔵 REFACTOR PHASE: Polish & Optimize

### Accessibility Improvements

1. **ARIA Labels:**
   - All buttons have descriptive aria-labels
   - Modal has proper aria-labelledby and aria-describedby

2. **Keyboard Navigation:**
   - Tab order follows logical flow
   - Escape key closes modals

3. **Focus Management:**
   - Focus returns to trigger button after modal closes
   - Focus trapped within modal when open

### Performance Optimizations

1. **Memoization:**
   - Consider `useMemo` for button visibility logic if complex
   - Consider `useCallback` for event handlers in smart container

2. **API Optimization:**
   - Duplicate uses single fetch + create (no unnecessary calls)
   - Delete removes from list immediately (optimistic UI)

### Code Quality

1. **Extract Constants:**
```typescript
// src/features/organizer/constants/actionMessages.ts
export const ACTION_MESSAGES = {
  PUBLISH_SUCCESS: 'Event published successfully',
  PUBLISH_ERROR: 'Failed to publish event',
  DUPLICATE_SUCCESS: 'Event duplicated successfully',
  DUPLICATE_ERROR: 'Failed to duplicate event',
  DELETE_SUCCESS: 'Event deleted successfully',
  DELETE_ERROR: 'Failed to delete event'
}
```

2. **JSDoc Comments:**
   - All public functions have JSDoc
   - Complex logic has inline comments

3. **Error Handling:**
   - Specific error messages for different failure scenarios
   - Graceful degradation if API fails

---

## ✅ Validation Checklist

### Pre-Implementation
- [ ] Read claude.md architecture rules
- [ ] Review CARD-004 implementation for patterns
- [ ] Verify organizer-event.service has all needed methods
- [ ] Check Button component supports all variants (primary, secondary, danger)

### During Implementation (TDD)
- [ ] **RED:** Write all tests first (must fail)
- [ ] **GREEN:** Implement minimum code to pass tests
- [ ] **REFACTOR:** Clean up, add JSDoc, improve accessibility
- [ ] Zero console.log in code
- [ ] Zero unused imports/variables
- [ ] All functions have return types
- [ ] All props have interfaces

### Post-Implementation
- [ ] Run tests: `pnpm test` → 12+ new tests passing
- [ ] Run linter: `pnpm run lint` → 0 errors, 0 warnings
- [ ] TypeScript check: `pnpm run type-check` → 0 errors
- [ ] Manual testing: Test each action in browser
- [ ] Accessibility check: Test with keyboard only
- [ ] Mobile responsive check

### Integration Testing
- [ ] Publish draft event → changes to pending_internal
- [ ] Duplicate any event → creates copy with (Copy) suffix
- [ ] Delete event → removes from list
- [ ] Cancel modals → no API calls made
- [ ] Loading states → buttons disabled during operations
- [ ] Toast notifications → appear on success/error

---

## 📊 Expected Test Results

**After RED Phase:**
```bash
pnpm test EventActionButtons
# Expected: 12 tests, 12 failing ❌
```

**After GREEN Phase:**
```bash
pnpm test EventActionButtons
# Expected: 12 tests, 12 passing ✅
```

**Full Suite:**
```bash
pnpm test
# Expected: 140 tests passing (128 existing + 12 new)
```

---

## 🎯 Acceptance Criteria

**Functional:**
- [x] Publish button only visible on draft events
- [x] Duplicate works on any event status
- [x] Delete works on any event status
- [x] Publish modal shows before publishing
- [x] Delete modal shows before deleting (with warning)
- [x] Duplicate does not require confirmation (instant)
- [x] Toast notifications on success/error
- [x] Event list refreshes after actions

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
- [x] Buttons disabled when loading
- [x] Clear visual distinction (primary/secondary/danger)
- [x] Confirmation for destructive actions
- [x] User feedback via toasts

---

## 🔗 Related Documentation

- **Backend API:** `/docs/API.md` - Event endpoints
- **Service Reference:** `/src/features/organizer/services/organizer-event.service.ts`
- **Component Patterns:** `/docs/frontend/ARCHITECTURE.md`
- **Testing Guide:** `/claude.md` - Testing Requirements section

---

## 📝 Notes for Implementation

1. **Button Component:** Verify that `Button` component in `/src/components/ui/Button.tsx` supports these variants:
   - `variant="primary"` (blue)
   - `variant="secondary"` (gray)
   - `variant="danger"` (red)

2. **Toast Component:** Verify that `Toast` utility exists in `/src/components/ui/Toast.tsx` with:
   - `toast.success(message: string)`
   - `toast.error(message: string)`

3. **Modal Component:** Verify that `Modal` component exists in `/src/components/ui/Modal.tsx`

4. **API Endpoint:** Backend should have `PATCH /api/v1/organizer/events/{id}/publish` endpoint (verify in API.md)

5. **Event Interface:** Verify `Event` type includes all needed fields (id, status, title, etc.)

---

## 🚀 Ready for Execution

This CARD is **READY** for implementation following TDD methodology:
1. Create test files → Run tests (should fail)
2. Implement components → Run tests (should pass)
3. Refactor code → Run tests (should still pass)

**Estimated Time:** 3-3.5 hours
**Complexity:** Medium
**Risk:** Low (follows established patterns from CARD-002, 003, 004)

---

**Created:** October 29, 2025
**Status:** Ready for Implementation
**Next CARD:** CARD-006 (Dashboard Layout Integration)