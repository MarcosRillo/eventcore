'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react'
import { memo } from 'react'

import type { User } from '@/types/auth.types'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const UserMenu = memo(function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="flex items-center gap-3 text-sm rounded-xl p-2.5 hover:bg-neutral-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        aria-label="Menu de usuario"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
          {getUserInitials(user.name)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-neutral-900 leading-tight">
            {user.name}
          </p>
          <p className="text-xs text-neutral-500 font-medium capitalize leading-tight">
            {user.role?.role_code === 'entity_admin'
              ? 'Administrador'
              : user.role?.role_name ?? 'Usuario'}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-500" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="z-50 mt-2 w-64 rounded-xl bg-white shadow-2xl ring-1 ring-neutral-200 focus:outline-none overflow-hidden"
      >
        {/* User info header */}
        <div className="px-4 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
              {getUserInitials(user.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {user.name}
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 transition-all duration-150 ${
                  focus ? 'bg-neutral-100' : ''
                }`}
              >
                <UserIcon
                  className="w-4 h-4 text-neutral-500"
                  aria-hidden="true"
                />
                <span className="font-medium">Mi Perfil</span>
              </button>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 transition-all duration-150 ${
                  focus ? 'bg-neutral-100' : ''
                }`}
              >
                <Settings
                  className="w-4 h-4 text-neutral-500"
                  aria-hidden="true"
                />
                <span className="font-medium">Configuración</span>
              </button>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 transition-all duration-150 ${
                  focus ? 'bg-neutral-100' : ''
                }`}
              >
                <HelpCircle
                  className="w-4 h-4 text-neutral-500"
                  aria-hidden="true"
                />
                <span className="font-medium">Ayuda</span>
              </button>
            )}
          </MenuItem>
        </div>

        {/* Logout */}
        <div className="border-t border-neutral-200 py-1">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-error-600 transition-all duration-150 ${
                  focus ? 'bg-error-50' : ''
                }`}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="font-semibold">Cerrar Sesión</span>
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
})

export { UserMenu }
