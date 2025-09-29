/**
 * Modal Types - Ultra-Aggressive Consolidation
 *
 * Reduced from 3 interfaces to 1 enum + inline patterns
 */

/**
 * Modal identifiers - essential enum that cannot be reduced
 */
export enum ModalId {
  // Event modals
  CREATE_EVENT = 'create-event',
  EDIT_EVENT = 'edit-event',
  DELETE_EVENT = 'delete-event',
  DUPLICATE_EVENT = 'duplicate-event',
  EVENT_DETAILS = 'event-details',
  APPROVE_EVENT = 'approve-event',
  REJECT_EVENT = 'reject-event',
  REQUEST_CHANGES = 'request-changes',

  // Category modals
  CREATE_CATEGORY = 'create-category',
  EDIT_CATEGORY = 'edit-category',
  DELETE_CATEGORY = 'delete-category',

  // User/Auth modals
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
  CHANGE_PASSWORD = 'change-password',
  USER_PROFILE = 'user-profile',

  // System modals
  CONFIRM_ACTION = 'confirm-action',
  ERROR_DIALOG = 'error-dialog',
  SUCCESS_DIALOG = 'success-dialog',
  LOADING = 'loading',

  // Export modals
  EXPORT_EVENTS = 'export-events',
  EXPORT_CALENDAR = 'export-calendar',

  // Communication modals
  SEND_MESSAGE = 'send-message',
  VIEW_MESSAGES = 'view-messages',

  // Template modals
  SAVE_TEMPLATE = 'save-template',
  LOAD_TEMPLATE = 'load-template',
  MANAGE_TEMPLATES = 'manage-templates',
}

// Use inline types for everything else - ultra-aggressive consolidation
export type ModalState = Partial<Record<ModalId, boolean>>;
export type ModalConfig = {
  id: ModalId;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  className?: string;
};
export type ModalWithData<T = unknown> = {
  isOpen: boolean;
  data: T | null;
  config?: ModalConfig;
};