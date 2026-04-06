/**
 * Auth Feature Export Index
 * Central exports for all authentication-related functionality
 */

// Components (when moved)
// export * from '@/features/auth/components';

// Hooks
export * from '@/features/auth/hooks';

// Services (shared services, imported for convenience)
export {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  resetPassword,
  validateResetToken,
} from '@/features/auth/services/authService';

// Types (when created)
// export * from '@/features/auth/types';