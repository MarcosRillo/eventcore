/**
 * Events Services Export Index
 * Clean barrel exports for all event-related services
 */

// Main service facade
export type { EventServiceContext } from '@/features/events/services/event.service';
export { getEventServiceForContext } from '@/features/events/services/event.service';

// Specialized services
export { approvalService, approvalValidation } from '@/features/events/services/approvalService';
export { combinedEventAdminService, eventAdminService } from '@/features/events/services/eventAdminService';
export { combinedEventPublicService,eventPublicExportService, eventPublicService } from '@/features/events/services/eventPublicService';

// Service types
export type {
  AdminEventService,
  EventApprovalService,
  PublicEventService,
} from '@/features/events/services/types';