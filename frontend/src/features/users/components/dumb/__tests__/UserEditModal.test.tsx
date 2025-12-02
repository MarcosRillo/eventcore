import { render, screen, fireEvent } from '@testing-library/react'
import UserEditModal from '../UserEditModal'
import type { User } from '../../../types/user.types'

describe('UserEditModal', () => {
  const mockUser: User = {
    id: 1,
    name: 'Patricia López',
    email: 'patricia.lopez@enteturismo.gov.ar',
    status: 'active',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  }

  const defaultProps = {
    user: mockUser,
    isOpen: true,
    loading: false,
    name: 'Patricia López',
    email: 'patricia.lopez@enteturismo.gov.ar',
    errors: {},
    onNameChange: jest.fn(),
    onEmailChange: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render modal with user data', () => {
      render(<UserEditModal {...defaultProps} />)

      expect(screen.getByText('Editar Usuario')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Patricia López')).toBeInTheDocument()
      expect(screen.getByDisplayValue('patricia.lopez@enteturismo.gov.ar')).toBeInTheDocument()
    })

    it('should not render when user is null', () => {
      render(<UserEditModal {...defaultProps} user={null} />)

      expect(screen.queryByText('Editar Usuario')).not.toBeInTheDocument()
    })

    it('should render name and email labels', () => {
      render(<UserEditModal {...defaultProps} />)

      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should render Guardar and Cancelar buttons', () => {
      render(<UserEditModal {...defaultProps} />)

      expect(screen.getByText('Guardar')).toBeInTheDocument()
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })
  })

  describe('form interactions', () => {
    it('should call onNameChange when typing in name field', () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: 'Patricia López Updated' } })

      expect(defaultProps.onNameChange).toHaveBeenCalledWith('Patricia López Updated')
    })

    it('should call onEmailChange when typing in email field', () => {
      render(<UserEditModal {...defaultProps} />)

      const emailInput = screen.getByDisplayValue('patricia.lopez@enteturismo.gov.ar')
      fireEvent.change(emailInput, { target: { value: 'new.email@test.com' } })

      expect(defaultProps.onEmailChange).toHaveBeenCalledWith('new.email@test.com')
    })

    it('should call onClose when clicking Cancelar', () => {
      render(<UserEditModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Cancelar'))

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when form is submitted', () => {
      render(<UserEditModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Guardar'))

      expect(defaultProps.onSubmit).toHaveBeenCalled()
    })
  })

  describe('error display', () => {
    it('should show name error when provided', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ name: 'El nombre es obligatorio' }}
        />
      )

      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    })

    it('should show email error when provided', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ email: 'El email es obligatorio' }}
        />
      )

      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    })

    it('should show error when name exceeds 255 characters', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ name: 'El nombre no puede exceder 255 caracteres' }}
        />
      )

      expect(screen.getByText('El nombre no puede exceder 255 caracteres')).toBeInTheDocument()
    })

    it('should show error when email is invalid', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ email: 'El email debe ser válido' }}
        />
      )

      expect(screen.getByText('El email debe ser válido')).toBeInTheDocument()
    })

    it('should apply red border to name input when name error exists', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ name: 'El nombre es obligatorio' }}
        />
      )

      const nameInput = screen.getByLabelText('Nombre')
      expect(nameInput).toHaveClass('border-red-500')
    })

    it('should apply red border to email input when email error exists', () => {
      render(
        <UserEditModal
          {...defaultProps}
          errors={{ email: 'El email es obligatorio' }}
        />
      )

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveClass('border-red-500')
    })
  })

  describe('loading state', () => {
    it('should disable inputs when loading', () => {
      render(<UserEditModal {...defaultProps} loading={true} />)

      const nameInput = screen.getByLabelText('Nombre')
      const emailInput = screen.getByLabelText('Email')

      expect(nameInput).toBeDisabled()
      expect(emailInput).toBeDisabled()
    })

    it('should disable buttons when loading', () => {
      render(<UserEditModal {...defaultProps} loading={true} />)

      expect(screen.getByText('Guardando...')).toBeInTheDocument()
      const cancelButton = screen.getByText('Cancelar').closest('button')
      expect(cancelButton).toBeDisabled()
    })

    it('should show "Guardando..." text when loading', () => {
      render(<UserEditModal {...defaultProps} loading={true} />)

      expect(screen.getByText('Guardando...')).toBeInTheDocument()
      expect(screen.queryByText('Guardar')).not.toBeInTheDocument()
    })
  })

  describe('form values from props', () => {
    it('should display name from props', () => {
      render(<UserEditModal {...defaultProps} name="Miguel Sánchez" />)

      expect(screen.getByDisplayValue('Miguel Sánchez')).toBeInTheDocument()
    })

    it('should display email from props', () => {
      render(<UserEditModal {...defaultProps} email="miguel@test.com" />)

      expect(screen.getByDisplayValue('miguel@test.com')).toBeInTheDocument()
    })

    it('should update displayed values when props change', () => {
      const { rerender } = render(<UserEditModal {...defaultProps} />)

      expect(screen.getByDisplayValue('Patricia López')).toBeInTheDocument()

      rerender(
        <UserEditModal
          {...defaultProps}
          name="Updated Name"
          email="updated@test.com"
        />
      )

      expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument()
      expect(screen.getByDisplayValue('updated@test.com')).toBeInTheDocument()
    })
  })
})
