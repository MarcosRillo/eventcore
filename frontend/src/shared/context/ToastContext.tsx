'use client'

/**
 * Toast Context - Global Toast Notification System
 * Provides addToast and removeToast functions via React Context
 */

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

import { ToastContainer } from '@/shared/components/feedback/Toast'

export interface ToastConfig {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface ToastWithId extends ToastConfig {
  id: string
}

interface ToastContextType {
  addToast: (config: ToastConfig) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastWithId[]>([])

  const addToast = useCallback((config: ToastConfig) => {
    const id = crypto.randomUUID()
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
