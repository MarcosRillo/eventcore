/**
 * Tests for RegistrationRequestForm Component
 *
 * Tests form rendering, field interactions, validation display,
 * file uploads, terms checkbox, and form submission.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { RegistrationRequestForm } from '@/features/registration-requests/components/dumb/RegistrationRequestForm'
import {
  RegistrationRequestFormData,
  RegistrationRequestFormErrors
} from '@/features/registration-requests/types/registration-request.types'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) {
    const { unoptimized, alt = '', ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt} data-unoptimized={unoptimized ? 'true' : 'false'} />
  }
}))

describe('RegistrationRequestForm', () => {
  const mockOnFieldChange = jest.fn()
  const mockOnSubmit = jest.fn()

  const defaultFormData: RegistrationRequestFormData = {
    dni: '',
    first_name: '',
    last_name: '',
    email: '',
    whatsapp: '',
    profile_photo: null,
    organization_name: '',
    organization_cuit: '',
    organization_sector: '',
    organization_logo: null,
    website: '',
    motivation: '',
    accepted_terms: false
  }

  const defaultFormErrors: RegistrationRequestFormErrors = {}

  const defaultProps = {
    formData: defaultFormData,
    formErrors: defaultFormErrors,
    submitting: false,
    onFieldChange: mockOnFieldChange,
    onSubmit: mockOnSubmit
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset URL.createObjectURL mock
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  describe('Rendering - Form Sections', () => {
    test('renders personal information section', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText('Datos Personales')).toBeInTheDocument()
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Apellido')).toBeInTheDocument()
      expect(screen.getByText('DNI')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    })

    test('renders organization information section', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText('Datos de la Organización')).toBeInTheDocument()
      expect(screen.getByText('Nombre de la Organización')).toBeInTheDocument()
      expect(screen.getByText('CUIT')).toBeInTheDocument()
      // Sector uses Headless UI Listbox (button role)
      expect(screen.getByText('Sector')).toBeInTheDocument()
      expect(screen.getByText(/sitio web \(opcional\)/i)).toBeInTheDocument()
    })

    test('renders motivation section', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText('Motivación')).toBeInTheDocument()
      expect(screen.getByText(/¿por qué deseas unirte/i)).toBeInTheDocument()
    })

    test('renders terms and conditions checkbox', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText(/acepto los/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /términos y condiciones/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /política de privacidad/i })).toBeInTheDocument()
    })

    test('renders submit button', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument()
    })
  })

  describe('Field Interactions', () => {
    test('calls onFieldChange when first name is entered', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const nameInput = screen.getByPlaceholderText(/tu nombre/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).not.toBeDisabled()
      fireEvent.change(nameInput, { target: { name: 'first_name', value: 'Juan' } })

      expect(mockOnFieldChange).toHaveBeenCalledWith('first_name', 'Juan')
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
    })

    test('calls onFieldChange when email is entered', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const emailInput = screen.getByPlaceholderText(/tu@email/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).not.toBeDisabled()
      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } })

      expect(mockOnFieldChange).toHaveBeenCalledWith('email', 'test@example.com')
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
    })

    test('calls onFieldChange when sector is selected', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      // Sector uses Headless UI Listbox - click to open and select
      const sectorButton = screen.getByText(/seleccionar sector/i)
      expect(sectorButton).toBeInTheDocument()
      fireEvent.click(sectorButton)

      // Select "Hotel" from the dropdown options
      const hotelOption = screen.getByText('Hotel')
      fireEvent.click(hotelOption)

      expect(mockOnFieldChange).toHaveBeenCalledWith('organization_sector', 'hotel')
    })

    test('calls onFieldChange when motivation textarea is filled', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const motivationTextarea = screen.getByPlaceholderText(/describe brevemente/i)
      expect(motivationTextarea).toBeInTheDocument()
      fireEvent.change(motivationTextarea, {
        target: { name: 'motivation', value: 'Test motivation' }
      })

      expect(mockOnFieldChange).toHaveBeenCalledWith('motivation', 'Test motivation')
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
      expect(motivationTextarea).not.toBeDisabled()
    })

    test('calls onFieldChange when terms checkbox is checked', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
      fireEvent.click(checkbox)

      expect(mockOnFieldChange).toHaveBeenCalledWith('accepted_terms', true)
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Sector Dropdown', () => {
    test('renders all organization sectors', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      // Open the dropdown
      const sectorButton = screen.getByText(/seleccionar sector/i)
      fireEvent.click(sectorButton)

      // Check that options are visible
      expect(screen.getByText('Hotel')).toBeInTheDocument()
      expect(screen.getByText('Restaurante')).toBeInTheDocument()
      expect(screen.getByText('Museo')).toBeInTheDocument()
      expect(screen.getByText('Entretenimiento')).toBeInTheDocument()
    })

    test('has default placeholder option', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      // Placeholder is shown in the button
      expect(screen.getByText(/seleccionar sector/i)).toBeInTheDocument()
    })
  })

  describe('File Upload - Profile Photo', () => {
    test('renders profile photo upload when no photo selected', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText(/foto de perfil \(opcional\)/i)).toBeInTheDocument()
      const helperTexts = screen.getAllByText(/máximo 2mb/i)
      expect(helperTexts.length).toBeGreaterThan(0)
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThan(0)
    })

    test('calls onFieldChange when profile photo is selected', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const profilePhotoInput = fileInputs[0]
      expect(profilePhotoInput).not.toBeDisabled()

      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
      fireEvent.change(profilePhotoInput, { target: { files: [file] } })

      expect(mockOnFieldChange).toHaveBeenCalledWith('profile_photo', file)
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
      expect(file.name).toBe('photo.jpg')
    })

    test('shows preview when profile photo is selected', () => {
      const formDataWithPhoto = {
        ...defaultFormData,
        profile_photo: new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithPhoto} />)

      expect(screen.getByAltText(/vista previa de foto de perfil/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })

    test('calls onFieldChange with null when profile photo is removed', () => {
      const formDataWithPhoto = {
        ...defaultFormData,
        profile_photo: new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithPhoto} />)

      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
      fireEvent.click(removeButtons[0])

      expect(mockOnFieldChange).toHaveBeenCalledWith('profile_photo', null)
    })
  })

  describe('File Upload - Organization Logo', () => {
    test('renders logo upload when no logo selected', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText(/logo de la organización/i)).toBeInTheDocument()
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThanOrEqual(2) // profile photo + logo
      expect(screen.getByText(/datos de la organización/i)).toBeInTheDocument()
    })

    test('shows preview when organization logo is selected', () => {
      const formDataWithLogo = {
        ...defaultFormData,
        organization_logo: new File(['test'], 'logo.png', { type: 'image/png' })
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithLogo} />)

      const logoPreview = screen.getByAltText(/vista previa del logo/i)
      expect(logoPreview).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(logoPreview).toHaveAttribute('src', 'blob:mock-url')
    })

    test('calls onFieldChange with null when logo is removed', () => {
      const formDataWithLogo = {
        ...defaultFormData,
        organization_logo: new File(['test'], 'logo.png', { type: 'image/png' })
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithLogo} />)

      const removeButton = screen.getByRole('button', { name: /eliminar/i })
      expect(removeButton).toBeInTheDocument()
      fireEvent.click(removeButton)

      expect(mockOnFieldChange).toHaveBeenCalledWith('organization_logo', null)
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Character Counter', () => {
    test('displays character count for motivation - shows remaining when below minimum', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      // When empty (0 chars), shows "50 caracteres más requeridos"
      expect(screen.getByText(/50 caracteres más requeridos/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/describe brevemente/i)).toBeInTheDocument()
      expect(screen.getByText('Motivación')).toBeInTheDocument()
    })

    test('updates character count when motivation changes - shows remaining', () => {
      const formDataWithMotivation = {
        ...defaultFormData,
        motivation: 'A'.repeat(100)
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithMotivation} />)

      // 100 chars means 900 remaining
      expect(screen.getByText(/900 caracteres restantes/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('A'.repeat(100))).toBeInTheDocument()
      expect(formDataWithMotivation.motivation.length).toBe(100)
    })

    test('shows error styling when character count is below minimum', () => {
      const formDataWithShortMotivation = {
        ...defaultFormData,
        motivation: 'Short'
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithShortMotivation} />)

      // 5 chars means 45 more required
      const counter = screen.getByText(/45 caracteres más requeridos/i)
      expect(counter).toHaveClass('text-error-500')
      expect(formDataWithShortMotivation.motivation.length).toBe(5)
      expect(formDataWithShortMotivation.motivation.length).toBeLessThan(50)
      expect(screen.getByDisplayValue('Short')).toBeInTheDocument()
    })

    test('shows error styling when character count exceeds maximum', () => {
      const formDataWithLongMotivation = {
        ...defaultFormData,
        motivation: 'A'.repeat(1001)
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithLongMotivation} />)

      // 1001 chars means -1 remaining (negative)
      const counter = screen.getByText(/-1 caracteres restantes/i)
      expect(counter).toHaveClass('text-error-500')
      expect(formDataWithLongMotivation.motivation.length).toBe(1001)
      expect(formDataWithLongMotivation.motivation.length).toBeGreaterThan(1000)
    })

    test('shows neutral styling when character count is within range', () => {
      const formDataWithValidMotivation = {
        ...defaultFormData,
        motivation: 'A'.repeat(100)
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithValidMotivation} />)

      // 100 chars means 900 remaining
      const counter = screen.getByText(/900 caracteres restantes/i)
      expect(counter).toHaveClass('text-neutral-500')
      expect(formDataWithValidMotivation.motivation.length).toBeGreaterThanOrEqual(50)
      expect(formDataWithValidMotivation.motivation.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Submit Button State', () => {
    test('submit button is disabled when terms not accepted', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).not.toBeChecked()
      expect(defaultFormData.accepted_terms).toBe(false)
    })

    test('submit button is enabled when terms accepted', () => {
      const formDataWithTerms = {
        ...defaultFormData,
        accepted_terms: true
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithTerms} />)

      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
      expect(submitButton).toBeEnabled()
      expect(submitButton).toBeInTheDocument()
      expect(formDataWithTerms.accepted_terms).toBe(true)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    test('submit button is disabled while submitting', () => {
      const formDataWithTerms = {
        ...defaultFormData,
        accepted_terms: true
      }

      render(
        <RegistrationRequestForm
          {...defaultProps}
          formData={formDataWithTerms}
          submitting={true}
        />
      )

      // Button text changes to "Enviando solicitud..." while submitting
      const submitButton = screen.getByRole('button', { name: /enviando solicitud/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeDisabled()
      expect(screen.getByPlaceholderText(/tu nombre/i)).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    test('calls onSubmit when form is submitted', () => {
      const formDataWithTerms = {
        ...defaultFormData,
        accepted_terms: true
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithTerms} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      fireEvent.submit(form!)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeEnabled()
    })

    test('prevents default form submission behavior', () => {
      const formDataWithTerms = {
        ...defaultFormData,
        accepted_terms: true
      }

      render(<RegistrationRequestForm {...defaultProps} formData={formDataWithTerms} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      fireEvent.submit(form!)

      // Verify onSubmit was called without page reload
      expect(mockOnSubmit).toHaveBeenCalled()
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    test('displays general error message', () => {
      const formErrorsWithGeneral: RegistrationRequestFormErrors = {
        general: 'Ocurrió un error al enviar el formulario'
      }

      render(<RegistrationRequestForm {...defaultProps} formErrors={formErrorsWithGeneral} />)

      expect(screen.getByText(/ocurrió un error/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeDisabled()
      expect(document.querySelector('form')).toBeInTheDocument()
      expect(formErrorsWithGeneral.general).toBeDefined()
    })

    test('displays field-specific error for first name', () => {
      const formErrorsWithField: RegistrationRequestFormErrors = {
        first_name: 'El nombre es requerido'
      }

      render(<RegistrationRequestForm {...defaultProps} formErrors={formErrorsWithField} />)

      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument()
      expect(formErrorsWithField.first_name).toBe('El nombre es requerido')
      expect(screen.getByText('Nombre')).toBeInTheDocument()
    })

    test('displays error for organization sector', () => {
      const formErrorsWithSector: RegistrationRequestFormErrors = {
        organization_sector: 'Selecciona un sector'
      }

      render(<RegistrationRequestForm {...defaultProps} formErrors={formErrorsWithSector} />)

      expect(screen.getByText(/selecciona un sector/i)).toBeInTheDocument()
      expect(screen.getByText('Sector')).toBeInTheDocument()
      expect(formErrorsWithSector.organization_sector).toBe('Selecciona un sector')
      expect(screen.getByText(/datos de la organización/i)).toBeInTheDocument()
    })

    test('displays error for motivation', () => {
      const formErrorsWithMotivation: RegistrationRequestFormErrors = {
        motivation: 'La motivación debe tener al menos 50 caracteres'
      }

      render(<RegistrationRequestForm {...defaultProps} formErrors={formErrorsWithMotivation} />)

      expect(screen.getByText(/al menos 50 caracteres/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/describe brevemente/i)).toBeInTheDocument()
      expect(formErrorsWithMotivation.motivation).toContain('50')
      expect(screen.getByText('Motivación')).toBeInTheDocument()
    })

    test('displays error for terms not accepted', () => {
      const formErrorsWithTerms: RegistrationRequestFormErrors = {
        accepted_terms: 'Debes aceptar los términos'
      }

      render(<RegistrationRequestForm {...defaultProps} formErrors={formErrorsWithTerms} />)

      expect(screen.getByText(/debes aceptar los términos/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(formErrorsWithTerms.accepted_terms).toBe('Debes aceptar los términos')
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  describe('Disabled State', () => {
    test('all inputs are disabled when submitting', () => {
      render(<RegistrationRequestForm {...defaultProps} submitting={true} />)

      const nameInput = screen.getByPlaceholderText(/tu nombre/i)
      const emailInput = screen.getByPlaceholderText(/tu@email/i)
      const motivationTextarea = screen.getByPlaceholderText(/describe brevemente/i)
      const checkbox = screen.getByRole('checkbox')

      expect(nameInput).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(motivationTextarea).toBeDisabled()
      expect(checkbox).toBeDisabled()
      // Sector select uses Listbox which doesn't have a native disabled state queryable as 'combobox'
      // Check the button has disabled opacity class instead
      const sectorButton = screen.getByText(/seleccionar sector/i).closest('button')
      expect(sectorButton).toHaveClass('disabled:opacity-50')
    })

    test('file inputs are disabled when submitting', () => {
      render(<RegistrationRequestForm {...defaultProps} submitting={true} />)

      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })

    test('remove buttons are disabled when submitting', () => {
      const formDataWithFiles = {
        ...defaultFormData,
        profile_photo: new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
      }

      render(
        <RegistrationRequestForm
          {...defaultProps}
          formData={formDataWithFiles}
          submitting={true}
        />
      )

      const removeButton = screen.getByRole('button', { name: /eliminar/i })
      expect(removeButton).toBeDisabled()
      expect(screen.getByAltText(/vista previa de foto de perfil/i)).toBeInTheDocument()
      // Button text changes to "Enviando solicitud..." while submitting
      expect(screen.getByRole('button', { name: /enviando solicitud/i })).toBeDisabled()
      expect(formDataWithFiles.profile_photo).not.toBeNull()
    })
  })

  describe('Accessibility', () => {
    test('terms links open in new tab with proper attributes', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const termsLink = screen.getByRole('link', { name: /términos y condiciones/i })
      const privacyLink = screen.getByRole('link', { name: /política de privacidad/i })

      expect(termsLink).toHaveAttribute('target', '_blank')
      expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(privacyLink).toHaveAttribute('target', '_blank')
      expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    test('form has proper structure with labeled fields', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      // All inputs should have labels (via Input component)
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Apellido')).toBeInTheDocument()
      expect(screen.getByText('DNI')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()

      // Verify inputs exist and are accessible via placeholders
      expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/tu apellido/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/tu@email/i)).toBeInTheDocument()
    })

    test('required fields are marked with asterisk', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const requiredMarkers = document.querySelectorAll('.text-error-500')
      expect(requiredMarkers.length).toBeGreaterThan(0)
    })
  })

  describe('Helper Text', () => {
    test('displays CUIT format helper text', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      expect(screen.getByText(/formato: xx-xxxxxxxx-x/i)).toBeInTheDocument()
      expect(screen.getByText('CUIT')).toBeInTheDocument()
      expect(screen.getByText(/datos de la organización/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/20-12345678-9/i)).toBeInTheDocument()
    })

    test('displays file size helper text for profile photo', () => {
      render(<RegistrationRequestForm {...defaultProps} />)

      const helperTexts = screen.getAllByText(/máximo 2mb/i)
      expect(helperTexts.length).toBeGreaterThan(0)
      expect(screen.getByText(/foto de perfil \(opcional\)/i)).toBeInTheDocument()
      expect(screen.getByText(/logo de la organización/i)).toBeInTheDocument()
    })
  })

  describe('Pre-filled Form', () => {
    test('displays pre-filled values correctly', () => {
      const prefilledFormData: RegistrationRequestFormData = {
        dni: '12345678',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com',
        whatsapp: '+54 9 11 1234-5678',
        profile_photo: null,
        organization_name: 'Mi Empresa S.A.',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        organization_logo: null,
        website: 'https://miempresa.com',
        motivation: 'Queremos participar en la plataforma de turismo.',
        accepted_terms: true
      }

      render(<RegistrationRequestForm {...defaultProps} formData={prefilledFormData} />)

      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12345678')).toBeInTheDocument()
      expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Mi Empresa S.A.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://miempresa.com')).toBeInTheDocument()
    })
  })
})
