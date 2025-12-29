// Event components
export { EventFiltersBar } from '@/features/events/components/EventFiltersBar';
// EventDetailModal moved to @/components/ui (unified implementation)

// Dashboard Components (migrated from dashboard/)
export { EventsFilterTabs } from '@/features/events/components/EventsFilterTabs';
export { EventsList } from '@/features/events/components/EventsList';
// DashboardModeView moved to @/features/entity-admin

// Dumb Components (Presentational)
export * from '@/features/events/components/dumb';

// Smart Components (With Logic)
export * from '@/features/events/components/smart';

// Re-export types
export type { DashboardTab } from '@/features/events/components/EventsFilterTabs';
