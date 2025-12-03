/**
 * Event Subtypes Page - Placeholder
 * TODO: Implementar vista completa de gestión de subtipos
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Subtipos de Evento',
  description: 'Administración de subtipos de eventos',
}

export default function EventSubtypesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Gestión de Subtipos de Evento
        </h1>
        <p className="text-neutral-600">
          Vista de todos los subtipos de eventos organizados por tipo
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
              />
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Próximamente
          </h2>
          <p className="text-neutral-600 mb-6">
            La vista de gestión de subtipos está en desarrollo. Por ahora,
            puedes administrar los subtipos desde la página de cada tipo de evento.
          </p>

          {/* CTA */}
          <a
            href="/event-types"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Ir a Tipos de Evento
          </a>
        </div>
      </div>

      {/* Future Features Preview (optional) */}
      <div className="mt-8 bg-neutral-50 rounded-lg border border-neutral-200 p-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          Funcionalidades planificadas:
        </h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">✓</span>
            <span>Vista consolidada de todos los subtipos del sistema</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">✓</span>
            <span>Filtrado por tipo de evento y estado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">✓</span>
            <span>Búsqueda por nombre de subtipo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">✓</span>
            <span>Edición y gestión masiva de subtipos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
