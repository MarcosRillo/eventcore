import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganizerEventFormContainer } from '../components/smart/OrganizerEventFormContainer'
import * as organizerEventService from '../services/organizer-event.service'
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

    // Default mocks for categories and locations
    ;(categoryService.getCategories as jest.Mock).mockResolvedValue({
      data: mockCategories
    })
    ;(locationService.getLocations as jest.Mock).mockResolvedValue({
      data: mockLocations
    })
  })

  describe('Initial Render', () => {
    // Test 1: Renders all form fields
    test('should render all form fields in create mode', async () => {
      // ACT
      render(<OrganizerEventFormContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/event date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })
    })

    // Test 2: Loads categories and locations on mount
    test('should load categories and locations on mount', async () => {
      // ACT
      render(<OrganizerEventFormContainer />)

      // ASSERT
      await waitFor(() => {
        expect(categoryService.getCategories).toHaveBeenCalled()
        expect(locationService.getLocations).toHaveBeenCalled()
      })

      // Verify options are populated
      await waitFor(() => {
        const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement
        expect(categorySelect.options.length).toBe(3) // placeholder + 2 categories
      })
    })
  })

  describe('Validation', () => {
    // Test 3: Shows validation errors for required fields
    test('should show validation errors for required fields when submitted empty', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument()
      })

      // ACT
      const submitButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/description is required/i)).toBeInTheDocument()
        expect(screen.getByText(/event date is required/i)).toBeInTheDocument()
        expect(screen.getByText(/category is required/i)).toBeInTheDocument()
        expect(screen.getByText(/location is required/i)).toBeInTheDocument()
      })

      // Verify API was NOT called
      expect(organizerEventService.createEvent).not.toHaveBeenCalled()
    })

    // Test 4: Validates date is in the future
    test('should show error when date is in the past', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      // ACT - Fill form with past date
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Event' }
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: '2020-01-01' }
      })

      const submitButton = screen.getByRole('button', { name: /create event/i })
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
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateString = futureDate.toISOString().split('T')[0]

      // ACT - Fill form with end time before start time
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Event' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: futureDateString }
      })
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '18:00' }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '16:00' }
      })

      const submitButton = screen.getByRole('button', { name: /create event/i })
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
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      // ACT - Fill and submit form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Festival de Jazz' }
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Un evento increíble' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: '2025-12-15' }
      })
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '18:00' }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '22:00' }
      })

      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const locationSelect = screen.getByLabelText(/location/i)
      fireEvent.change(locationSelect, { target: { value: '1' } })

      const submitButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(organizerEventService.createEvent).toHaveBeenCalledWith({
          title: 'Festival de Jazz',
          description: 'Un evento increíble',
          event_date: '2025-12-15',
          start_time: '18:00',
          end_time: '22:00',
          category_id: 1,
          location_id: 1
        })
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
        event_date: '2025-12-15',
        start_time: '18:00',
        end_time: '22:00',
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
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
        const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

        expect(titleInput.value).toBe('Existing Event')
        expect(descriptionInput.value).toBe('Existing description')
        expect(screen.getByRole('button', { name: /update event/i })).toBeInTheDocument()
      })
    })

    // Test 8: Handles submit with valid data (edit mode)
    test('should update event with valid data in edit mode', async () => {
      // ARRANGE
      const mockEvent = {
        id: 1,
        title: 'Original Title',
        description: 'Original description',
        event_date: '2025-12-15',
        start_time: '18:00',
        end_time: '22:00',
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
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
        expect(titleInput.value).toBe('Original Title')
      })

      // ACT - Update title and submit
      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      const submitButton = screen.getByRole('button', { name: /update event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(organizerEventService.updateEvent).toHaveBeenCalledWith(1, expect.objectContaining({
          title: 'Updated Title'
        }))
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
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      // Fill form with valid data
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Event' }
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: '2025-12-15' }
      })
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '18:00' }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '22:00' }
      })
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/location/i), { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
      })
    })

    // Test 10: Disables form during submission
    test('should disable all form fields during submission', async () => {
      // ARRANGE
      ;(organizerEventService.createEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<OrganizerEventFormContainer />)

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      // Fill form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Event' }
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: '2025-12-15' }
      })
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '18:00' }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '22:00' }
      })
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/location/i), { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeDisabled()
        expect(screen.getByLabelText(/description/i)).toBeDisabled()
        expect(screen.getByLabelText(/category/i)).toBeDisabled()
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
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      // Fill form with valid data
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Event' }
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText(/event date/i), {
        target: { value: '2025-12-15' }
      })
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '18:00' }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '22:00' }
      })
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/location/i), { target: { value: '1' } })

      // ACT
      const submitButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(submitButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/error creating event/i)).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(screen.getByLabelText(/title/i)).not.toBeDisabled()
    })
  })

  describe('Cancel Action', () => {
    // Test 12: Handles cancel action
    test('should navigate back when cancel button is clicked', async () => {
      // ARRANGE
      render(<OrganizerEventFormContainer />)

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
