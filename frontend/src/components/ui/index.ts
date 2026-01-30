/**
 * UI Components Export Index
 * Centralized export for all UI components
 */

// Form components - canonical location: @/shared/components/form
export { type FieldErrorMap, FormModal, type FormModalProps, type FormRenderProps, type FormSubmitHandler,type FormValidator } from '@/components/ui/FormModal';
export { LoadingDots, LoadingOverlay,default as LoadingSpinner } from '@/components/ui/LoadingSpinner';
export { default as Modal } from '@/components/ui/Modal';
export { SearchableMultiSelect, type SearchableMultiSelectProps, type SelectOption } from '@/components/ui/SearchableMultiSelect';
export { Tooltip } from '@/components/ui/Tooltip';
export { Button, Checkbox, Input, PasswordInput, Select, Textarea } from '@/shared/components/form';

// State Components
export { default as EmptyState, EmptyStateIcons } from '@/components/ui/EmptyState';
export { default as Skeleton, SkeletonAvatar, SkeletonButton, SkeletonCard, SkeletonTable,SkeletonText } from '@/components/ui/Skeleton';

// Data Components
export { ColorPicker } from '@/components/ui/ColorPicker';
export { default as Pagination } from '@/components/ui/Pagination';
export { RadioGroup } from '@/components/ui/RadioGroup';
export { default as SafeImage } from '@/components/ui/SafeImage';
export { default as StatCard, StatIcons } from '@/components/ui/StatCard';

// Table Components
export { Table, type TableAction, type TableColumn, type TableProps } from '@/components/ui/Table';

// Event Components
export { type EventDetailContext,EventDetailModal, type EventDetailModalProps } from '@/components/ui/EventDetailModal';

// Layout Components
export { default as Badge } from '@/components/ui/Badge';
export { default as Card } from '@/components/ui/Card';

// Dialog Components
export { default as ConfirmDialog } from '@/components/ui/ConfirmDialog';
export { default as PromptDialog } from '@/components/ui/PromptDialog';

// Toast Components - re-exported from canonical location
export { Toast, ToastContainer } from '@/shared/components/feedback';
export { ToastProvider, useToast } from '@/shared/context';
