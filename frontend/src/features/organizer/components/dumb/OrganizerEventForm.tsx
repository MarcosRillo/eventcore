'use client'

import { EventFormData, EventFormErrors, AsynchronousDate } from '@/features/organizer/types/event.types'
import { useState } from 'react'

interface OrganizerEventFormProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  initialLoading: boolean
  categories: { id: number; name: string }[]
  locations: { id: number; name: string }[]
  isEditMode: boolean
  handleChange: (field: keyof EventFormData, value: string | number | boolean | null | AsynchronousDate[]) => void
  handleSubmit: (e: React.FormEvent) => void
  handleCancel: () => void
}

// Opciones para los selectores (pueden venir del backend luego)
const EVENT_TYPES = [
  { value: '', label: 'Seleccionar tipo de evento' },
  { value: 'congreso', label: 'Congreso' },
  { value: 'seminario', label: 'Seminario' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conferencia', label: 'Conferencia' },
  { value: 'feria', label: 'Feria' },
  { value: 'exposicion', label: 'Exposición' },
  { value: 'festival', label: 'Festival' },
]

const EVENT_SUBTYPES = [
  { value: '', label: 'Seleccionar subtipo' },
  { value: 'nacional', label: 'Nacional' },
  { value: 'internacional', label: 'Internacional' },
  { value: 'regional', label: 'Regional' },
  { value: 'local', label: 'Local' },
]

const ORIGINS = [
  { value: '', label: 'Seleccionar origen' },
  { value: 'publico', label: 'Público' },
  { value: 'privado', label: 'Privado' },
  { value: 'mixto', label: 'Mixto' },
]

const THEMES = [
  { value: '', label: 'Seleccionar tema' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'ciencia', label: 'Ciencia' },
  { value: 'negocios', label: 'Negocios' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educación' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'gastronomia', label: 'Gastronomía' },
]

const FREQUENCIES = [
  { value: '', label: 'Seleccionar frecuencia' },
  { value: 'unico', label: 'Único' },
  { value: 'anual', label: 'Anual' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'semanal', label: 'Semanal' },
]

const ROTATION_TYPES = [
  { value: '', label: 'Seleccionar tipo de rotación' },
  { value: 'fija', label: 'Sede Fija' },
  { value: 'rotativa_regional', label: 'Rotativa Regional' },
  { value: 'rotativa_nacional', label: 'Rotativa Nacional' },
  { value: 'rotativa_internacional', label: 'Rotativa Internacional' },
]

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
  // Estado local para manejar fechas asincrónicas
  const [newAsyncDate, setNewAsyncDate] = useState({ date: '', start_time: '', end_time: '' })

  const addAsynchronousDate = () => {
    if (!newAsyncDate.date || !newAsyncDate.start_time || !newAsyncDate.end_time) {
      return
    }

    const newDate: AsynchronousDate = {
      id: crypto.randomUUID(),
      date: newAsyncDate.date,
      start_time: newAsyncDate.start_time,
      end_time: newAsyncDate.end_time,
    }

    handleChange('asynchronous_dates', [...formData.asynchronous_dates, newDate])
    setNewAsyncDate({ date: '', start_time: '', end_time: '' })
  }

  const removeAsynchronousDate = (id: string) => {
    handleChange(
      'asynchronous_dates',
      formData.asynchronous_dates.filter(d => d.id !== id)
    )
  }

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
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 rounded-sm">
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
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Congreso Internacional de Turismo 2025"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.title}</p>
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
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: 10ma Edición"
            />
            {errors.edition_number && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.edition_number}</p>
            )}
          </div>

          {/* Tipo de Evento */}
          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-neutral-600">
              Tipo de Evento *
            </label>
            <select
              id="event_type"
              value={formData.event_type}
              onChange={(e) => handleChange('event_type', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {EVENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.event_type && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.event_type}</p>
            )}
          </div>

          {/* Subtipo de Evento */}
          <div>
            <label htmlFor="event_subtype" className="block text-sm font-medium text-neutral-600">
              Subtipo de Evento
            </label>
            <select
              id="event_subtype"
              value={formData.event_subtype}
              onChange={(e) => handleChange('event_subtype', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {EVENT_SUBTYPES.map(subtype => (
                <option key={subtype.value} value={subtype.value}>{subtype.label}</option>
              ))}
            </select>
          </div>

          {/* Origen */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-neutral-600">
              Origen
            </label>
            <select
              id="origin"
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {ORIGINS.map(origin => (
                <option key={origin.value} value={origin.value}>{origin.label}</option>
              ))}
            </select>
          </div>

          {/* Tema */}
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-neutral-600">
              Tema
            </label>
            <select
              id="theme"
              value={formData.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {THEMES.map(theme => (
                <option key={theme.value} value={theme.value}>{theme.label}</option>
              ))}
            </select>
          </div>

          {/* Frecuencia */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-neutral-600">
              Frecuencia
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Rotación */}
          <div>
            <label htmlFor="rotation_type" className="block text-sm font-medium text-neutral-600">
              Tipo de Rotación
            </label>
            <select
              id="rotation_type"
              value={formData.rotation_type}
              onChange={(e) => handleChange('rotation_type', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {ROTATION_TYPES.map(rotation => (
                <option key={rotation.value} value={rotation.value}>{rotation.label}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-neutral-600">
              Categoría *
            </label>
            <select
              id="category_id"
              value={formData.category_id || ''}
              onChange={(e) => handleChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Seleccionar categoría</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.category_id}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location_id" className="block text-sm font-medium text-neutral-600">
              Ubicación *
            </label>
            <select
              id="location_id"
              value={formData.location_id || ''}
              onChange={(e) => handleChange('location_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Seleccionar ubicación</option>
              {Array.isArray(locations) && locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.location_id}</p>
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
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Descripción detallada del evento..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: SERVICIOS Y CATERING */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          2. Servicios y Catering
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coffee Break */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="coffee_break"
              checked={formData.coffee_break}
              onChange={(e) => handleChange('coffee_break', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="coffee_break" className="ml-2 block text-sm text-neutral-900">
              Mesas de Coffee Break
            </label>
          </div>

          {/* Catering Almuerzo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lunch_catering"
              checked={formData.lunch_catering}
              onChange={(e) => handleChange('lunch_catering', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="lunch_catering" className="ml-2 block text-sm text-neutral-900">
              Catering de Almuerzo
            </label>
          </div>

          {/* Catering Cena */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dinner_catering"
              checked={formData.dinner_catering}
              onChange={(e) => handleChange('dinner_catering', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="dinner_catering" className="ml-2 block text-sm text-neutral-900">
              Catering de Cena
            </label>
          </div>

          {/* Paquete Pre-evento */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pre_event_package"
              checked={formData.pre_event_package}
              onChange={(e) => handleChange('pre_event_package', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="pre_event_package" className="ml-2 block text-sm text-neutral-900">
              Paquete Pre-evento
            </label>
          </div>

          {/* Paquete Post-evento */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="post_event_package"
              checked={formData.post_event_package}
              onChange={(e) => handleChange('post_event_package', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="post_event_package" className="ml-2 block text-sm text-neutral-900">
              Paquete Post-evento
            </label>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: UBICACIÓN */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          3. Ubicación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sede */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-neutral-600">
              Sede *
            </label>
            <input
              type="text"
              id="venue"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Centro de Convenciones"
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.venue}</p>
            )}
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-600">
              Ciudad *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: San Miguel de Tucumán"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.city}</p>
            )}
          </div>

          {/* Salones Utilizados */}
          <div className="md:col-span-2">
            <label htmlFor="rooms_used" className="block text-sm font-medium text-neutral-600">
              Salón/Salones Utilizados
            </label>
            <input
              type="text"
              id="rooms_used"
              value={formData.rooms_used}
              onChange={(e) => handleChange('rooms_used', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Salón Principal, Sala A, Sala B"
            />
          </div>

          {/* Maps URL */}
          <div className="md:col-span-2">
            <label htmlFor="maps_url" className="block text-sm font-medium text-neutral-600">
              Maps (URL o Embed)
            </label>
            <input
              type="text"
              id="maps_url"
              value={formData.maps_url}
              onChange={(e) => handleChange('maps_url', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: https://maps.google.com/... o código embed"
            />
          </div>

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

      {/* SECCIÓN 4: FECHAS Y HORARIOS */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          4. Fechas y Horarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha Desde */}
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium text-neutral-600">
              Fecha Desde *
            </label>
            <input
              type="date"
              id="event_date"
              value={formData.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.event_date && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.event_date}</p>
            )}
          </div>

          {/* Fecha Hasta */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-neutral-600">
              Fecha Hasta
            </label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.end_date}</p>
            )}
          </div>

          {/* Hora Desde */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-neutral-600">
              Hora Desde *
            </label>
            <input
              type="time"
              id="start_time"
              value={formData.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.start_time}</p>
            )}
          </div>

          {/* Hora Hasta */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-neutral-600">
              Hora Hasta *
            </label>
            <input
              type="time"
              id="end_time"
              value={formData.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* Fechas Asincrónicas */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Fechas Asincrónicas (Opcional)
          </h3>
          <p className="text-xs text-neutral-500 mb-3">
            Agrega fechas adicionales para eventos que ocurren en días no consecutivos (ej: lunes, miércoles y viernes)
          </p>

          {/* Lista de fechas asincrónicas */}
          {formData.asynchronous_dates.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.asynchronous_dates.map(asyncDate => (
                <div
                  key={asyncDate.id}
                  className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-sm p-3"
                >
                  <div className="flex-1 text-sm text-neutral-900">
                    <span className="font-medium">{asyncDate.date}</span>
                    {' • '}
                    <span>{asyncDate.start_time} - {asyncDate.end_time}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAsynchronousDate(asyncDate.id!)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar nueva fecha asincrónica */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <input
                type="date"
                value={newAsyncDate.date}
                onChange={(e) => setNewAsyncDate(prev => ({ ...prev, date: e.target.value }))}
                disabled={loading}
                placeholder="Fecha"
                className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <input
                type="time"
                value={newAsyncDate.start_time}
                onChange={(e) => setNewAsyncDate(prev => ({ ...prev, start_time: e.target.value }))}
                disabled={loading}
                placeholder="Hora inicio"
                className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <input
                type="time"
                value={newAsyncDate.end_time}
                onChange={(e) => setNewAsyncDate(prev => ({ ...prev, end_time: e.target.value }))}
                disabled={loading}
                placeholder="Hora fin"
                className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="button"
              onClick={addAsynchronousDate}
              disabled={loading || !newAsyncDate.date || !newAsyncDate.start_time || !newAsyncDate.end_time}
              className="bg-secondary-500 text-white px-4 py-2 rounded-sm font-medium shadow-sm hover:bg-secondary-600 active:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: ASISTENCIA */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          5. Asistencia
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

      {/* SECCIÓN 6: INFORMACIÓN ADICIONAL */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          6. Información Adicional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Productor */}
          <div>
            <label htmlFor="producer" className="block text-sm font-medium text-neutral-600">
              Productor
            </label>
            <input
              type="text"
              id="producer"
              value={formData.producer}
              onChange={(e) => handleChange('producer', e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="Ej: Empresa Productora XYZ"
            />
          </div>

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

      {/* SECCIÓN 7: IMÁGENES */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          7. Imágenes
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

          {/* Imagen */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-neutral-600">
              Imagen Principal
            </label>
            <input
              type="url"
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
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
