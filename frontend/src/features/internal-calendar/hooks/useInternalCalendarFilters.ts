import { useEffect, useState } from 'react';

import { getEventTypes } from '@/features/event-types/services/eventType.service';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type {
  EventType,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';

interface UseInternalCalendarFiltersReturn {
  eventTypes: EventType[];
  eventTypesLoading: boolean;
  statuses: InternalCalendarStatusCode[];
  statusesLoading: boolean;
}

/**
 * Fetches event types and available statuses in parallel on mount.
 * Used by InternalCalendarPageContainer to populate filter dropdowns.
 */
export function useInternalCalendarFilters(): UseInternalCalendarFiltersReturn {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const [statuses, setStatuses] = useState<InternalCalendarStatusCode[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  useEffect(() => {
    const fetchEventTypes = async () => {
      setEventTypesLoading(true);
      try {
        const data = await getEventTypes({ active: true, per_page: 100 });
        setEventTypes(data.data);
      } catch {
        setEventTypes([]);
      } finally {
        setEventTypesLoading(false);
      }
    };

    const fetchStatuses = async () => {
      setStatusesLoading(true);
      try {
        const data = await internalCalendarService.getAvailableStatuses();
        setStatuses(data);
      } catch {
        setStatuses([]);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchEventTypes();
    fetchStatuses();
  }, []);

  return { eventTypes, eventTypesLoading, statuses, statusesLoading };
}
