/**
 * Locations Feature - Barrel Exports
 * Central export point for all location-related components, hooks, and services
 */

// Hooks
export { useLocationManager } from './hooks/useLocationManager';

// Components - Smart
export { LocationTableContainer } from './components/smart/LocationTableContainer';

// Components - Dumb
export { LocationTable } from './components/dumb/LocationTable';

// Components - Modals
export { CreateLocationModal } from './components/CreateLocationModal';
export { EditLocationModal } from './components/EditLocationModal';

// Services
export {
  getLocations,
  getActiveLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  locationService,
} from './services/location.service';
