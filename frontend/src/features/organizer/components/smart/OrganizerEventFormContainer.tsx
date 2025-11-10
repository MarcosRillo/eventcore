import { useEventForm } from '@/features/organizer/hooks/useEventForm'
import { OrganizerEventForm } from '@/features/organizer/components/dumb/OrganizerEventForm'

interface OrganizerEventFormContainerProps {
  eventId?: number
  mode?: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
}

export const OrganizerEventFormContainer = ({
  eventId,
  onSuccess,
  onCancel
}: OrganizerEventFormContainerProps) => {
  const {
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
  } = useEventForm({ eventId, onSuccess, onCancel })

  return (
    <OrganizerEventForm
      formData={formData}
      errors={errors}
      loading={loading}
      initialLoading={initialLoading}
      categories={categories}
      locations={locations}
      isEditMode={isEditMode}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  )
}
