// Event components
export { CreateEventForm } from './CreateEventForm';
export { EditEventForm } from './EditEventForm';
export { EventFiltersBar } from './EventFiltersBar';
// EventDetailModal moved to @/components/ui (unified implementation)

// Dashboard Components (migrated from dashboard/)
export { EventsFilterTabs } from './EventsFilterTabs';
export { EventsList } from './EventsList';
// DashboardModeView moved to @/features/entity-admin

// Dumb Components (Presentational)
export * from './dumb';

// Smart Components (With Logic)
export * from './smart';

// Re-export types
export type { DashboardTab } from './EventsFilterTabs';
