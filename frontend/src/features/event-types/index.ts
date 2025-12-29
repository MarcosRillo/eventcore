/**
 * Event Types Feature
 * Exports for the event types and subtypes management feature
 *
 * Created: December 2, 2025
 */

// Services
export { default as eventTypeService } from '@/features/event-types/services/eventType.service';
export { default as eventSubtypeService } from '@/features/event-types/services/eventSubtype.service';
export {
  getEventTypes,
  getEventType,
  createEventType,
  updateEventType,
  deleteEventType,
  toggleEventTypeStatus,
  getActiveEventTypes,
  searchEventTypes,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service';
export {
  getEventSubtypes,
  getEventSubtype,
  createEventSubtype,
  updateEventSubtype,
  deleteEventSubtype,
  toggleEventSubtypeStatus,
  getActiveEventSubtypes,
  searchEventSubtypes,
  validateEventSubtypeData,
} from '@/features/event-types/services/eventSubtype.service';

// Hooks
export { useEventTypeManager } from '@/features/event-types/hooks/useEventTypeManager';
export { useEventSubtypeManager } from '@/features/event-types/hooks/useEventSubtypeManager';

// Components - Smart
export { EventTypeTableContainer } from '@/features/event-types/components/smart/EventTypeTableContainer';
export { EventSubtypeTableContainer } from '@/features/event-types/components/smart/EventSubtypeTableContainer';

// Components - Modals
export { default as CreateEventTypeModal } from '@/features/event-types/components/CreateEventTypeModal';
export { default as EditEventTypeModal } from '@/features/event-types/components/EditEventTypeModal';
export { default as CreateEventSubtypeModal } from '@/features/event-types/components/CreateEventSubtypeModal';
export { default as EditEventSubtypeModal } from '@/features/event-types/components/EditEventSubtypeModal';
