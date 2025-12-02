/**
 * Organizers Section Component
 * Call-to-action section for event organizers to register on the platform
 */

import Link from 'next/link'

export const OrganizersSection = () => {
  return (
    <section className="bg-primary-600 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Organizás eventos en Tucumán?
          </h2>

          {/* Description */}
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sumá tu organización a la plataforma oficial de eventos turísticos y culturales
            de la provincia. Llegá a miles de turistas y residentes interesados en tus eventos.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">Mayor Visibilidad</div>
              <p className="text-sm text-primary-100">
                Tu evento visible en el calendario oficial de turismo
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">Gestión Simple</div>
              <p className="text-sm text-primary-100">
                Panel de control para administrar todos tus eventos
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">Apoyo Institucional</div>
              <p className="text-sm text-primary-100">
                Respaldo del Ente de Turismo de Tucumán
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register-request"
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              Solicitar Registro
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent text-white font-medium border border-white/30 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
