import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
    onClose: jest.fn(),
    onSave: jest.fn().mockResolvedValue(true),
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
    it('should update name when typing', () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: 'Patricia López Updated' } })

      expect(screen.getByDisplayValue('Patricia López Updated')).toBeInTheDocument()
    })

    it('should update email when typing', () => {
      render(<UserEditModal {...defaultProps} />)

      const emailInput = screen.getByDisplayValue('patricia.lopez@enteturismo.gov.ar')
      fireEvent.change(emailInput, { target: { value: 'new.email@test.com' } })

      expect(screen.getByDisplayValue('new.email@test.com')).toBeInTheDocument()
    })

    it('should call onClose when clicking Cancelar', () => {
      render(<UserEditModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Cancelar'))

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('validation', () => {
    it('should show error when name is empty', async () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: '' } })

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
      })
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should show error when email is empty', async () => {
      render(<UserEditModal {...defaultProps} />)

      const emailInput = screen.getByDisplayValue('patricia.lopez@enteturismo.gov.ar')
      fireEvent.change(emailInput, { target: { value: '' } })

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
      })
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should show error when email is invalid', async () => {
      render(<UserEditModal {...defaultProps} />)

      const emailInput = screen.getByDisplayValue('patricia.lopez@enteturismo.gov.ar')
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } })

      // Submit the form directly to bypass HTML5 validation
      const form = emailInput.closest('form')
      expect(form).toBeInTheDocument()
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByText('El email debe ser válido')).toBeInTheDocument()
      })
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should show error when name exceeds 255 characters', async () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(256) } })

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(screen.getByText('El nombre no puede exceder 255 caracteres')).toBeInTheDocument()
      })
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    it('should call onSave with correct data when form is valid', async () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: 'Patricia López Updated' } })

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, {
          name: 'Patricia López Updated',
          email: 'patricia.lopez@enteturismo.gov.ar',
        })
      })
    })

    it('should call onClose after successful save', async () => {
      render(<UserEditModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should not call onClose when save fails', async () => {
      const onSaveFailing = jest.fn().mockResolvedValue(false)
      render(<UserEditModal {...defaultProps} onSave={onSaveFailing} />)

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(onSaveFailing).toHaveBeenCalled()
      })
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('should trim whitespace from values', async () => {
      render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: '  Patricia López Updated  ' } })

      fireEvent.click(screen.getByText('Guardar'))

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, {
          name: 'Patricia López Updated',
          email: 'patricia.lopez@enteturismo.gov.ar',
        })
      })
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

  describe('form reset on user change', () => {
    it('should reset form when user changes', () => {
      const { rerender } = render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

      expect(screen.getByDisplayValue('Changed Name')).toBeInTheDocument()

      const newUser = { ...mockUser, id: 2, name: 'Miguel Sánchez', email: 'miguel@test.com' }
      rerender(<UserEditModal {...defaultProps} user={newUser} />)

      expect(screen.getByDisplayValue('Miguel Sánchez')).toBeInTheDocument()
      expect(screen.getByDisplayValue('miguel@test.com')).toBeInTheDocument()
    })

    it('should clear errors when user changes', () => {
      const { rerender } = render(<UserEditModal {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('Patricia López')
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.click(screen.getByText('Guardar'))

      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()

      const newUser = { ...mockUser, id: 2, name: 'Miguel Sánchez', email: 'miguel@test.com' }
      rerender(<UserEditModal {...defaultProps} user={newUser} />)

      expect(screen.queryByText('El nombre es obligatorio')).not.toBeInTheDocument()
    })
  })
})
