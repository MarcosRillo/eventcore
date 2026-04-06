/**
 * Event Service - Main Aggregator
 *
 * Main event service that delegates to specialized services based on user context.
 * This service acts as a facade and provides role-based functionality.
 */

import { combinedEventAdminService } from '@/features/events/services/eventAdminService';
import { combinedEventPublicService } from '@/features/events/services/eventPublicService';
import { EventServiceContext } from '@/features/events/services/types';

export type { EventServiceContext } from '@/features/events/services/types';

/**
 * Get the appropriate service based on context/role
 * @param context
 */
export const getEventServiceForContext = (context: EventServiceContext = 'admin') => {
  switch (context) {
    case 'admin':
      return combinedEventAdminService;
    case 'public':
      return combinedEventPublicService;
    case 'auto':
      // This will be handled by useEventManager with user role detection
      return combinedEventAdminService; // Default fallback
    default:
      return combinedEventAdminService;
  }
};

// Export specialized services for direct use
export { combinedEventAdminService as eventAdminService };
export { combinedEventPublicService as eventPublicService };
