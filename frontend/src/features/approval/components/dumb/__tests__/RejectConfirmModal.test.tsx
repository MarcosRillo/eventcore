import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RejectConfirmModal } from '../RejectConfirmModal'

interface MockModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: string
  disabled?: boolean
}

interface MockTextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  'aria-label'?: string
}

// Mock UI components
jest.mock('@/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children }: MockModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-body">{children}</div>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}))

jest.mock('@/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, variant, disabled }: MockButtonProps) => (
    <button
      data-testid={`button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/Textarea', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, disabled, rows, ...props }: MockTextareaProps) => (
    <textarea
      data-testid="textarea-reason"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  ),
}))

describe('RejectConfirmModal', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <RejectConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Reject Event')
    })
  })

  describe('Warning Message', () => {
    it('should display rejection warning', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('This will reject the event submission')).toBeInTheDocument()
    })

    it('should apply warning styles', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const warningElement = screen.getByText('This will reject the event submission')
      expect(warningElement).toHaveClass('text-red-800', 'font-semibold')
    })
  })

  describe('Event Title Display', () => {
    it('should display instruction without event title', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Please provide a reason for rejecting/)).toBeInTheDocument()
    })

    it('should display event title when provided', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Summer Festival"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Please provide a reason for rejecting/)).toBeInTheDocument()
      expect(screen.getByText('"Summer Festival"')).toBeInTheDocument()
    })

    it('should render event title in bold', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      const titleElement = screen.getByText('"Test Event"')
      expect(titleElement.tagName).toBe('STRONG')
    })
  })

  describe('Reason Textarea', () => {
    it('should render textarea with placeholder', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      expect(textarea).toHaveAttribute('placeholder', 'Enter reason for rejection...')
      expect(textarea).toHaveAttribute('rows', '4')
    })

    it('should update reason when user types', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Invalid event details' } })

      expect(textarea).toHaveValue('Invalid event details')
    })

    it('should disable textarea when loading', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      expect(textarea).toBeDisabled()
    })

    it('should not disable textarea when not loading', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      expect(textarea).not.toBeDisabled()
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancel')
    })

    it('should call onClose and clear reason when cancel is clicked', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type reason
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Test reason' } })

      // Click cancel
      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should disable cancel button when loading', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Reject Button', () => {
    it('should render reject button with danger variant', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).toHaveTextContent('Reject Event')
    })

    it('should be disabled when reason is empty', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).toBeDisabled()
    })

    it('should be disabled when reason is only whitespace', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: '   ' } })

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).toBeDisabled()
    })

    it('should be enabled when reason is provided', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Invalid content' } })

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).not.toBeDisabled()
    })

    it('should call onConfirm with trimmed reason when clicked', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: '  Test reason  ' } })

      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith('  Test reason  ')
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when reason is empty', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: '' } })

      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should show loading text when loading', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toHaveTextContent('Rejecting...')
    })

    it('should disable reject button when loading', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).toBeDisabled()
    })
  })

  describe('State Management', () => {
    it('should clear reason when modal is closed', () => {
      const { rerender } = render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type reason
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Test reason' } })
      expect(textarea).toHaveValue('Test reason')

      // Close modal
      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      // Reopen modal - reason should be cleared
      rerender(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const newTextarea = screen.getByTestId('textarea-reason')
      expect(newTextarea).toHaveValue('')
    })

    it('should clear reason after successful confirmation', () => {
      const { rerender } = render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type reason and confirm
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Test reason' } })

      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      // Reopen modal - reason should be cleared
      rerender(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const newTextarea = screen.getByTestId('textarea-reason')
      expect(newTextarea).toHaveValue('')
    })
  })

  describe('Rejection Workflow', () => {
    it('should handle rejection workflow correctly', () => {
      const { rerender } = render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      // Type rejection reason
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Event violates guidelines' } })

      // Click reject
      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith('Event violates guidelines')

      // Loading state
      rerender(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toHaveTextContent('Rejecting...')
      expect(screen.getByTestId('button-danger')).toBeDisabled()
      expect(screen.getByTestId('button-secondary')).toBeDisabled()
      expect(screen.getByTestId('textarea-reason')).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long rejection reasons', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const longReason = 'A'.repeat(1000)
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: longReason } })

      expect(textarea).toHaveValue(longReason)

      const rejectButton = screen.getByTestId('button-danger')
      expect(rejectButton).not.toBeDisabled()
    })

    it('should handle special characters in reason', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const specialReason = '<script>alert("xss")</script>'
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: specialReason } })

      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith(specialReason)
    })

    it('should handle newlines in reason', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const multilineReason = 'Reason line 1\nReason line 2\nReason line 3'
      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: multilineReason } })

      const rejectButton = screen.getByTestId('button-danger')
      fireEvent.click(rejectButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith(multilineReason)
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <RejectConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      rerender(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const textarea = screen.getByTestId('textarea-reason')
      fireEvent.change(textarea, { target: { value: 'Test' } })

      rerender(
        <RejectConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toBeDisabled()

      rerender(
        <RejectConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on textarea', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-reason')
      expect(textarea).toHaveAttribute('aria-label', 'Rejection reason')
    })

    it('should have proper button variants for semantic meaning', () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument() // Cancel
      expect(screen.getByTestId('button-danger')).toBeInTheDocument() // Reject (destructive action)
    })
  })
})
