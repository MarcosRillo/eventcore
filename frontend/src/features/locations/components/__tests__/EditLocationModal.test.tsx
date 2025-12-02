import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditLocationModal } from '../EditLocationModal'
import * as locationService from '@/features/locations/services/location.service'
import { Location } from '@/types/location.types'

// Mock the location service
jest.mock('@/features/locations/services/location.service')
const mockUpdateLocation = locationService.updateLocation as jest.Mock

// Mock @/components/ui
jest.mock('@/components/ui', () => ({
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
        validationErrors.forEach((err) => {
          if (err.includes('nombre')) errorObj.name = err
          else if (err.includes('dirección')) errorObj.address = err
          else if (err.includes('ciudad')) errorObj.city = err
        })
        setErrors(errorObj)
        return
      }
      setIsLoading(true)
      try {
        await submitHandler(formData)
        onSuccess()
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

// Need to import React for the mock
import React from 'react'

// Helper to create mock location
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 1,
  name: 'Centro de Convenciones',
  address: 'Av. Soldati 330',
  city: 'San Miguel de Tucumán',
  state: 'Tucumán',
  country: 'Argentina',
  description: 'Un centro de eventos importante',
  is_active: true,
  entity_id: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

describe('EditLocationModal', () => {
  const mockLocation = createMockLocation()

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    location: mockLocation,
    onLocationUpdated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateLocation.mockResolvedValue({ id: 1, name: 'Updated Location' })
  })

  describe('rendering', () => {
    it('should render null when location is null', () => {
      const { container } = render(<EditLocationModal {...defaultProps} location={null} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render modal when location is provided and isOpen is true', () => {
      render(<EditLocationModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(`Editar: ${mockLocation.name}`)).toBeInTheDocument()
    })

    it('should populate form with location data', () => {
      render(<EditLocationModal {...defaultProps} />)

      expect(screen.getByDisplayValue(mockLocation.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockLocation.address)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockLocation.city)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockLocation.description!)).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<EditLocationModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should validate name is required', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Clear the name field
      const nameInput = screen.getByLabelText(/Nombre del lugar/)
      await user.clear(nameInput)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockUpdateLocation).not.toHaveBeenCalled()
    })

    it('should validate address is required', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Clear the address field
      const addressInput = screen.getByLabelText(/Dirección/)
      await user.clear(addressInput)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/dirección es requerida/i)).toBeInTheDocument()
      })
    })

    it('should validate city is required', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Clear the city field
      const cityInput = screen.getByLabelText(/Ciudad/)
      await user.clear(cityInput)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/ciudad es requerida/i)).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('should call updateLocation API with location.id on valid submit', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Update the name
      const nameInput = screen.getByLabelText(/Nombre del lugar/)
      await user.clear(nameInput)
      await user.type(nameInput, 'Nuevo Nombre')

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      await waitFor(() => {
        expect(mockUpdateLocation).toHaveBeenCalledWith(
          mockLocation.id,
          expect.objectContaining({
            name: 'Nuevo Nombre',
            state: 'Tucumán',
            country: 'Argentina',
            is_active: true,
          })
        )
      })
    })

    it('should call onSuccess callback after successful submit', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Submit form without changes
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onLocationUpdated callback after successful submit', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onLocationUpdated).toHaveBeenCalled()
      })
    })

    it('should close modal after successful submit', async () => {
      const user = userEvent.setup()
      render(<EditLocationModal {...defaultProps} />)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Actualizar Ubicación/i }))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })
  })
})
