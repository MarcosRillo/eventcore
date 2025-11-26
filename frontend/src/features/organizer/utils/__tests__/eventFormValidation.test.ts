import { validateEventForm, hasErrors } from '../eventFormValidation'
import { EventFormData } from '@/features/organizer/types/event.types'

describe('eventFormValidation', () => {
  const getValidFormData = (): EventFormData => ({
    title: 'Valid Event Title',
    description: 'Valid description',
    event_date: '2030-12-31',
    start_time: '10:00',
    end_time: '18:00',
    category_id: 1,
    location_id: 1,
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
    end_date: '',
    asynchronous_dates: [],
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,
    producer: '',
    event_website: '',
    logo_url: '',
    image_url: '',
    responsive_image_url: '',
  })

  describe('validateEventForm', () => {
    describe('title validation', () => {
      it('should return error when title is empty', () => {
        const formData = getValidFormData()
        formData.title = ''

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('Title is required')
      })

      it('should return error when title is only whitespace', () => {
        const formData = getValidFormData()
        formData.title = '   '

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('Title is required')
      })

      it('should return error when title exceeds 200 characters', () => {
        const formData = getValidFormData()
        formData.title = 'a'.repeat(201)

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('Title must be less than 200 characters')
      })

      it('should not return error when title is valid', () => {
        const formData = getValidFormData()
        formData.title = 'Valid Event Title'

        const errors = validateEventForm(formData)

        expect(errors.title).toBeUndefined()
      })

      it('should allow title with exactly 200 characters', () => {
        const formData = getValidFormData()
        formData.title = 'a'.repeat(200)

        const errors = validateEventForm(formData)

        expect(errors.title).toBeUndefined()
      })
    })

    describe('description validation', () => {
      it('should return error when description is empty', () => {
        const formData = getValidFormData()
        formData.description = ''

        const errors = validateEventForm(formData)

        expect(errors.description).toBe('Description is required')
      })

      it('should return error when description is only whitespace', () => {
        const formData = getValidFormData()
        formData.description = '   '

        const errors = validateEventForm(formData)

        expect(errors.description).toBe('Description is required')
      })

      it('should return error when description exceeds 2000 characters', () => {
        const formData = getValidFormData()
        formData.description = 'a'.repeat(2001)

        const errors = validateEventForm(formData)

        expect(errors.description).toBe('Description must be less than 2000 characters')
      })

      it('should not return error when description is valid', () => {
        const formData = getValidFormData()
        formData.description = 'Valid description'

        const errors = validateEventForm(formData)

        expect(errors.description).toBeUndefined()
      })

      it('should allow description with exactly 2000 characters', () => {
        const formData = getValidFormData()
        formData.description = 'a'.repeat(2000)

        const errors = validateEventForm(formData)

        expect(errors.description).toBeUndefined()
      })
    })

    describe('event_date validation', () => {
      it('should return error when event_date is empty', () => {
        const formData = getValidFormData()
        formData.event_date = ''

        const errors = validateEventForm(formData)

        expect(errors.event_date).toBe('Event date is required')
      })

      it('should return error when date is in the past', () => {
        const formData = getValidFormData()
        formData.event_date = '2020-01-01' // Past date

        const errors = validateEventForm(formData)

        expect(errors.event_date).toBe('Date must be in the future')
      })

      it('should return error when date is today (considered past)', () => {
        const formData = getValidFormData()
        const today = new Date()
        formData.event_date = today.toISOString().split('T')[0]

        const errors = validateEventForm(formData)

        // The validation requires future dates, today is considered past
        expect(errors.event_date).toBe('Date must be in the future')
      })

      it('should not return error when date is in the future', () => {
        const formData = getValidFormData()
        formData.event_date = '2030-12-31'

        const errors = validateEventForm(formData)

        expect(errors.event_date).toBeUndefined()
      })
    })

    describe('time validation', () => {
      it('should return error when start_time is empty', () => {
        const formData = getValidFormData()
        formData.start_time = ''

        const errors = validateEventForm(formData)

        expect(errors.start_time).toBe('Start time is required')
      })

      it('should return error when end_time is empty', () => {
        const formData = getValidFormData()
        formData.end_time = ''

        const errors = validateEventForm(formData)

        expect(errors.end_time).toBe('End time is required')
      })

      it('should return error when end_time equals start_time', () => {
        const formData = getValidFormData()
        formData.start_time = '10:00'
        formData.end_time = '10:00'

        const errors = validateEventForm(formData)

        expect(errors.end_time).toBe('End time must be after start time')
      })

      it('should return error when end_time is before start_time', () => {
        const formData = getValidFormData()
        formData.start_time = '18:00'
        formData.end_time = '16:00'

        const errors = validateEventForm(formData)

        expect(errors.end_time).toBe('End time must be after start time')
      })

      it('should not return error when end_time is after start_time', () => {
        const formData = getValidFormData()
        formData.start_time = '10:00'
        formData.end_time = '18:00'

        const errors = validateEventForm(formData)

        expect(errors.end_time).toBeUndefined()
      })

      it('should not return error when times are different and valid', () => {
        const formData = getValidFormData()
        formData.start_time = '09:00'
        formData.end_time = '09:01'

        const errors = validateEventForm(formData)

        expect(errors.end_time).toBeUndefined()
      })
    })

    describe('category_id validation', () => {
      it('should return error when category_id is null', () => {
        const formData = getValidFormData()
        formData.category_id = null

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBe('Category is required')
      })

      it('should return error when category_id is undefined', () => {
        const formData: Partial<EventFormData> = {
          ...getValidFormData(),
          category_id: undefined
        }

        const errors = validateEventForm(formData as EventFormData)

        expect(errors.category_id).toBe('Category is required')
      })

      it('should not return error when category_id is valid', () => {
        const formData = getValidFormData()
        formData.category_id = 1

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBeUndefined()
      })
    })

    describe('location_id validation', () => {
      it('should return error when location_id is null', () => {
        const formData = getValidFormData()
        formData.location_id = null

        const errors = validateEventForm(formData)

        expect(errors.location_id).toBe('Location is required')
      })

      it('should return error when location_id is undefined', () => {
        const formData: Partial<EventFormData> = {
          ...getValidFormData(),
          location_id: undefined
        }

        const errors = validateEventForm(formData as EventFormData)

        expect(errors.location_id).toBe('Location is required')
      })

      it('should not return error when location_id is valid', () => {
        const formData = getValidFormData()
        formData.location_id = 1

        const errors = validateEventForm(formData)

        expect(errors.location_id).toBeUndefined()
      })
    })

    describe('combined validation', () => {
      it('should return empty errors object when all fields are valid', () => {
        const formData = getValidFormData()

        const errors = validateEventForm(formData)

        expect(Object.keys(errors).length).toBe(0)
      })

      it('should return multiple errors when multiple fields are invalid', () => {
        const formData = getValidFormData()
        formData.title = ''
        formData.description = ''
        formData.event_date = ''
        formData.start_time = ''
        formData.end_time = ''
        formData.category_id = null
        formData.location_id = null

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('Title is required')
        expect(errors.description).toBe('Description is required')
        expect(errors.event_date).toBe('Event date is required')
        expect(errors.start_time).toBe('Start time is required')
        expect(errors.end_time).toBe('End time is required')
        expect(errors.category_id).toBe('Category is required')
        expect(errors.location_id).toBe('Location is required')
        expect(Object.keys(errors).length).toBe(7)
      })
    })
  })

  describe('hasErrors', () => {
    it('should return true when errors object has errors', () => {
      const errors = { title: 'Title is required' }

      const result = hasErrors(errors)

      expect(result).toBe(true)
    })

    it('should return false when errors object is empty', () => {
      const errors = {}

      const result = hasErrors(errors)

      expect(result).toBe(false)
    })

    it('should return true when errors object has multiple errors', () => {
      const errors = {
        title: 'Title is required',
        description: 'Description is required',
        event_date: 'Event date is required'
      }

      const result = hasErrors(errors)

      expect(result).toBe(true)
    })
  })
})
