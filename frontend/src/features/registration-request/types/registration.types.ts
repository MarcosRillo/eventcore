export interface RegistrationFormData {
  dni: string
  first_name: string
  last_name: string
  email: string
  whatsapp: string
  organization_name: string
  organization_cuit: string
  organization_sector: string
  website: string
  motivation: string
}

export interface RegistrationFormErrors {
  dni?: string
  first_name?: string
  last_name?: string
  email?: string
  whatsapp?: string
  organization_name?: string
  organization_cuit?: string
  organization_sector?: string
  website?: string
  motivation?: string
}

export interface RegistrationResponse {
  success: boolean
  message: string
  data: {
    id: number
    email: string
    status: string
  }
}

export const initialFormData: RegistrationFormData = {
  dni: '',
  first_name: '',
  last_name: '',
  email: '',
  whatsapp: '',
  organization_name: '',
  organization_cuit: '',
  organization_sector: '',
  website: '',
  motivation: '',
}
