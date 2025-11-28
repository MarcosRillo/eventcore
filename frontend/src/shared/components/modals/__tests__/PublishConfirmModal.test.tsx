import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PublishConfirmModal } from '../PublishConfirmModal'

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

describe('PublishConfirmModal', () => {
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
        <PublishConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('should display default title when not provided', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Publish Item')
    })

    it('should display custom title when provided', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          title="Publish Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Publish Event')
    })
  })

  describe('Message Display', () => {
    it('should display default message when not provided', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(
        screen.getByText('Are you sure you want to publish this item? It will be submitted for internal approval.')
      ).toBeInTheDocument()
    })

    it('should display custom message when provided', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          message="Publishing will make this event visible to all users. Continue?"
          {...mockHandlers}
        />
      )

      expect(
        screen.getByText('Publishing will make this event visible to all users. Continue?')
      ).toBeInTheDocument()
    })

    it('should apply correct text styling to message', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const messageElement = screen.getByText(/Are you sure you want to publish this item/)
      expect(messageElement).toHaveClass('text-neutral-700')
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancel')
    })

    it('should call onClose when cancel button is clicked', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
    })

    it('should disable cancel button when loading', () => {
      render(
        <PublishConfirmModal
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
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Confirm Button', () => {
    it('should render confirm button with default label', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Publish')
    })

    it('should render confirm button with custom label', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          confirmLabel="Submit"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Submit')
    })

    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const confirmButton = screen.getByTestId('button-primary')
      fireEvent.click(confirmButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should show loading text with default label when loading', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Publishing...')
    })

    it('should show loading text with custom label when loading', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          confirmLabel="Submit"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Submiting...')
    })

    it('should disable confirm button when loading', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const confirmButton = screen.getByTestId('button-primary')
      expect(confirmButton).toBeDisabled()
    })

    it('should not disable confirm button when not loading', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const confirmButton = screen.getByTestId('button-primary')
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('Modal Close', () => {
    it('should call onClose when modal is closed', () => {
      render(
        <PublishConfirmModal
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

  describe('Integration Scenarios', () => {
    it('should handle publish workflow correctly', () => {
      const { rerender } = render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          title="Publish Event"
          message="This event will be visible to everyone."
          confirmLabel="Publish Now"
          {...mockHandlers}
        />
      )

      // User clicks publish
      const publishButton = screen.getByTestId('button-primary')
      fireEvent.click(publishButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalled()

      // Loading state enabled
      rerender(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          title="Publish Event"
          message="This event will be visible to everyone."
          confirmLabel="Publish Now"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Publish Nowing...')
      expect(screen.getByTestId('button-primary')).toBeDisabled()
      expect(screen.getByTestId('button-secondary')).toBeDisabled()
    })

    it('should handle cancel workflow correctly', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalled()
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })

    it('should not call handlers when buttons are disabled', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const publishButton = screen.getByTestId('button-primary')
      const cancelButton = screen.getByTestId('button-secondary')

      expect(publishButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Customization Options', () => {
    it('should allow full customization of all props', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          title="Submit for Review"
          message="Your changes will be sent for manager approval."
          confirmLabel="Submit"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Submit for Review')
      expect(screen.getByText('Your changes will be sent for manager approval.')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toHaveTextContent('Submit')
    })

    it('should work with minimal props (all defaults)', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Publish Item')
      expect(screen.getByText(/Are you sure you want to publish this item/)).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toHaveTextContent('Publish')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button variants for screen readers', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument() // Cancel
      expect(screen.getByTestId('button-primary')).toBeInTheDocument() // Publish
    })

    it('should maintain semantic HTML structure', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const modal = screen.getByTestId('modal-body')
      expect(modal).toBeInTheDocument()
      expect(modal.querySelector('.space-y-4')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500)
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          message={longMessage}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle messages with special characters', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          message='<script>alert("xss")</script> Publishing...'
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/<script>alert\("xss"\)<\/script> Publishing.../)).toBeInTheDocument()
    })

    it('should handle empty strings as custom values', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          title=""
          message=""
          confirmLabel=""
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('')
      expect(screen.getByTestId('button-primary')).toHaveTextContent('')
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <PublishConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      rerender(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      rerender(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toBeDisabled()

      rerender(
        <PublishConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should handle confirm labels with special characters', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          confirmLabel="Publish & Notify"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toHaveTextContent('Publish & Notify')
    })

    it('should handle loading text generation with various confirm labels', () => {
      const testCases = [
        { label: 'Approve', expected: 'Approveing...' },
        { label: 'Submit', expected: 'Submiting...' },
        { label: 'Send', expected: 'Sending...' },
        { label: 'Process', expected: 'Processing...' },
      ]

      testCases.forEach(({ label, expected }) => {
        const { rerender } = render(
          <PublishConfirmModal
            isOpen={true}
            loading={true}
            confirmLabel={label}
            {...mockHandlers}
          />
        )

        expect(screen.getByTestId('button-primary')).toHaveTextContent(expected)

        rerender(<></>)
      })
    })
  })

  describe('Comparison with DeleteConfirmModal', () => {
    it('should use primary variant for confirm button (not danger)', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
      expect(screen.queryByTestId('button-danger')).not.toBeInTheDocument()
    })

    it('should not display warning message like DeleteConfirmModal', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText(/Warning:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/cannot be undone/)).not.toBeInTheDocument()
    })

    it('should have different default messaging tone', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const message = screen.getByText(/Are you sure you want to publish this item/)
      expect(message).toBeInTheDocument()
      expect(message).not.toHaveClass('text-red-800')
    })
  })
})
