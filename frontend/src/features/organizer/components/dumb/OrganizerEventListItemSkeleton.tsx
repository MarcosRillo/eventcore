/**
 * OrganizerEventListItemSkeleton
 *
 * Loading skeleton that matches the OrganizerEventListItem layout.
 * Uses animate-pulse which respects prefers-reduced-motion via globals.css.
 */

import Card from '@/shared/components/display/Card'

interface OrganizerEventListItemSkeletonProps {
  className?: string
}

/**
 * Skeleton loading state for event list items
 *
 * Mirrors the structure of OrganizerEventListItem:
 * - Status badge placeholder
 * - Title placeholder
 * - Metadata row placeholders
 * - Action buttons placeholders
 */
export function OrganizerEventListItemSkeleton({
  className = '',
}: OrganizerEventListItemSkeletonProps) {
  return (
    <Card
      as="div"
      variant="default"
      padding="md"
      className={`flex gap-3 ${className}`}
    >
      {/* Thumbnail skeleton */}
      <div className="w-24 h-[4.5rem] shrink-0 rounded-lg bg-neutral-200 animate-pulse" />

      {/* Content */}
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {/* Row 1: Status Badge skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse" />
        </div>

        {/* Row 2: Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Row 3: Metadata skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Row 4: Actions skeleton */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
          <div className="h-8 w-14 bg-neutral-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Generates an array of skeleton items for loading states
 *
 * @param count - Number of skeletons to render
 * @returns Array of skeleton components with unique keys
 */
export function OrganizerEventListItemSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <OrganizerEventListItemSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  )
}
