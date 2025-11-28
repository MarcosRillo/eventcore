/**
 * Tests for OrganizerEventForm (Dumb Component)
 *
 * Comprehensive tests covering all form sections, inputs, selects,
 * checkboxes, asynchronous dates, loading states, and error handling.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizerEventForm } from '../OrganizerEventForm'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

// Mock crypto.randomUUID for asynchronous dates
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
})

describe('OrganizerEventForm', () => {
  const mockHandleChange = jest.fn()
  const mockHandleSubmit = jest.fn((e) => e.preventDefault())
  const mockHandleCancel = jest.fn()

  const mockCategories = [
    { id: 1, name: 'Música' },
    { id: 2, name: 'Gastronomía' },
    { id: 3, name: 'Tecnología' }
  ]

  const mockLocations = [
    { id: 1, name: 'Plaza Independencia' },
    { id: 2, name: 'Parque 9 de Julio' }
  ]

  const emptyFormData: EventFormData = {
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    category_id: null,
    location_id: null,
    edition_number: '',
    event_type: '',
    event_subtype: '',
    origin: '',
    theme: '',
    frequency: '',
    rotation_type: '',
    coffee_break: false,
    lunch_catering: false,
    dinner_catering: false,
    pre_event_package: false,
    post_event_package: false,
    venue: '',
    city: '',
    rooms_used: '',
    maps_url: '',
    previous_venue: '',
    next_venue: '',
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,
    producer: '',
    event_website: '',
    logo_url: '',
    image_url: '',
    responsive_image_url: '',
    asynchronous_dates: []
  }

  const filledFormData: EventFormData = {
    ...emptyFormData,
    title: 'Festival de Jazz',
    description: 'Un evento increíble de música jazz',
    event_date: '2025-12-15',
    end_date: '2025-12-16',
    start_time: '18:00',
    end_time: '22:00',
    category_id: 1,
    location_id: 1,
    edition_number: '10ma Edición',
    event_type: 'festival',
    event_subtype: 'internacional',
    origin: 'privado',
    theme: 'cultura',
    frequency: 'anual',
    rotation_type: 'fija',
    coffee_break: true,
    lunch_catering: true,
    dinner_catering: false,
    pre_event_package: true,
    post_event_package: false,
    venue: 'Centro de Convenciones',
    city: 'San Miguel de Tucumán',
    rooms_used: 'Salón Principal, Sala A',
    maps_url: 'https://maps.google.com/test',
    previous_venue: 'Buenos Aires 2024',
    next_venue: 'Córdoba 2026',
    local_attendance: '500',
    national_attendance: '200',
    international_attendance: '50',
    virtual_transmission: true,
    producer: 'Empresa Productora XYZ',
    event_website: 'https://festival.com',
    logo_url: 'https://ejemplo.com/logo.png',
    image_url: 'https://ejemplo.com/imagen.jpg',
    responsive_image_url: 'https://ejemplo.com/imagen-mobile.jpg',
    asynchronous_dates: [
      { id: 'async-1', date: '2025-12-20', start_time: '10:00', end_time: '14:00' }
    ]
  }

  const defaultProps = {
    formData: emptyFormData,
    errors: {} as EventFormErrors,
    loading: false,
    initialLoading: false,
    categories: mockCategories,
    locations: mockLocations,
    isEditMode: false,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    handleCancel: mockHandleCancel
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
    test('should render all 7 form sections', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByText('1. Información Básica')).toBeInTheDocument()
      expect(screen.getByText('2. Servicios y Catering')).toBeInTheDocument()
      expect(screen.getByText('3. Ubicación')).toBeInTheDocument()
      expect(screen.getByText('4. Fechas y Horarios')).toBeInTheDocument()
      expect(screen.getByText('5. Asistencia')).toBeInTheDocument()
      expect(screen.getByText('6. Información Adicional')).toBeInTheDocument()
      expect(screen.getByText('7. Imágenes')).toBeInTheDocument()
    })

    test('should render section headers with proper styling', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const sectionHeaders = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeaders).toHaveLength(7)
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

    test('should render event type select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const eventTypeSelect = document.getElementById('event_type') as HTMLSelectElement
      expect(eventTypeSelect).toBeInTheDocument()

      const options = eventTypeSelect.querySelectorAll('option')
      expect(options).toHaveLength(8) // Including placeholder
      expect(screen.getByRole('option', { name: 'Congreso' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Seminario' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Workshop' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Festival' })).toBeInTheDocument()
    })

    test('should render event subtype select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const subtypeSelect = screen.getByLabelText(/subtipo de evento/i)
      expect(subtypeSelect).toBeInTheDocument()

      expect(screen.getByText('Nacional')).toBeInTheDocument()
      expect(screen.getByText('Internacional')).toBeInTheDocument()
      expect(screen.getByText('Regional')).toBeInTheDocument()
      expect(screen.getByText('Local')).toBeInTheDocument()
    })

    test('should render origin select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const originSelect = screen.getByLabelText(/origen/i)
      expect(originSelect).toBeInTheDocument()

      expect(screen.getByText('Público')).toBeInTheDocument()
      expect(screen.getByText('Privado')).toBeInTheDocument()
      expect(screen.getByText('Mixto')).toBeInTheDocument()
    })

    test('should render theme select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const themeSelect = document.getElementById('theme') as HTMLSelectElement
      expect(themeSelect).toBeInTheDocument()

      const options = themeSelect.querySelectorAll('option')
      expect(options.length).toBeGreaterThanOrEqual(8) // Including placeholder + themes
      // Check options exist within the select element
      expect(themeSelect.querySelector('option[value="tecnologia"]')).toBeInTheDocument()
      expect(themeSelect.querySelector('option[value="ciencia"]')).toBeInTheDocument()
      expect(themeSelect.querySelector('option[value="negocios"]')).toBeInTheDocument()
      expect(themeSelect.querySelector('option[value="turismo"]')).toBeInTheDocument()
    })

    test('should render frequency select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const frequencySelect = screen.getByLabelText(/frecuencia/i)
      expect(frequencySelect).toBeInTheDocument()

      expect(screen.getByText('Único')).toBeInTheDocument()
      expect(screen.getByText('Anual')).toBeInTheDocument()
      expect(screen.getByText('Semestral')).toBeInTheDocument()
      expect(screen.getByText('Mensual')).toBeInTheDocument()
    })

    test('should render rotation type select with all options', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const rotationSelect = screen.getByLabelText(/tipo de rotación/i)
      expect(rotationSelect).toBeInTheDocument()

      expect(screen.getByText('Sede Fija')).toBeInTheDocument()
      expect(screen.getByText('Rotativa Regional')).toBeInTheDocument()
      expect(screen.getByText('Rotativa Nacional')).toBeInTheDocument()
      expect(screen.getByText('Rotativa Internacional')).toBeInTheDocument()
    })

    test('should render category select with provided categories', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const categorySelect = document.getElementById('category_id') as HTMLSelectElement
      expect(categorySelect).toBeInTheDocument()

      expect(categorySelect.querySelector('option[value=""]')).toHaveTextContent('Seleccionar categoría')
      expect(categorySelect.querySelector('option[value="1"]')).toHaveTextContent('Música')
      expect(categorySelect.querySelector('option[value="2"]')).toHaveTextContent('Gastronomía')
    })

    test('should render location select with provided locations', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const locationSelect = screen.getByLabelText(/ubicación/i)
      expect(locationSelect).toBeInTheDocument()

      expect(screen.getByText('Seleccionar ubicación')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Plaza Independencia' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Parque 9 de Julio' })).toBeInTheDocument()
    })

    test('should handle empty categories array', () => {
      render(<OrganizerEventForm {...defaultProps} categories={[]} />)

      const categorySelect = screen.getByLabelText(/categoría/i)
      const options = categorySelect.querySelectorAll('option')
      expect(options).toHaveLength(1) // Only placeholder
    })

    test('should handle empty locations array', () => {
      render(<OrganizerEventForm {...defaultProps} locations={[]} />)

      const locationSelect = screen.getByLabelText(/ubicación/i)
      const options = locationSelect.querySelectorAll('option')
      expect(options).toHaveLength(1) // Only placeholder
    })
  })

  describe('section 2: services and catering', () => {
    test('should render all service checkboxes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/mesas de coffee break/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/catering de almuerzo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/catering de cena/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/paquete pre-evento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/paquete post-evento/i)).toBeInTheDocument()
    })

    test('should render checkboxes as unchecked by default', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/mesas de coffee break/i)).not.toBeChecked()
      expect(screen.getByLabelText(/catering de almuerzo/i)).not.toBeChecked()
      expect(screen.getByLabelText(/catering de cena/i)).not.toBeChecked()
    })

    test('should render checkboxes as checked when formData has true values', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByLabelText(/mesas de coffee break/i)).toBeChecked()
      expect(screen.getByLabelText(/catering de almuerzo/i)).toBeChecked()
      expect(screen.getByLabelText(/catering de cena/i)).not.toBeChecked()
    })

    test('should call handleChange when checkbox is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const coffeeBreakCheckbox = screen.getByLabelText(/mesas de coffee break/i)
      fireEvent.click(coffeeBreakCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('coffee_break', true)
    })

    test('should call handleChange for lunch_catering checkbox', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const lunchCheckbox = screen.getByLabelText(/catering de almuerzo/i)
      fireEvent.click(lunchCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('lunch_catering', true)
    })

    test('should call handleChange for dinner_catering checkbox', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const dinnerCheckbox = screen.getByLabelText(/catering de cena/i)
      fireEvent.click(dinnerCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('dinner_catering', true)
    })

    test('should call handleChange for pre_event_package checkbox', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const preEventCheckbox = screen.getByLabelText(/paquete pre-evento/i)
      fireEvent.click(preEventCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('pre_event_package', true)
    })

    test('should call handleChange for post_event_package checkbox', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const postEventCheckbox = screen.getByLabelText(/paquete post-evento/i)
      fireEvent.click(postEventCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('post_event_package', true)
    })
  })

  describe('section 3: location', () => {
    test('should render venue input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const venueInput = screen.getByLabelText(/sede \*/i)
      expect(venueInput).toBeInTheDocument()
      expect(venueInput).toHaveAttribute('placeholder', 'Ej: Centro de Convenciones')
    })

    test('should render city input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const cityInput = screen.getByLabelText(/ciudad \*/i)
      expect(cityInput).toBeInTheDocument()
      expect(cityInput).toHaveAttribute('placeholder', 'Ej: San Miguel de Tucumán')
    })

    test('should render rooms used input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const roomsInput = screen.getByLabelText(/salón\/salones utilizados/i)
      expect(roomsInput).toBeInTheDocument()
    })

    test('should render maps url input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const mapsInput = screen.getByLabelText(/maps/i)
      expect(mapsInput).toBeInTheDocument()
    })

    test('should render previous and next venue inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByLabelText(/última sede/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/próxima sede/i)).toBeInTheDocument()
    })

    test('should call handleChange when venue input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const venueInput = document.getElementById('venue') as HTMLInputElement
      fireEvent.change(venueInput, { target: { value: 'Nuevo Centro' } })

      expect(mockHandleChange).toHaveBeenCalledWith('venue', 'Nuevo Centro')
    })

    test('should call handleChange when city input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const cityInput = document.getElementById('city') as HTMLInputElement
      fireEvent.change(cityInput, { target: { value: 'Buenos Aires' } })

      expect(mockHandleChange).toHaveBeenCalledWith('city', 'Buenos Aires')
    })

    test('should call handleChange when rooms_used input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const roomsInput = document.getElementById('rooms_used') as HTMLInputElement
      fireEvent.change(roomsInput, { target: { value: 'Salón A, Salón B' } })

      expect(mockHandleChange).toHaveBeenCalledWith('rooms_used', 'Salón A, Salón B')
    })

    test('should call handleChange when maps_url input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

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

  describe('section 4: dates and times', () => {
    test('should render date inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startDateInput = screen.getByLabelText(/fecha desde/i)
      const endDateInput = screen.getByLabelText(/fecha hasta/i)

      expect(startDateInput).toBeInTheDocument()
      expect(startDateInput).toHaveAttribute('type', 'date')
      expect(endDateInput).toBeInTheDocument()
      expect(endDateInput).toHaveAttribute('type', 'date')
    })

    test('should render time inputs', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startTimeInput = screen.getByLabelText(/hora desde/i)
      const endTimeInput = screen.getByLabelText(/hora hasta/i)

      expect(startTimeInput).toBeInTheDocument()
      expect(startTimeInput).toHaveAttribute('type', 'time')
      expect(endTimeInput).toBeInTheDocument()
      expect(endTimeInput).toHaveAttribute('type', 'time')
    })

    test('should render asynchronous dates section', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      expect(screen.getByText(/fechas asincrónicas/i)).toBeInTheDocument()
      expect(screen.getByText(/agrega fechas adicionales/i)).toBeInTheDocument()
    })

    test('should render asynchronous dates add form', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // The add button for async dates
      expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument()
    })

    test('should render existing asynchronous dates', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByText('2025-12-20')).toBeInTheDocument()
      expect(screen.getByText(/10:00 - 14:00/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })

    test('should disable add button when async date fields are empty', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /agregar/i })
      expect(addButton).toBeDisabled()
    })
  })

  describe('section 5: attendance', () => {
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

    test('should call handleChange when national_attendance input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const nationalInput = document.getElementById('national_attendance') as HTMLInputElement
      fireEvent.change(nationalInput, { target: { value: '250' } })

      expect(mockHandleChange).toHaveBeenCalledWith('national_attendance', '250')
    })

    test('should call handleChange when international_attendance input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const internationalInput = document.getElementById('international_attendance') as HTMLInputElement
      fireEvent.change(internationalInput, { target: { value: '50' } })

      expect(mockHandleChange).toHaveBeenCalledWith('international_attendance', '50')
    })

    test('should call handleChange when virtual_transmission checkbox is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const virtualCheckbox = screen.getByLabelText(/transmisión virtual/i)
      fireEvent.click(virtualCheckbox)

      expect(mockHandleChange).toHaveBeenCalledWith('virtual_transmission', true)
    })
  })

  describe('section 6: additional information', () => {
    test('should render producer input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const producerInput = screen.getByLabelText(/productor/i)
      expect(producerInput).toBeInTheDocument()
      expect(producerInput).toHaveAttribute('placeholder', 'Ej: Empresa Productora XYZ')
    })

    test('should render event website input', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const websiteInput = screen.getByLabelText(/web del evento/i)
      expect(websiteInput).toBeInTheDocument()
      expect(websiteInput).toHaveAttribute('type', 'url')
    })

    test('should call handleChange when producer input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const producerInput = document.getElementById('producer') as HTMLInputElement
      fireEvent.change(producerInput, { target: { value: 'Nueva Empresa' } })

      expect(mockHandleChange).toHaveBeenCalledWith('producer', 'Nueva Empresa')
    })

    test('should call handleChange when event_website input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const websiteInput = document.getElementById('event_website') as HTMLInputElement
      fireEvent.change(websiteInput, { target: { value: 'https://evento.com' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_website', 'https://evento.com')
    })
  })

  describe('section 7: images', () => {
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

    test('should call handleChange when image_url input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const imageInput = document.getElementById('image_url') as HTMLInputElement
      fireEvent.change(imageInput, { target: { value: 'https://ejemplo.com/nueva-imagen.jpg' } })

      expect(mockHandleChange).toHaveBeenCalledWith('image_url', 'https://ejemplo.com/nueva-imagen.jpg')
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

    test('should call handleChange when event type select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const eventTypeSelect = document.getElementById('event_type') as HTMLSelectElement
      fireEvent.change(eventTypeSelect, { target: { value: 'congreso' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_type', 'congreso')
    })

    test('should call handleChange with parsed number for category_id', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const categorySelect = screen.getByLabelText(/categoría/i)
      fireEvent.change(categorySelect, { target: { value: '2' } })

      expect(mockHandleChange).toHaveBeenCalledWith('category_id', 2)
    })

    test('should call handleChange with null for empty category_id', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const categorySelect = screen.getByLabelText(/categoría/i)
      fireEvent.change(categorySelect, { target: { value: '' } })

      expect(mockHandleChange).toHaveBeenCalledWith('category_id', null)
    })

    test('should call handleChange with parsed number for location_id', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const locationSelect = screen.getByLabelText(/ubicación/i)
      fireEvent.change(locationSelect, { target: { value: '1' } })

      expect(mockHandleChange).toHaveBeenCalledWith('location_id', 1)
    })

    test('should call handleChange when date inputs change', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startDateInput = screen.getByLabelText(/fecha desde/i)
      fireEvent.change(startDateInput, { target: { value: '2025-12-20' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_date', '2025-12-20')
    })

    test('should call handleChange when time inputs change', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const startTimeInput = screen.getByLabelText(/hora desde/i)
      fireEvent.change(startTimeInput, { target: { value: '19:00' } })

      expect(mockHandleChange).toHaveBeenCalledWith('start_time', '19:00')
    })

    test('should call handleChange when end_date input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const endDateInput = document.getElementById('end_date') as HTMLInputElement
      fireEvent.change(endDateInput, { target: { value: '2025-12-20' } })

      expect(mockHandleChange).toHaveBeenCalledWith('end_date', '2025-12-20')
    })

    test('should call handleChange when end_time input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const endTimeInput = document.getElementById('end_time') as HTMLInputElement
      fireEvent.change(endTimeInput, { target: { value: '23:00' } })

      expect(mockHandleChange).toHaveBeenCalledWith('end_time', '23:00')
    })

    test('should call handleChange when edition_number input changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const editionInput = document.getElementById('edition_number') as HTMLInputElement
      fireEvent.change(editionInput, { target: { value: '15ta Edición' } })

      expect(mockHandleChange).toHaveBeenCalledWith('edition_number', '15ta Edición')
    })

    test('should call handleChange when event_subtype select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const subtypeSelect = document.getElementById('event_subtype') as HTMLSelectElement
      fireEvent.change(subtypeSelect, { target: { value: 'regional' } })

      expect(mockHandleChange).toHaveBeenCalledWith('event_subtype', 'regional')
    })

    test('should call handleChange when origin select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const originSelect = document.getElementById('origin') as HTMLSelectElement
      fireEvent.change(originSelect, { target: { value: 'mixto' } })

      expect(mockHandleChange).toHaveBeenCalledWith('origin', 'mixto')
    })

    test('should call handleChange when theme select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const themeSelect = document.getElementById('theme') as HTMLSelectElement
      fireEvent.change(themeSelect, { target: { value: 'ciencia' } })

      expect(mockHandleChange).toHaveBeenCalledWith('theme', 'ciencia')
    })

    test('should call handleChange when frequency select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const frequencySelect = document.getElementById('frequency') as HTMLSelectElement
      fireEvent.change(frequencySelect, { target: { value: 'mensual' } })

      expect(mockHandleChange).toHaveBeenCalledWith('frequency', 'mensual')
    })

    test('should call handleChange when rotation_type select changes', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const rotationSelect = document.getElementById('rotation_type') as HTMLSelectElement
      fireEvent.change(rotationSelect, { target: { value: 'rotativa_regional' } })

      expect(mockHandleChange).toHaveBeenCalledWith('rotation_type', 'rotativa_regional')
    })
  })

  describe('asynchronous dates functionality', () => {
    test('should add asynchronous date when form is filled and button clicked', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // Fill the async date form fields
      const dateInputs = document.querySelectorAll('input[type="date"]')
      const timeInputs = document.querySelectorAll('input[type="time"]')

      // The async date inputs are the last date/time inputs
      const asyncDateInput = dateInputs[2] // Third date input (after start and end date)
      const asyncStartTimeInput = timeInputs[2] // Third time input
      const asyncEndTimeInput = timeInputs[3] // Fourth time input

      fireEvent.change(asyncDateInput, { target: { value: '2025-12-25' } })
      fireEvent.change(asyncStartTimeInput, { target: { value: '09:00' } })
      fireEvent.change(asyncEndTimeInput, { target: { value: '12:00' } })

      const addButton = screen.getByRole('button', { name: /agregar/i })
      fireEvent.click(addButton)

      expect(mockHandleChange).toHaveBeenCalledWith(
        'asynchronous_dates',
        expect.arrayContaining([
          expect.objectContaining({
            date: '2025-12-25',
            start_time: '09:00',
            end_time: '12:00'
          })
        ])
      )
    })

    test('should remove asynchronous date when delete button is clicked', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      fireEvent.click(deleteButton)

      expect(mockHandleChange).toHaveBeenCalledWith('asynchronous_dates', [])
    })

    test('should not add async date when fields are incomplete', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // Only fill date, not times
      const dateInputs = document.querySelectorAll('input[type="date"]')
      const asyncDateInput = dateInputs[2]
      fireEvent.change(asyncDateInput, { target: { value: '2025-12-25' } })

      const addButton = screen.getByRole('button', { name: /agregar/i })
      fireEvent.click(addButton)

      // handleChange should NOT be called for asynchronous_dates since fields are incomplete
      const asyncDatesCalls = mockHandleChange.mock.calls.filter(
        call => call[0] === 'asynchronous_dates'
      )
      expect(asyncDatesCalls).toHaveLength(0)
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

    test('should display category error message', () => {
      const errors: EventFormErrors = {
        category_id: 'Seleccione una categoría'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Seleccione una categoría')).toBeInTheDocument()
    })

    test('should display location error message', () => {
      const errors: EventFormErrors = {
        location_id: 'Seleccione una ubicación'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Seleccione una ubicación')).toBeInTheDocument()
    })

    test('should display date error messages', () => {
      const errors: EventFormErrors = {
        event_date: 'La fecha es requerida',
        end_date: 'La fecha de fin debe ser posterior'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La fecha es requerida')).toBeInTheDocument()
      expect(screen.getByText('La fecha de fin debe ser posterior')).toBeInTheDocument()
    })

    test('should display time error messages', () => {
      const errors: EventFormErrors = {
        start_time: 'La hora de inicio es requerida',
        end_time: 'La hora de fin es requerida'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La hora de inicio es requerida')).toBeInTheDocument()
      expect(screen.getByText('La hora de fin es requerida')).toBeInTheDocument()
    })

    test('should display venue and city error messages', () => {
      const errors: EventFormErrors = {
        venue: 'La sede es requerida',
        city: 'La ciudad es requerida'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('La sede es requerida')).toBeInTheDocument()
      expect(screen.getByText('La ciudad es requerida')).toBeInTheDocument()
    })

    test('should display event_type error message', () => {
      const errors: EventFormErrors = {
        event_type: 'El tipo de evento es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('El tipo de evento es requerido')).toBeInTheDocument()
    })

    test('should display edition_number error message', () => {
      const errors: EventFormErrors = {
        edition_number: 'Número de edición inválido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Número de edición inválido')).toBeInTheDocument()
    })

    test('should display multiple errors simultaneously', () => {
      const errors: EventFormErrors = {
        general: 'Error general',
        title: 'Error de título',
        description: 'Error de descripción',
        event_date: 'Error de fecha'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      expect(screen.getByText('Error general')).toBeInTheDocument()
      expect(screen.getByText('Error de título')).toBeInTheDocument()
      expect(screen.getByText('Error de descripción')).toBeInTheDocument()
      expect(screen.getByText('Error de fecha')).toBeInTheDocument()
    })

    test('should style error messages with red color', () => {
      const errors: EventFormErrors = {
        title: 'El título es requerido'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      const errorMessage = screen.getByText('El título es requerido')
      expect(errorMessage).toHaveClass('text-red-600')
    })

    test('should style general error with red background', () => {
      const errors: EventFormErrors = {
        general: 'Error al guardar el evento'
      }

      render(<OrganizerEventForm {...defaultProps} errors={errors} />)

      const errorContainer = screen.getByText('Error al guardar el evento').closest('div')
      expect(errorContainer).toHaveClass('bg-red-50', 'border-red-600')
    })
  })

  describe('loading state', () => {
    test('should disable all inputs when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(document.getElementById('title')).toBeDisabled()
      expect(document.getElementById('description')).toBeDisabled()
      expect(document.getElementById('event_type')).toBeDisabled()
      expect(document.getElementById('category_id')).toBeDisabled()
      expect(document.getElementById('location_id')).toBeDisabled()
    })

    test('should disable checkboxes when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      expect(screen.getByLabelText(/mesas de coffee break/i)).toBeDisabled()
      expect(screen.getByLabelText(/catering de almuerzo/i)).toBeDisabled()
      expect(screen.getByLabelText(/transmisión virtual/i)).toBeDisabled()
    })

    test('should disable submit button when loading is true', () => {
      render(<OrganizerEventForm {...defaultProps} loading={true} />)

      // When loading is true in create mode, button shows "Creando..."
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

    test('should prevent default on submit', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      expect(mockHandleSubmit).toHaveBeenCalled()
    })
  })

  describe('form values display', () => {
    test('should display filled form data correctly', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(document.getElementById('title')).toHaveValue('Festival de Jazz')
      expect(document.getElementById('description')).toHaveValue('Un evento increíble de música jazz')
      expect(document.getElementById('edition_number')).toHaveValue('10ma Edición')
      expect(document.getElementById('event_type')).toHaveValue('festival')
      expect(document.getElementById('event_subtype')).toHaveValue('internacional')
    })

    test('should display date and time values', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByLabelText(/fecha desde/i)).toHaveValue('2025-12-15')
      expect(screen.getByLabelText(/fecha hasta/i)).toHaveValue('2025-12-16')
      expect(screen.getByLabelText(/hora desde/i)).toHaveValue('18:00')
      expect(screen.getByLabelText(/hora hasta/i)).toHaveValue('22:00')
    })

    test('should display location information', () => {
      render(<OrganizerEventForm {...defaultProps} formData={filledFormData} />)

      expect(screen.getByLabelText(/sede \*/i)).toHaveValue('Centro de Convenciones')
      expect(screen.getByLabelText(/ciudad \*/i)).toHaveValue('San Miguel de Tucumán')
      expect(screen.getByLabelText(/salón\/salones utilizados/i)).toHaveValue('Salón Principal, Sala A')
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

      // Check that all required fields have labels using IDs
      expect(document.getElementById('title')).toBeInTheDocument()
      expect(document.getElementById('description')).toBeInTheDocument()
      expect(document.getElementById('event_type')).toBeInTheDocument()
      expect(document.getElementById('category_id')).toBeInTheDocument()
      expect(document.getElementById('location_id')).toBeInTheDocument()

      // Verify labels exist
      expect(document.querySelector('label[for="title"]')).toBeInTheDocument()
      expect(document.querySelector('label[for="description"]')).toBeInTheDocument()
      expect(document.querySelector('label[for="event_type"]')).toBeInTheDocument()
    })

    test('should mark required fields with asterisk', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      // Labels with asterisks indicate required fields
      expect(screen.getByText(/nombre del evento \*/i)).toBeInTheDocument()
      expect(screen.getByText(/descripción \*/i)).toBeInTheDocument()
      expect(screen.getByText(/categoría \*/i)).toBeInTheDocument()
    })

    test('should have proper form structure', () => {
      render(<OrganizerEventForm {...defaultProps} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('space-y-8')
    })
  })

  describe('edge cases', () => {
    test('should handle undefined categories gracefully', () => {
      render(<OrganizerEventForm {...defaultProps} categories={undefined as unknown as { id: number; name: string }[]} />)

      const categorySelect = screen.getByLabelText(/categoría/i)
      expect(categorySelect).toBeInTheDocument()
    })

    test('should handle undefined locations gracefully', () => {
      render(<OrganizerEventForm {...defaultProps} locations={undefined as unknown as { id: number; name: string }[]} />)

      const locationSelect = screen.getByLabelText(/ubicación/i)
      expect(locationSelect).toBeInTheDocument()
    })

    test('should handle form with no errors object', () => {
      render(<OrganizerEventForm {...defaultProps} errors={{}} />)

      // Should not throw and render normally
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
