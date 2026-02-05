import { EventFormData } from '@/features/organizer/types/event.types'
import { hasErrors,validateEventForm } from '@/features/organizer/utils/eventFormValidation'

describe('eventFormValidation', () => {
  const getValidFormData = (): EventFormData => ({
    title: 'Valid Event Title',
    description: 'Valid description',
    edition_number: '',
    // Event Type/Subtype (required since Dec 2, 2025)
    event_type_id: 1,
    event_subtype_id: 1,
    // FK references
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
    has_custom_location: false,
    custom_location_name: '',
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
    featured_image: '',
    featured_image_file: null,
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

    describe('event_type_id validation', () => {
      it('should return error when event_type_id is null', () => {
        const formData = getValidFormData()
        formData.event_type_id = null

        const errors = validateEventForm(formData)

        expect(errors.event_type_id).toBe('El tipo de evento es requerido')
      })

      it('should not return error when event_type_id is valid', () => {
        const formData = getValidFormData()
        formData.event_type_id = 1

        const errors = validateEventForm(formData)

        expect(errors.event_type_id).toBeUndefined()
      })
    })

    describe('event_subtype_id validation', () => {
      it('should return error when event_subtype_id is null', () => {
        const formData = getValidFormData()
        formData.event_subtype_id = null

        const errors = validateEventForm(formData)

        expect(errors.event_subtype_id).toBe('El subtipo de evento es requerido')
      })

      it('should not return error when event_subtype_id is valid', () => {
        const formData = getValidFormData()
        formData.event_subtype_id = 1

        const errors = validateEventForm(formData)

        expect(errors.event_subtype_id).toBeUndefined()
      })
    })

    describe('category_id validation', () => {
      // Category is now optional (Dec 2, 2025)
      it('should not return error when category_id is null (now optional)', () => {
        const formData = getValidFormData()
        formData.category_id = null

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBeUndefined()
      })

      it('should not return error when category_id is valid', () => {
        const formData = getValidFormData()
        formData.category_id = 1

        const errors = validateEventForm(formData)

        expect(errors.category_id).toBeUndefined()
      })
    })

    describe('location_ids validation', () => {
      it('should return error when location_ids is empty and no custom location', () => {
        const formData = getValidFormData()
        formData.location_ids = []
        formData.has_custom_location = false

        const errors = validateEventForm(formData)

        expect(errors.location_ids).toBe('Selecciona al menos una ubicación o agrega una personalizada')
      })

      it('should return error when location_ids is undefined and no custom location', () => {
        const formData: Partial<EventFormData> = {
          ...getValidFormData(),
          location_ids: undefined,
          has_custom_location: false
        }

        const errors = validateEventForm(formData as EventFormData)

        expect(errors.location_ids).toBe('Selecciona al menos una ubicación o agrega una personalizada')
      })

      it('should return error when has_custom_location but custom_location_name is empty', () => {
        const formData = getValidFormData()
        formData.location_ids = []
        formData.has_custom_location = true
        formData.custom_location_name = ''

        const errors = validateEventForm(formData)

        expect(errors.custom_location_name).toBe('El nombre del lugar es requerido')
      })

      it('should not return error when has_custom_location with valid custom_location_name', () => {
        const formData = getValidFormData()
        formData.location_ids = []
        formData.has_custom_location = true
        formData.custom_location_name = 'Salón El Jardín'

        const errors = validateEventForm(formData)

        expect(errors.location_ids).toBeUndefined()
        expect(errors.custom_location_name).toBeUndefined()
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
        formData.event_type_id = null
        formData.event_subtype_id = null
        formData.location_ids = []

        const errors = validateEventForm(formData)

        expect(errors.title).toBe('El título es requerido')
        expect(errors.description).toBe('La descripción es requerida')
        expect(errors.start_date).toBe('La fecha de inicio es requerida')
        expect(errors.event_type_id).toBe('El tipo de evento es requerido')
        expect(errors.event_subtype_id).toBe('El subtipo de evento es requerido')
        expect(errors.location_ids).toBe('Selecciona al menos una ubicación o agrega una personalizada')
        expect(Object.keys(errors).length).toBe(6)
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
