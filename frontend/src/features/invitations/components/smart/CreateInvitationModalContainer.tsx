'use client'

/**
 * Create Invitation Modal Container - Smart Component
 * Manages form state via useCreateInvitation hook and passes to dumb component
 */

import { CreateInvitationModal } from '@/features/invitations/components/dumb/CreateInvitationModal'
import { useCreateInvitation } from '@/features/invitations/hooks/useCreateInvitation'
import type { AssignableRole, SendInvitationData } from '@/features/invitations/types/invitation.types'

interface CreateInvitationModalContainerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SendInvitationData) => Promise<boolean>
  roles: AssignableRole[]
  isLoading: boolean
}

export function CreateInvitationModalContainer({
  isOpen,
  onClose,
  onSubmit,
  roles,
  isLoading,
}: CreateInvitationModalContainerProps) {
  const {
    email,
    roleId,
    errors,
    setEmail,
    setRoleId,
    clearEmailError,
    clearRoleError,
    handleSubmit,
    handleClose,
  } = useCreateInvitation({ onSubmit, onClose, isLoading })

  return (
    <CreateInvitationModal
      isOpen={isOpen}
      isLoading={isLoading}
      roles={roles}
      email={email}
      roleId={roleId}
      errors={errors}
      onEmailChange={setEmail}
      onRoleChange={setRoleId}
      onEmailBlur={clearEmailError}
      onRoleBlur={clearRoleError}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}

export default CreateInvitationModalContainer
