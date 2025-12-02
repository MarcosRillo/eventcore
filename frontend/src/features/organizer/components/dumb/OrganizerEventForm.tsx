'use client'

import { EventFormData, EventFormErrors, AsynchronousDate } from '@/features/organizer/types/event.types'
import { EventType, EventSubtype } from '@/types/eventType.types'
import { AsyncSearchableMultiSelect, SelectOption } from '@/shared/components/form'

interface OrganizerEventFormProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  initialLoading: boolean
  categories: { id: number; name: string }[]
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

export const OrganizerEventForm = ({
  formData,
  errors,
  loading,
  initialLoading,
  categories,
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
      {errors.general && (
        <div className="bg-error-50 border-l-4 border-error-600 text-error-800 px-4 py-3 rounded-sm" role="alert">
          <p className="font-medium">{errors.general}</p>
        </div>
      )}

      {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          1. Información Básica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Evento */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-600">
              Nombre del Evento *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Congreso Internacional de Turismo 2025"
            />
            {errors.title && (
              <p id="title-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Número de Edición */}
          <div>
            <label htmlFor="edition_number" className="block text-sm font-medium text-neutral-600">
              Número de Edición
            </label>
            <input
              type="text"
              id="edition_number"
              value={formData.edition_number}
              onChange={(e) => handleChange('edition_number', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.edition_number}
              aria-describedby={errors.edition_number ? 'edition-number-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: 10ma Edición"
            />
            {errors.edition_number && (
              <p id="edition-number-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.edition_number}</p>
            )}
          </div>

          {/* Tipo de Evento (Hierarchical - Dec 2, 2025) */}
          <div>
            <label htmlFor="event_type_id" className="block text-sm font-medium text-neutral-600">
              Tipo de Evento *
            </label>
            <select
              id="event_type_id"
              value={formData.event_type_id || ''}
              onChange={(e) => {
                const newTypeId = e.target.value ? parseInt(e.target.value) : null
                handleChange('event_type_id', newTypeId)
                // Reset subtype when type changes
                handleChange('event_subtype_id', null)
              }}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!errors.event_type_id}
              aria-describedby={errors.event_type_id ? 'event-type-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Seleccionar tipo de evento</option>
              {Array.isArray(eventTypes) && eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {errors.event_type_id && (
              <p id="event-type-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.event_type_id}</p>
            )}
          </div>

          {/* Subtipo de Evento (Hierarchical - Dec 2, 2025) */}
          <div>
            <label htmlFor="event_subtype_id" className="block text-sm font-medium text-neutral-600">
              Subtipo de Evento *
            </label>
            <select
              id="event_subtype_id"
              value={formData.event_subtype_id || ''}
              onChange={(e) => handleChange('event_subtype_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={loading || !formData.event_type_id}
              aria-required="true"
              aria-invalid={!!errors.event_subtype_id}
              aria-describedby={errors.event_subtype_id ? 'event-subtype-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">
                {!formData.event_type_id ? 'Primero selecciona un tipo' : 'Seleccionar subtipo'}
              </option>
              {Array.isArray(eventSubtypes) && eventSubtypes.map(subtype => (
                <option key={subtype.id} value={subtype.id}>{subtype.name}</option>
              ))}
            </select>
            {errors.event_subtype_id && (
              <p id="event-subtype-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.event_subtype_id}</p>
            )}
          </div>

          {/* Categoría (ahora opcional) */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-neutral-600">
              Categoría
            </label>
            <select
              id="category_id"
              value={formData.category_id || ''}
              onChange={(e) => handleChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={loading}
              aria-invalid={!!errors.category_id}
              aria-describedby={errors.category_id ? 'category-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Seleccionar categoría (opcional)</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p id="category-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.category_id}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-600">
              Descripción *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={4}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Descripción detallada del evento..."
            />
            {errors.description && (
              <p id="description-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: UBICACIÓN */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          2. Ubicación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ubicaciones (selección múltiple con búsqueda async) */}
          <div className="md:col-span-2">
            <AsyncSearchableMultiSelect
              label="Ubicaciones"
              onSearch={onSearchLocations}
              selected={formData.location_ids}
              selectedOptions={selectedLocations}
              onChange={(ids) => handleChange('location_ids', ids)}
              placeholder="Escribe para buscar ubicación..."
              error={errors.location_ids}
              disabled={loading}
              required={!formData.has_custom_location}
            />
          </div>

          {/* Checkbox "Otro" - Ubicación Personalizada */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_custom_location}
                onChange={(e) => handleCustomLocationToggle(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="text-sm text-neutral-700">Agregar ubicación personalizada (Otro)</span>
            </label>
          </div>

          {/* Campos de ubicación personalizada - solo visibles cuando has_custom_location es true */}
          {formData.has_custom_location && (
            <>
              <div>
                <label htmlFor="custom_location_name" className="block text-sm font-medium text-neutral-600">
                  Nombre del Lugar *
                </label>
                <input
                  type="text"
                  id="custom_location_name"
                  value={formData.custom_location_name}
                  onChange={(e) => handleChange('custom_location_name', e.target.value)}
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={!!errors.custom_location_name}
                  aria-describedby={errors.custom_location_name ? 'custom-location-error' : undefined}
                  className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="Ej: Salón de Eventos El Jardín"
                />
                {errors.custom_location_name && (
                  <p id="custom-location-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.custom_location_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="maps_url" className="block text-sm font-medium text-neutral-600">
                  URL de Google Maps
                </label>
                <input
                  type="text"
                  id="maps_url"
                  value={formData.maps_url}
                  onChange={(e) => handleChange('maps_url', e.target.value)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </>
          )}

          {/* Última Sede */}
          <div>
            <label htmlFor="previous_venue" className="block text-sm font-medium text-neutral-600">
              Última Sede (Anterior)
            </label>
            <input
              type="text"
              id="previous_venue"
              value={formData.previous_venue}
              onChange={(e) => handleChange('previous_venue', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Buenos Aires 2024"
            />
          </div>

          {/* Próxima Sede */}
          <div>
            <label htmlFor="next_venue" className="block text-sm font-medium text-neutral-600">
              Próxima Sede
            </label>
            <input
              type="text"
              id="next_venue"
              value={formData.next_venue}
              onChange={(e) => handleChange('next_venue', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Córdoba 2026"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: FECHAS */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          3. Fechas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-neutral-600">
              Fecha Inicio *
            </label>
            <input
              type="datetime-local"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!errors.start_date}
              aria-describedby={errors.start_date ? 'start-date-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.start_date && (
              <p id="start-date-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.start_date}</p>
            )}
          </div>

          {/* Fecha Fin */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-neutral-600">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.end_date}
              aria-describedby={errors.end_date ? 'end-date-error' : undefined}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.end_date && (
              <p id="end-date-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.end_date}</p>
            )}
          </div>
        </div>

        {/* Fechas Asincrónicas */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Fechas Adicionales (Opcional)
          </h3>
          <p className="text-xs text-neutral-500 mb-3">
            Agrega fechas adicionales para eventos que ocurren en días no consecutivos
          </p>

          {/* Lista de fechas asincrónicas */}
          {formData.async_dates.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.async_dates.map((asyncDate, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-sm p-3"
                >
                  <div className="flex-1 text-sm text-neutral-900">
                    <span className="font-medium">{asyncDate.date}</span>
                    {asyncDate.notes && (
                      <>
                        {' • '}
                        <span className="text-neutral-500">{asyncDate.notes}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAsynchronousDate(index)}
                    disabled={loading}
                    className="text-error-600 hover:text-error-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar nueva fecha asincrónica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input
                type="date"
                value={newAsyncDate.date}
                onChange={(e) => setNewAsyncDate({ ...newAsyncDate, date: e.target.value })}
                disabled={loading}
                placeholder="Fecha"
                className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <input
                type="text"
                value={newAsyncDate.notes}
                onChange={(e) => setNewAsyncDate({ ...newAsyncDate, notes: e.target.value })}
                disabled={loading}
                placeholder="Notas (opcional)"
                className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="button"
              onClick={addAsynchronousDate}
              disabled={loading || !newAsyncDate.date}
              className="bg-secondary-500 text-white px-4 py-2 rounded-sm font-medium shadow-sm hover:bg-secondary-600 active:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: ASISTENCIA */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          4. Asistencia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Asistencia Locales */}
          <div>
            <label htmlFor="local_attendance" className="block text-sm font-medium text-neutral-600">
              Asistencia Locales
            </label>
            <input
              type="number"
              id="local_attendance"
              value={formData.local_attendance}
              onChange={(e) => handleChange('local_attendance', e.target.value)}
              disabled={loading}
              min="0"
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>

          {/* Asistencia Nacionales */}
          <div>
            <label htmlFor="national_attendance" className="block text-sm font-medium text-neutral-600">
              Asistencia Nacionales
            </label>
            <input
              type="number"
              id="national_attendance"
              value={formData.national_attendance}
              onChange={(e) => handleChange('national_attendance', e.target.value)}
              disabled={loading}
              min="0"
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>

          {/* Asistencia Extranjeros */}
          <div>
            <label htmlFor="international_attendance" className="block text-sm font-medium text-neutral-600">
              Asistencia Extranjeros
            </label>
            <input
              type="number"
              id="international_attendance"
              value={formData.international_attendance}
              onChange={(e) => handleChange('international_attendance', e.target.value)}
              disabled={loading}
              min="0"
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
        </div>

        {/* Transmisión Virtual */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="virtual_transmission"
            checked={formData.virtual_transmission}
            onChange={(e) => handleChange('virtual_transmission', e.target.checked)}
            disabled={loading}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="virtual_transmission" className="ml-2 block text-sm text-neutral-900">
            Transmisión Virtual
          </label>
        </div>
      </div>

      {/* SECCIÓN 5: INFORMACIÓN ADICIONAL */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          5. Información Adicional
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Web del Evento */}
          <div>
            <label htmlFor="event_website" className="block text-sm font-medium text-neutral-600">
              Web del Evento
            </label>
            <input
              type="url"
              id="event_website"
              value={formData.event_website}
              onChange={(e) => handleChange('event_website', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 6: IMÁGENES */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          6. Imágenes
        </h2>
        <p className="text-sm text-neutral-500">
          Por ahora ingresa URLs de imágenes. Próximamente podrás subir archivos directamente.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {/* Logo */}
          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-neutral-600">
              Logo
            </label>
            <input
              type="url"
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          {/* Imagen Principal */}
          <div>
            <label htmlFor="featured_image" className="block text-sm font-medium text-neutral-600">
              Imagen Principal
            </label>
            <input
              type="url"
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => handleChange('featured_image', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Imagen Responsive */}
          <div>
            <label htmlFor="responsive_image_url" className="block text-sm font-medium text-neutral-600">
              Imagen Responsive (Móvil)
            </label>
            <input
              type="url"
              id="responsive_image_url"
              value={formData.responsive_image_url}
              onChange={(e) => handleChange('responsive_image_url', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com/imagen-mobile.jpg"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-sm font-semibold shadow-sm hover:bg-primary-600 hover:shadow-md active:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Evento' : 'Crear Evento')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 bg-neutral-50 text-neutral-700 py-3 px-6 rounded-sm font-medium border border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
