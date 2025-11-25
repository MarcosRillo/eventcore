/**
 * Events Services Export Index
 * Clean barrel exports for all event-related services
 */

// Main service facade
export { getEventServiceForContext } from './event.service';
export type { EventServiceContext } from './event.service';

// Specialized services
// eventAdminService, eventAdminApprovalService, combinedEventAdminService moved to @/features/entity-admin
export { eventPublicService, eventPublicExportService, combinedEventPublicService } from './eventPublicService';
export { eventOrganizerService, combinedEventOrganizerService } from './eventOrganizerService';
// approvalService moved to @/features/entity-admin

// Service types
export type {
  AdminEventService,
  PublicEventService,
  OrganizerEventService,
  EventApprovalService
} from './types';