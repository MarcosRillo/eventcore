import { OrganizerEventForm } from '@/features/organizer/components/dumb/OrganizerEventForm'
import { useEventForm } from '@/features/organizer/hooks/useEventForm'

interface OrganizerEventFormContainerProps {
  eventId?: number
  mode?: 'create' | 'edit'
  onSuccess?: () => void
  onError?: (message: string) => void
  onCancel?: () => void
}

export const OrganizerEventFormContainer = ({
  eventId,
  onSuccess,
  onError,
  onCancel
}: OrganizerEventFormContainerProps) => {
  const {
    formData,
    errors,
    loading,
    initialLoading,
    eventTypes,
    eventSubtypes,
    allLocations,
    selectedLocations,
    isEditMode,
    newAsyncDate,
    setNewAsyncDate,
    handleChange,
    handleFileChange,
    handleSubmit,
    handleCancel,
    addAsynchronousDate,
    removeAsynchronousDate,
    handleCustomLocationToggle
  } = useEventForm({ eventId, onSuccess, onError, onCancel })

  return (
    <OrganizerEventForm
      formData={formData}
      errors={errors}
      loading={loading}
      initialLoading={initialLoading}
      eventTypes={eventTypes}
      eventSubtypes={eventSubtypes}
      allLocations={allLocations}
      selectedLocations={selectedLocations}
      isEditMode={isEditMode}
      newAsyncDate={newAsyncDate}
      setNewAsyncDate={setNewAsyncDate}
      handleChange={handleChange}
      handleFileChange={handleFileChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      addAsynchronousDate={addAsynchronousDate}
      removeAsynchronousDate={removeAsynchronousDate}
      handleCustomLocationToggle={handleCustomLocationToggle}
    />
  )
}
