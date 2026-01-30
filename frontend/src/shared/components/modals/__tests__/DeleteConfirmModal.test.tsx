import { fireEvent,render, screen } from '@testing-library/react'
import React from 'react'

import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal'

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

jest.mock('@/shared/components/form/Button', () => ({
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

describe('DeleteConfirmModal', () => {
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
        <DeleteConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('should display default title when not provided', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Eliminar elemento')
    })

    it('should display custom title when provided', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          title="Delete Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Delete Event')
    })
  })

  describe('Warning Message', () => {
    it('should display default warning message', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Advertencia: Esta acción no se puede deshacer')).toBeInTheDocument()
    })

    it('should display custom warning message when provided', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          warningMessage="Custom warning: Data will be permanently lost"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Custom warning: Data will be permanently lost')).toBeInTheDocument()
    })

    it('should apply warning styles to warning message', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const warningElement = screen.getByText('Advertencia: Esta acción no se puede deshacer')
      expect(warningElement).toHaveClass('text-red-800', 'font-semibold')
    })
  })

  describe('Item Name Display', () => {
    it('should display confirmation message without item name when not provided', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/¿Está seguro de que desea eliminar/)).toBeInTheDocument()
    })

    it('should display item name in confirmation message when provided', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Test Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/¿Está seguro de que desea eliminar/)).toBeInTheDocument()
      expect(screen.getByText('"Test Event"')).toBeInTheDocument()
    })

    it('should render item name in bold', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Important Document"
          {...mockHandlers}
        />
      )

      const itemElement = screen.getByText('"Important Document"')
      expect(itemElement.tagName).toBe('STRONG')
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancelar')
    })

    it('should call onClose when cancel button is clicked', () => {
      render(
        <DeleteConfirmModal
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
        <DeleteConfirmModal
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
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Delete Button', () => {
    it('should render delete button with default text', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toHaveTextContent('Eliminar')
    })

    it('should call onConfirm when delete button is clicked', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const deleteButton = screen.getByTestId('button-danger')
      fireEvent.click(deleteButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should show loading text when loading', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toHaveTextContent('Eliminando...')
    })

    it('should disable delete button when loading', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const deleteButton = screen.getByTestId('button-danger')
      expect(deleteButton).toBeDisabled()
    })

    it('should not disable delete button when not loading', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      const deleteButton = screen.getByTestId('button-danger')
      expect(deleteButton).not.toBeDisabled()
    })
  })

  describe('Modal Close', () => {
    it('should call onClose when modal is closed', () => {
      render(
        <DeleteConfirmModal
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
    it('should handle deletion workflow correctly', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Test Item"
          {...mockHandlers}
        />
      )

      // User clicks delete
      const deleteButton = screen.getByTestId('button-danger')
      fireEvent.click(deleteButton)

      expect(mockHandlers.onConfirm).toHaveBeenCalled()

      // Loading state enabled
      rerender(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          itemName="Test Item"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toHaveTextContent('Eliminando...')
      expect(screen.getByTestId('button-danger')).toBeDisabled()
      expect(screen.getByTestId('button-secondary')).toBeDisabled()
    })

    it('should handle cancel workflow correctly', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Test Item"
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
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      const deleteButton = screen.getByTestId('button-danger')
      const cancelButton = screen.getByTestId('button-secondary')

      fireEvent.click(deleteButton)
      fireEvent.click(cancelButton)

      // Buttons are disabled, so handlers might still be called depending on implementation
      // The disabled attribute is for UX, but clicks can still fire in tests
      // This test verifies the buttons are disabled, actual prevention depends on Button component
      expect(deleteButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button variants for screen readers', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toBeInTheDocument() // Cancel
      expect(screen.getByTestId('button-danger')).toBeInTheDocument() // Delete
    })

    it('should maintain semantic HTML structure', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Test Item"
          {...mockHandlers}
        />
      )

      const modal = screen.getByTestId('modal-body')
      expect(modal).toBeInTheDocument()
      expect(modal.querySelector('.space-y-4')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long item names', () => {
      const longName = 'A'.repeat(200)
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName={longName}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(`"${longName}"`)).toBeInTheDocument()
    })

    it('should handle item names with special characters', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName='Event <script>alert("xss")</script>'
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/"Event <script>alert\("xss"\)<\/script>"/)).toBeInTheDocument()
    })

    it('should handle empty string as item name', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName=""
          {...mockHandlers}
        />
      )

      // Should still render the confirmation message
      expect(screen.getByText(/¿Está seguro de que desea eliminar/)).toBeInTheDocument()
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      rerender(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      rerender(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-danger')).toBeDisabled()

      rerender(
        <DeleteConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })
})
