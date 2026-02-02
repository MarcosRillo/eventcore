/**
 * PromptDialog Component Tests
 * Tests for the prompt dialog component with input/textarea
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PromptDialog from '@/shared/components/modals/PromptDialog'

describe('PromptDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Enter Value',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with title when open', () => {
      render(<PromptDialog {...defaultProps} />)

      expect(screen.getByText('Enter Value')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<PromptDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Enter Value')).not.toBeInTheDocument()
    })

    it('renders with message', () => {
      render(<PromptDialog {...defaultProps} message="Please enter a value" />)

      expect(screen.getByText('Please enter a value')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<PromptDialog {...defaultProps} label="Your input" />)

      expect(screen.getByText('Your input')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<PromptDialog {...defaultProps} placeholder="Type here..." />)

      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })

    it('renders custom button text', () => {
      render(
        <PromptDialog
          {...defaultProps}
          confirmText="Submit"
          cancelText="Go Back"
        />
      )

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument()
    })

    it('shows required indicator when required', () => {
      render(<PromptDialog {...defaultProps} label="Field" required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Input Mode', () => {
    it('renders text input by default', () => {
      render(<PromptDialog {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input.tagName).toBe('INPUT')
    })

    it('handles text input changes', async () => {
      render(<PromptDialog {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello')

      expect(input).toHaveValue('Hello')
    })

    it('shows default value', () => {
      render(<PromptDialog {...defaultProps} defaultValue="Initial value" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Initial value')
    })
  })

  describe('Multiline Mode (Textarea)', () => {
    it('renders textarea when multiline is true', () => {
      render(<PromptDialog {...defaultProps} multiline />)

      const textarea = screen.getByRole('textbox')
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('handles textarea input changes', async () => {
      render(<PromptDialog {...defaultProps} multiline />)

      const textarea = screen.getByRole('textbox')
      await userEvent.type(textarea, 'Multi\nline\ntext')

      expect(textarea).toHaveValue('Multi\nline\ntext')
    })
  })

  describe('Validation', () => {
    it('disables confirm when empty and required', () => {
      render(<PromptDialog {...defaultProps} required />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toBeDisabled()
    })

    it('enables confirm when value entered and required', async () => {
      render(<PromptDialog {...defaultProps} required />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Some value')

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).not.toBeDisabled()
    })

    it('shows character counter when maxLength is set', () => {
      render(<PromptDialog {...defaultProps} maxLength={100} />)

      expect(screen.getByText('0 / 100')).toBeInTheDocument()
    })

    it('updates character counter as user types', async () => {
      render(<PromptDialog {...defaultProps} maxLength={100} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello')

      expect(screen.getByText('5 / 100')).toBeInTheDocument()
    })

    it('limits input to maxLength characters', async () => {
      render(<PromptDialog {...defaultProps} maxLength={5} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello World')

      // Input is limited by maxLength attribute
      expect(input).toHaveValue('Hello')
      expect(screen.getByText('5 / 5')).toBeInTheDocument()
    })

    it('enables confirm when within maxLength', async () => {
      render(<PromptDialog {...defaultProps} maxLength={10} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello')

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).not.toBeDisabled()
      expect(screen.getByText('5 / 10')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onConfirm with input value', async () => {
      const onConfirm = jest.fn()
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Test value')

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await userEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledWith('Test value')
    })

    it('calls onCancel when cancel button clicked', async () => {
      const onCancel = jest.fn()
      render(<PromptDialog {...defaultProps} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await userEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when ESC key is pressed', async () => {
      const onCancel = jest.fn()
      render(<PromptDialog {...defaultProps} onCancel={onCancel} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled()
      })
    })

    it('submits on Enter in single-line mode', async () => {
      const onConfirm = jest.fn()
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Test{Enter}')

      expect(onConfirm).toHaveBeenCalledWith('Test')
    })

    it('does not submit on Enter in multiline mode', async () => {
      const onConfirm = jest.fn()
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} multiline />)

      const textarea = screen.getByRole('textbox')
      await userEvent.type(textarea, 'Test{Enter}More')

      expect(onConfirm).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('Test\nMore')
    })
  })

  describe('Loading State', () => {
    it('disables input when loading', () => {
      render(<PromptDialog {...defaultProps} loading />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('disables cancel button when loading', () => {
      render(<PromptDialog {...defaultProps} loading />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      expect(cancelButton).toBeDisabled()
    })

    it('does not call onCancel on ESC when loading', async () => {
      const onCancel = jest.fn()
      render(<PromptDialog {...defaultProps} onCancel={onCancel} loading />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(onCancel).not.toHaveBeenCalled()
      })
    })
  })

  describe('Reset Behavior', () => {
    it('resets value when reopened', async () => {
      const { rerender } = render(
        <PromptDialog {...defaultProps} defaultValue="" />
      )

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Typed value')
      expect(input).toHaveValue('Typed value')

      // Close and reopen
      rerender(<PromptDialog {...defaultProps} defaultValue="" isOpen={false} />)
      rerender(<PromptDialog {...defaultProps} defaultValue="" isOpen={true} />)

      await waitFor(() => {
        const newInput = screen.getByRole('textbox')
        expect(newInput).toHaveValue('')
      })
    })
  })

  describe('Button Variants', () => {
    it('uses primary variant by default', () => {
      render(<PromptDialog {...defaultProps} />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toHaveClass('bg-primary-500')
    })

    it('uses danger variant when specified', () => {
      render(<PromptDialog {...defaultProps} variant="danger" />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toHaveClass('bg-error-500')
    })

    it('uses warning variant when specified', () => {
      render(<PromptDialog {...defaultProps} variant="warning" />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toHaveClass('bg-warning-500')
    })

    it('uses success variant when specified', () => {
      render(<PromptDialog {...defaultProps} variant="success" />)

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toHaveClass('bg-success-500')
    })
  })

  describe('Accessibility', () => {
    it('has accessible dialog structure', () => {
      render(<PromptDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('focuses input when dialog opens', async () => {
      render(<PromptDialog {...defaultProps} />)

      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(document.activeElement).toBe(input)
      }, { timeout: 200 })
    })
  })
})
