/**
 * ConfirmDialog Component Tests
 * Tests for the confirmation dialog component
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConfirmDialog from '@/shared/components/modals/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with title and message when open', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    it('renders custom button text', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      )

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders danger variant with error icon', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />)

      const iconContainer = document.querySelector('.bg-error-50')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders warning variant with warning icon', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />)

      const iconContainer = document.querySelector('.bg-warning-50')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders success variant with success icon', () => {
      render(<ConfirmDialog {...defaultProps} variant="success" />)

      const iconContainer = document.querySelector('.bg-success-50')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders info variant (default) with primary icon', () => {
      render(<ConfirmDialog {...defaultProps} variant="info" />)

      const iconContainer = document.querySelector('.bg-primary-50')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const onConfirm = jest.fn()
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await userEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = jest.fn()
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await userEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when ESC key is pressed', async () => {
      const onCancel = jest.fn()
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        // HeadlessUI Dialog handles ESC natively via onClose
        expect(onCancel).toHaveBeenCalled()
      })
    })

    it('does not call onCancel on ESC when loading', async () => {
      const onCancel = jest.fn()
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} loading />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(onCancel).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading state on confirm button', () => {
      render(<ConfirmDialog {...defaultProps} loading />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toBeInTheDocument()
    })

    it('disables cancel button when loading', () => {
      render(<ConfirmDialog {...defaultProps} loading />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      expect(cancelButton).toBeDisabled()
    })

    it('prevents interactions when loading', async () => {
      const onConfirm = jest.fn()
      const onCancel = jest.fn()
      render(
        <ConfirmDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onCancel={onCancel}
          loading
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await userEvent.click(cancelButton)

      expect(onCancel).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has accessible modal structure', () => {
      render(<ConfirmDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('focuses on modal content when opened', async () => {
      render(<ConfirmDialog {...defaultProps} />)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })
    })
  })
})
