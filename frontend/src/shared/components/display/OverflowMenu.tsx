/**
 * OverflowMenu - Shared overflow actions menu using HeadlessUI Menu
 *
 * Renders a `⋯` trigger button that opens a dropdown with contextual actions.
 * Supports danger variant for destructive actions.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - Ternary conditionals instead of && (rendering-conditional-render)
 * - Early return for empty items (js-early-exit)
 */

'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'

export interface OverflowMenuItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  icon?: ReactNode
}

interface OverflowMenuProps {
  items: OverflowMenuItem[]
  ariaLabel?: string
}

const OverflowMenu = memo(function OverflowMenu({
  items,
  ariaLabel = 'Más acciones',
}: OverflowMenuProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="inline-flex items-center justify-center rounded-md p-1.5 bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/40"
        aria-label={ariaLabel}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-neutral-200 focus:outline-none"
      >
        {items.map((item) => (
          <MenuItem key={item.label} disabled={item.disabled}>
            {({ focus }) => (
              <button
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={[
                  'flex w-full items-center gap-2 px-3 py-2 text-sm',
                  item.variant === 'danger'
                    ? 'text-error-600'
                    : 'text-neutral-700',
                  focus ? 'bg-neutral-100' : '',
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.icon ? item.icon : null}
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
})

export default OverflowMenu
