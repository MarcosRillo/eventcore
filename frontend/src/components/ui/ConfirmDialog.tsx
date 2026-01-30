/**
 * ConfirmDialog Component - Minimalist Design System
 * Clean confirmation dialog with variant icons
 */

'use client'

import { useEffect } from 'react'

import Modal from '@/components/ui/Modal'
import { Button } from '@/shared/components/form'

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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel, loading])

  const iconConfig = {
    danger: {
      bg: 'bg-error-50',
      color: 'text-error-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-warning-50',
      color: 'text-warning-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-success-50',
      color: 'text-success-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-primary-50',
      color: 'text-primary-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
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
