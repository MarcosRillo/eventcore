/**
 * Toast Component - Minimalist Design System
 * Clean notification system with auto-dismiss
 */

'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { Transition } from '@headlessui/react'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

interface ToastConfig {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  addToast: (config: ToastConfig) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 200)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      text: 'text-amber-800',
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      icon: 'text-primary-500',
      text: 'text-primary-800',
    },
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  }

  const styles = config[type]

  return (
    <Transition
      show={isVisible}
      enter="transform ease-out duration-200 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`
          max-w-sm w-full rounded-lg border shadow-sm
          pointer-events-auto overflow-hidden
          ${styles.bg} ${styles.border}
        `}
        role="alert"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${styles.icon}`}>
              {icons[type]}
            </div>
            <p className={`text-sm font-medium flex-1 ${styles.text}`}>
              {message}
            </p>
            <button
              type="button"
              className={`
                flex-shrink-0 rounded-md p-1
                ${styles.text} hover:opacity-70
                transition-opacity duration-150
                focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 200)
              }}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  )
}

const ToastContainer = ({ toasts }: { toasts: (ToastConfig & { id: string })[] }) => {
  const { removeToast } = useToast()

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center gap-3 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastConfig & { id: string })[]>([])

  const addToast = useCallback((config: ToastConfig) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...config, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const contextValue = {
    addToast,
    removeToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default Toast
