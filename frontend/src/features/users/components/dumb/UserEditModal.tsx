/**
 * User Edit Modal - Dumb Component
 * Modal for editing user name and email
 * Receives all state via props (no hooks)
 */

import { Button } from '@/components/ui'
import Modal from '@/components/ui/Modal'
import type { User } from '@/features/users/types/user.types'

interface UserEditModalProps {
  user: User | null
  isOpen: boolean
  loading: boolean
  name: string
  email: string
  errors: { name?: string; email?: string }
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

/**
 *
 * @param root0
 * @param root0.user
 * @param root0.isOpen
 * @param root0.loading
 * @param root0.name
 * @param root0.email
 * @param root0.errors
 * @param root0.onNameChange
 * @param root0.onEmailChange
 * @param root0.onSubmit
 * @param root0.onClose
 */
export function UserEditModal({
  user,
  isOpen,
  loading,
  name,
  email,
  errors,
  onNameChange,
  onEmailChange,
  onSubmit,
  onClose,
}: UserEditModalProps) {
  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-user-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <input
            id="edit-user-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-user-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="edit-user-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UserEditModal
