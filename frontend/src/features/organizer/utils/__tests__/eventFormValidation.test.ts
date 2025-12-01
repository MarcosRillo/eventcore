import { validateEventForm, hasErrors } from '../eventFormValidation'
import { EventFormData } from '@/features/organizer/types/event.types'

describe('eventFormValidation', () => {
  const getValidFormData = (): EventFormData => ({
    title: 'Valid Event Title',
    description: 'Valid description',
    edition_number: '',
    type_id: null,
    subtype_id: null,
    origin_id: null,
    theme_id: null,
    frequency_id: null,
    rotation_type_id: null,
    producer_id: null,
    category_id: 1,
    service_ids: [],
    room_ids: [],
    location_ids: [1],
    maps_url: '',
    previous_venue: '',
    next_venue: '',
    start_date: '2030-12-31T10:00',
    end_date: '2030-12-31T18:00',
    async_dates: [],
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,
    event_website: '',
    logo_url: '',
    featured_image: '',
    responsive_image_url: '',
  })

  describe('validateEventForm', () => {
    describe('title validation', () => {
      it('should return error when title is empty', () => {
        const formData = getValidFormData()
        formData.title = ''

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('El título es requerido')
      })

      it('should return error when title is only whitespace', () => {
        const formData = getValidFormData()
        formData.title = '   '

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('El título es requerido')
      })

      it('should return error when title exceeds 200 characters', () => {
        const formData = getValidFormData()
        formData.title = 'a'.repeat(201)

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('El título debe tener menos de 200 caracteres')
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

        expect(errors.description).toBe('La descripción es requerida')
      })

      it('should return error when description is only whitespace', () => {
        const formData = getValidFormData()
        formData.description = '   '

        const errors = validateEventForm(formData)

        expect(errors.description).toBe('La descripción es requerida')
      })

      it('should return error when description exceeds 2000 characters', () => {
        const formData = getValidFormData()
        formData.description = 'a'.repeat(2001)

        const errors = validateEventForm(formData)

        expect(errors.description).toBe('La descripción debe tener menos de 2000 caracteres')
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

    describe('start_date validation', () => {
      it('should return error when start_date is empty', () => {
        const formData = getValidFormData()
        formData.start_date = ''

        const errors = validateEventForm(formData)

        expect(errors.start_date).toBe('La fecha de inicio es requerida')
      })

      it('should return error when date is in the past', () => {
        const formData = getValidFormData()
        formData.start_date = '2020-01-01T10:00'

        const errors = validateEventForm(formData)

        expect(errors.start_date).toBe('La fecha de inicio debe ser en el futuro')
      })

      it('should not return error when date is in the future', () => {
        const formData = getValidFormData()
        formData.start_date = '2030-12-31T10:00'

        const errors = validateEventForm(formData)

        expect(errors.start_date).toBeUndefined()
      })
    })

    describe('end_date validation', () => {
      it('should return error when end_date is before start_date', () => {
        const formData = getValidFormData()
        formData.start_date = '2030-12-31T10:00'
        formData.end_date = '2030-12-30T10:00'

        const errors = validateEventForm(formData)

        expect(errors.end_date).toBe('La fecha de fin debe ser posterior a la fecha de inicio')
      })

      it('should not return error when end_date is after start_date', () => {
        const formData = getValidFormData()
        formData.start_date = '2030-12-30T10:00'
        formData.end_date = '2030-12-31T10:00'

        const errors = validateEventForm(formData)

        expect(errors.end_date).toBeUndefined()
      })

      it('should not return error when end_date is not provided', () => {
        const formData = getValidFormData()
        formData.start_date = '2030-12-31T10:00'
        formData.end_date = ''

        const errors = validateEventForm(formData)

        expect(errors.end_date).toBeUndefined()
      })
    })

    describe('category_id validation', () => {
      it('should return error when category_id is null', () => {
        const formData = getValidFormData()
        formData.category_id = null

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBe('La categoría es requerida')
      })

      it('should return error when category_id is undefined', () => {
        const formData: Partial<EventFormData> = {
          ...getValidFormData(),
          category_id: undefined
        }

        const errors = validateEventForm(formData as EventFormData)

        expect(errors.category_id).toBe('La categoría es requerida')
      })

      it('should not return error when category_id is valid', () => {
        const formData = getValidFormData()
        formData.category_id = 1

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBeUndefined()
      })
    })

    describe('location_ids validation', () => {
      it('should return error when location_ids is empty array', () => {
        const formData = getValidFormData()
        formData.location_ids = []

        const errors = validateEventForm(formData)

        expect(errors.location_ids).toBe('Al menos una ubicación es requerida')
      })

      it('should return error when location_ids is undefined', () => {
        const formData: Partial<EventFormData> = {
          ...getValidFormData(),
          location_ids: undefined
        }

        const errors = validateEventForm(formData as EventFormData)

        expect(errors.location_ids).toBe('Al menos una ubicación es requerida')
      })

      it('should not return error when location_ids has at least one location', () => {
        const formData = getValidFormData()
        formData.location_ids = [1]

        const errors = validateEventForm(formData)

        expect(errors.location_ids).toBeUndefined()
      })

      it('should not return error when location_ids has multiple locations', () => {
        const formData = getValidFormData()
        formData.location_ids = [1, 2, 3]

        const errors = validateEventForm(formData)

        expect(errors.location_ids).toBeUndefined()
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
        formData.start_date = ''
        formData.category_id = null
        formData.location_ids = []

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('El título es requerido')
        expect(errors.description).toBe('La descripción es requerida')
        expect(errors.start_date).toBe('La fecha de inicio es requerida')
        expect(errors.category_id).toBe('La categoría es requerida')
        expect(errors.location_ids).toBe('Al menos una ubicación es requerida')
        expect(Object.keys(errors).length).toBe(5)
      })
    })
  })

  describe('hasErrors', () => {
    it('should return true when errors object has errors', () => {
      const errors = { title: 'El título es requerido' }

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
        title: 'El título es requerido',
        description: 'La descripción es requerida',
        start_date: 'La fecha de inicio es requerida'
      }

      const result = hasErrors(errors)

      expect(result).toBe(true)
    })
  })
})
