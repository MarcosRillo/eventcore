import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { FormModal, FormModalProps, FormRenderProps } from '@/shared/components/modals/FormModal'

// Mock Modal with the pattern from DeleteConfirmModal.test.tsx
interface MockModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  footer: React.ReactNode
  size?: string
  closeOnOverlayClick?: boolean
  onClose: () => void
}

jest.mock('@/shared/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, title, children, footer }: MockModalProps) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}))

// Simple form data type for testing
interface TestFormData {
  name: string
  email: string
}

// Helper to render FormModal with test children
const renderFormModal = (overrides: Partial<FormModalProps<TestFormData>> = {}) => {
  const defaultProps: FormModalProps<TestFormData> = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    title: 'Test Form',
    submitButtonText: 'Guardar',
    initialData: { name: '', email: '' },
    submitHandler: jest.fn().mockResolvedValue(undefined),
    children: (props: FormRenderProps<TestFormData>) => (
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={props.formData.name}
          onChange={props.handleInputChange}
        />
        {props.errors.name && <span data-testid="error-name">{props.errors.name}</span>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          value={props.formData.email}
          onChange={props.handleInputChange}
        />
        {props.errors.email && <span data-testid="error-email">{props.errors.email}</span>}
      </div>
    ),
    ...overrides,
  }

  return {
    props: defaultProps,
    ...render(<FormModal {...defaultProps} />),
  }
}

describe('FormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders title and form content when open', () => {
      renderFormModal()

      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderFormModal({ isOpen: false })

      expect(screen.queryByText('Test Form')).not.toBeInTheDocument()
    })

    it('renders submit button text', () => {
      renderFormModal()

      expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
    })
  })

  describe('Form State', () => {
    it('initializes from initialData', () => {
      renderFormModal({ initialData: { name: 'Juan', email: 'juan@test.com' } })

      expect(screen.getByLabelText('Name')).toHaveValue('Juan')
      expect(screen.getByLabelText('Email')).toHaveValue('juan@test.com')
    })

    it('updates on input change', async () => {
      const user = userEvent.setup()
      renderFormModal()

      await user.type(screen.getByLabelText('Name'), 'María')

      expect(screen.getByLabelText('Name')).toHaveValue('María')
    })

    it('resets when originalData changes', () => {
      const { rerender, props } = renderFormModal({
        originalData: { name: 'Old', email: 'old@test.com' },
      })

      expect(screen.getByLabelText('Name')).toHaveValue('Old')

      rerender(
        <FormModal
          {...props}
          originalData={{ name: 'New', email: 'new@test.com' }}
        />
      )

      expect(screen.getByLabelText('Name')).toHaveValue('New')
      expect(screen.getByLabelText('Email')).toHaveValue('new@test.com')
    })
  })

  describe('Validation & Submission', () => {
    it('calls validator before submit', async () => {
      const user = userEvent.setup()
      const validator = jest.fn().mockReturnValue([])
      const submitHandler = jest.fn().mockResolvedValue(undefined)
      renderFormModal({ validator, submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(validator).toHaveBeenCalled()
      })
    })

    it('prevents submit on validation failure', async () => {
      const user = userEvent.setup()
      const submitHandler = jest.fn().mockResolvedValue(undefined)
      const validator = jest.fn().mockReturnValue(['name is required'])

      renderFormModal({ submitHandler, validator })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(submitHandler).not.toHaveBeenCalled()
    })

    it('calls submitHandler with formData', async () => {
      const user = userEvent.setup()
      const submitHandler = jest.fn().mockResolvedValue(undefined)
      renderFormModal({
        submitHandler,
        initialData: { name: 'Test', email: 'test@test.com' },
      })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(submitHandler).toHaveBeenCalledWith(
          { name: 'Test', email: 'test@test.com' },
          undefined
        )
      })
    })

    it('calls onSuccess after successful submit', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      const submitHandler = jest.fn().mockResolvedValue(undefined)

      renderFormModal({ onSuccess, submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('calls onClose after success when closeOnSuccess is true', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      const submitHandler = jest.fn().mockResolvedValue(undefined)

      renderFormModal({ onClose, submitHandler, closeOnSuccess: true })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('shows ErrorAlert on API error with error-* tokens', async () => {
      const user = userEvent.setup()
      const submitHandler = jest.fn().mockRejectedValue({
        response: { status: 500, data: { message: 'Server Error' } },
      })

      renderFormModal({ submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        const alert = screen.getByText('Server Error')
        expect(alert).toBeInTheDocument()
        // Verify error-* tokens are used (from M1 fix)
        const alertContainer = alert.closest('.bg-error-50')
        expect(alertContainer).toBeInTheDocument()
      })
    })

    it('shows 422 field errors from API', async () => {
      const user = userEvent.setup()
      const submitHandler = jest.fn().mockRejectedValue({
        response: {
          status: 422,
          data: {
            errors: {
              name: ['El nombre es requerido'],
              email: ['El email no es válido'],
            },
          },
        },
      })

      renderFormModal({ submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toHaveTextContent('El nombre es requerido')
        expect(screen.getByTestId('error-email')).toHaveTextContent('El email no es válido')
      })
    })

    it('clears errors on input change', async () => {
      const user = userEvent.setup()
      const submitHandler = jest.fn().mockRejectedValue({
        response: {
          status: 422,
          data: {
            errors: {
              name: ['El nombre es requerido'],
            },
          },
        },
      })

      renderFormModal({ submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Name'), 'A')

      expect(screen.queryByTestId('error-name')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('disables buttons during submission', async () => {
      const user = userEvent.setup()
      // Use a promise that we control to keep loading state active
      let resolveSubmit: () => void = () => {}
      const submitPromise = new Promise<void>((resolve) => { resolveSubmit = resolve })
      const submitHandler = jest.fn().mockReturnValue(submitPromise)

      renderFormModal({ submitHandler })

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      })

      // Cleanup: resolve the pending promise inside act to avoid act() warnings
      await act(async () => {
        resolveSubmit()
        await submitPromise
      })
    })
  })
})
