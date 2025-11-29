/**
 * Auth Feature Export Index
 * Central exports for all authentication-related functionality
 */

// Components (when moved)
// export * from './components';

// Hooks
export * from './hooks';

// Services (shared services, imported for convenience)
export {
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  validateResetToken,
  resetPassword,
} from '@/services/authService';

// Types (when created)
// export * from './types';