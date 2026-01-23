/**
 * Users Feature - Main Barrel Export
 *
 * User management for admin.
 */

// Hooks
export { useUserEdit } from '@/features/users/hooks/useUserEdit'
export { useUserManager } from '@/features/users/hooks/useUserManager'

// Services
export { default as userService } from '@/features/users/services/user.service'

// Types
export * from '@/features/users/types/user.types'
