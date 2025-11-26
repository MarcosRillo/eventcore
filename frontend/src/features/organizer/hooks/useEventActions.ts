/**
 * Custom hook for event action operations
 *
 * Provides methods to publish, duplicate, and delete events
 * with confirmation modals, loading states, and toast notifications.
 */

'use client';

import { useState } from 'react'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { useToast } from '@/components/ui/Toast'

interface UseEventActionsReturn {
  loading: boolean
  publishModalOpen: boolean
  deleteModalOpen: boolean
  selectedEventId: number | null
  openPublishModal: (eventId: number) => void
  closePublishModal: () => void
  openDeleteModal: (eventId: number) => void
  closeDeleteModal: () => void
  publishEvent: (eventId: number) => Promise<void>
  duplicateEvent: (eventId: number) => Promise<void>
  deleteEvent: (eventId: number) => Promise<void>
}

export const useEventActions = (
  onSuccess?: () => void
): UseEventActionsReturn => {
  const [loading, setLoading] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const { addToast } = useToast()

  const openPublishModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setPublishModalOpen(true)
  }

  const closePublishModal = (): void => {
    setPublishModalOpen(false)
    setSelectedEventId(null)
  }

  const openDeleteModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = (): void => {
    setDeleteModalOpen(false)
    setSelectedEventId(null)
  }

  const publishEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      await organizerEventService.publishEvent(eventId)
      addToast({
        message: 'Event published successfully',
        type: 'success'
      })
      closePublishModal()
      onSuccess?.()
    } catch {
      addToast({
        message: 'Failed to publish event',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const duplicateEvent = async (eventId: number): Promise<void> => {
    setLoading(true)
    try {
      const response = await organizerEventService.getEvent(eventId)
      const originalEvent = response.data

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...cleanData } = {
        ...originalEvent,
        title: `${originalEvent.title} (Copy)`,
        status: 'draft' as const
      }

      // Extract date and time from original event's start_date and end_date
      // Original event has start_date/end_date as ISO timestamps
      const dateSource = cleanData.start_date || cleanData.event_date
      if (!dateSource) {
        throw new Error('No date available for duplication')
      }

      const startDate = new Date(dateSource)
      const eventDate = startDate.toISOString().split('T')[0] // YYYY-MM-DD
      const startTime = cleanData.start_time || '09:00'
      const endTime = cleanData.end_time || '17:00'

      // Combine date + time into ISO 8601 format
      const startDateTime = `${eventDate}T${startTime}:00`
      const endDateTime = `${eventDate}T${endTime}:00`

      await organizerEventService.createEvent({
        title: cleanData.title,
        description: cleanData.description || '',
        start_date: startDateTime,
        end_date: endDateTime,
        category_id: cleanData.category_id || 0,
        location_ids: [cleanData.location_id || 0],  // Backend expects array
        featured_image: cleanData.image_url
      })

      addToast({
        message: 'Event duplicated successfully',
        type: 'success'
      })
      onSuccess?.()
    } catch {
      addToast({
        message: 'Failed to duplicate event',
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
        message: 'Event deleted successfully',
        type: 'success'
      })
      closeDeleteModal()
      onSuccess?.()
    } catch {
      addToast({
        message: 'Failed to delete event',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    publishModalOpen,
    deleteModalOpen,
    selectedEventId,
    openPublishModal,
    closePublishModal,
    openDeleteModal,
    closeDeleteModal,
    publishEvent,
    duplicateEvent,
    deleteEvent
  }
}
