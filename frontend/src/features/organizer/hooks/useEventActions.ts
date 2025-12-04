/**
 * Custom hook for event action operations
 *
 * Provides methods to submit for review, duplicate, and delete events
 * with confirmation modals, loading states, and toast notifications.
 */

'use client';

import { useState, useRef } from 'react'
import { AxiosError } from 'axios'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { SubmitEventError } from '@/features/organizer/types/event.types'
import { useToast } from '@/components/ui/Toast'

interface UseEventActionsReturn {
  loading: boolean
  submitModalOpen: boolean
  deleteModalOpen: boolean
  selectedEventId: number | null
  validationErrors: Record<string, string> | null
  openSubmitModal: (eventId: number) => void
  closeSubmitModal: () => void
  openDeleteModal: (eventId: number) => void
  closeDeleteModal: () => void
  submitForReview: (eventId: number) => Promise<void>
  duplicateEvent: (eventId: number) => Promise<void>
  deleteEvent: (eventId: number) => Promise<void>
}

export const useEventActions = (
  onSuccess?: () => void
): UseEventActionsReturn => {
  const [loading, setLoading] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null)
  const { addToast } = useToast()

  // Ref to always have the latest onSuccess callback (prevents stale closure)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const openSubmitModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setValidationErrors(null)
    setSubmitModalOpen(true)
  }

  const closeSubmitModal = (): void => {
    setSubmitModalOpen(false)
    setSelectedEventId(null)
    setValidationErrors(null)
  }

  const openDeleteModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = (): void => {
    setDeleteModalOpen(false)
    setSelectedEventId(null)
  }

  const submitForReview = async (eventId: number): Promise<void> => {
    setLoading(true)
    setValidationErrors(null)
    try {
      await organizerEventService.submitForReview(eventId)
      addToast({
        message: 'Evento enviado a revisión exitosamente',
        type: 'success'
      })
      closeSubmitModal()
      onSuccessRef.current?.()
    } catch (error) {
      const axiosError = error as AxiosError<SubmitEventError>
      if (axiosError.response?.status === 422) {
        // Validation errors - show which fields are missing
        const errors = axiosError.response.data?.errors
        setValidationErrors(errors || null)
        addToast({
          message: 'Faltan campos requeridos para enviar a revisión',
          type: 'error'
        })
      } else if (axiosError.response?.status === 403) {
        addToast({
          message: 'Solo eventos en borrador pueden ser enviados a revisión',
          type: 'error'
        })
      } else {
        addToast({
          message: 'Error al enviar evento a revisión',
          type: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const duplicateEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      const originalEvent = await organizerEventService.getEvent(eventId)

      if (!originalEvent.start_date) {
        throw new Error('No date available for duplication')
      }

      // Extract location IDs from locations array
      const locationIds = originalEvent.locations?.map((l: { id: number }) => l.id) || []

      if (locationIds.length === 0) {
        throw new Error('No location available for duplication')
      }

      await organizerEventService.createEvent({
        title: `${originalEvent.title} (Copia)`,
        description: originalEvent.description || '',
        start_date: originalEvent.start_date,
        end_date: originalEvent.end_date,
        location_ids: locationIds,
        // Event Type/Subtype (required - Dec 2, 2025)
        event_type_id: originalEvent.event_type_id || originalEvent.event_type?.id || 0,
        event_subtype_id: originalEvent.event_subtype_id || originalEvent.event_subtype?.id || 0,
        // Copy optional FK fields
        type_id: originalEvent.type_id,
        edition_number: originalEvent.edition_number,
        subtype_id: originalEvent.subtype_id,
        origin_id: originalEvent.origin_id,
        theme_id: originalEvent.theme_id,
        frequency_id: originalEvent.frequency_id,
        rotation_type_id: originalEvent.rotation_type_id,
        // Copy images
        logo_url: originalEvent.logo_url,
        featured_image: originalEvent.featured_image,
        responsive_image_url: originalEvent.responsive_image_url
      })

      addToast({
        message: 'Evento duplicado exitosamente',
        type: 'success'
      })
      onSuccessRef.current?.()
    } catch {
      addToast({
        message: 'Error al duplicar evento',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await organizerEventService.deleteEvent(eventId)
      addToast({
        message: 'Evento eliminado exitosamente',
        type: 'success'
      })
      closeDeleteModal()
      onSuccessRef.current?.()
    } catch {
      addToast({
        message: 'Error al eliminar evento',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    submitModalOpen,
    deleteModalOpen,
    selectedEventId,
    validationErrors,
    openSubmitModal,
    closeSubmitModal,
    openDeleteModal,
    closeDeleteModal,
    submitForReview,
    duplicateEvent,
    deleteEvent
  }
}
