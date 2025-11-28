/**
 * Tests for CreateEventForm Component
 *
 * Tests form rendering, validation, input handling, and submission.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateEventForm } from '../CreateEventForm'
import { useAuth } from '@/context/AuthContext'
import { getActiveCategories } from '@/features/categories/services/category.service'
import { getActiveLocations } from '@/features/locations/services/location.service'
import { EVENT_TYPE } from '@/types/event.types'

// Mock hooks and services
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn()
}))

jest.mock('@/features/categories/services/category.service', () => ({
  getActiveCategories: jest.fn()
}))

jest.mock('@/features/locations/services/location.service', () => ({
  getActiveLocations: jest.fn()
}))

// Mock UI components
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, type, disabled, loading, variant }: {
    children: React.ReactNode
    onClick?: () => void
    type?: string
    disabled?: boolean
    loading?: boolean
    variant?: string
  }) => (
    <button
      type={type as 'button' | 'submit'}
      onClick={onClick}
      disabled={disabled}
      data-loading={loading}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({ label, value, onChange, type, error, placeholder, min, disabled }: {
    label: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    error?: string
    placeholder?: string
    min?: string
    disabled?: boolean
  }) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        disabled={disabled}
        aria-label={label}
      />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
  Textarea: ({ label, value, onChange, rows, error, placeholder }: {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    rows?: number
    error?: string
    placeholder?: string
  }) => (
    <div>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        aria-label={label}
      />
      {error && <span data-testid="textarea-error">{error}</span>}
    </div>
  ),
  Select: ({ label, value, onChange, options, placeholder, error, disabled }: {
    label: string
    value: string | number
    onChange: (value: string) => void
    options: { value: string | number; label: string }[]
    placeholder?: string
    error?: string
    disabled?: boolean
  }) => (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span data-testid="select-error">{error}</span>}
    </div>
  ),
  Modal: ({ isOpen, onClose, title, children }: {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
  }) => isOpen ? (
    <div data-testid="modal">
      <h2>{title}</h2>
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {children}
    </div>
  ) : null
}))

jest.mock('@/components/ui/ButtonGroupSelector', () => ({
  ButtonGroupSelector: ({ label, options, selectedValue, onSelect }: {
    label: string
    options: { value: string; label: string; description?: string }[]
    selectedValue: string
    onSelect: (value: string) => void
  }) => (
    <div data-testid="button-group">
      <span>{label}</span>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          data-selected={selectedValue === opt.value}
          data-testid={`option-${opt.value}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}))

describe('CreateEventForm', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const mockUser = {
    id: 1,
    name: 'Test User',
    organization: { id: 10 }
  }

  const mockCategories = [
    { id: 1, name: 'Category 1', description: '' },
    { id: 2, name: 'Category 2', description: '' }
  ]

  const mockLocations = [
    { id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1' },
    { id: 2, name: 'Location 2', address: 'Address 2', city: 'City 2' }
  ]

  const defaultProps = {
    isOpen: true,
    isLoading: false,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(getActiveCategories as jest.Mock).mockResolvedValue(mockCategories)
    ;(getActiveLocations as jest.Mock).mockResolvedValue(mockLocations)
  })

  describe('rendering', () => {
    test('should render modal when isOpen is true', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    })

    test('should not render when isOpen is false', () => {
      render(<CreateEventForm {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    test('should render form title', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Crear Nuevo Evento')).toBeInTheDocument()
      })
    })

    test('should render all form fields', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/Título/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Fecha de Inicio/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Fecha de Fin/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Tipo de Evento/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Categoría/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Capacidad Máxima/)).toBeInTheDocument()
      })
    })

    test('should render submit and cancel buttons', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Crear Evento/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
      })
    })

    test('should render location type selector', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('button-group')).toBeInTheDocument()
        expect(screen.getByTestId('option-structured')).toBeInTheDocument()
        expect(screen.getByTestId('option-free_text')).toBeInTheDocument()
      })
    })
  })

  describe('data loading', () => {
    test('should load categories when modal opens', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(getActiveCategories).toHaveBeenCalled()
      })
    })

    test('should load locations when modal opens', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(getActiveLocations).toHaveBeenCalled()
      })
    })

    test('should handle categories load error gracefully', async () => {
      ;(getActiveCategories as jest.Mock).mockRejectedValue(new Error('Load failed'))

      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        // Should not crash
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    })

    test('should handle locations load error gracefully', async () => {
      ;(getActiveLocations as jest.Mock).mockRejectedValue(new Error('Load failed'))

      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    test('should show error when title is empty', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      // Check for error in any error element
      await waitFor(() => {
        const errorElements = screen.getAllByTestId('input-error')
        const titleError = errorElements.find(el => el.textContent === 'El título es obligatorio')
        expect(titleError).toBeDefined()
      })
    })

    test('should show error when description is empty', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill only title
      const titleInput = screen.getByLabelText(/Título/)
      fireEvent.change(titleInput, { target: { value: 'Test Event' } })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      // Check for error element
      await waitFor(() => {
        const errorElements = screen.getAllByTestId('textarea-error')
        const descError = errorElements.find(el => el.textContent === 'La descripción es obligatoria')
        expect(descError).toBeDefined()
      })
    })

    test('should show error when start date is empty', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill title and description
      const titleInput = screen.getByLabelText(/Título/)
      fireEvent.change(titleInput, { target: { value: 'Test Event' } })

      const descInput = screen.getByLabelText(/Descripción/)
      fireEvent.change(descInput, { target: { value: 'Test Description' } })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElements = screen.getAllByTestId('input-error')
        const dateError = errorElements.find(el => el.textContent === 'La fecha de inicio es obligatoria')
        expect(dateError).toBeDefined()
      })
    })

    test('should show error when end date is before start date', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Fin/), { target: { value: '2025-12-15T10:00' } })

      // Select category
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })

      // Select location
      await waitFor(() => {
        const locationSelect = screen.getByLabelText(/Ubicaciones/)
        fireEvent.change(locationSelect, { target: { value: '1' } })
      })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElements = screen.getAllByTestId('input-error')
        const dateError = errorElements.find(el => el.textContent === 'La fecha de fin debe ser posterior a la fecha de inicio')
        expect(dateError).toBeDefined()
      })
    })

    test('should show error when category is not selected', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill fields except category
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElements = screen.getAllByTestId('select-error')
        const categoryError = errorElements.find(el => el.textContent === 'La categoría es obligatoria')
        expect(categoryError).toBeDefined()
      })
    })

    test('should show error when no location is selected in structured mode', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElements = screen.getAllByTestId('select-error')
        const locationError = errorElements.find(el => el.textContent === 'Debe seleccionar al menos una ubicación')
        expect(locationError).toBeDefined()
      })
    })

    test('should show error when no location text in free_text mode', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Switch to free text mode
      fireEvent.click(screen.getByTestId('option-free_text'))

      // Fill required fields except location_text
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElements = screen.getAllByTestId('textarea-error')
        const locationError = errorElements.find(el => el.textContent === 'Debe introducir una ubicación')
        expect(locationError).toBeDefined()
      })
    })

    test('should not submit form when validation fails', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Submit without filling any fields
      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      // onSubmit should not be called
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('input handling', () => {
    test('should update title when typed', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/Título/) as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'My Event Title' } })

      expect(titleInput.value).toBe('My Event Title')
    })

    test('should update description when typed', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const descInput = screen.getByLabelText(/Descripción/) as HTMLTextAreaElement
      fireEvent.change(descInput, { target: { value: 'My Event Description' } })

      expect(descInput.value).toBe('My Event Description')
    })

    test('should update start date when changed', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText(/Fecha de Inicio/) as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-12-20T10:00' } })

      expect(dateInput.value).toBe('2025-12-20T10:00')
    })

    test('should update max attendees when changed', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const capacityInput = screen.getByLabelText(/Capacidad Máxima/) as HTMLInputElement
      fireEvent.change(capacityInput, { target: { value: '100' } })

      expect(capacityInput.value).toBe('100')
    })

    test('should toggle featured checkbox', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText(/Marcar como evento destacado/) as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('location type switching', () => {
    test('should switch to free text mode when selected', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Initially in structured mode
      expect(screen.getByTestId('option-structured')).toHaveAttribute('data-selected', 'true')

      // Switch to free text
      fireEvent.click(screen.getByTestId('option-free_text'))

      await waitFor(() => {
        expect(screen.getByTestId('option-free_text')).toHaveAttribute('data-selected', 'true')
        expect(screen.getByLabelText(/Dirección de la Ubicación/)).toBeInTheDocument()
      })
    })

    test('should show location select in structured mode', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()
      })
    })

    test('should show location textarea in free_text mode', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('option-free_text'))

      await waitFor(() => {
        expect(screen.getByLabelText(/Dirección de la Ubicación/)).toBeInTheDocument()
      })
    })

    test('should clear location data when switching modes', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Start in structured mode
      expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()

      // Switch to free text mode - structured location field should disappear
      fireEvent.click(screen.getByTestId('option-free_text'))

      await waitFor(() => {
        expect(screen.queryByLabelText(/^Ubicaciones$/)).not.toBeInTheDocument()
        expect(screen.getByLabelText(/Dirección de la Ubicación/)).toBeInTheDocument()
      })

      // Switch back to structured mode - free text field should disappear
      fireEvent.click(screen.getByTestId('option-structured'))

      await waitFor(() => {
        expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()
        expect(screen.queryByLabelText(/Dirección de la Ubicación/)).not.toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    test('should call onSubmit with form data when valid', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Fin/), { target: { value: '2025-12-21T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })

      // Select location
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Ubicaciones/), { target: { value: '1' } })
      })

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Event',
            description: 'Test Description',
            start_date: '2025-12-20T10:00',
            end_date: '2025-12-21T10:00',
            category_id: 1,
            location_ids: [1]
          })
        )
      })
    })

    test('should include location_text when in free_text mode', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Switch to free text mode
      fireEvent.click(screen.getByTestId('option-free_text'))

      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Dirección de la Ubicación/), {
          target: { value: 'Custom Address 123' }
        })
      })

      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            location_text: 'Custom Address 123'
          })
        )
      })
    })

    test('should not submit when validation fails', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Submit without filling required fields
      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    test('should include user organization_id in submission', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Ubicaciones/), { target: { value: '1' } })

      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            organization_id: 10,
            created_by: 1
          })
        )
      })
    })
  })

  describe('form close and reset', () => {
    test('should render cancel button with correct properties', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
      expect(cancelButton).toHaveAttribute('data-variant', 'outline')
      expect(cancelButton).toHaveAttribute('type', 'button')
    })

    test('should render submit button with correct properties', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      expect(submitButton).toHaveAttribute('data-variant', 'primary')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('loading state', () => {
    test('should disable buttons when isLoading is true', async () => {
      render(<CreateEventForm {...defaultProps} isLoading={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    test('should show loading state on submit button', async () => {
      render(<CreateEventForm {...defaultProps} isLoading={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Crear Evento/i })
      expect(submitButton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('event type selection', () => {
    test('should default to single location type', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/Tipo de Evento/) as HTMLSelectElement
      expect(typeSelect.value).toBe(EVENT_TYPE.SINGLE_LOCATION)
    })

    test('should update event type when changed', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/Tipo de Evento/) as HTMLSelectElement
      fireEvent.change(typeSelect, { target: { value: EVENT_TYPE.MULTI_LOCATION } })

      expect(typeSelect.value).toBe(EVENT_TYPE.MULTI_LOCATION)
    })
  })

  describe('edge cases', () => {
    test('should handle user without organization', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: { id: 1, name: 'Test User' }
      })

      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Ubicaciones/), { target: { value: '1' } })

      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            organization_id: null
          })
        )
      })
    })

    test('should handle empty categories list', async () => {
      ;(getActiveCategories as jest.Mock).mockResolvedValue([])

      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
        expect(screen.getByLabelText(/Categoría/)).toBeInTheDocument()
      })
    })

    test('should handle empty locations list', async () => {
      ;(getActiveLocations as jest.Mock).mockResolvedValue([])

      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
        expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()
      })
    })

    test('should include is_featured when checked', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Ubicaciones/), { target: { value: '1' } })

      // Check featured
      fireEvent.click(screen.getByLabelText(/Marcar como evento destacado/))

      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            is_featured: true
          })
        )
      })
    })

    test('should include max_attendees when provided', async () => {
      render(<CreateEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Test Event' } })
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Test Description' } })
      fireEvent.change(screen.getByLabelText(/Fecha de Inicio/), { target: { value: '2025-12-20T10:00' } })
      fireEvent.change(screen.getByLabelText(/Categoría/), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Ubicaciones/), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Capacidad Máxima/), { target: { value: '50' } })

      fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            max_attendees: 50
          })
        )
      })
    })
  })
})
