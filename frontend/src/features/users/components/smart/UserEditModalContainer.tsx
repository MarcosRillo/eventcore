'use client'

/**
 * User Edit Modal Container - Smart Component
 * Manages form state via useUserEdit hook and passes to dumb component
 */

import { UserEditModal } from '@/features/users/components/dumb/UserEditModal'
import { useUserEdit } from '@/features/users/hooks/useUserEdit'
import type { User, UpdateUserData } from '@/features/users/types/user.types'

interface UserEditModalContainerProps {
  user: User | null
  isOpen: boolean
  loading: boolean
  onClose: () => void
  onSave: (id: number, data: UpdateUserData) => Promise<boolean>
}

export function UserEditModalContainer({
  user,
  isOpen,
  loading,
  onClose,
  onSave,
}: UserEditModalContainerProps) {
  const {
    name,
    email,
    errors,
    setName,
    setEmail,
    handleSubmit,
    handleClose,
  } = useUserEdit({ user, onSave, onClose })

  return (
    <UserEditModal
      user={user}
      isOpen={isOpen}
      loading={loading}
      name={name}
      email={email}
      errors={errors}
      onNameChange={setName}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  )
}

export default UserEditModalContainer
