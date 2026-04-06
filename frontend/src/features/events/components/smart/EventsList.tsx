/**
 * Events List Component
 * Grid layout for event cards with responsive design
 * Adapted from dashboard for consolidated events view
 */

'use client';

import { EventCardContainer } from '@/features/events/components/smart/EventCardContainer';
import { Event } from '@/types/event.types';

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
  onViewDetail: (eventId: number) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  // Double-Level Workflow Actions
  onApproveInternal?: (event: Event) => void;
  onRequestPublicApproval?: (event: Event) => void;
  onPublishEvent?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onRejectEvent?: (event: Event) => void;
  // Legacy compatibility
  onApproveEvent?: (event: Event) => void;
}

export const EventsList = ({
  events,
  isLoading = false,
  onViewDetail,
  onEditEvent,
  onDeleteEvent,
  onApproveInternal,
  onRequestPublicApproval,
  onPublishEvent,
  onRequestChanges,
  onRejectEvent,
  // Legacy compatibility
  onApproveEvent
}: EventsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200 animate-pulse">
            <div className="p-6">
              {/* Title skeleton */}
              <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>

              {/* Organization skeleton */}
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>

              {/* Status badges skeleton */}
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>

              {/* Date skeleton */}
              <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>

              {/* Actions skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3zm4 10.93V20a2 2 0 002 2h2c1.1 0 2-.9 2-2v-2"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No hay eventos disponibles
        </h3>
        <p className="mt-2 text-gray-500">
          No se encontraron eventos que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCardContainer
          key={event.id}
          event={event}
          onViewDetail={onViewDetail}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          onApproveInternal={onApproveInternal}
          onRequestPublicApproval={onRequestPublicApproval}
          onPublishEvent={onPublishEvent}
          onRequestChanges={onRequestChanges}
          onRejectEvent={onRejectEvent}
          // Legacy compatibility
          onApproveEvent={onApproveEvent}
        />
      ))}
    </div>
  );
};
