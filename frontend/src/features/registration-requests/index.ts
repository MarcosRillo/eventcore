/**
 * Registration Requests Feature - Public API
 */

// Types
export * from './types/registration-request.types'

// Services
export { default as registrationRequestService } from './services/registration-request.service'
export {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from './services/registration-request.service'

// Hooks
export { useRegistrationRequests } from './hooks/useRegistrationRequests'

// Components
export { RegistrationRequestTable } from './components/dumb/RegistrationRequestTable'
export { RegistrationRequestDetailPanel } from './components/dumb/RegistrationRequestDetail'
export { RejectRequestModal } from './components/dumb/RejectRequestModal'
export { RegistrationRequestsContainer } from './components/smart/RegistrationRequestsContainer'
