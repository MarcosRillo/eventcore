'use client'

import {
  EventFormActions,
  EventFormAttendance,
  EventFormBasicInfo,
  EventFormDates,
  EventFormLocation,
  EventFormMedia} from '@/features/organizer/components/dumb/event-form'
import { AsynchronousDate,EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { SelectOption } from '@/shared/components/form'
import { EventSubtype,EventType } from '@/types/eventType.types'

interface OrganizerEventFormProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  initialLoading: boolean
  eventTypes: EventType[]
  eventSubtypes: EventSubtype[]
  onSearchLocations: (query: string) => Promise<SelectOption[]>
  selectedLocations: SelectOption[]
  isEditMode: boolean
  newAsyncDate: { date: string; notes: string }
  setNewAsyncDate: (value: { date: string; notes: string }) => void
  handleChange: (field: keyof EventFormData, value: string | number | boolean | null | number[] | AsynchronousDate[]) => void
  handleSubmit: (e: React.FormEvent) => void
  handleCancel: () => void
  addAsynchronousDate: () => void
  removeAsynchronousDate: (index: number) => void
  handleCustomLocationToggle: (checked: boolean) => void
}

/**
 * OrganizerEventForm - Compositor Component
 *
 * Orchestrates the event form sections without containing implementation details.
 * Each section is a separate component for maintainability and testability.
 *
 * Sections:
 * 1. Basic Info - Title, edition, type, subtype, description
 * 2. Location - Locations multi-select, custom location, venues
 * 3. Dates - Start/end dates, asynchronous dates
 * 4. Attendance - Local/national/international, virtual transmission
 * 5. Additional Info - Event website
 * 6. Media - Logo, featured image, responsive image
 */
export const OrganizerEventForm = ({
  formData,
  errors,
  loading,
  initialLoading,
  eventTypes,
  eventSubtypes,
  onSearchLocations,
  selectedLocations,
  isEditMode,
  newAsyncDate,
  setNewAsyncDate,
  handleChange,
  handleSubmit,
  handleCancel,
  addAsynchronousDate,
  removeAsynchronousDate,
  handleCustomLocationToggle
}: OrganizerEventFormProps) => {
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-neutral-600">Cargando evento...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Error Alert */}
      {errors.general && (
        <div className="bg-error-50 border-l-4 border-error-600 text-error-800 px-4 py-3 rounded-sm" role="alert">
          <p className="font-medium">{errors.general}</p>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <EventFormBasicInfo
        formData={formData}
        errors={errors}
        loading={loading}
        eventTypes={eventTypes}
        eventSubtypes={eventSubtypes}
        handleChange={handleChange}
      />

      {/* Section 2: Location */}
      <EventFormLocation
        formData={formData}
        errors={errors}
        loading={loading}
        onSearchLocations={onSearchLocations}
        selectedLocations={selectedLocations}
        handleChange={handleChange}
        handleCustomLocationToggle={handleCustomLocationToggle}
      />

      {/* Section 3: Dates */}
      <EventFormDates
        formData={formData}
        errors={errors}
        loading={loading}
        newAsyncDate={newAsyncDate}
        setNewAsyncDate={setNewAsyncDate}
        handleChange={handleChange}
        addAsynchronousDate={addAsynchronousDate}
        removeAsynchronousDate={removeAsynchronousDate}
      />

      {/* Section 4: Attendance */}
      <EventFormAttendance
        formData={formData}
        errors={errors}
        loading={loading}
        handleChange={handleChange}
      />

      {/* Sections 5 & 6: Additional Info and Media */}
      <EventFormMedia
        formData={formData}
        errors={errors}
        loading={loading}
        handleChange={handleChange}
      />

      {/* Action Buttons */}
      <EventFormActions
        loading={loading}
        isEditMode={isEditMode}
        onCancel={handleCancel}
      />
    </form>
  )
}
