# CARD-004: Event Form Widget - TDD Specification
**Created:** October 27, 2025  
**Priority:** High  
**Estimated Time:** 3-3.5 hours with Claude Code  
**Methodology:** Test-Driven Development (TDD)

---

## 🎯 OBJECTIVE

Implement a comprehensive event form widget for the organizer dashboard that handles both create and edit modes with validation, error handling, and proper UX - following strict TDD methodology.

**Success Criteria:**
- 10-12 tests written FIRST (RED phase)
- All tests passing (GREEN phase)
- Clean, maintainable code (REFACTOR phase)
- Visual verification in browser
- Zero regressions in existing 116 frontend tests

---

## 📋 FEATURE REQUIREMENTS

### Core Functionality
1. **Form Fields**
   - Title (text input, required)
   - Description (textarea, required)
   - Event Date (date picker, required)
   - Start Time (time picker, required)
   - End Time (time picker, required)
   - Category (select dropdown, required)
   - Location (select dropdown, required)
   - Image URL (text input, optional for MVP)

2. **Validation**
   - Required field validation
   - Date validation (must be future date)
   - End time must be after start time
   - Character limits (title max 200, description max 2000)
   - Real-time validation feedback
   - Form-level error display

3. **Modes**
   - **Create Mode:** Empty form, submit creates new event
   - **Edit Mode:** Pre-populated form, submit updates existing event
   - Mode determined by presence of eventId prop

4. **Actions**
   - Submit button (Create/Update based on mode)
   - Cancel button (returns to list)
   - Loading state during submission
   - Success callback on successful submit
   - Error display on failure

5. **Data Loading**
   - Fetch categories on mount
   - Fetch locations on mount
   - Fetch event data on mount (edit mode only)
   - Loading state while fetching

6. **User Experience**
   - Disabled state during submission
   - Clear error messages
   - Success feedback
   - Form reset after successful create
   - Navigate back after successful edit

---

## 🧪 TDD METHODOLOGY

### Phase 1: RED (Tests First) - 45 minutes
Write 10-12 failing tests covering all functionality:
1. Renders form with all fields
2. Shows validation errors for required fields
3. Validates date is in the future
4. Validates end time after start time
5. Handles submit with valid data (create mode)
6. Handles submit with valid data (edit mode)
7. Pre-populates form in edit mode
8. Shows loading state during submit
9. Displays API error on failure
10. Calls onSuccess callback on success
11. Handles cancel action
12. Disables form during submission

### Phase 2: GREEN (Implementation) - 90 minutes
Implement minimum code to make all tests pass:
- OrganizerEventForm component (dumb)
- OrganizerEventFormContainer (smart)
- useEventForm hook
- Form validation logic
- Event service methods (create/update)
- Types/interfaces

### Phase 3: REFACTOR (Polish) - 30 minutes
- Extract validation functions
- Optimize form state management
- Improve accessibility (labels, ARIA)
- Add JSDoc comments
- Performance optimization (memoization)

---

## 🏗️ ARCHITECTURE

### Component Structure

```
src/features/organizer/
├── components/
│   ├── dumb/
│   │   └── OrganizerEventForm.tsx              # Presentational form
│   └── smart/
│       └── OrganizerEventFormContainer.tsx     # Logic container
├── hooks/
│   └── useEventForm.ts                         # Form state + validation
├── services/
│   └── organizer-event.service.ts              # API calls (extend existing)
├── types/
│   └── event.types.ts                          # Extend existing types
└── __tests__/
    └── OrganizerEventForm.test.tsx             # 10-12 tests
```

### Data Flow

```
OrganizerEventFormContainer
    ↓ (uses)
useEventForm hook
    ↓ (manages)
Form State + Validation
    ↓ (calls on submit)
organizerEventService
    ↓ (POST/PUT)
API /api/v1/organizer/events
    ↓ (success)
onSuccess callback + navigate
    ↓ (renders)
OrganizerEventForm (dumb)
```

---

## 🧪 TEST SUITE SPECIFICATION

### File: `src/features/organizer/__tests__/OrganizerEventForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
```

---

## 📝 IMPLEMENTATION GUIDE

### Step 1: Extend Types/Interfaces (5 min)

```typescript
// src/features/organizer/types/event.types.ts (extend existing)

export interface CreateEventDto {
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  category_id: number
  location_id: number
  image_url?: string
}

export interface UpdateEventDto extends CreateEventDto {
  id: number
}

export interface EventFormData {
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  category_id: number | null
  location_id: number | null
  image_url: string
}

export interface EventFormErrors {
  title?: string
  description?: string
  event_date?: string
  start_time?: string
  end_time?: string
  category_id?: string
  location_id?: string
  general?: string
}
```

### Step 2: Extend Service Methods (10 min)

```typescript
// src/features/organizer/services/organizer-event.service.ts (extend existing)

import { CreateEventDto, UpdateEventDto, OrganizerEvent } from '../types/event.types'

export const getEvent = async (id: number): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.get(`/organizer/events/${id}`)
  return response.data
}

export const createEvent = async (data: CreateEventDto): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.post('/organizer/events', data)
  return response.data
}

export const updateEvent = async (id: number, data: UpdateEventDto): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.put(`/organizer/events/${id}`, data)
  return response.data
}
```

### Step 3: Validation Helper (15 min)

```typescript
// src/features/organizer/utils/eventFormValidation.ts

import { EventFormData, EventFormErrors } from '../types/event.types'

export const validateEventForm = (data: EventFormData): EventFormErrors => {
  const errors: EventFormErrors = {}

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Title is required'
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters'
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Description is required'
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters'
  }

  // Date validation
  if (!data.event_date) {
    errors.event_date = 'Event date is required'
  } else {
    const eventDate = new Date(data.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      errors.event_date = 'Date must be in the future'
    }
  }

  // Time validation
  if (!data.start_time) {
    errors.start_time = 'Start time is required'
  }

  if (!data.end_time) {
    errors.end_time = 'End time is required'
  }

  // End time must be after start time
  if (data.start_time && data.end_time) {
    if (data.end_time <= data.start_time) {
      errors.end_time = 'End time must be after start time'
    }
  }

  // Category validation
  if (!data.category_id) {
    errors.category_id = 'Category is required'
  }

  // Location validation
  if (!data.location_id) {
    errors.location_id = 'Location is required'
  }

  return errors
}

export const hasErrors = (errors: EventFormErrors): boolean => {
  return Object.keys(errors).length > 0
}
```

### Step 4: Custom Hook (30 min)

```typescript
// src/features/organizer/hooks/useEventForm.ts

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvent, createEvent, updateEvent } from '../services/organizer-event.service'
import { getCategories } from '@/features/categories/services/category.service'
import { getLocations } from '@/features/locations/services/location.service'
import { validateEventForm, hasErrors } from '../utils/eventFormValidation'
import { EventFormData, EventFormErrors, OrganizerEvent } from '../types/event.types'

interface UseEventFormProps {
  eventId?: number
}

export const useEventForm = ({ eventId }: UseEventFormProps = {}) => {
  const router = useRouter()
  const isEditMode = !!eventId

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    category_id: null,
    location_id: null,
    image_url: ''
  })

  const [errors, setErrors] = useState<EventFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])

  // Load categories and locations on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          getCategories(),
          getLocations()
        ])
        setCategories(categoriesRes.data)
        setLocations(locationsRes.data)
      } catch (err) {
        console.error('Error loading form options:', err)
        setErrors({ general: 'Error loading form options' })
      }
    }

    loadOptions()
  }, [])

  // Load event data in edit mode
  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      setInitialLoading(true)
      try {
        const response = await getEvent(eventId)
        const event = response.data
        
        setFormData({
          title: event.title,
          description: event.description || '',
          event_date: event.event_date,
          start_time: event.start_time || '',
          end_time: event.end_time || '',
          category_id: event.category_id || null,
          location_id: event.location_id || null,
          image_url: event.image_url || ''
        })
      } catch (err) {
        console.error('Error loading event:', err)
        setErrors({ general: 'Error loading event data' })
      } finally {
        setInitialLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleChange = (field: keyof EventFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateEventForm(formData)
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        category_id: formData.category_id!,
        location_id: formData.location_id!,
        image_url: formData.image_url || undefined
      }

      if (isEditMode) {
        await updateEvent(eventId, { ...payload, id: eventId })
      } else {
        await createEvent(payload)
      }

      // Navigate to events list on success
      router.push('/organizer/events')
    } catch (err) {
      console.error('Error submitting form:', err)
      setErrors({
        general: isEditMode ? 'Error updating event' : 'Error creating event'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return {
    formData,
    errors,
    loading,
    initialLoading,
    categories,
    locations,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel
  }
}
```

### Step 5: Dumb Component (40 min)

```typescript
// src/features/organizer/components/dumb/OrganizerEventForm.tsx

import { EventFormData, EventFormErrors } from '../../types/event.types'

interface OrganizerEventFormProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  categories: { id: number; name: string }[]
  locations: { id: number; name: string }[]
  isEditMode: boolean
  onChange: (field: keyof EventFormData, value: string | number | null) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const OrganizerEventForm = ({
  formData,
  errors,
  loading,
  categories,
  locations,
  isEditMode,
  onChange,
  onSubmit,
  onCancel
}: OrganizerEventFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h2>

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            placeholder="Festival de Jazz"
            maxLength={200}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            disabled={loading}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            placeholder="Describe your event..."
            maxLength={2000}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Event Date */}
        <div className="mb-4">
          <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </label>
          <input
            type="date"
            id="event_date"
            value={formData.event_date}
            onChange={(e) => onChange('event_date', e.target.value)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.event_date
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.event_date && (
            <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>
          )}
        </div>

        {/* Time Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              id="start_time"
              value={formData.start_time}
              onChange={(e) => onChange('start_time', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.start_time
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              id="end_time"
              value={formData.end_time}
              onChange={(e) => onChange('end_time', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.end_time
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category_id || ''}
            onChange={(e) => onChange('category_id', e.target.value ? Number(e.target.value) : null)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.category_id
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <select
            id="location"
            value={formData.location_id || ''}
            onChange={(e) => onChange('location_id', e.target.value ? Number(e.target.value) : null)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.location_id
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {errors.location_id && (
            <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
          )}
        </div>

        {/* Image URL (Optional) */}
        <div className="mb-6">
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) => onChange('image_url', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Event'
              : 'Create Event'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
```

### Step 6: Smart Container (10 min)

```typescript
// src/features/organizer/components/smart/OrganizerEventFormContainer.tsx

'use client'

import { useEventForm } from '../../hooks/useEventForm'
import { OrganizerEventForm } from '../dumb/OrganizerEventForm'

interface OrganizerEventFormContainerProps {
  eventId?: number
}

export const OrganizerEventFormContainer = ({ eventId }: OrganizerEventFormContainerProps) => {
  const {
    formData,
    errors,
    loading,
    initialLoading,
    categories,
    locations,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel
  } = useEventForm({ eventId })

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading event data...</div>
      </div>
    )
  }

  return (
    <OrganizerEventForm
      formData={formData}
      errors={errors}
      loading={loading}
      categories={categories}
      locations={locations}
      isEditMode={isEditMode}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}
```

---

## ✅ ACCEPTANCE CRITERIA

### Functional
- [ ] Form renders with all fields in create mode
- [ ] Form pre-populates in edit mode
- [ ] Validation works for all required fields
- [ ] Date validation (future dates only)
- [ ] Time validation (end after start)
- [ ] Create mode posts to API correctly
- [ ] Edit mode puts to API correctly
- [ ] Navigate to list on success
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Form disables during submission
- [ ] Cancel returns to previous page

### Technical
- [ ] All 12 tests passing
- [ ] No regressions (116 existing tests still pass)
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Code follows smart/dumb pattern
- [ ] Proper error handling
- [ ] Validation extracted to utility
- [ ] Form accessible (labels, ARIA)

### Visual
- [ ] Responsive layout works
- [ ] Validation errors clearly visible
- [ ] Loading states apparent
- [ ] Disabled states visually clear
- [ ] Form layout clean and professional

---

## 🚀 EXECUTION STEPS

### Phase 1: RED (45 min)
```bash
# 1. Create test file
touch frontend/src/features/organizer/__tests__/OrganizerEventForm.test.tsx

# 2. Copy all 12 tests from specification

# 3. Run tests (should ALL FAIL)
cd frontend
npm test OrganizerEventForm.test.tsx

# Expected: 12 failing tests ❌
```

### Phase 2: GREEN (90 min)
```bash
# 4. Extend types
# Edit src/features/organizer/types/event.types.ts

# 5. Extend service
# Edit src/features/organizer/services/organizer-event.service.ts

# 6. Create validation utility
mkdir -p frontend/src/features/organizer/utils
touch frontend/src/features/organizer/utils/eventFormValidation.ts

# 7. Create hook
touch frontend/src/features/organizer/hooks/useEventForm.ts

# 8. Create dumb component
touch frontend/src/features/organizer/components/dumb/OrganizerEventForm.tsx

# 9. Create smart container
touch frontend/src/features/organizer/components/smart/OrganizerEventFormContainer.tsx

# 10. Run tests (should ALL PASS)
npm test OrganizerEventForm.test.tsx

# Expected: 12 passing tests ✅
```

### Phase 3: REFACTOR (30 min)
```bash
# 11. Extract reusable validation functions
# 12. Add memoization if needed
# 13. Improve accessibility
# 14. Add JSDoc comments
# 15. Clean up code

# 16. Final test run
npm test

# Expected: 128 tests passing (116 existing + 12 new) ✅
```

### Phase 4: VISUAL TESTING (20 min)
```bash
# 17. Start dev server
npm run dev

# 18. Navigate to create form
# http://localhost:3000/organizer/events/new

# 19. Test manually:
# - Form displays all fields
# - Validation errors show
# - Submit creates event
# - Navigate to edit mode
# - Form pre-populates
# - Submit updates event
# - Cancel returns to list
# - Responsive on mobile
```

### Phase 5: COMMIT (10 min)
```bash
# 20. Stage changes
git add .

# 21. Commit with metrics
git commit -m "feat(organizer): implement event form widget with TDD

TDD Phases:
- RED: 12 failing tests written
- GREEN: All tests passing
- REFACTOR: Code cleanup and validation extraction

Features:
- Create and edit modes
- Full form validation (required fields, date, time)
- Category and location dropdowns
- Error handling with user feedback
- Loading states during submission
- Disabled states during operations
- Cancel functionality
- Responsive design

Tests:
- 12 new tests (100% passing)
- Total: 128 tests (116 existing + 12 new)
- Coverage: Form component + hook + validation

Files Created/Modified:
- __tests__/OrganizerEventForm.test.tsx (12 tests)
- components/dumb/OrganizerEventForm.tsx
- components/smart/OrganizerEventFormContainer.tsx
- hooks/useEventForm.ts
- utils/eventFormValidation.ts
- types/event.types.ts (extended)
- services/organizer-event.service.ts (extended)

Architecture:
- Smart/Dumb component pattern
- Custom hook for form state
- Extracted validation utility
- TypeScript strict mode (0 errors)
- Path aliases (@/)

Quality:
- TypeScript: 0 errors
- ESLint: 0 warnings
- Form fields: 8 (7 required + 1 optional)
- Validation rules: 7
- Accessibility: Full labels + ARIA
- Zero regressions

Integration:
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

// Create mode
<OrganizerEventFormContainer />

// Edit mode
<OrganizerEventFormContainer eventId={1} />

API Endpoints:
- GET /api/v1/organizer/events/:id (load event)
- POST /api/v1/organizer/events (create)
- PUT /api/v1/organizer/events/:id (update)

Part of: CARD-004 - Event Form Widget
Methodology: TDD (Test-Driven Development)
Time: ~3 hours (RED + GREEN + REFACTOR)
Status: ✅ COMPLETE
MVP Progress: 90% → 92%"

# 22. Push
git push origin main
```

---

## 📊 SUCCESS METRICS

### Tests
- **Before:** 116 tests passing
- **After:** 128 tests passing (+12)
- **Coverage:** Form validation + submission 100%

### Performance
- **Form render:** < 100ms
- **Validation:** Instant (client-side)
- **Submit:** < 1s (API dependent)

### Code Quality
- **TypeScript errors:** 0
- **ESLint warnings:** 0
- **Component lines:** < 250 (form), < 50 (container)
- **Test assertions:** 24+ total

---

## 🔍 TROUBLESHOOTING

### Common Issues

**Issue:** Date validation not working
**Solution:** Ensure date comparison uses proper Date objects

**Issue:** Time validation fails
**Solution:** Compare times as strings (24h format works)

**Issue:** Form not pre-populating in edit mode
**Solution:** Check useEffect dependencies, verify API response structure

**Issue:** Categories/locations not loading
**Solution:** Verify service methods are mocked in tests

**Issue:** Submit button stays disabled
**Solution:** Check loading state is reset in finally block

---

## 📚 REFERENCES

- **Similar Implementation:** CARD-002 (Stats Widget), CARD-003 (Event List)
- **Testing Pattern:** Jest + React Testing Library
- **Architecture:** Features-based, Smart/Dumb components
- **Commit Style:** Conventional Commits with metrics
- **Validation:** Client-side with utility functions

---

**Created:** October 27, 2025  
**TDD Methodology:** RED → GREEN → REFACTOR  
**Estimated Completion:** 3-3.5 hours  
**Status:** Ready for implementation  
**MVP Impact:** +2% (90% → 92%)