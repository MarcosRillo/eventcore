/**
 * Tests for Approval Action Buttons Component
 *
 * Tests the action buttons that allow Entity Admin to approve,
 * reject, request changes, or publish events.
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { ApprovalActionButtons } from '@/features/approval/components/dumb/ApprovalActionButtons'
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
      const approvedEvent = { ...mockEvent, status: 'approved_internal' as const }

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
      const publishedEvent = { ...mockEvent, status: 'published' as const }

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
      const rejectedEvent = { ...mockEvent, status: 'rejected' as const }

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
      const approvedEvent = { ...mockEvent, status: 'approved_internal' as const }

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
      expect(approveButton.className).toContain('bg-success-500')
    })

    test('reject button has danger styling', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      expect(rejectButton.className).toContain('bg-error-500')
    })

    test('request changes button has warning styling', () => {
      render(
        <ApprovalActionButtons
          event={mockEvent}
          {...mockHandlers}
        />
      )

      const requestButton = screen.getByRole('button', { name: /request changes/i })
      expect(requestButton.className).toContain('bg-warning-500')
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
