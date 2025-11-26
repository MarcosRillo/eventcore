/**
 * Footer Component
 * Landing page footer with links and contact info
 */

import Link from 'next/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Eventos Tucumán</h3>
            <p className="text-gray-400">
              Plataforma de gestión y difusión de eventos turísticos y culturales
              de la provincia de Tucumán.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/calendar"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Ver Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Acceso Organizadores
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-400">
              <li>📧 info@eventostucuman.gob.ar</li>
              <li>📱 +54 381 XXX-XXXX</li>
              <li>📍 San Miguel de Tucumán, Argentina</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>
            &copy; {currentYear} Ente de Turismo de Tucumán. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
