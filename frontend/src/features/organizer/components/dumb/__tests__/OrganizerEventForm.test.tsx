/**
 * Tests for OrganizerEventForm (Dumb Component)
 *
 * Tests covering form sections, inputs, locations selection,
 * async dates, loading states, and error handling.
 * Updated for 3NF schema (Nov 30, 2025).
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { OrganizerEventForm } from '@/features/organizer/components/dumb/OrganizerEventForm'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

describe('OrganizerEventForm', () => {
  const mockHandleChange = jest.fn()
  const mockHandleSubmit = jest.fn((e) => e.preventDefault())
  const mockHandleCancel = jest.fn()
  const mockSetNewAsyncDate = jest.fn()
  const mockAddAsynchronousDate = jest.fn()
  const mockRemoveAsynchronousDate = jest.fn()
  const mockHandleCustomLocationToggle = jest.fn()

  // Mock ResizeObserver for Headless UI Combobox
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  const mockLocations = [
    { id: 1, name: 'Plaza Independencia' },
    { id: 2, name: 'Parque 9 de Julio' }
  ]

  const emptyFormData: EventFormData = {
    title: '',
    description: '',
    edition_number: '',
    // Event Type/Subtype (hierarchical - Dec 2, 2025)
    event_type_id: null,
    event_subtype_id: null,
    // FK references
    type_id: null,
    subtype_id: null,
    origin_id: null,
    theme_id: null,
    frequency_id: null,
    rotation_type_id: null,
    producer_id: null,
    service_ids: [],
    room_ids: [],
    location_ids: [],
    has_custom_location: false,
    custom_location_name: '',
    maps_url: '',
    previous_venue: '',
    next_venue: '',
    start_date: '',
    end_date: '',
    async_dates: [],
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,
    event_website: '',
    logo_url: '',
    featured_image: '',
    responsive_image_url: ''
  }

  const filledFormData: EventFormData = {
    ...emptyFormData,
    title: 'Festival de Jazz',
    description: 'Un evento increíble de música jazz',
    edition_number: '10ma Edición',
    event_type_id: 1,
    event_subtype_id: 1,
    location_ids: [1],
    maps_url: 'https://maps.google.com/test',
    previous_venue: 'Buenos Aires 2024',
    next_venue: 'Córdoba 2026',
    start_date: '2025-12-15T18:00',
    end_date: '2025-12-16T22:00',
    async_dates: [
      { date: '2025-12-20', notes: 'Sesión adicional' }
    ],
    local_attendance: '500',
    national_attendance: '200',
    international_attendance: '50',
    virtual_transmission: true,
    event_website: 'https://festival.com',
    logo_url: 'https://ejemplo.com/logo.png',
    featured_image: 'https://ejemplo.com/imagen.jpg',
    responsive_image_url: 'https://ejemplo.com/imagen-mobile.jpg'
  }

  const mockSearchLocations = jest.fn().mockResolvedValue(mockLocations)

  const mockEventTypes = [
    { id: 1, name: 'Congreso', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 2, name: 'Feria', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' }
  ]

  const mockEventSubtypes = [
    { id: 1, event_type_id: 1, name: 'Nacional', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 2, event_type_id: 1, name: 'Internacional', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' }
  ]

  const defaultProps = {
    formData: emptyFormData,
    errors: {} as EventFormErrors,
    loading: false,
    initialLoading: false,
    eventTypes: mockEventTypes,
    eventSubtypes: mockEventSubtypes,
    onSearchLocations: mockSearchLocations,
    selectedLocations: [] as { id: number; name: string }[],
    isEditMode: false,
    newAsyncDate: { date: '', notes: '' },
    setNewAsyncDate: mockSetNewAsyncDate,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    handleCancel: mockHandleCancel,
    addAsynchronousDate: mockAddAsynchronousDate,
    removeAsynchronousDate: mockRemoveAsynchronousDate,
    handleCustomLocationToggle: mockHandleCustomLocationToggle
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial loading state', () => {
    test('should render loading message when initialLoading is true', () => {
      render(<OrganizerEventForm {...defaultProps} initialLoading={true} />)

      expect(screen.getByText('Cargando evento...')).toBeInTheDocument()
    })

    test('should not render form when initialLoading is true', () => {
      render(<OrganizerEventForm {...defaultProps} initialLoading={true} />)

      expect(screen.queryByRole('form')).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nombre del evento/i)).not.toBeInTheDocument()
    })

    test('should render form when initialLoading is false', () => {
      render(<OrganizerEventForm {...defaultProps} initialLoading={false} />)

      expect(screen.queryByText('Cargando evento...')).not.toBeInTheDocument()
      expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
    })
  })

  describe('form sections rendering', () => {
    test('should render all 6 form sections', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByText('1. Información Básica')).toBeInTheDocument()
      expect(screen.getByText('2. Ubicación')).toBeInTheDocument()
      expect(screen.getByText('3. Fechas')).toBeInTheDocument()
      expect(screen.getByText('4. Asistencia')).toBeInTheDocument()
      expect(screen.getByText('5. Información Adicional')).toBeInTheDocument()
      expect(screen.getByText('6. Imágenes')).toBeInTheDocument()
    })

    test('should render section headers with proper styling', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const sectionHeaders = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeaders).toHaveLength(6)
      sectionHeaders.forEach(header => {
        expect(header).toHaveClass('text-lg', 'font-semibold')
      })
    })
  })

  describe('section 1: basic information', () => {
    test('should render title input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveAttribute('type', 'text')
      expect(titleInput).toHaveAttribute('placeholder', 'Ej: Congreso Internacional de Turismo 2025')
    })

    test('should render edition number input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const editionInput = screen.getByLabelText(/número de edición/i)
      expect(editionInput).toBeInTheDocument()
      expect(editionInput).toHaveAttribute('placeholder', 'Ej: 10ma Edición')
    })

    test('should render description textarea', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const descriptionInput = screen.getByLabelText(/descripción/i)
      expect(descriptionInput).toBeInTheDocument()
      expect(descriptionInput.tagName).toBe('TEXTAREA')
      expect(descriptionInput).toHaveAttribute('rows', '4')
    })

    test('should render event type select with provided event types', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const eventTypeSelect = document.getElementById('event_type_id') as HTMLSelectElement
      expect(eventTypeSelect).toBeInTheDocument()

      expect(eventTypeSelect.querySelector('option[value=""]')).toHaveTextContent('Seleccionar tipo de evento')
      expect(eventTypeSelect.querySelector('option[value="1"]')).toHaveTextContent('Congreso')
      expect(eventTypeSelect.querySelector('option[value="2"]')).toHaveTextContent('Feria')
    })

    test('should render event subtype select with provided subtypes', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, event_type_id: 1 }} />)

      const eventSubtypeSelect = document.getElementById('event_subtype_id') as HTMLSelectElement
      expect(eventSubtypeSelect).toBeInTheDocument()

      expect(eventSubtypeSelect.querySelector('option[value="1"]')).toHaveTextContent('Nacional')
      expect(eventSubtypeSelect.querySelector('option[value="2"]')).toHaveTextContent('Internacional')
    })

    test('should disable subtype select when no type is selected', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const eventSubtypeSelect = document.getElementById('event_subtype_id') as HTMLSelectElement
      expect(eventSubtypeSelect).toBeDisabled()
      expect(eventSubtypeSelect.querySelector('option[value=""]')).toHaveTextContent('Primero selecciona un tipo')
    })

    test('should enable subtype select when type is selected', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, event_type_id: 1 }} />)

      const eventSubtypeSelect = document.getElementById('event_subtype_id') as HTMLSelectElement
      expect(eventSubtypeSelect).not.toBeDisabled()
      expect(eventSubtypeSelect.querySelector('option[value=""]')).toHaveTextContent('Seleccionar subtipo')
    })

    test('should call handleChange when event_type_id changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const eventTypeSelect = document.getElementById('event_type_id') as HTMLSelectElement
      fireEvent.change(eventTypeSelect, { target: { value: '1' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_type_id', 1)
      // Should also reset subtype
      expect(mockHandleChange).toHaveBeenCalledWith('event_subtype_id', null)
    })

    test('should call handleChange when event_subtype_id changes', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, event_type_id: 1 }} />)

      const eventSubtypeSelect = document.getElementById('event_subtype_id') as HTMLSelectElement
      fireEvent.change(eventSubtypeSelect, { target: { value: '2' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_subtype_id', 2)
    })
  })

  describe('section 2: location', () => {
    test('should render location async searchable multi-select', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // AsyncSearchableMultiSelect renders with "Ubicaciones" label
      expect(screen.getByText('Ubicaciones')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Escribe para buscar ubicación...')).toBeInTheDocument()
    })

    test('should render "Otro" checkbox for custom location', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/agregar ubicación personalizada/i)).toBeInTheDocument()
    })

    test('should not render maps_url and custom_location_name inputs by default', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(document.getElementById('maps_url')).not.toBeInTheDocument()
      expect(document.getElementById('custom_location_name')).not.toBeInTheDocument()
    })

    test('should render custom location fields when has_custom_location is true', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, has_custom_location: true }} />)

      expect(document.getElementById('custom_location_name')).toBeInTheDocument()
      expect(document.getElementById('maps_url')).toBeInTheDocument()
    })

    test('should render previous and next venue inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/última sede/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/próxima sede/i)).toBeInTheDocument()
    })

    test('should call handleCustomLocationToggle when Otro checkbox is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const otroCheckbox = screen.getByLabelText(/agregar ubicación personalizada/i)
      fireEvent.click(otroCheckbox)

      expect(mockHandleCustomLocationToggle).toHaveBeenCalledWith(true)
    })

    test('should call handleChange when custom_location_name input changes', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, has_custom_location: true }} />)

      const customNameInput = document.getElementById('custom_location_name') as HTMLInputElement
      fireEvent.change(customNameInput, { target: { value: 'Salón El Jardín' } })

      expect(mockHandleChange).toHaveBeenCalledWith('custom_location_name', 'Salón El Jardín')
    })

    test('should call handleChange when maps_url input changes', () => {
      render(<OrganizerEventForm {...defaultProps} formData={{ ...emptyFormData, has_custom_location: true }} />)

      const mapsInput = document.getElementById('maps_url') as HTMLInputElement
      fireEvent.change(mapsInput, { target: { value: 'https://maps.google.com/test' } })

      expect(mockHandleChange).toHaveBeenCalledWith('maps_url', 'https://maps.google.com/test')
    })

    test('should call handleChange when previous_venue input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const previousVenueInput = document.getElementById('previous_venue') as HTMLInputElement
      fireEvent.change(previousVenueInput, { target: { value: 'Córdoba 2023' } })

      expect(mockHandleChange).toHaveBeenCalledWith('previous_venue', 'Córdoba 2023')
    })

    test('should call handleChange when next_venue input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const nextVenueInput = document.getElementById('next_venue') as HTMLInputElement
      fireEvent.change(nextVenueInput, { target: { value: 'Mendoza 2026' } })

      expect(mockHandleChange).toHaveBeenCalledWith('next_venue', 'Mendoza 2026')
    })
  })

  describe('section 3: dates', () => {
    test('should render start_date input as datetime-local', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startDateInput = screen.getByLabelText(/fecha inicio/i)
      expect(startDateInput).toBeInTheDocument()
      expect(startDateInput).toHaveAttribute('type', 'datetime-local')
    })

    test('should render end_date input as datetime-local', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const endDateInput = screen.getByLabelText(/fecha fin/i)
      expect(endDateInput).toBeInTheDocument()
      expect(endDateInput).toHaveAttribute('type', 'datetime-local')
    })

    test('should render async dates section', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // Check for async dates section - using getAllByText since label may appear multiple times
      const asyncTexts = screen.getAllByText(/fechas adicionales/i)
      expect(asyncTexts.length).toBeGreaterThan(0)
    })

    test('should render async dates add button', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument()
    })

    test('should render existing async dates', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByText('2025-12-20')).toBeInTheDocument()
      expect(screen.getByText(/sesión adicional/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })

    test('should disable add button when async date field is empty', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /agregar/i })
      expect(addButton).toBeDisabled()
    })

    test('should call handleChange when start_date changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startDateInput = document.getElementById('start_date') as HTMLInputElement
      fireEvent.change(startDateInput, { target: { value: '2025-12-20T10:00' } })

      expect(mockHandleChange).toHaveBeenCalledWith('start_date', '2025-12-20T10:00')
    })

    test('should call handleChange when end_date changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const endDateInput = document.getElementById('end_date') as HTMLInputElement
      fireEvent.change(endDateInput, { target: { value: '2025-12-20T18:00' } })

      expect(mockHandleChange).toHaveBeenCalledWith('end_date', '2025-12-20T18:00')
    })
  })

  describe('async dates functionality', () => {
    test('should call setNewAsyncDate when date input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // Find the date input in the async dates section (it's a type="date" input)
      const asyncDateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(asyncDateInput, { target: { value: '2025-12-25' } })

      expect(mockSetNewAsyncDate).toHaveBeenCalledWith({ date: '2025-12-25', notes: '' })
    })

    test('should call addAsynchronousDate when add button clicked', () => {
      render(<OrganizerEventForm {...defaultProps} newAsyncDate={{ date: '2025-12-25', notes: '' }} />)

      const addButton = screen.getByRole('button', { name: /agregar/i })
      fireEvent.click(addButton)

      expect(mockAddAsynchronousDate).toHaveBeenCalled()
    })

    test('should call removeAsynchronousDate when delete button is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      fireEvent.click(deleteButton)

      expect(mockRemoveAsynchronousDate).toHaveBeenCalledWith(0)
    })
  })

  describe('section 4: attendance', () => {
    test('should render attendance inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/asistencia locales/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/asistencia nacionales/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/asistencia extranjeros/i)).toBeInTheDocument()
    })

    test('should render attendance inputs as number type', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const localInput = screen.getByLabelText(/asistencia locales/i)
      expect(localInput).toHaveAttribute('type', 'number')
      expect(localInput).toHaveAttribute('min', '0')
    })

    test('should render virtual transmission checkbox', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const virtualCheckbox = screen.getByLabelText(/transmisión virtual/i)
      expect(virtualCheckbox).toBeInTheDocument()
      expect(virtualCheckbox).toHaveAttribute('type', 'checkbox')
    })

    test('should call handleChange when local_attendance input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const localInput = document.getElementById('local_attendance') as HTMLInputElement
      fireEvent.change(localInput, { target: { value: '100' } })

      expect(mockHandleChange).toHaveBeenCalledWith('local_attendance', '100')
    })

    test('should call handleChange when virtual_transmission checkbox is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const virtualCheckbox = screen.getByLabelText(/transmisión virtual/i)
      fireEvent.click(virtualCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('virtual_transmission', true)
    })
  })

  describe('section 5: additional information', () => {
    test('should render event website input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const websiteInput = screen.getByLabelText(/web del evento/i)
      expect(websiteInput).toBeInTheDocument()
      expect(websiteInput).toHaveAttribute('type', 'url')
    })

    test('should call handleChange when event_website input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const websiteInput = document.getElementById('event_website') as HTMLInputElement
      fireEvent.change(websiteInput, { target: { value: 'https://evento.com' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_website', 'https://evento.com')
    })
  })

  describe('section 6: images', () => {
    test('should render image URL inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/^logo$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/imagen principal/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/imagen responsive/i)).toBeInTheDocument()
    })

    test('should render help text about image URLs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByText(/por ahora ingresa urls de imágenes/i)).toBeInTheDocument()
    })

    test('should call handleChange when logo_url input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const logoInput = document.getElementById('logo_url') as HTMLInputElement
      fireEvent.change(logoInput, { target: { value: 'https://ejemplo.com/nuevo-logo.png' } })

      expect(mockHandleChange).toHaveBeenCalledWith('logo_url', 'https://ejemplo.com/nuevo-logo.png')
    })

    test('should call handleChange when featured_image input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const imageInput = document.getElementById('featured_image') as HTMLInputElement
      fireEvent.change(imageInput, { target: { value: 'https://ejemplo.com/nueva-imagen.jpg' } })

      expect(mockHandleChange).toHaveBeenCalledWith('featured_image', 'https://ejemplo.com/nueva-imagen.jpg')
    })

    test('should call handleChange when responsive_image_url input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const responsiveInput = document.getElementById('responsive_image_url') as HTMLInputElement
      fireEvent.change(responsiveInput, { target: { value: 'https://ejemplo.com/mobile.jpg' } })

      expect(mockHandleChange).toHaveBeenCalledWith('responsive_image_url', 'https://ejemplo.com/mobile.jpg')
    })
  })

  describe('input interactions', () => {
    test('should call handleChange when title input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      fireEvent.change(titleInput, { target: { value: 'Nuevo Evento' } })

      expect(mockHandleChange).toHaveBeenCalledWith('title', 'Nuevo Evento')
    })

    test('should call handleChange when description textarea changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const descriptionInput = screen.getByLabelText(/descripción/i)
      fireEvent.change(descriptionInput, { target: { value: 'Nueva descripción' } })

      expect(mockHandleChange).toHaveBeenCalledWith('description', 'Nueva descripción')
    })

    test('should call handleChange when edition_number input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const editionInput = document.getElementById('edition_number') as HTMLInputElement
      fireEvent.change(editionInput, { target: { value: '15ta Edición' } })

      expect(mockHandleChange).toHaveBeenCalledWith('edition_number', '15ta Edición')
    })
  })

  describe('error display', () => {
    test('should display general error message', () => {
      const errors: EventFormErrors = {
        general: 'Error al guardar el evento'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Error al guardar el evento')).toBeInTheDocument()
    })

    test('should display title error message', () => {
      const errors: EventFormErrors = {
        title: 'El título es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('El título es requerido')).toBeInTheDocument()
    })

    test('should display description error message', () => {
      const errors: EventFormErrors = {
        description: 'La descripción es requerida'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
    })

    test('should display event_type_id error message', () => {
      const errors: EventFormErrors = {
        event_type_id: 'El tipo de evento es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('El tipo de evento es requerido')).toBeInTheDocument()
    })

    test('should display event_subtype_id error message', () => {
      const errors: EventFormErrors = {
        event_subtype_id: 'El subtipo de evento es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('El subtipo de evento es requerido')).toBeInTheDocument()
    })

    test('should display location_ids error message', () => {
      const errors: EventFormErrors = {
        location_ids: 'Al menos una ubicación es requerida'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Al menos una ubicación es requerida')).toBeInTheDocument()
    })

    test('should display start_date error message', () => {
      const errors: EventFormErrors = {
        start_date: 'La fecha de inicio es requerida'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La fecha de inicio es requerida')).toBeInTheDocument()
    })

    test('should display end_date error message', () => {
      const errors: EventFormErrors = {
        end_date: 'La fecha de fin debe ser posterior'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La fecha de fin debe ser posterior')).toBeInTheDocument()
    })

    test('should display multiple errors simultaneously', () => {
      const errors: EventFormErrors = {
        general: 'Error general',
        title: 'Error de título',
        description: 'Error de descripción',
        start_date: 'Error de fecha'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Error general')).toBeInTheDocument()
      expect(screen.getByText('Error de título')).toBeInTheDocument()
      expect(screen.getByText('Error de descripción')).toBeInTheDocument()
      expect(screen.getByText('Error de fecha')).toBeInTheDocument()
    })

    test('should style error messages with error color', () => {
      const errors: EventFormErrors = {
        title: 'El título es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      const errorMessage = screen.getByText('El título es requerido')
      expect(errorMessage).toHaveClass('text-error-600')
    })
  })

  describe('loading state', () => {
    test('should disable all inputs when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(document.getElementById('title')).toBeDisabled()
      expect(document.getElementById('description')).toBeDisabled()
      expect(document.getElementById('event_type_id')).toBeDisabled()
      expect(document.getElementById('event_subtype_id')).toBeDisabled()
    })

    test('should disable checkboxes when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(screen.getByLabelText(/transmisión virtual/i)).toBeDisabled()
      expect(screen.getByLabelText(/agregar ubicación personalizada/i)).toBeDisabled()
    })

    test('should disable submit button when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled()
    })

    test('should disable cancel button when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    })

    test('should disable async date buttons when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} formData={filledFormData} />)

      expect(screen.getByRole('button', { name: /agregar/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeDisabled()
    })
  })

  describe('create mode vs edit mode', () => {
    test('should show "Crear Evento" button text in create mode', () => {
      render(<OrganizerEventForm {...defaultProps} isEditMode={false} />)

      expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
    })

    test('should show "Actualizar Evento" button text in edit mode', () => {
      render(<OrganizerEventForm {...defaultProps} isEditMode={true} />)

      expect(screen.getByRole('button', { name: /actualizar evento/i })).toBeInTheDocument()
    })

    test('should show "Creando..." when loading in create mode', () => {
      render(<OrganizerEventForm {...defaultProps} isEditMode={false} loading={true} />)

      expect(screen.getByRole('button', { name: /creando/i })).toBeInTheDocument()
    })

    test('should show "Actualizando..." when loading in edit mode', () => {
      render(<OrganizerEventForm {...defaultProps} isEditMode={true} loading={true} />)

      expect(screen.getByRole('button', { name: /actualizando/i })).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    test('should call handleSubmit when form is submitted', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(mockHandleSubmit).toHaveBeenCalled()
    })

    test('should call handleCancel when cancel button is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)

      expect(mockHandleCancel).toHaveBeenCalled()
    })
  })

  describe('form values display', () => {
    test('should display filled form data correctly', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(document.getElementById('title')).toHaveValue('Festival de Jazz')
      expect(document.getElementById('description')).toHaveValue('Un evento increíble de música jazz')
      expect(document.getElementById('edition_number')).toHaveValue('10ma Edición')
    })

    test('should display date values', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(document.getElementById('start_date')).toHaveValue('2025-12-15T18:00')
      expect(document.getElementById('end_date')).toHaveValue('2025-12-16T22:00')
    })

    test('should display selected locations as chips', () => {
      // AsyncSearchableMultiSelect needs selectedLocations prop to display chips
      const selectedLocations = [{ id: 1, name: 'Plaza Independencia' }]
      render(
        <OrganizerEventForm
          {...defaultProps}
          formData={filledFormData}
          selectedLocations={selectedLocations}
        />
      )

      // AsyncSearchableMultiSelect shows selected options as chips with the location name
      expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
    })

    test('should display attendance values', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByLabelText(/asistencia locales/i)).toHaveValue(500)
      expect(screen.getByLabelText(/asistencia nacionales/i)).toHaveValue(200)
      expect(screen.getByLabelText(/asistencia extranjeros/i)).toHaveValue(50)
    })

    test('should display image URLs', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByLabelText(/^logo$/i)).toHaveValue('https://ejemplo.com/logo.png')
      expect(screen.getByLabelText(/imagen principal/i)).toHaveValue('https://ejemplo.com/imagen.jpg')
      expect(screen.getByLabelText(/imagen responsive/i)).toHaveValue('https://ejemplo.com/imagen-mobile.jpg')
    })
  })

  describe('accessibility', () => {
    test('should have labels for all inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(document.getElementById('title')).toBeInTheDocument()
      expect(document.getElementById('description')).toBeInTheDocument()
      expect(document.getElementById('event_type_id')).toBeInTheDocument()
      expect(document.getElementById('event_subtype_id')).toBeInTheDocument()

      expect(document.querySelector('label[for="title"]')).toBeInTheDocument()
      expect(document.querySelector('label[for="description"]')).toBeInTheDocument()
    })

    test('should mark required fields with asterisk', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByText(/nombre del evento \*/i)).toBeInTheDocument()
      expect(screen.getByText(/descripción \*/i)).toBeInTheDocument()
      // Use anchor ^ to avoid matching "Subtipo de Evento *" as well
      expect(screen.getByText(/^tipo de evento \*/i)).toBeInTheDocument()
      expect(screen.getByText(/^subtipo de evento \*/i)).toBeInTheDocument()
      // Category is now optional (Dec 2, 2025)
    })

    test('should have proper form structure', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('space-y-8')
    })
  })

  describe('edge cases', () => {
    test('should handle empty selectedLocations gracefully', () => {
      render(<OrganizerEventForm {...defaultProps} selectedLocations={[]} />)

      // Should not crash
      expect(screen.getByText('2. Ubicación')).toBeInTheDocument()
    })

    test('should handle form with no errors object', () => {
      render(<OrganizerEventForm {...defaultProps} errors={{}} />)

      expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
    })

    test('should handle rapid input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const titleInput = screen.getByLabelText(/nombre del evento/i)

      fireEvent.change(titleInput, { target: { value: 'A' } })
      fireEvent.change(titleInput, { target: { value: 'AB' } })
      fireEvent.change(titleInput, { target: { value: 'ABC' } })

      expect(mockHandleChange).toHaveBeenCalledTimes(3)
      expect(mockHandleChange).toHaveBeenLastCalledWith('title', 'ABC')
    })
  })
})
