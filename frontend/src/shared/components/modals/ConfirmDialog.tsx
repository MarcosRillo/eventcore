/**
 * ConfirmDialog Component - Minimalist Design System
 * Clean confirmation dialog with variant icons
 */

'use client'

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { Button } from '@/shared/components/form'
import Modal from '@/shared/components/modals/Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  const iconConfig = {
    danger: {
      bg: 'bg-error-50',
      color: 'text-error-500',
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    warning: {
      bg: 'bg-warning-50',
      color: 'text-warning-500',
      icon: <AlertCircle className="w-6 h-6" />,
    },
    success: {
      bg: 'bg-success-50',
      color: 'text-success-500',
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    info: {
      bg: 'bg-primary-50',
      color: 'text-primary-500',
      icon: <Info className="w-6 h-6" />,
    },
  }

  const config = iconConfig[variant]

  const buttonVariantMap: Record<string, 'danger' | 'warning' | 'success' | 'primary'> = {
    danger: 'danger',
    warning: 'warning',
    success: 'success',
    info: 'primary',
  }

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={buttonVariantMap[variant]}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onCancel}
      title={title}
      footer={footer}
      size="sm"
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}>
          {config.icon}
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed pt-2">
          {message}
        </p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
