import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import * as categoryService from '@/features/categories/services/category.service'
import * as locationService from '@/features/locations/services/location.service'

jest.mock('../services/organizer-event.service')
jest.mock('@/features/categories/services/category.service')
jest.mock('@/features/locations/services/location.service')

// Mock Next.js router
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

    // Default mocks for categories and locations (hook expects data.data for locations)
    ;(categoryService.getCategories as jest.Mock).mockResolvedValue({
      data: mockCategories
    })
    ;(locationService.getLocations as jest.Mock).mockResolvedValue({
      data: { data: mockLocations }
    })
  })

  describe('Initial Render', () => {
    // Test 1: Renders all form fields
    test('should render all form fields in create mode', async () => {
      // ACT
      render(<OrganizerEventFormContainer />)

      // ASSERT - Wait for form to load with categories
      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })

      // Verify form fields are present by id (more robust than label text)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })
    })

    // Test 2: Loads categories and locations on mount
    test('should load categories and locations on mount', async () => {
      // ACT
      render(<OrganizerEventFormContainer />)

      // ASSERT - Services should be called
      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })
    })
  })

  describe('Validation', () => {
    // Test 3: Shows validation errors for required fields
    test('should show validation errors for required fields when submitted empty', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      // Wait for services to be called and form to be ready
      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
      })

      // ACT
      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })

      // Verify API was NOT called
      expect(organizerEventService.createEvent).not.toHaveBeenCalled()
    })

    // Test 4: Validates date is in the future
    test('should show error when date is in the past', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      // ACT - Fill form with past date
      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(dateInput, { target: { value: '2020-01-01' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/date must be in the future/i)).toBeInTheDocument()
      })
    })

    // Test 5: Validates end time is after start time
    test('should show error when end time is before start time', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateString = futureDate.toISOString().split('T')[0]

      // ACT - Fill form with end time before start time
      const titleInput = document.getElementById('title') as HTMLInputElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement
      const startTimeInput = document.getElementById('start_time') as HTMLInputElement
      const endTimeInput = document.getElementById('end_time') as HTMLInputElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(dateInput, { target: { value: futureDateString } })
      fireEvent.change(startTimeInput, { target: { value: '18:00' } })
      fireEvent.change(endTimeInput, { target: { value: '16:00' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument()
      })
    })
  })

  describe('Create Mode', () => {
    // Test 6: Handles submit with valid data (create mode)
    test('should create event with valid data', async () => {
      // ARRANGE
      const mockNewEvent = {
        id: 1,
        title: 'Festival de Jazz',
        description: 'Un evento increíble',
        event_date: '2025-12-15',
        start_time: '18:00',
        end_time: '22:00',
        category_id: 1,
        location_id: 1,
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

      // ACT - Fill and submit form
      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement
      const startTimeInput = document.getElementById('start_time') as HTMLInputElement
      const endTimeInput = document.getElementById('end_time') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement
      const locationSelect = document.getElementById('location_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Festival de Jazz' } })
      fireEvent.change(descInput, { target: { value: 'Un evento increíble' } })
      fireEvent.change(dateInput, { target: { value: '2025-12-15' } })
      fireEvent.change(startTimeInput, { target: { value: '18:00' } })
      fireEvent.change(endTimeInput, { target: { value: '22:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })
      fireEvent.change(locationSelect, { target: { value: '1' } })

      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(organizerEventService.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Festival de Jazz',
            description: 'Un evento increíble',
            start_date: '2025-12-15T18:00:00',
            end_date: '2025-12-15T22:00:00',
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
    // Test 7: Pre-populates form in edit mode
    test('should pre-populate form with event data in edit mode', async () => {
      // ARRANGE
      const mockEvent = {
        id: 1,
        title: 'Existing Event',
        description: 'Existing description',
        start_date: '2025-12-15T18:00:00',
        end_date: '2025-12-15T22:00:00',
        category_id: 1,
        location_id: 1,
        status: 'draft'
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue({
        data: mockEvent
      })

      // ACT
      render(<OrganizerEventFormContainer eventId={1} />)

      // ASSERT
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

    // Test 8: Handles submit with valid data (edit mode)
    test('should update event with valid data in edit mode', async () => {
      // ARRANGE
      const mockEvent = {
        id: 1,
        title: 'Original Title',
        description: 'Original description',
        start_date: '2025-12-15T18:00:00',
        end_date: '2025-12-15T22:00:00',
        event_date: '2025-12-15',    // Add parsed date
        start_time: '18:00',          // Add parsed start time
        end_time: '22:00',            // Add parsed end time
        category_id: 1,
        location_id: 1,
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

      // ACT - Update title and submit
      const titleInput = document.getElementById('title') as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      const submitButton = screen.getByRole('button', { name: /actualizar evento/i })
      fireEvent.click(submitButton)

      // ASSERT
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
    // Test 9: Shows loading state during submit
    test('should show loading state during submission', async () => {
      // ARRANGE
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

      // Fill form with valid data
      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement
      const startTimeInput = document.getElementById('start_time') as HTMLInputElement
      const endTimeInput = document.getElementById('end_time') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement
      const locationSelect = document.getElementById('location_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(dateInput, { target: { value: '2025-12-15' } })
      fireEvent.change(startTimeInput, { target: { value: '18:00' } })
      fireEvent.change(endTimeInput, { target: { value: '22:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })
      fireEvent.change(locationSelect, { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT - Check button shows loading state
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /creando/i })
        expect(button).toBeDisabled()
      })
    })

    // Test 10: Disables form during submission
    test('should disable all form fields during submission', async () => {
      // ARRANGE
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

      // Fill form
      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement
      const startTimeInput = document.getElementById('start_time') as HTMLInputElement
      const endTimeInput = document.getElementById('end_time') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement
      const locationSelect = document.getElementById('location_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test' } })
      fireEvent.change(dateInput, { target: { value: '2025-12-15' } })
      fireEvent.change(startTimeInput, { target: { value: '18:00' } })
      fireEvent.change(endTimeInput, { target: { value: '22:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })
      fireEvent.change(locationSelect, { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT - Check inputs are disabled during loading
      await waitFor(() => {
        const titleInput = document.getElementById('title') as HTMLInputElement
        expect(titleInput).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    // Test 11: Displays API error on failure
    test('should display error message when API call fails', async () => {
      // ARRANGE
      const mockError = new Error('Network error')
      ;(organizerEventService.createEvent as jest.Mock).mockRejectedValue(mockError)

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(document.getElementById('title')).toBeInTheDocument()
      })

      // Fill form with valid data
      const titleInput = document.getElementById('title') as HTMLInputElement
      const descInput = document.getElementById('description') as HTMLTextAreaElement
      const dateInput = document.getElementById('event_date') as HTMLInputElement
      const startTimeInput = document.getElementById('start_time') as HTMLInputElement
      const endTimeInput = document.getElementById('end_time') as HTMLInputElement
      const categorySelect = document.getElementById('category_id') as HTMLSelectElement
      const locationSelect = document.getElementById('location_id') as HTMLSelectElement

      fireEvent.change(titleInput, { target: { value: 'Test Event' } })
      fireEvent.change(descInput, { target: { value: 'Test description' } })
      fireEvent.change(dateInput, { target: { value: '2025-12-15' } })
      fireEvent.change(startTimeInput, { target: { value: '18:00' } })
      fireEvent.change(endTimeInput, { target: { value: '22:00' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })
      fireEvent.change(locationSelect, { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /crear evento/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/error creating event/i)).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(titleInput).not.toBeDisabled()
    })
  })

  describe('Cancel Action', () => {
    // Test 12: Handles cancel action
    test('should navigate back when cancel button is clicked', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      // ACT
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // ASSERT
      expect(mockBack).toHaveBeenCalled()
    })
  })
})
