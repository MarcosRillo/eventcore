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
    handleCustomLocationToggle,
    handleSearchLocations
  } = useEventForm({ eventId, onSuccess, onError, onCancel })

  return (
    <OrganizerEventForm
      formData={formData}
      errors={errors}
      loading={loading}
      initialLoading={initialLoading}
      eventTypes={eventTypes}
      eventSubtypes={eventSubtypes}
      onSearchLocations={handleSearchLocations}
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
