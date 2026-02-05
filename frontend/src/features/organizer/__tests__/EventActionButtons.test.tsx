/**
 * Tests for EventActionButtons component
 *
 * Tests presentational component that displays action buttons
 * based on event status and handles user clicks.
 */

import { fireEvent,render, screen } from '@testing-library/react'

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

  describe('Submit Button', () => {
    test('renders submit button when event status is draft', () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /submit.*review/i })).toBeInTheDocument()
    })

    test('renders submit button when event status is requires_changes', () => {
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

      expect(screen.getByRole('button', { name: /submit.*review/i })).toBeInTheDocument()
    })

    test('does not render submit button when event is published', () => {
      const publishedEvent: OrganizerEvent = {
        ...mockEvent,
        status: { id: 1, status_code: 'published', status_name: 'Published' }
      }

      render(
        <EventActionButtons
          event={publishedEvent}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('button', { name: /submit.*review/i })).not.toBeInTheDocument()
    })

    test('calls onSubmit with event id when submit button clicked', () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /submit.*review/i }))

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(1)
      expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1)
    })

    test('disables submit button when loading', () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
          loading={true}
        />
      )

      const submitButton = screen.getByRole('button', { name: /submit.*review/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Delete Button', () => {
    test('renders delete button only for draft events', () => {
      render(
        <EventActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    test('does not render delete button for non-draft events', () => {
      const publishedEvent: OrganizerEvent = {
        ...mockEvent,
        status: { id: 1, status_code: 'published', status_name: 'Published' }
      }

      render(
        <EventActionButtons
          event={publishedEvent}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
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
      expect(deleteButton.className).toContain('bg-error-500')
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

      expect(screen.getByRole('button', { name: /submit.*review/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /delete/i })).toHaveAttribute('aria-label')
    })
  })
})
