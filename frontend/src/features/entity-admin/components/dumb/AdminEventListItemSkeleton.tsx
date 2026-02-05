/**
 * AdminEventListItemSkeleton Component
 *
 * Loading skeleton that matches the AdminEventListItem layout.
 * Uses animate-pulse which respects prefers-reduced-motion via globals.css.
 */

import Card from '@/shared/components/display/Card'

interface AdminEventListItemSkeletonProps {
  className?: string
}

/**
 * Skeleton loading state for admin event list items
 *
 * Mirrors the structure of AdminEventListItem:
 * - Status badge + organizer placeholder
 * - Title placeholder
 * - Metadata row placeholders
 * - Action buttons placeholders
 */
export function AdminEventListItemSkeleton({
  className = '',
}: AdminEventListItemSkeletonProps) {
  return (
    <Card
      as="div"
      variant="default"
      padding="md"
      className={`flex flex-col gap-3 ${className}`}
    >
      {/* Row 1: Status Badge + Organizer skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 bg-neutral-200 rounded-full animate-pulse" />
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
      </div>

      {/* Row 2: Title skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
      </div>

      {/* Row 3: Metadata skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
      </div>

      {/* Row 4: Actions skeleton */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
        <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
        <div className="h-8 w-18 bg-neutral-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse" />
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
export function AdminEventListItemSkeletons({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <AdminEventListItemSkeleton key={`admin-skeleton-${index}`} />
      ))}
    </>
  )
}

export default AdminEventListItemSkeleton
