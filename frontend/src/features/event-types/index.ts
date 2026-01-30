/**
 * Event Types Feature
 * Exports for the event types and subtypes management feature
 *
 * Created: December 2, 2025
 * Updated: January 2026 - Unified types + subtypes view
 */

// Services
export { default as eventSubtypeService } from '@/features/event-types/services/eventSubtype.service';
export {
  createEventSubtype,
  deleteEventSubtype,
  getActiveEventSubtypes,
  getEventSubtype,
  getEventSubtypes,
  searchEventSubtypes,
  toggleEventSubtypeStatus,
  updateEventSubtype,
  validateEventSubtypeData,
} from '@/features/event-types/services/eventSubtype.service';
export { default as eventTypeService } from '@/features/event-types/services/eventType.service';
export {
  createEventType,
  deleteEventType,
  getActiveEventTypes,
  getEventType,
  getEventTypes,
  searchEventTypes,
  toggleEventTypeStatus,
  updateEventType,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service';

// Hooks
export { useEventTypeManager } from '@/features/event-types/hooks/useEventTypeManager';
export { useEventTypeWithSubtypes } from '@/features/event-types/hooks/useEventTypeWithSubtypes';

// Components - Smart
export { EventTypeTableContainer } from '@/features/event-types/components/smart/EventTypeTableContainer';

// Components - Dumb
export { SubtypeRowsContent } from '@/features/event-types/components/dumb/SubtypeRowsContent';

// Components - Modals
export { default as CreateEventSubtypeModal } from '@/features/event-types/components/CreateEventSubtypeModal';
export { default as CreateEventTypeModal } from '@/features/event-types/components/CreateEventTypeModal';
export { default as EditEventSubtypeModal } from '@/features/event-types/components/EditEventSubtypeModal';
export { default as EditEventTypeModal } from '@/features/event-types/components/EditEventTypeModal';
