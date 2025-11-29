/**
 * Footer Component - Minimalist Design
 * Clean footer with subtle styling
 */

import Link from 'next/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Eventos Tucumán</h3>
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
                  className="text-neutral-400 hover:text-white transition-colors duration-150 text-sm"
                >
                  Ver Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-neutral-400 hover:text-white transition-colors duration-150 text-sm"
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
                info@eventostucuman.gob.ar
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +54 381 XXX-XXXX
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
            © {currentYear} Ente de Turismo de Tucumán. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
