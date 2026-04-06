/**
 * AdminPageHeader - Shared presentational component
 *
 * Page header for admin sections: title + description on the left,
 * create button on the right. Extracted from admin page containers.
 */

import type { ReactNode } from 'react'

import { Button } from '@/shared/components/form'

interface AdminPageHeaderProps {
  title: string
  description: string
  createLabel: string
  onCreateClick: () => void
  createIcon?: ReactNode
}

export function AdminPageHeader({
  title,
  description,
  createLabel,
  onCreateClick,
  createIcon,
}: AdminPageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-2 text-neutral-600">{description}</p>
      </div>
      <Button
        onClick={onCreateClick}
        leftIcon={createIcon}
      >
        {createLabel}
      </Button>
    </div>
  )
}
