/**
 * Footer Component - Minimalist Design
 * Clean footer with subtle styling
 */

import Link from 'next/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-white py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-6 md:mb-10">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">eventcore</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Plataforma de gestión y difusión de eventos turísticos y culturales
              de la provincia de Tucumán.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Enlaces rápidos">
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/calendar"
                  className="py-1.5 -my-1.5 text-neutral-400 hover:text-white transition-colors duration-150 text-sm"
                >
                  Ver Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/register-request"
                  className="py-1.5 -my-1.5 text-neutral-400 hover:text-white transition-colors duration-150 text-sm"
                >
                  Registrar mi Organización
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="py-1.5 -my-1.5 text-neutral-400 hover:text-white transition-colors duration-150 text-sm"
                >
                  Acceso Organizadores
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-neutral-400 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                info@eventcore.dev
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                San Miguel de Tucumán
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 text-center">
          <p className="text-neutral-500 text-sm">
            © {currentYear} Demo Organization. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
