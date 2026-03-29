// EventDetailModal moved to @/components/ui (unified implementation)
// DashboardModeView moved to @/features/entity-admin

// Dumb Components (Presentational)
export * from '@/features/events/components/dumb';

// Smart Components (With Logic)
export * from '@/features/events/components/smart';

// Re-export types
export type { DashboardTab } from '@/features/events/components/smart/EventsFilterTabs';
