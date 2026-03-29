/**
 * Locations Feature - Barrel Exports
 * Central export point for all location-related components, hooks, and services
 */

// Hooks
export { useLocationManager } from '@/features/locations/hooks/useLocationManager';

// Components - Smart
export { LocationTableContainer } from '@/features/locations/components/smart/LocationTableContainer';

// Components - Dumb
export { LocationTable } from '@/features/locations/components/dumb/LocationTable';

// Components - Modals
export { CreateLocationModal } from '@/features/locations/components/dumb/CreateLocationModal';
export { EditLocationModal } from '@/features/locations/components/dumb/EditLocationModal';

// Services
export {
  createLocation,
  deleteLocation,
  getActiveLocations,
  getLocation,
  getLocations,
  locationService,
  updateLocation,
} from '@/features/locations/services/location.service';
