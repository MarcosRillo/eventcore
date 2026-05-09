import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { CreateLocationModal } from '@/features/locations/components/dumb/CreateLocationModal'
import * as locationService from '@/features/locations/services/location.service'

// Mock the location service
jest.mock('@/features/locations/services/location.service')
const mockCreateLocation = locationService.createLocation as jest.Mock

// Mock UI components
jest.mock('@/shared/components/modals', () => ({
  FormModal: ({
    isOpen,
    onClose,
    onSuccess,
    title,
    submitButtonText,
    initialData,
    validator,
    submitHandler,
    children,
    resetOnSuccess,
    closeOnSuccess,
  }: {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    title: string
    submitButtonText: string
    initialData: Record<string, string>
    validator: (data: Record<string, string>) => string[]
    submitHandler: (data: Record<string, string>) => Promise<void>
    children: (props: {
      formData: Record<string, string>
      errors: Record<string, string>
      isLoading: boolean
      handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    }) => React.ReactNode
    resetOnSuccess?: boolean
    closeOnSuccess?: boolean
  }) => {
    const [formData, setFormData] = React.useState(initialData)
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const validationErrors = validator(formData)
      if (validationErrors.length > 0) {
        const errorObj: Record<string, string> = {}
        validationErrors.forEach((err, i) => {
          if (err.includes('nombre')) errorObj.name = err
          else if (err.includes('dirección')) errorObj.address = err
          else if (err.includes('ciudad')) errorObj.city = err
          else errorObj[`error${i}`] = err
        })
        setErrors(errorObj)
        return
      }
      setIsLoading(true)
      try {
        await submitHandler(formData)
        onSuccess()
        if (resetOnSuccess) {
          setFormData(initialData)
        }
        if (closeOnSuccess) {
          onClose()
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false)
      }
    }

    if (!isOpen) return null

    return (
      <div data-testid="form-modal" role="dialog">
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          {children({ formData, errors, isLoading, handleInputChange })}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : submitButtonText}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    )
  },
}))

jest.mock('@/shared/components/form', () => ({
  Input: ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    error,
  }: {
    label: string
    type?: string
    id?: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    error?: string
    fullWidth?: boolean
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  Textarea: ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    error,
  }: {
    label: string
    id?: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    rows?: number
    placeholder?: string
    disabled?: boolean
    error?: string
    fullWidth?: boolean
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}))

describe('CreateLocationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onLocationCreated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateLocation.mockResolvedValue({ id: 1, name: 'Test Location' })
  })

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<CreateLocationModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Crear Nueva Ubicación')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<CreateLocationModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render form with 4 fields', () => {
      render(<CreateLocationModal {...defaultProps} />)

      expect(screen.getByLabelText(/Nombre del lugar/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Dirección/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ciudad/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<CreateLocationModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Crear Ubicación/i })).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should validate name is required', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill only address and city
      await user.type(screen.getByLabelText(/Dirección/), 'Test Address')
      await user.type(screen.getByLabelText(/Ciudad/), 'Test City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockCreateLocation).not.toHaveBeenCalled()
    })

    it('should validate address is required', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill only name and city
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test Name')
      await user.type(screen.getByLabelText(/Ciudad/), 'Test City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/dirección es requerida/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockCreateLocation).not.toHaveBeenCalled()
    })

    it('should validate city is required', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill only name and address
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test Name')
      await user.type(screen.getByLabelText(/Dirección/), 'Test Address')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/ciudad es requerida/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockCreateLocation).not.toHaveBeenCalled()
    })

    it('should allow optional description', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill required fields only, no description
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test Name')
      await user.type(screen.getByLabelText(/Dirección/), 'Test Address')
      await user.type(screen.getByLabelText(/Ciudad/), 'Test City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      // Should call API without description
      await waitFor(() => {
        expect(mockCreateLocation).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Name',
            address: 'Test Address',
            city: 'Test City',
          })
        )
      })
    })
  })

  describe('submission', () => {
    it('should call createLocation API on valid submit', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill all fields
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Centro Cultural')
      await user.type(screen.getByLabelText(/Dirección/), 'Av. Principal 123')
      await user.type(screen.getByLabelText(/Ciudad/), 'San Miguel de Tucumán')
      await user.type(screen.getByLabelText(/Descripción/), 'Un lugar increíble')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      await waitFor(() => {
        expect(mockCreateLocation).toHaveBeenCalledWith({
          name: 'Centro Cultural',
          address: 'Av. Principal 123',
          city: 'San Miguel de Tucumán',
          description: 'Un lugar increíble',
          state: 'Tucumán',
          country: 'Argentina',
          is_active: true,
        })
      })
    })

    it('should call onSuccess callback after successful submit', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test')
      await user.type(screen.getByLabelText(/Dirección/), 'Address')
      await user.type(screen.getByLabelText(/Ciudad/), 'City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onLocationCreated callback after successful submit', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test')
      await user.type(screen.getByLabelText(/Dirección/), 'Address')
      await user.type(screen.getByLabelText(/Ciudad/), 'City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onLocationCreated).toHaveBeenCalled()
      })
    })

    it('should close modal after successful submit', async () => {
      const user = userEvent.setup()
      render(<CreateLocationModal {...defaultProps} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/Nombre del lugar/), 'Test')
      await user.type(screen.getByLabelText(/Dirección/), 'Address')
      await user.type(screen.getByLabelText(/Ciudad/), 'City')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })
  })
})
