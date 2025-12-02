/**
 * Event Types Feature
 * Exports for the event types and subtypes management feature
 *
 * Created: December 2, 2025
 */

// Services
export { default as eventTypeService } from './services/eventType.service';
export { default as eventSubtypeService } from './services/eventSubtype.service';
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
} from './services/eventType.service';
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
} from './services/eventSubtype.service';

// Hooks
export { useEventTypeManager } from './hooks/useEventTypeManager';
export { useEventSubtypeManager } from './hooks/useEventSubtypeManager';

// Components - Smart
export { EventTypeTableContainer } from './components/smart/EventTypeTableContainer';
export { EventSubtypeTableContainer } from './components/smart/EventSubtypeTableContainer';

// Components - Modals
export { default as CreateEventTypeModal } from './components/CreateEventTypeModal';
export { default as EditEventTypeModal } from './components/EditEventTypeModal';
export { default as CreateEventSubtypeModal } from './components/CreateEventSubtypeModal';
export { default as EditEventSubtypeModal } from './components/EditEventSubtypeModal';
