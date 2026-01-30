import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { ImageUploadField, Input } from '@/shared/components/form'

type FormFieldValue = string | number | boolean | null

interface EventFormMediaProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
  handleFileChange: (field: keyof EventFormData, file: File | null) => void
}

/**
 * Media section: event website, logo, featured image, responsive image
 */
export const EventFormMedia = ({
  formData,
  errors,
  loading,
  handleChange,
  handleFileChange
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
        <div className="grid grid-cols-1 gap-6">
          {/* Imagen Principal (Featured Image) */}
          <ImageUploadField
            label="Imagen Principal"
            value={formData.featured_image}
            onChange={(value) => handleChange('featured_image', value)}
            file={formData.featured_image_file}
            onFileChange={(file) => handleFileChange('featured_image_file', file)}
            recommendedSize="1920 x 1080 px"
            aspectRatio="16:9"
            disabled={loading}
            error={errors.featured_image || errors.featured_image_file}
            helperText="Banner principal, hero en página de detalle, cards grandes"
            fullWidth
          />

          {/* Logo */}
          <ImageUploadField
            label="Logo del Evento"
            value={formData.logo_url}
            onChange={(value) => handleChange('logo_url', value)}
            file={formData.logo_file}
            onFileChange={(file) => handleFileChange('logo_file', file)}
            recommendedSize="500 x 500 px"
            aspectRatio="1:1"
            disabled={loading}
            error={errors.logo_url || errors.logo_file}
            helperText="Logo del evento, thumbnails, favicon"
            fullWidth
          />

          {/* Imagen Responsive */}
          <ImageUploadField
            label="Imagen Responsive (Móvil)"
            value={formData.responsive_image_url}
            onChange={(value) => handleChange('responsive_image_url', value)}
            file={formData.responsive_image_file}
            onFileChange={(file) => handleFileChange('responsive_image_file', file)}
            recommendedSize="800 x 450 px"
            aspectRatio="16:9"
            disabled={loading}
            error={errors.responsive_image_url || errors.responsive_image_file}
            helperText="Vista móvil, cards pequeños, redes sociales"
            fullWidth
          />
        </div>
      </EventFormSection>
    </>
  )
}
