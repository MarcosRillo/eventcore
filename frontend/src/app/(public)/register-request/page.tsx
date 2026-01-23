/**
 * Public Registration Request Page
 * Server Component with static metadata for SEO
 */

import { Metadata } from 'next'

import { RegisterRequestPageContainer } from '@/features/registration-requests/components/smart/RegisterRequestPageContainer'

export const metadata: Metadata = {
  title: 'Solicitar Registro | Plataforma de Eventos',
  description: 'Solicita el registro de tu organización en la plataforma de eventos turísticos de Tucumán',
}

export default function RegisterRequestPage() {
  return <RegisterRequestPageContainer />
}
