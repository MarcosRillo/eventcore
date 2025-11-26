import { render, screen, fireEvent } from '@testing-library/react'
import { ApproveConfirmModal } from '../ApproveConfirmModal'

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

describe('ApproveConfirmModal', () => {
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
        <ApproveConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Approve Event')
    })
  })

  describe('Event Title Display', () => {
    it('should display confirmation message without event title', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Are you sure you want to approve/)).toBeInTheDocument()
    })

    it('should display event title in confirmation message when provided', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Summer Music Festival"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Are you sure you want to approve/)).toBeInTheDocument()
      expect(screen.getByText('"Summer Music Festival"')).toBeInTheDocument()
    })

    it('should render event title in bold', () => {
      render(
        <ApproveConfirmModal
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

  describe('Information Message', () => {
    it('should display explanation about approval', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(
        screen.getByText(
          'The event will be marked as approved and can be published to the public calendar.'
        )
      ).toBeInTheDocument()
    })

    it('should apply correct styling to info message', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const infoElement = screen.getByText(/The event will be marked as approved/)
      expect(infoElement).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancel')
    })

    it('should call onClose when cancel button is clicked', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should disable cancel button when loading', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).toBeDisabled()
    })

    it('should not disable cancel button when not loading', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Approve Button', () => {
    it('should render approve button with success variant', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const approveButton = screen.getByTestId('button-success')
      expect(approveButton).toHaveTextContent('Approve')
    })

    it('should call onConfirm when approve button is clicked', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const approveButton = screen.getByTestId('button-success')
      fireEvent.click(approveButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onClose).not.toHaveBeenCalled()
    })

    it('should show loading text when loading', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-success')).toHaveTextContent('Approving...')
    })

    it('should disable approve button when loading', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const approveButton = screen.getByTestId('button-success')
      expect(approveButton).toBeDisabled()
    })

    it('should not disable approve button when not loading', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const approveButton = screen.getByTestId('button-success')
      expect(approveButton).not.toBeDisabled()
    })
  })

  describe('Modal Close', () => {
    it('should call onClose when modal close is triggered', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Approval Workflow', () => {
    it('should handle approval workflow correctly', () => {
      const { rerender } = render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      // User clicks approve
      const approveButton = screen.getByTestId('button-success')
      fireEvent.click(approveButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalled()

      // Loading state enabled
      rerender(
        <ApproveConfirmModal
          isOpen={true}
          loading={true}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-success')).toHaveTextContent('Approving...')
      expect(screen.getByTestId('button-success')).toBeDisabled()
      expect(screen.getByTestId('button-secondary')).toBeDisabled()
    })

    it('should handle cancel workflow correctly', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          eventTitle="Test Event"
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalled()
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long event titles', () => {
      const longTitle = 'A'.repeat(200)
      render(
        <ApproveConfirmModal
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
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          eventTitle='Event <script>alert("xss")</script>'
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/"Event <script>alert\("xss"\)<\/script>"/)).toBeInTheDocument()
    })

    it('should handle empty string as event title', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          eventTitle=""
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Are you sure you want to approve/)).toBeInTheDocument()
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <ApproveConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      rerender(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      rerender(
        <ApproveConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-success')).toBeDisabled()

      rerender(
        <ApproveConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button variants for semantic meaning', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument() // Cancel
      expect(screen.getByTestId('button-success')).toBeInTheDocument() // Approve (positive action)
    })

    it('should maintain semantic HTML structure', () => {
      render(
        <ApproveConfirmModal
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

  describe('Visual States', () => {
    it('should display both buttons in default state', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
      expect(screen.getByTestId('button-success')).toBeInTheDocument()
    })

    it('should show all action buttons (Close, Cancel, Approve)', () => {
      render(
        <ApproveConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)

      // Verify all buttons are present
      expect(screen.getByTestId('close-modal')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
      expect(screen.getByTestId('button-success')).toBeInTheDocument()
    })
  })
})
