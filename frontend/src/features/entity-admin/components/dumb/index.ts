/**
 * Entity Admin Dumb Components - Barrel Export
 */

// Legacy components (to be deprecated after refactor)
export { ApprovalModal } from '@/features/entity-admin/components/dumb/ApprovalModal'
export { EventTable } from '@/features/entity-admin/components/dumb/EventTable'
export type { ApprovalActionOption, ApprovalFormData, ApprovalFormErrors } from '@/features/entity-admin/components/dumb/ApprovalModal'
export type { EventTableViewMode, ColumnConfig, ActionConfig, ConfirmDialogData } from '@/features/entity-admin/components/dumb/EventTable'

// New approval workflow components
export { AdminStatsGrid } from '@/features/entity-admin/components/dumb/AdminStatsGrid'
export { AdminQuickFilters } from '@/features/entity-admin/components/dumb/AdminQuickFilters'
export { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel'
export { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel'
export { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline'
export { EventManagementModal } from '@/features/entity-admin/components/dumb/EventManagementModal'
