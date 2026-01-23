import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

type FormFieldValue = string | number | boolean | null

interface EventFormMediaProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
}

/**
 * Media section: event website, logo, featured image, responsive image
 */
export const EventFormMedia = ({
  formData,
  errors,
  loading,
  handleChange
}: EventFormMediaProps) => {
  return (
    <>
      {/* SECCIÓN 5: INFORMACIÓN ADICIONAL */}
      <EventFormSection number={5} title="Información Adicional">
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
              aria-invalid={!!errors.event_website}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>
      </EventFormSection>

      {/* SECCIÓN 6: IMÁGENES */}
      <EventFormSection number={6} title="Imágenes">
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
              aria-invalid={!!errors.logo_url}
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
              aria-invalid={!!errors.featured_image}
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
              aria-invalid={!!errors.responsive_image_url}
              className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com/imagen-mobile.jpg"
            />
          </div>
        </div>
      </EventFormSection>
    </>
  )
}
