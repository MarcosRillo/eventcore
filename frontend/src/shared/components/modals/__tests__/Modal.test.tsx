import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import Modal from '@/shared/components/modals/Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders children when isOpen is true', () => {
      render(
        <Modal {...defaultProps}>
          <p>Modal content</p>
        </Modal>
      )

      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render content when isOpen is false', () => {
      render(
        <Modal {...defaultProps} isOpen={false}>
          <p>Modal content</p>
        </Modal>
      )

      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Modal {...defaultProps} title="Test Title">
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders ReactNode title (JSX)', () => {
      const titleNode = <span data-testid="custom-title">Custom Title</span>

      render(
        <Modal {...defaultProps} title={titleNode}>
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      render(
        <Modal {...defaultProps} title="Title" description="A helpful description">
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByText('A helpful description')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(
        <Modal {...defaultProps} footer={<button>Save</button>}>
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders close button by default', () => {
      render(
        <Modal {...defaultProps} title="Title">
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    })

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal {...defaultProps} title="Title" showCloseButton={false}>
          <p>Content</p>
        </Modal>
      )

      expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    const sizes = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-4xl',
    } as const

    it.each(Object.entries(sizes))('applies correct max-width for size "%s"', (size, expectedClass) => {
      render(
        <Modal {...defaultProps} size={size as keyof typeof sizes}>
          <p>Content</p>
        </Modal>
      )

      const dialog = screen.getByRole('dialog')
      // The Dialog.Panel inside the dialog should have the size class
      const panel = dialog.querySelector(`.${expectedClass}`)
      expect(panel).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button clicked', async () => {
      const onClose = jest.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={onClose} title="Title">
          <p>Content</p>
        </Modal>
      )

      await user.click(screen.getByRole('button', { name: 'Cerrar' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('close button has aria-label="Cerrar"', () => {
      render(
        <Modal {...defaultProps} title="Title">
          <p>Content</p>
        </Modal>
      )

      const closeButton = screen.getByRole('button', { name: 'Cerrar' })
      expect(closeButton).toHaveAttribute('aria-label', 'Cerrar')
    })
  })

  describe('Accessibility', () => {
    it('renders with dialog role', () => {
      render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
