/**
 * Tests for EditEventForm Component
 *
 * Tests form rendering, pre-population, validation, input handling, and submission.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditEventForm } from '../EditEventForm'
import { Event, EVENT_TYPE } from '@/types/event.types'
import { getActiveCategories } from '@/features/categories/services/category.service'
import { getActiveLocations } from '@/features/locations/services/location.service'

// Mock services
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

describe('EditEventForm', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const mockCategories = [
    { id: 1, name: 'Category 1', description: '' },
    { id: 2, name: 'Category 2', description: '' }
  ]

  const mockLocations = [
    { id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    { id: 2, name: 'Location 2', address: 'Address 2', city: 'City 2', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }
  ]

  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-20T10:00:00',
    end_date: '2025-12-21T18:00:00',
    status: 'published',
    type: EVENT_TYPE.SINGLE_LOCATION,
    category_id: 1,
    category: { id: 1, name: 'Category 1', slug: 'category-1', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    max_attendees: 100,
    is_featured: true,
    locations: [{ id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }],
    location: { id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
    approval_history: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockEventWithFreeText: Event = {
    ...mockEvent,
    id: 2,
    locations: [],
    location_text: 'Custom Address 123'
  }

  const defaultProps = {
    isOpen: true,
    isLoading: false,
    event: mockEvent,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getActiveCategories as jest.Mock).mockResolvedValue(mockCategories)
    ;(getActiveLocations as jest.Mock).mockResolvedValue(mockLocations)
  })

  describe('rendering', () => {
    test('should render modal when isOpen is true and event exists', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    })

    test('should not render when isOpen is false', () => {
      render(<EditEventForm {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    test('should not render when event is null', () => {
      render(<EditEventForm {...defaultProps} event={null} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    test('should render form title', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Editar Evento')).toBeInTheDocument()
      })
    })

    test('should render all form fields', async () => {
      render(<EditEventForm {...defaultProps} />)

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
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
      })
    })
  })

  describe('form pre-population', () => {
    test('should populate title from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Título/) as HTMLInputElement
        expect(titleInput.value).toBe('Test Event')
      })
    })

    test('should populate description from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const descInput = screen.getByLabelText(/Descripción/) as HTMLTextAreaElement
        expect(descInput.value).toBe('Test Description')
      })
    })

    test('should populate start date from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/Fecha de Inicio/) as HTMLInputElement
        expect(startDateInput.value).toBe('2025-12-20T10:00')
      })
    })

    test('should populate end date from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const endDateInput = screen.getByLabelText(/Fecha de Fin/) as HTMLInputElement
        expect(endDateInput.value).toBe('2025-12-21T18:00')
      })
    })

    test('should populate max attendees from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const capacityInput = screen.getByLabelText(/Capacidad Máxima/) as HTMLInputElement
        expect(capacityInput.value).toBe('100')
      })
    })

    test('should populate featured checkbox from event', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/Marcar como evento destacado/) as HTMLInputElement
        expect(checkbox.checked).toBe(true)
      })
    })

    test('should select structured location mode when event has locations', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('option-structured')).toHaveAttribute('data-selected', 'true')
      })
    })

    test('should select free text mode when event has location_text', async () => {
      render(<EditEventForm {...defaultProps} event={mockEventWithFreeText} />)

      await waitFor(() => {
        expect(screen.getByTestId('option-free_text')).toHaveAttribute('data-selected', 'true')
      })
    })
  })

  describe('data loading', () => {
    test('should load categories when modal opens', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(getActiveCategories).toHaveBeenCalled()
      })
    })

    test('should load locations when modal opens', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(getActiveLocations).toHaveBeenCalled()
      })
    })

    test('should handle categories load error gracefully', async () => {
      ;(getActiveCategories as jest.Mock).mockRejectedValue(new Error('Load failed'))

      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    test('should not submit when title is empty', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Clear the title
      const titleInput = screen.getByLabelText(/Título/)
      fireEvent.change(titleInput, { target: { value: '' } })

      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    test('should not submit when description is empty', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Clear the description
      const descInput = screen.getByLabelText(/Descripción/)
      fireEvent.change(descInput, { target: { value: '' } })

      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    test('should not submit when end date is before start date', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Set end date before start date
      fireEvent.change(screen.getByLabelText(/Fecha de Fin/), { target: { value: '2025-12-15T10:00' } })

      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('input handling', () => {
    test('should update title when typed', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/Título/) as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      expect(titleInput.value).toBe('Updated Title')
    })

    test('should update description when typed', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const descInput = screen.getByLabelText(/Descripción/) as HTMLTextAreaElement
      fireEvent.change(descInput, { target: { value: 'Updated Description' } })

      expect(descInput.value).toBe('Updated Description')
    })

    test('should update max attendees when changed', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const capacityInput = screen.getByLabelText(/Capacidad Máxima/) as HTMLInputElement
      fireEvent.change(capacityInput, { target: { value: '200' } })

      expect(capacityInput.value).toBe('200')
    })

    test('should toggle featured checkbox', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText(/Marcar como evento destacado/) as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('location type switching', () => {
    test('should switch to free text mode when selected', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('option-free_text'))

      await waitFor(() => {
        expect(screen.getByTestId('option-free_text')).toHaveAttribute('data-selected', 'true')
        expect(screen.getByLabelText(/Dirección de la Ubicación/)).toBeInTheDocument()
      })
    })

    test('should show location select in structured mode', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    test('should call onSubmit with event id and form data when valid', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith(
          1, // event id
          expect.objectContaining({
            title: 'Test Event',
            description: 'Test Description'
          })
        )
      })
    })

    test('should include updated values in submission', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Update title
      fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Updated Event Title' } })

      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            title: 'Updated Event Title'
          })
        )
      })
    })

    test('should populate location_text when event has it', async () => {
      render(<EditEventForm {...defaultProps} event={mockEventWithFreeText} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Should be in free_text mode
      expect(screen.getByTestId('option-free_text')).toHaveAttribute('data-selected', 'true')

      // Should show location text input
      await waitFor(() => {
        const locationInput = screen.getByLabelText(/Dirección de la Ubicación/) as HTMLTextAreaElement
        expect(locationInput.value).toBe('Custom Address 123')
      })
    })
  })

  describe('button properties', () => {
    test('should render cancel button with correct properties', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
      expect(cancelButton).toHaveAttribute('data-variant', 'outline')
      expect(cancelButton).toHaveAttribute('type', 'button')
    })

    test('should render submit button with correct properties', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Guardar Cambios/i })
      expect(submitButton).toHaveAttribute('data-variant', 'primary')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('loading state', () => {
    test('should disable buttons when isLoading is true', async () => {
      render(<EditEventForm {...defaultProps} isLoading={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Guardar Cambios/i })
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    test('should show loading state on submit button', async () => {
      render(<EditEventForm {...defaultProps} isLoading={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Guardar Cambios/i })
      expect(submitButton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('event type handling', () => {
    test('should handle event with object type', async () => {
      const eventWithObjectType: Event = {
        ...mockEvent,
        type: { id: 1, type_code: EVENT_TYPE.MULTI_LOCATION, type_name: 'Multi-Sede' } as Event['type']
      }

      render(<EditEventForm {...defaultProps} event={eventWithObjectType} />)

      await waitFor(() => {
        const typeSelect = screen.getByLabelText(/Tipo de Evento/) as HTMLSelectElement
        expect(typeSelect.value).toBe(EVENT_TYPE.MULTI_LOCATION)
      })
    })

    test('should handle event with string type', async () => {
      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        const typeSelect = screen.getByLabelText(/Tipo de Evento/) as HTMLSelectElement
        expect(typeSelect.value).toBe(EVENT_TYPE.SINGLE_LOCATION)
      })
    })
  })

  describe('edge cases', () => {
    test('should handle event with empty end_date', async () => {
      const eventWithoutEndDate: Event = {
        ...mockEvent,
        end_date: ''
      }

      render(<EditEventForm {...defaultProps} event={eventWithoutEndDate} />)

      await waitFor(() => {
        const endDateInput = screen.getByLabelText(/Fecha de Fin/) as HTMLInputElement
        expect(endDateInput.value).toBe('')
      })
    })

    test('should handle event with no max_attendees', async () => {
      const eventWithoutCapacity: Event = {
        ...mockEvent,
        max_attendees: undefined
      }

      render(<EditEventForm {...defaultProps} event={eventWithoutCapacity} />)

      await waitFor(() => {
        const capacityInput = screen.getByLabelText(/Capacidad Máxima/) as HTMLInputElement
        expect(capacityInput.value).toBe('')
      })
    })

    test('should handle empty categories list', async () => {
      ;(getActiveCategories as jest.Mock).mockResolvedValue([])

      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
        expect(screen.getByLabelText(/Categoría/)).toBeInTheDocument()
      })
    })

    test('should handle empty locations list', async () => {
      ;(getActiveLocations as jest.Mock).mockResolvedValue([])

      render(<EditEventForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
        expect(screen.getByLabelText(/Ubicaciones/)).toBeInTheDocument()
      })
    })

    test('should handle event with both locations and location_text (prioritize free_text)', async () => {
      const eventWithBoth: Event = {
        ...mockEvent,
        location_text: 'Custom Address',
        locations: [{ id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }]
      }

      render(<EditEventForm {...defaultProps} event={eventWithBoth} />)

      await waitFor(() => {
        // Should prioritize free_text when both exist
        expect(screen.getByTestId('option-free_text')).toHaveAttribute('data-selected', 'true')
      })
    })
  })
})
