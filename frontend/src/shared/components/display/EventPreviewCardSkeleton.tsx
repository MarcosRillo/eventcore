/**
 * EventPreviewCardSkeleton - Loading skeleton matching EventPreviewCard layout
 *
 * Displays pulse-animated placeholders for image, badge, title, metadata, and actions.
 */

import Card from '@/shared/components/display/Card'

export function EventPreviewCardSkeleton() {
  return (
    <Card
      as="div"
      variant="default"
      padding="none"
      className="flex flex-col overflow-hidden"
    >
      {/* Image skeleton */}
      <div className="aspect-video bg-neutral-200 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 flex flex-col gap-3">
        {/* Event type badge skeleton */}
        <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Date skeleton */}
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />

        {/* Location skeleton */}
        <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
      </div>

      {/* Actions skeleton */}
      <div className="px-4 pb-4 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
        <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />
      </div>
    </Card>
  )
}

export function EventPreviewCardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <EventPreviewCardSkeleton key={`preview-skeleton-${index}`} />
      ))}
    </>
  )
}
