/**
 * Custom hook for event action operations
 *
 * Provides methods to submit for review and delete events
 * with confirmation modals, loading states, and toast notifications.
 */

'use client';

import { AxiosError } from 'axios'
import { useRef, useState, useTransition } from 'react'

import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { SubmitEventError } from '@/features/organizer/types/event.types'
import { useToast } from '@/shared/context'

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
  deleteEvent: (eventId: number) => Promise<void>
}

export const useEventActions = (
  onSuccess?: (deletedEventId?: number) => void
): UseEventActionsReturn => {
  // React 19 transition for non-blocking UI
  const [, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    setValidationErrors(null)
    startTransition(async () => {
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
        setIsLoading(false)
      }
    })
  }

  const deleteEvent = async (eventId: number): Promise<void> => {
    setIsLoading(true)
    try {
      await organizerEventService.deleteEvent(eventId)
      addToast({
        message: 'Evento eliminado exitosamente',
        type: 'success'
      })
      closeDeleteModal()
      onSuccessRef.current?.(eventId)
    } catch {
      addToast({
        message: 'Error al eliminar evento',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Backward compatibility
  const loading = isLoading

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
    deleteEvent
  }
}
