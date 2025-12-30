/**
 * Approval Feature - Main Barrel Export
 *
 * Admin dashboard and event approval functionality.
 */

// Hooks
export { useAdminEvents } from '@/features/approval/hooks/useAdminEvents'
export { useAdminStats } from '@/features/approval/hooks/useAdminStats'
export { useApprovalActions } from '@/features/approval/hooks/useApprovalActions'

// Services
export { adminEventService } from '@/features/approval/services/admin-event.service'
export { adminStatsService } from '@/features/approval/services/admin-stats.service'
export { approvalService } from '@/features/approval/services/approval.service'

// Types
export * from '@/features/approval/types/approval.types'
