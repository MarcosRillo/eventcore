/**
 * Operation Types - Discriminated Unions
 * Ultra-aggressive consolidation using discriminated unions to replace 15+ specific interfaces
 */

// Import types only if needed for specific operations

/**
 * Event Operations - Consolidates all event-related operations
 * Replaces: CreateEventData, UpdateEventData, ApprovalActionData, etc.
 */
export type EventOperation =
  | { action: 'create'; data: { title: string; description: string; category_id: number; start_date: string; end_date: string } }
  | { action: 'update'; id: number; data: Partial<{ title: string; description: string; category_id: number }> }
  | { action: 'delete'; id: number }
  | { action: 'approve'; id: number; comment?: string }
  | { action: 'reject'; id: number; comment: string }
  | { action: 'publish'; id: number }
  | { action: 'unpublish'; id: number }
  | { action: 'feature'; id: number; featured: boolean }
  | { action: 'duplicate'; id: number; newTitle: string };

/**
 * Auth Operations - Consolidates all auth-related operations
 * Replaces: LoginCredentials, RefreshTokenRequest, PasswordResetRequest, etc.
 */
export type AuthOperation =
  | { type: 'login'; email: string; password: string }
  | { type: 'logout' }
  | { type: 'refresh'; token: string }
  | { type: 'forgot_password'; email: string }
  | { type: 'reset_password'; token: string; password: string; password_confirmation: string }
  | { type: 'verify_email'; token: string }
  | { type: 'change_password'; current_password: string; new_password: string };

/**
 * API Response Union - Universal response pattern
 * Replaces: LoginResponse, CategoryResponse, EventResponse, etc.
 */
export type ApiOperation<T = unknown> =
  | { status: 'success'; data: T; message?: string }
  | { status: 'error'; error: string; code?: string; details?: Record<string, string[]> }
  | { status: 'loading' }
  | { status: 'idle' };

/**
 * Form Operations - Universal form state machine
 * Replaces: multiple form state interfaces
 */
export type FormOperation<T> =
  | { state: 'idle'; data: T }
  | { state: 'editing'; data: T; changes: Partial<T> }
  | { state: 'validating'; data: T; errors?: Record<string, string> }
  | { state: 'submitting'; data: T }
  | { state: 'success'; data: T; result?: unknown }
  | { state: 'error'; data: T; error: string };

/**
 * Filter Operations - Universal filter pattern
 * Replaces: multiple filter interfaces
 */
export type FilterOperation =
  | { type: 'set_search'; value: string }
  | { type: 'set_page'; value: number }
  | { type: 'set_per_page'; value: number }
  | { type: 'set_sort'; field: string; direction: 'asc' | 'desc' }
  | { type: 'set_date_range'; from: string; to: string }
  | { type: 'toggle_filter'; key: string; value: boolean }
  | { type: 'reset' };

/**
 * Modal Operations - Universal modal state
 * Replaces: multiple modal state interfaces
 */
export type ModalOperation<T = unknown> =
  | { state: 'closed' }
  | { state: 'opening'; data?: T }
  | { state: 'open'; data?: T }
  | { state: 'closing'; result?: unknown };

/**
 * Notification Operations - Universal notification pattern
 */
export type NotificationOperation =
  | { type: 'success'; message: string; duration?: number }
  | { type: 'error'; message: string; details?: string[]; duration?: number }
  | { type: 'warning'; message: string; duration?: number }
  | { type: 'info'; message: string; duration?: number };

// Type guards for discriminated unions
export const isSuccessResponse = <T>(op: ApiOperation<T>): op is Extract<ApiOperation<T>, { status: 'success' }> =>
  op.status === 'success';

export const isErrorResponse = <T>(op: ApiOperation<T>): op is Extract<ApiOperation<T>, { status: 'error' }> =>
  op.status === 'error';

export const isFormSubmitting = <T>(op: FormOperation<T>): op is Extract<FormOperation<T>, { state: 'submitting' }> =>
  op.state === 'submitting';

// Backward compatibility type aliases
export type LoginCredentials = Extract<AuthOperation, { type: 'login' }>;