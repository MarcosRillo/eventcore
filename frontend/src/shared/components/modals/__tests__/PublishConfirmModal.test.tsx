import { render, screen } from '@testing-library/react'
import React from 'react'

import { PublishConfirmModal } from '@/shared/components/modals/PublishConfirmModal'

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

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })

    it('should render ConfirmDialog when isOpen is true', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    })
  })

  describe('Spanish Defaults', () => {
    it('should default title to "Enviar a revisión"', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-title',
        'Enviar a revisión'
      )
    })

    it('should default message to Spanish', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        '¿Está seguro de que desea enviar este elemento? Será enviado para aprobación interna.'
      )
    })

    it('should default confirmText to "Enviar"', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-confirm-text', 'Enviar')
    })

    it('should hardcode cancelText as "Cancelar"', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-cancel-text', 'Cancelar')
    })
  })

  describe('Variant Prop', () => {
    it('should default to info variant', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'info')
    })

    it('should accept warning variant', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          variant="warning"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'warning')
    })

    it('should accept info variant explicitly', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          variant="info"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'info')
    })
  })

  describe('Custom Props', () => {
    it('should pass custom title', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          title="Publicar evento"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-title', 'Publicar evento')
    })

    it('should pass custom message', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          message="Este evento será visible para todos."
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        'Este evento será visible para todos.'
      )
    })

    it('should map confirmLabel to confirmText', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          confirmLabel="Publicar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-confirm-text', 'Publicar')
    })

    it('should pass loading prop', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('Callback Mapping', () => {
    it('should map onClose to onCancel', () => {
      render(
        <PublishConfirmModal
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
        <PublishConfirmModal
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
        <PublishConfirmModal
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
        <PublishConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()

      rerender(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()

      rerender(
        <PublishConfirmModal
          isOpen={false}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })

    it('should update loading state', () => {
      const { rerender } = render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'false')

      rerender(
        <PublishConfirmModal
          isOpen={true}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-loading', 'true')
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

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-message', longMessage)
    })

    it('should handle messages with special characters', () => {
      render(
        <PublishConfirmModal
          isOpen={true}
          loading={false}
          message='<script>alert("xss")</script>'
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute(
        'data-message',
        '<script>alert("xss")</script>'
      )
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

      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-title', '')
      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-message', '')
      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-confirm-text', '')
    })
  })
})
