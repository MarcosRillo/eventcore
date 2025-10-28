import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

interface OrganizerEventFormProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  initialLoading: boolean
  categories: { id: number; name: string }[]
  locations: { id: number; name: string }[]
  isEditMode: boolean
  handleChange: (field: keyof EventFormData, value: string | number | null) => void
  handleSubmit: (e: React.FormEvent) => void
  handleCancel: () => void
}

export const OrganizerEventForm = ({
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
}: OrganizerEventFormProps) => {
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={loading}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Event Date Field */}
      <div>
        <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
          Event Date *
        </label>
        <input
          type="date"
          id="event_date"
          value={formData.event_date}
          onChange={(e) => handleChange('event_date', e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.event_date && (
          <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>
        )}
      </div>

      {/* Start Time Field */}
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
          Start Time *
        </label>
        <input
          type="time"
          id="start_time"
          value={formData.start_time}
          onChange={(e) => handleChange('start_time', e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.start_time && (
          <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
        )}
      </div>

      {/* End Time Field */}
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
          End Time *
        </label>
        <input
          type="time"
          id="end_time"
          value={formData.end_time}
          onChange={(e) => handleChange('end_time', e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.end_time && (
          <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          id="category"
          value={formData.category_id ?? ''}
          onChange={(e) => handleChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
        )}
      </div>

      {/* Location Field */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <select
          id="location"
          value={formData.location_id ?? ''}
          onChange={(e) => handleChange('location_id', e.target.value ? parseInt(e.target.value) : null)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        {errors.location_id && (
          <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
        )}
      </div>

      {/* Image URL Field (Optional) */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          id="image_url"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
