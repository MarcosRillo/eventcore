import { useEventForm } from '@/features/organizer/hooks/useEventForm'
import { OrganizerEventForm } from '@/features/organizer/components/dumb/OrganizerEventForm'

interface OrganizerEventFormContainerProps {
  eventId?: number
}

export const OrganizerEventFormContainer = ({ eventId }: OrganizerEventFormContainerProps) => {
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
  } = useEventForm({ eventId })

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
