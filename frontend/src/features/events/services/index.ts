/**
 * Events Services Export Index
 * Clean barrel exports for all event-related services
 */

// Main service facade
export { getEventServiceForContext } from './event.service';
export type { EventServiceContext } from './event.service';

// Specialized services
export { eventAdminService, eventAdminApprovalService, combinedEventAdminService } from './eventAdminService';
export { eventPublicService, eventPublicExportService, combinedEventPublicService } from './eventPublicService';
export { eventOrganizerService, combinedEventOrganizerService } from './eventOrganizerService';
export { approvalService, approvalValidation } from './approvalService';

// Service types
export type {
  AdminEventService,
  PublicEventService,
  OrganizerEventService,
  EventApprovalService
} from './types';