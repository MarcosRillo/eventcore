'use client'

/**
 * Appearance Page Container
 * Pure presentation component - ALL logic handled by useAppearanceForm hook
 * Renders theme customization form with real-time preview
 */

import { LoadingSpinner } from '@/components/ui';
import Button from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import Input from '@/components/ui/Input';
import SafeImage from '@/components/ui/SafeImage';
import { useAppearanceForm } from '@/features/appearance/hooks/useAppearanceForm';

export function AppearancePageContainer() {
  const {
    data,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    updateField,
    handleSubmit,
    resetForm,
    resetToDefaults,
  } = useAppearanceForm();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando configuración de apariencia..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Configuración de Apariencia</h1>
          <p className="mt-2 text-neutral-600">
            Personaliza la apariencia de tu plataforma de calendario
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Configuración</h2>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
                <p className="text-error-800">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit?.(); }} className="space-y-6">
              {/* Logo URL */}
              <Input
                label="URL del Logo"
                type="url"
                value={data.logo_url || ''}
                onChange={(e) => updateField('logo_url', e.target.value || null)}
                placeholder="https://ejemplo.com/logo.png"
                disabled={isSaving}
              />

              {/* Banner URL */}
              <Input
                label="URL del Banner"
                type="url"
                value={data.banner_url || ''}
                onChange={(e) => updateField('banner_url', e.target.value || null)}
                placeholder="https://ejemplo.com/banner.png"
                disabled={isSaving}
              />

              {/* Color Scheme */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Esquema de Colores</h3>

                <ColorPicker
                  label="Color Primario"
                  value={data.color_primary}
                  onChange={(value) => updateField('color_primary', value)}
                  disabled={isSaving}
                />

                <ColorPicker
                  label="Color Secundario"
                  value={data.color_secondary}
                  onChange={(value) => updateField('color_secondary', value)}
                  disabled={isSaving}
                />

                <ColorPicker
                  label="Color de Fondo"
                  value={data.color_background}
                  onChange={(value) => updateField('color_background', value)}
                  disabled={isSaving}
                />

                <ColorPicker
                  label="Color de Texto"
                  value={data.color_text}
                  onChange={(value) => updateField('color_text', value)}
                  disabled={isSaving}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!hasUnsavedChanges || isSaving}
                  loading={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  Descartar Cambios
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToDefaults}
                  disabled={isSaving}
                >
                  Restaurar Predeterminados
                </Button>
              </div>
            </form>
          </div>

          {/* Live Preview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Vista Previa</h2>

            <div
              className="border-2 border-dashed border-neutral-300 rounded-lg p-6 min-h-96"
              style={{
                backgroundColor: data.color_background,
                color: data.color_text,
              }}
            >
              {/* Preview Header */}
              <div className="mb-6">
                <div
                  className="w-full h-24 rounded-lg mb-4 flex items-center justify-center"
                  style={{ backgroundColor: data.color_primary }}
                >
                  {data.banner_url ? (
                    <SafeImage
                      src={data.banner_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover rounded-lg"
                      fill
                      fallback={<span className="text-white font-medium">Error al cargar banner</span>}
                    />
                  ) : (
                    <span className="text-white font-medium">Banner Area</span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {data.logo_url ? (
                    <SafeImage
                      src={data.logo_url}
                      alt="Logo Preview"
                      className="w-12 h-12 object-contain"
                      width={48}
                      height={48}
                      fallback={
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: data.color_primary }}
                        >
                          ERROR
                        </div>
                      }
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: data.color_primary }}
                    >
                      LOGO
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">Nombre de la Organización</h3>
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `${data.color_secondary}20` }}
                >
                  <h4 className="font-medium mb-2">Ejemplo de Tarjeta</h4>
                  <p className="text-sm opacity-75">
                    Este es un ejemplo de cómo se verá el contenido con los colores seleccionados.
                  </p>
                </div>

                <Button
                  variant="primary"
                  style={{ backgroundColor: data.color_primary }}
                >
                  Botón de Ejemplo
                </Button>

                <Button
                  variant="outline"
                  style={{
                    borderColor: data.color_secondary,
                    color: data.color_secondary
                  }}
                >
                  Botón Secundario
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
