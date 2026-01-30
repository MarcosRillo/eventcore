/**
 * Integration tests for OrganizerEventFormContainer
 * Tests the smart component that combines the form with useEventForm hook
 * Updated for 3NF schema (Nov 30, 2025)
 */

import '@testing-library/jest-dom'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as eventSubtypeService from '@/features/event-types/services/eventSubtype.service'
import * as eventTypeService from '@/features/event-types/services/eventType.service'
import * as locationService from '@/features/locations/services/location.service'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'

// Mock ResizeObserver for Headless UI Combobox
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

jest.mock('../services/organizer-event.service')
jest.mock('@/features/locations/services/location.service')
jest.mock('@/features/event-types/services/eventType.service')
jest.mock('@/features/event-types/services/eventSubtype.service')

const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Helper to setup userEvent instance
const setupUser = () => userEvent.setup()

describe('OrganizerEventForm', () => {
  const mockLocations = [
    { id: 1, name: 'Plaza Independencia' },
    { id: 2, name: 'Parque 9 de Julio' }
  ]

  // Event Types/Subtypes (required since Dec 2, 2025)
  const mockEventTypes = [
    { id: 1, name: 'Congreso', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 2, name: 'Festival', entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' }
  ]

  const mockEventSubtypes = [
    { id: 1, name: 'Internacional', event_type_id: 1, entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 2, name: 'Nacional', event_type_id: 1, entity_id: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockBack.mockClear()

    // Mock searchLocations for async location search
    ;(locationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    // Mock event types and subtypes services
    ;(eventTypeService.getActiveEventTypes as jest.Mock).mockResolvedValue(mockEventTypes)
    ;(eventSubtypeService.getActiveEventSubtypes as jest.Mock).mockResolvedValue(mockEventSubtypes)
  })

  describe('Initial Render', () => {
    test('should render all form fields in create mode', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })
    })

    test('should verify locations are async search only', async () => {
      render(<OrganizerEventFormContainer />)

      // Wait for component to complete initial async operations
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })

      // Locations are no longer pre-loaded, they are searched asynchronously
      expect(locationService.searchLocations).not.toHaveBeenCalled()
    })
  })

  describe('Validation', () => {
    test('should show validation errors for required fields when submitted empty', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el título es requerido/i)).toBeInTheDocument()
      })

      expect(organizerEventService.createEvent).not.toHaveBeenCalled()
    })

    test('should show error when date is in the past', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      const descInput = screen.getByLabelText(/descripción/i)
      const startDateInput = screen.getByLabelText(/fecha inicio/i)

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(startDateInput, { target: { value: '2020-01-01T10:00' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/la fecha de inicio debe ser en el futuro/i)).toBeInTheDocument()
      })
    })
  })

  describe('Create Mode', () => {
    test('should create event with custom location', async () => {
      const user = setupUser()
      const mockNewEvent = {
        id: 1,
        title: 'Festival de Jazz',
        description: 'Un evento increíble',
        start_date: '2030-12-15T18:00',
        end_date: '2030-12-15T22:00',
        event_type_id: 1,
        event_subtype_id: 1,
        custom_location_name: 'Salón El Jardín',
        status: 'draft'
      }

      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({
        data: mockNewEvent
      })

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      const descInput = screen.getByLabelText(/descripción/i)
      const startDateInput = screen.getByLabelText(/fecha inicio/i)
      const endDateInput = screen.getByLabelText(/fecha fin/i)

      fireEvent.change(titleInput, { target: { value: 'Festival de Jazz' } })
      fireEvent.change(descInput, { target: { value: 'Un evento increíble' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })
      fireEvent.change(endDateInput, { target: { value: '2030-12-15T22:00' } })

      // Select event type using Headless UI - userEvent triggers full event sequence
      const typeButton = screen.getByText(/Seleccionar tipo de evento/i).closest('button')!
      await user.click(typeButton)
      await waitFor(() => {
        expect(screen.getByText('Congreso')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Congreso'))

      // Wait for subtype to be enabled and select it
      await waitFor(() => {
        expect(screen.getByText(/Seleccionar subtipo/i)).toBeInTheDocument()
      })
      const subtypeButton = screen.getByText(/Seleccionar subtipo/i).closest('button')!
      await user.click(subtypeButton)
      await waitFor(() => {
        expect(screen.getByText('Internacional')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Internacional'))

      // Use custom location instead of selecting from dropdown
      const otroCheckbox = screen.getByLabelText(/agregar ubicación personalizada/i)
      await user.click(otroCheckbox)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del lugar/i)).toBeInTheDocument()
      })

      const customLocationInput = screen.getByLabelText(/nombre del lugar/i)
      fireEvent.change(customLocationInput, { target: { value: 'Salón El Jardín' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(organizerEventService.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Festival de Jazz',
            description: 'Un evento increíble',
            start_date: '2030-12-15T18:00',
            event_type_id: 1,
            event_subtype_id: 1,
            custom_location_name: 'Salón El Jardín'
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/organizer/events')
      })
    })
  })

  describe('Edit Mode', () => {
    test('should pre-populate form with event data in edit mode', async () => {
      const mockEvent = {
        id: 1,
        title: 'Existing Event',
        description: 'Existing description',
        start_date: '2030-12-15T18:00',
        end_date: '2030-12-15T22:00',
        event_type_id: 1,
        event_subtype_id: 1,
        locations: [{ id: 1, name: 'Plaza Independencia' }],
        status: 'draft'
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue(mockEvent)

      render(<OrganizerEventFormContainer eventId={1} />)

      await waitFor(() => {
        expect(organizerEventService.getEvent).toHaveBeenCalledWith(1)
      })

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/nombre del evento/i) as HTMLInputElement
        expect(titleInput).toBeInTheDocument()
        expect(titleInput.value).toBe('Existing Event')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualizar evento/i })).toBeInTheDocument()
      })
    })

    test('should update event with valid data in edit mode', async () => {
      const mockEvent = {
        id: 1,
        title: 'Original Title',
        description: 'Original description',
        start_date: '2030-12-15T18:00',
        end_date: '2030-12-15T22:00',
        event_type_id: 1,
        event_subtype_id: 1,
        locations: [{ id: 1, name: 'Plaza Independencia' }],
        status: 'draft'
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue(mockEvent)

      ;(organizerEventService.updateEvent as jest.Mock).mockResolvedValue({
        data: { ...mockEvent, title: 'Updated Title' }
      })

      render(<OrganizerEventFormContainer eventId={1} />)

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/nombre del evento/i) as HTMLInputElement
        expect(titleInput.value).toBe('Original Title')
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      const submitButton = screen.getByRole('button', { name: /actualizar evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(organizerEventService.updateEvent).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            id: 1,
            title: 'Updated Title',
            event_type_id: 1,
            event_subtype_id: 1
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/organizer/events')
      })
    })
  })

  describe('Loading States', () => {
    test('should show loading state during submission', async () => {
      const user = setupUser()
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 200))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      const descInput = screen.getByLabelText(/descripción/i)
      const startDateInput = screen.getByLabelText(/fecha inicio/i)

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })

      // Select event type using Headless UI - userEvent triggers full event sequence
      const typeButton = screen.getByText(/Seleccionar tipo de evento/i).closest('button')!
      await user.click(typeButton)
      await waitFor(() => {
        expect(screen.getByText('Congreso')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Congreso'))

      // Wait for subtype and select it
      await waitFor(() => {
        expect(screen.getByText(/Seleccionar subtipo/i)).toBeInTheDocument()
      })
      const subtypeButton = screen.getByText(/Seleccionar subtipo/i).closest('button')!
      await user.click(subtypeButton)
      await waitFor(() => {
        expect(screen.getByText('Internacional')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Internacional'))

      // Use custom location
      const otroCheckbox = screen.getByLabelText(/agregar ubicación personalizada/i)
      await user.click(otroCheckbox)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del lugar/i)).toBeInTheDocument()
      })

      const customLocationInput = screen.getByLabelText(/nombre del lugar/i)
      fireEvent.change(customLocationInput, { target: { value: 'Test Location' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // Button shows loading state with aria-busy
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /crear evento/i })
        expect(button).toHaveAttribute('aria-busy', 'true')
      })
    })

    test('should disable all form fields during submission', async () => {
      const user = setupUser()
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 200))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      const descInput = screen.getByLabelText(/descripción/i)
      const startDateInput = screen.getByLabelText(/fecha inicio/i)

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })

      // Select event type using Headless UI - userEvent triggers full event sequence
      const typeButton = screen.getByText(/Seleccionar tipo de evento/i).closest('button')!
      await user.click(typeButton)
      await waitFor(() => {
        expect(screen.getByText('Congreso')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Congreso'))

      // Wait for subtype and select it
      await waitFor(() => {
        expect(screen.getByText(/Seleccionar subtipo/i)).toBeInTheDocument()
      })
      const subtypeButton = screen.getByText(/Seleccionar subtipo/i).closest('button')!
      await user.click(subtypeButton)
      await waitFor(() => {
        expect(screen.getByText('Internacional')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Internacional'))

      // Use custom location
      const otroCheckbox = screen.getByLabelText(/agregar ubicación personalizada/i)
      await user.click(otroCheckbox)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del lugar/i)).toBeInTheDocument()
      })

      const customLocationInput = screen.getByLabelText(/nombre del lugar/i)
      fireEvent.change(customLocationInput, { target: { value: 'Test Location' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    test('should display error message when API call fails', async () => {
      const user = setupUser()
      const mockError = new Error('Network error')
      ;(organizerEventService.createEvent as jest.Mock).mockRejectedValue(mockError)

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del evento/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/nombre del evento/i)
      const descInput = screen.getByLabelText(/descripción/i)
      const startDateInput = screen.getByLabelText(/fecha inicio/i)

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })

      // Select event type using Headless UI - userEvent triggers full event sequence
      const typeButton = screen.getByText(/Seleccionar tipo de evento/i).closest('button')!
      await user.click(typeButton)
      await waitFor(() => {
        expect(screen.getByText('Congreso')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Congreso'))

      // Wait for subtype and select it
      await waitFor(() => {
        expect(screen.getByText(/Seleccionar subtipo/i)).toBeInTheDocument()
      })
      const subtypeButton = screen.getByText(/Seleccionar subtipo/i).closest('button')!
      await user.click(subtypeButton)
      await waitFor(() => {
        expect(screen.getByText('Internacional')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Internacional'))

      // Use custom location
      const otroCheckbox = screen.getByLabelText(/agregar ubicación personalizada/i)
      await user.click(otroCheckbox)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del lugar/i)).toBeInTheDocument()
      })

      const customLocationInput = screen.getByLabelText(/nombre del lugar/i)
      fireEvent.change(customLocationInput, { target: { value: 'Test Location' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/error creating event/i)).toBeInTheDocument()
      })

      // Wait for the form to be re-enabled after the transition completes
      await waitFor(() => {
        expect(titleInput).not.toBeDisabled()
      })
    })
  })

  describe('Cancel Action', () => {
    test('should navigate back when cancel button is clicked', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })
})
