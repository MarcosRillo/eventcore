import { render, screen } from '@testing-library/react'
import React from 'react'

import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal'

interface MockConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

jest.mock('@/shared/components/modals/ConfirmDialog', () => ({
  __esModule: true,
  default: (props: MockConfirmDialogProps) =>
    props.isOpen ? (
      <div
        data-testid="confirm-dialog"
        data-variant={props.variant}
        data-title={props.title}
        data-message={props.message}
        data-confirm-text={props.confirmText}
        data-cancel-text={props.cancelText}
        data-loading={props.loading}
      >
        <button data-testid="confirm-btn" onClick={props.onConfirm}>
          {props.confirmText}
        </button>
        <button data-testid="cancel-btn" onClick={props.onCancel}>
          {props.cancelText}
        </button>
      </div>
    ) : null,
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

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })

    it('should render ConfirmDialog when isOpen is true', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    })
  })

  describe('ConfirmDialog Props', () => {
    it('should use danger variant', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'danger')
    })

    it('should pass default title', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-title', 'Eliminar elemento')
    })

    it('should pass custom title', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          title="Eliminar evento"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-title', 'Eliminar evento')
    })

    it('should hardcode confirmText as "Eliminar"', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-confirm-text', 'Eliminar')
    })

    it('should hardcode cancelText as "Cancelar"', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-cancel-text', 'Cancelar')
    })

    it('should pass loading prop', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('Message Composition', () => {
    it('should compose message with itemName and default warning', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="Test Event"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        '¿Está seguro de que desea eliminar "Test Event"? Advertencia: Esta acción no se puede deshacer'
      )
    })

    it('should compose message without itemName using generic text', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        '¿Está seguro de que desea eliminar este elemento? Advertencia: Esta acción no se puede deshacer'
      )
    })

    it('should compose message with custom warning', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName="My Item"
          warningMessage="Se perderán todos los datos asociados"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        '¿Está seguro de que desea eliminar "My Item"? Se perderán todos los datos asociados'
      )
    })

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

      const message = screen.getByTestId('confirm-dialog').getAttribute('data-message')
      expect(message).toContain(longName)
    })

    it('should handle special characters in item name', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          itemName='Event <script>alert("xss")</script>'
          {...mockHandlers}
        />
      )

      const message = screen.getByTestId('confirm-dialog').getAttribute('data-message')
      expect(message).toContain('Event <script>alert("xss")</script>')
    })
  })

  describe('Callback Mapping', () => {
    it('should map onClose to onCancel', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      screen.getByTestId('cancel-btn').click()
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
    })

    it('should forward onConfirm directly', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      screen.getByTestId('confirm-btn').click()
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when cancel is clicked', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      screen.getByTestId('cancel-btn').click()
      expect(mockHandlers.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('State Changes', () => {
    it('should handle open/close transitions', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()

      rerender(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()

      rerender(
        <DeleteConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })

    it('should update loading state', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'false')

      rerender(
        <DeleteConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'true')
    })
  })
})
