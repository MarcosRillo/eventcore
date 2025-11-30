/**
 * Auth Layout - Minimalist Design System
 * Layout wrapper for authentication pages (login, register, etc.)
 */

import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  )
}

export default AuthLayout
