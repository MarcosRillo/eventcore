/**
 * Tests for EventActionButtons component
 *
 * Tests presentational component that renders contextual actions
 * via OverflowMenu based on event status.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EventActionButtons } from '@/features/organizer/components/dumb/EventActionButtons'
import { OrganizerEvent } from '@/features/organizer/types/event.types'

describe('EventActionButtons', () => {
  const mockEvent: OrganizerEvent = {
    id: 1,
    title: 'Test Event',
    start_date: '2025-11-01T10:00:00',
    status: 'draft'
  }

  const mockHandlers = {
    onSubmit: jest.fn(),
    onDelete: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const openMenu = async () => {
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /acciones de test event/i })
    await user.click(trigger)
    return user
  }

  describe('Submit action', () => {
    test('renders submit menu item when event status is draft', async () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      await openMenu()

      expect(screen.getByRole('menuitem', { name: /enviar a revisión/i })).toBeInTheDocument()
    })

    test('renders submit menu item when event status is requires_changes', async () => {
      const requiresChangesEvent: OrganizerEvent = {
        ...mockEvent,
        status: { id: 1, status_code: 'requires_changes', status_name: 'Requires Changes' }
      }

      render(
        <EventActionButtons
          event={requiresChangesEvent}
          {...mockHandlers}
        />
      )

      await openMenu()

      expect(screen.getByRole('menuitem', { name: /enviar a revisión/i })).toBeInTheDocument()
    })

    test('does not render menu when event is published (no actions)', () => {
      const publishedEvent: OrganizerEvent = {
        ...mockEvent,
        status: { id: 1, status_code: 'published', status_name: 'Published' }
      }

      const { container } = render(
        <EventActionButtons
          event={publishedEvent}
          {...mockHandlers}
        />
      )

      expect(container.innerHTML).toBe('')
    })

    test('calls onSubmit with event id when submit item clicked', async () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const user = await openMenu()

      await user.click(screen.getByRole('menuitem', { name: /enviar a revisión/i }))

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(1)
      expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Delete action', () => {
    test('renders delete menu item for draft events', async () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      await openMenu()

      expect(screen.getByRole('menuitem', { name: /eliminar/i })).toBeInTheDocument()
    })

    test('does not render delete menu item for non-draft events', async () => {
      const requiresChangesEvent: OrganizerEvent = {
        ...mockEvent,
        status: { id: 1, status_code: 'requires_changes', status_name: 'Requires Changes' }
      }

      render(
        <EventActionButtons
          event={requiresChangesEvent}
          {...mockHandlers}
        />
      )

      await openMenu()

      expect(screen.queryByRole('menuitem', { name: /eliminar/i })).not.toBeInTheDocument()
    })

    test('calls onDelete with event id when delete item clicked', async () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const user = await openMenu()

      await user.click(screen.getByRole('menuitem', { name: /eliminar/i }))

      expect(mockHandlers.onDelete).toHaveBeenCalledWith(1)
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
    })

    test('delete item has danger styling', async () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      await openMenu()

      const deleteItem = screen.getByRole('menuitem', { name: /eliminar/i })
      const deleteButton = deleteItem.querySelector('button') ?? deleteItem
      expect(deleteButton.className).toContain('text-error-600')
    })
  })

  describe('Accessibility', () => {
    test('trigger button has accessible label with event title', () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /acciones de test event/i })).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    test('is memoized', () => {
      expect(EventActionButtons).toHaveProperty('$$typeof', Symbol.for('react.memo'))
    })
  })
})
