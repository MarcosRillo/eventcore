/**
 * Registration Requests Feature - Public API
 */

// Types
export * from '@/features/registration-requests/types/registration-request.types'

// Services
export { default as registrationRequestService } from '@/features/registration-requests/services/registration-request.service'
export {
  approveRegistrationRequest,
  getRegistrationRequestById,
  getRegistrationRequests,
  rejectRegistrationRequest,
} from '@/features/registration-requests/services/registration-request.service'

// Hooks
export { useRegistrationForm } from '@/features/registration-requests/hooks/useRegistrationForm'
export { useRegistrationRequests } from '@/features/registration-requests/hooks/useRegistrationRequests'

// Components
export { RegistrationForm as RegistrationPublicForm } from '@/features/registration-requests/components/dumb/RegistrationPublicForm'
export { RegistrationRequestDetailPanel } from '@/features/registration-requests/components/dumb/RegistrationRequestDetail'
export { RegistrationRequestTable } from '@/features/registration-requests/components/dumb/RegistrationRequestTable'
export { RejectRequestModal } from '@/features/registration-requests/components/dumb/RejectRequestModal'
export { RegistrationRequestsContainer } from '@/features/registration-requests/components/smart/RegistrationRequestsContainer'
