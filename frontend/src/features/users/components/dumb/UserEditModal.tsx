'use client'

/**
 * User Edit Modal - Dumb Component
 * Modal for editing user name and email
 */

import { useState, useEffect } from 'react'
import type { User, UpdateUserData } from '../../types/user.types'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui'

interface UserEditModalProps {
  user: User | null
  isOpen: boolean
  loading: boolean
  onClose: () => void
  onSave: (id: number, data: UpdateUserData) => Promise<boolean>
}

export function UserEditModal({
  user,
  isOpen,
  loading,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setErrors({})
    }
  }, [user])

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (name.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres'
    }

    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email debe ser válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validate()) return

    const success = await onSave(user.id, { name: name.trim(), email: email.trim() })
    if (success) {
      onClose()
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Usuario" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => setName(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
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
            onClick={handleClose}
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
