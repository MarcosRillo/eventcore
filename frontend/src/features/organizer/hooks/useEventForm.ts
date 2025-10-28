import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvent, createEvent, updateEvent } from '@/features/organizer/services/organizer-event.service'
import { getCategories } from '@/features/categories/services/category.service'
import { getLocations } from '@/features/locations/services/location.service'
import { validateEventForm, hasErrors } from '@/features/organizer/utils/eventFormValidation'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

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
      } catch {
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
      } catch {
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
    } catch {
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
