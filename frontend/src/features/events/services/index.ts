/**
 * Events Services Export Index
 * Clean barrel exports for all event-related services
 */

// Main service facade
export { getEventServiceForContext } from '@/features/events/services/event.service';
export type { EventServiceContext } from '@/features/events/services/event.service';

// Specialized services
export { eventAdminService, eventAdminApprovalService, combinedEventAdminService } from '@/features/events/services/eventAdminService';
export { eventPublicService, eventPublicExportService, combinedEventPublicService } from '@/features/events/services/eventPublicService';
export { eventOrganizerService, combinedEventOrganizerService } from '@/features/events/services/eventOrganizerService';
export { approvalService, approvalValidation } from '@/features/events/services/approvalService';

// Service types
export type {
  AdminEventService,
  PublicEventService,
  OrganizerEventService,
  EventApprovalService
} from '@/features/events/services/types';