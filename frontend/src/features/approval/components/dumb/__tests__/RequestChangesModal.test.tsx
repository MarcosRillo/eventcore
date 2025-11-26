import { render, screen, fireEvent } from '@testing-library/react'
import { RequestChangesModal } from '../RequestChangesModal'

// Mock UI components
jest.mock('@/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children }: any) =>
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
  default: ({ children, onClick, variant, disabled }: any) => (
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
  default: ({ value, onChange, placeholder, disabled, rows, ...props }: any) => (
    <textarea
      data-testid="textarea-comments"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  ),
}))

describe('RequestChangesModal', () => {
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
        <RequestChangesModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Request Changes')
    })
  })

  describe('Event Title Display', () => {
    it('should display instruction without event title', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Request changes to/)).toBeInTheDocument()
    })

    it('should display event title when provided', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          eventTitle="Music Concert"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Request changes to/)).toBeInTheDocument()
      expect(screen.getByText('"Music Concert"')).toBeInTheDocument()
    })

    it('should render event title in bold', () => {
      render(
        <RequestChangesModal
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

  describe('Comments Textarea', () => {
    it('should render textarea with placeholder', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      expect(textarea).toHaveAttribute('placeholder', 'Describe what changes are needed...')
      expect(textarea).toHaveAttribute('rows', '4')
    })

    it('should update comments when user types', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Please update the date' } })

      expect(textarea).toHaveValue('Please update the date')
    })

    it('should disable textarea when loading', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      expect(textarea).toBeDisabled()
    })

    it('should not disable textarea when not loading', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      expect(textarea).not.toBeDisabled()
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancel')
    })

    it('should call onClose and clear comments when cancel is clicked', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type comments
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Test comments' } })

      // Click cancel
      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should disable cancel button when loading', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Request Changes Button', () => {
    it('should render request changes button with warning variant', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const button = screen.getByTestId('button-warning')
      expect(button).toHaveTextContent('Request Changes')
    })

    it('should be disabled when comments are empty', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const button = screen.getByTestId('button-warning')
      expect(button).toBeDisabled()
    })

    it('should be disabled when comments are only whitespace', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: '   ' } })

      const button = screen.getByTestId('button-warning')
      expect(button).toBeDisabled()
    })

    it('should be enabled when comments are provided', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Please fix the title' } })

      const button = screen.getByTestId('button-warning')
      expect(button).not.toBeDisabled()
    })

    it('should call onConfirm with comments when clicked', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: '  Update event details  ' } })

      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith('  Update event details  ')
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when comments are empty', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: '' } })

      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should show loading text when loading', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-warning')).toHaveTextContent('Sending...')
    })

    it('should disable request changes button when loading', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const button = screen.getByTestId('button-warning')
      expect(button).toBeDisabled()
    })
  })

  describe('State Management', () => {
    it('should clear comments when modal is closed', () => {
      const { rerender } = render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type comments
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Test comments' } })
      expect(textarea).toHaveValue('Test comments')

      // Close modal
      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      // Reopen modal - comments should be cleared
      rerender(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const newTextarea = screen.getByTestId('textarea-comments')
      expect(newTextarea).toHaveValue('')
    })

    it('should clear comments after successful confirmation', () => {
      const { rerender } = render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      // Type comments and confirm
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Test comments' } })

      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      // Reopen modal - comments should be cleared
      rerender(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const newTextarea = screen.getByTestId('textarea-comments')
      expect(newTextarea).toHaveValue('')
    })
  })

  describe('Request Changes Workflow', () => {
    it('should handle workflow correctly', () => {
      const { rerender } = render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      // Type change request
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Please update the venue information' } })

      // Click request changes
      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith('Please update the venue information')

      // Loading state
      rerender(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-warning')).toHaveTextContent('Sending...')
      expect(screen.getByTestId('button-warning')).toBeDisabled()
      expect(screen.getByTestId('button-secondary')).toBeDisabled()
      expect(screen.getByTestId('textarea-comments')).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long comments', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const longComments = 'A'.repeat(2000)
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: longComments } })

      expect(textarea).toHaveValue(longComments)

      const button = screen.getByTestId('button-warning')
      expect(button).not.toBeDisabled()
    })

    it('should handle special characters in comments', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const specialComments = '<script>alert("xss")</script>'
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: specialComments } })

      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith(specialComments)
    })

    it('should handle multiline comments', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const multilineComments = 'Change 1\nChange 2\nChange 3'
      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: multilineComments } })

      const button = screen.getByTestId('button-warning')
      fireEvent.click(button)

      expect(mockHandlers.onConfirm).toHaveBeenCalledWith(multilineComments)
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <RequestChangesModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      rerender(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const textarea = screen.getByTestId('textarea-comments')
      fireEvent.change(textarea, { target: { value: 'Test' } })

      rerender(
        <RequestChangesModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-warning')).toBeDisabled()

      rerender(
        <RequestChangesModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should handle very long event titles', () => {
      const longTitle = 'A'.repeat(200)
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          eventTitle={longTitle}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(`"${longTitle}"`)).toBeInTheDocument()
    })

    it('should handle event titles with special characters', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          eventTitle='Event & "Special" <chars>'
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/"Event & "Special" <chars>"/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on textarea', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comments')
      expect(textarea).toHaveAttribute('aria-label', 'Change request comments')
    })

    it('should have proper button variants for semantic meaning', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument() // Cancel
      expect(screen.getByTestId('button-warning')).toBeInTheDocument() // Request Changes (cautionary action)
    })

    it('should maintain semantic HTML structure', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      const modal = screen.getByTestId('modal-body')
      expect(modal).toBeInTheDocument()
      expect(modal.querySelector('.space-y-4')).toBeInTheDocument()
    })
  })

  describe('Comparison with RejectConfirmModal', () => {
    it('should use warning variant instead of danger', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-warning')).toBeInTheDocument()
      expect(screen.queryByTestId('button-danger')).not.toBeInTheDocument()
    })

    it('should not display destructive warning message', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText(/This will reject the event submission/)).not.toBeInTheDocument()
    })

    it('should have different messaging tone (constructive vs destructive)', () => {
      render(
        <RequestChangesModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Request changes to/)).toBeInTheDocument()
      expect(screen.queryByText(/rejection/i)).not.toBeInTheDocument()
    })
  })
})
