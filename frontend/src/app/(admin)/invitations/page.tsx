import { Mail } from 'lucide-react'

import InvitationTableContainer from '@/features/invitations/components/smart/InvitationTableContainer'

const InvitationsPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-4">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Invitaciones</h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Gestiona las invitaciones pendientes para nuevos usuarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <InvitationTableContainer />
      </div>
    </div>
  )
}

export default InvitationsPage
