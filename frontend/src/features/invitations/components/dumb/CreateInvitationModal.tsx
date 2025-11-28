'use client'

import { useState, FormEvent } from 'react'
import { AssignableRole, SendInvitationData } from '../../types/invitation.types'
import { Mail, UserPlus, Loader2 } from 'lucide-react'

interface CreateInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SendInvitationData) => Promise<boolean>
  roles: AssignableRole[]
  isLoading: boolean
}

interface FormErrors {
  email?: string
  role_id?: string
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const CreateInvitationModal = ({
  isOpen,
  onClose,
  onSubmit,
  roles,
  isLoading,
}: CreateInvitationModalProps) => {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingrese un email válido'
    }

    if (!roleId) {
      newErrors.role_id = 'Debe seleccionar un rol'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const success = await onSubmit({
      email: email.trim(),
      role_id: roleId as number,
    })

    if (success) {
      setEmail('')
      setRoleId('')
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail('')
      setRoleId('')
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="create-invitation-modal"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Nueva Invitación</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            data-testid="close-modal-button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="usuario@ejemplo.com"
                disabled={isLoading}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                data-testid="email-input"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" data-testid="email-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Role field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="role"
              name="role_id"
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value ? Number(e.target.value) : '')
                if (errors.role_id) setErrors((prev) => ({ ...prev, role_id: undefined }))
              }}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                errors.role_id ? 'border-red-500' : 'border-gray-300'
              }`}
              data-testid="role-select"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="mt-1 text-sm text-red-600" data-testid="role-error">
                {errors.role_id}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              data-testid="submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Invitación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInvitationModal
