/**
 * Event Card - Dumb Component
 * Pure presentational component for displaying event information
 * Receives all data and handlers as props
 */

'use client';

import { Building2,Calendar, Clock, Star } from 'lucide-react';
import React from 'react';

import { Badge, Card } from '@/shared/components/display';
import { Event } from '@/types/event.types';

interface EventCardProps {
  event: Event;
  formattedDate: {
    date: string;
    time: string;
  };
  statusColor: string;
  urgencyIndicator: React.ReactNode | null;
  actionButtons: React.ReactNode;
  onViewDetail: () => void;
}

export const EventCard: React.FC<EventCardProps> = React.memo(({
  event,
  formattedDate,
  statusColor,
  urgencyIndicator,
  actionButtons,
  onViewDetail
}) => {
  return (
    <Card
      variant="bordered"
      hover
      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg"
    >
      {/* Featured indicator */}
      {event.is_featured && (
        <div className="absolute top-3 right-3">
          <Star className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={onViewDetail}
          >
            {event.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className={statusColor}>
            {typeof event.status === 'string' ? event.status : event.status?.status_code}
          </Badge>
          {urgencyIndicator}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        {/* Date and Time */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">{formattedDate.date}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formattedDate.time}</span>
        </div>

        {/* Organization */}
        {event.organizer && (
          <div className="flex items-center text-sm text-gray-600">
            <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.organizer.name}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {event.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t pt-3">
        {actionButtons}
      </div>
    </Card>
  );
});

EventCard.displayName = 'EventCard';