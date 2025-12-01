/**
 * Integration tests for OrganizerEventFormContainer
 * Tests the smart component that combines the form with useEventForm hook
 * Updated for 3NF schema (Nov 30, 2025)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import * as categoryService from '@/features/categories/services/category.service'
import * as locationService from '@/features/locations/services/location.service'

jest.mock('../services/organizer-event.service')
jest.mock('@/features/categories/services/category.service')
jest.mock('@/features/locations/services/location.service')

const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('OrganizerEventForm', () => {
  const mockCategories = [
    { id: 1, name: 'Música' },
    { id: 2, name: 'Gastronomía' }
  ]

  const mockLocations = [
    { id: 1, name: 'Plaza Independencia' },
    { id: 2, name: 'Parque 9 de Julio' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockBack.mockClear()

    ;(categoryService.getCategories as jest.Mock).mockResolvedValue({
      data: mockCategories
    })
    ;(locationService.getLocations as jest.Mock).mockResolvedValue({
      data: { data: mockLocations }
    })
  })

  describe('Initial Render', () => {
    test('should render all form fields in create mode', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })
    })

    test('should load categories and locations on mount', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })
    })
  })

  describe('Validation', () => {
    test('should show validation errors for required fields when submitted empty', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })

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
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const startDateInput = document.getElementById('start_date') as HTMLInputElement

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
    test('should create event with valid data', async () => {
      const mockNewEvent = {
        id: 1,
        title: 'Festival de Jazz',
        description: 'Un evento increíble',
        start_date: '2030-12-15T18:00',
        end_date: '2030-12-15T22:00',
        category_id: 1,
        locations: [{ id: 1, name: 'Plaza Independencia' }],
        status: 'draft'
      }

      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({
        data: mockNewEvent
      })

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const startDateInput = document.getElementById('start_date') as HTMLInputElement
      const endDateInput = document.getElementById('end_date') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Festival de Jazz' } })
      fireEvent.change(descInput, { target: { value: 'Un evento increíble' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })
      fireEvent.change(endDateInput, { target: { value: '2030-12-15T22:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })

      // Select location checkbox
      const locationCheckbox = screen.getByLabelText('Plaza Independencia')
      fireEvent.click(locationCheckbox)

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(organizerEventService.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Festival de Jazz',
            description: 'Un evento increíble',
            start_date: '2030-12-15T18:00',
            category_id: 1,
            location_ids: [1]
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
        category_id: 1,
        locations: [{ id: 1, name: 'Plaza Independencia' }],
        status: 'draft'
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: mockEvent
      })

      render(<OrganizerEventFormContainer eventId={1} />)

      await waitFor(() => {
        expect(organizerEventService.getEvent).toHaveBeenCalledWith(1)
      })

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        const titleInput = document.getElementById('title') as HTMLInputElement
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
        category_id: 1,
        locations: [{ id: 1, name: 'Plaza Independencia' }],
        status: 'draft'
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: mockEvent
      })

      ;(organizerEventService.updateEvent as jest.Mock).mockResolvedValue({
        data: { ...mockEvent, title: 'Updated Title' }
      })

      render(<OrganizerEventFormContainer eventId={1} />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        const titleInput = document.getElementById('title') as HTMLInputElement
        expect(titleInput.value).toBe('Original Title')
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      const submitButton = screen.getByRole('button', { name: /actualizar evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(organizerEventService.updateEvent).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            id: 1,
            title: 'Updated Title'
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
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 200))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const startDateInput = document.getElementById('start_date') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const locationCheckbox = screen.getByLabelText('Plaza Independencia')
      fireEvent.click(locationCheckbox)

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /creando/i })
        expect(button).toBeDisabled()
      })
    })

    test('should disable all form fields during submission', async () => {
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 200))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const startDateInput = document.getElementById('start_date') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const locationCheckbox = screen.getByLabelText('Plaza Independencia')
      fireEvent.click(locationCheckbox)

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const titleInputDisabled = document.getElementById('title') as HTMLInputElement
        expect(titleInputDisabled).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    test('should display error message when API call fails', async () => {
      const mockError = new Error('Network error')
      ;(organizerEventService.createEvent as jest.Mock).mockRejectedValue(mockError)

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const startDateInput = document.getElementById('start_date') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(startDateInput, { target: { value: '2030-12-15T18:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const locationCheckbox = screen.getByLabelText('Plaza Independencia')
      fireEvent.click(locationCheckbox)

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/error creating event/i)).toBeInTheDocument()
      })

      expect(titleInput).not.toBeDisabled()
    })
  })

  describe('Cancel Action', () => {
    test('should navigate back when cancel button is clicked', async () => {
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })
})
