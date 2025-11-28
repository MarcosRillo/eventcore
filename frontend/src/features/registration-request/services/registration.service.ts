import apiClient from '@/services/apiClient'
import { RegistrationFormData, RegistrationResponse } from '../types/registration.types'

export const submitRegistrationRequest = async (
  data: RegistrationFormData
): Promise<RegistrationResponse['data']> => {
  const response = await apiClient.post<RegistrationResponse>('/auth/register-request', data)
  return response.data.data
}

const registrationService = {
  submitRegistrationRequest,
}

export default registrationService
