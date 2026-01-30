import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { Input } from '@/shared/components/form'

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
          <Input
            type="url"
            label="Web del Evento"
            value={formData.event_website}
            onChange={(e) => handleChange('event_website', e.target.value)}
            disabled={loading}
            error={errors.event_website}
            placeholder="https://ejemplo.com"
            spellCheck={false}
            autoComplete="url"
            fullWidth
          />
        </div>
      </EventFormSection>

      {/* SECCIÓN 6: IMÁGENES */}
      <EventFormSection number={6} title="Imágenes">
        <p className="text-sm text-neutral-500">
          Por ahora ingresa URLs de imágenes. Próximamente podrás subir archivos directamente.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {/* Logo */}
          <Input
            type="url"
            label="Logo"
            value={formData.logo_url}
            onChange={(e) => handleChange('logo_url', e.target.value)}
            disabled={loading}
            error={errors.logo_url}
            placeholder="https://ejemplo.com/logo.png"
            spellCheck={false}
            autoComplete="off"
            fullWidth
          />

          {/* Imagen Principal */}
          <Input
            type="url"
            label="Imagen Principal"
            value={formData.featured_image}
            onChange={(e) => handleChange('featured_image', e.target.value)}
            disabled={loading}
            error={errors.featured_image}
            placeholder="https://ejemplo.com/imagen.jpg"
            spellCheck={false}
            autoComplete="off"
            fullWidth
          />

          {/* Imagen Responsive */}
          <Input
            type="url"
            label="Imagen Responsive (Móvil)"
            value={formData.responsive_image_url}
            onChange={(e) => handleChange('responsive_image_url', e.target.value)}
            disabled={loading}
            error={errors.responsive_image_url}
            placeholder="https://ejemplo.com/imagen-mobile.jpg"
            spellCheck={false}
            autoComplete="off"
            fullWidth
          />
        </div>
      </EventFormSection>
    </>
  )
}
