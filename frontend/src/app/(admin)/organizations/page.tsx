import UnifiedOrganizationsContainer from '@/features/organizations/components/smart/UnifiedOrganizationsContainer'

const OrganizationsPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Organizaciones</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Gestiona organizaciones, solicitudes de registro e invitaciones
          </p>
        </div>

        {/* Content */}
        <UnifiedOrganizationsContainer />
      </div>
    </div>
  )
}

export default OrganizationsPage
