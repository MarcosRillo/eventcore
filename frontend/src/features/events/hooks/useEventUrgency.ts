/**
 * Event Urgency Hook
 * Handles urgency indicators and time-based calculations for events
 */

import { useMemo } from 'react';

import { Event } from '@/types/event.types';

export const useEventUrgency = (event: Event) => {
  const { urgencyData, timeInfo } = useMemo(() => {
    const now = new Date();
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);
    const daysUntilEvent = Math.ceil((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const hasEnded = eventEnd.getTime() < now.getTime();
    const isHappening = eventStart.getTime() <= now.getTime() && now.getTime() <= eventEnd.getTime();
    const isUpcoming = eventStart.getTime() > now.getTime();

    let urgencyData = null;
    if (!hasEnded) {
      if (daysUntilEvent <= 3 && daysUntilEvent > 0) {
        urgencyData = {
          type: 'upcoming',
          text: `Próximo (${daysUntilEvent}d)`,
          className: 'bg-orange-100 text-orange-800',
          showIcon: true
        };
      } else if (isHappening) {
        urgencyData = {
          type: 'happening',
          text: 'En curso',
          className: 'bg-blue-100 text-blue-800',
          showPulse: true
        };
      }
    }

    return {
      urgencyData,
      timeInfo: {
        hasEnded,
        isHappening,
        isUpcoming,
        daysUntilEvent,
        isUrgent: daysUntilEvent <= 3 && daysUntilEvent > 0
      }
    };
  }, [event.start_date, event.end_date]);

  return {
    urgencyData,
    timeInfo
  };
};