'use client';

/**
 * EventTypeIcon Component (Dumb/Presentational)
 * Renders the icon associated with an event type by key
 * Falls back to the default Calendar icon when key is missing or unknown
 */

import { memo } from 'react';

import { DEFAULT_EVENT_TYPE_ICON, EVENT_TYPE_ICON_MAP } from '@/features/event-types/constants/eventTypeIcons';

interface EventTypeIconProps {
  icon?: string | null;
  className?: string;
}

export const EventTypeIcon = memo(function EventTypeIcon({
  icon,
  className = 'w-5 h-5',
}: EventTypeIconProps) {
  const IconComponent = (icon && EVENT_TYPE_ICON_MAP[icon]) || DEFAULT_EVENT_TYPE_ICON;

  return <IconComponent className={className} aria-hidden="true" />;
});
