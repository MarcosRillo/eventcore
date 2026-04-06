/**
 * Re-exports event status configuration for cross-feature consumers.
 * Canonical source: @/features/events/constants/eventConfig
 */
export type { StatusConfig } from '@/features/events/constants/eventConfig'
export {
  DEFAULT_STATUS_CONFIG,
  EVENT_STATUS_CONFIG,
  getStatusConfig,
} from '@/features/events/constants/eventConfig'
