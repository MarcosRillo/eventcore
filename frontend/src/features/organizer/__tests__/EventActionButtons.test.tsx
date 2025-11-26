/**
 * Tests for EventActionButtons component
 *
 * Tests presentational component that displays action buttons
 * based on event status and handles user clicks.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { EventActionButtons } from '../components/dumb/EventActionButtons'
import { OrganizerEvent } from '@/features/organizer/types/event.types'

describe('EventActionButtons', () => {
  const mockEvent: OrganizerEvent = {
    id: 1,
    title: 'Test Event',
    start_date: '2025-11-01T10:00:00',
    status: 'draft'
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
      const publishedEvent = { ...mockEvent, status: 'published' as const }

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
      const statuses: Array<'draft' | 'pending' | 'approved' | 'rejected' | 'published'> =
        ['draft', 'pending', 'approved', 'rejected', 'published']

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
      expect(deleteButton.className).toContain('bg-red-600')
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
