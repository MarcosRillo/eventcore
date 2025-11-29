import { render, screen, fireEvent } from '@testing-library/react'
import UserTable from '../UserTable'
import type { User, PaginationMeta } from '../../../types/user.types'

describe('UserTable', () => {
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

  const suspendedUser: User = {
    id: 2,
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@enteturismo.gov.ar',
    status: 'suspended',
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

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 2,
    per_page: 10,
    total: 15,
  }

  const defaultProps = {
    users: [mockUser],
    pagination: mockPagination,
    loading: false,
    actionLoading: null,
    onPageChange: jest.fn(),
    onEdit: jest.fn(),
    onSuspend: jest.fn(),
    onUnsuspend: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render table with users', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Patricia López')).toBeInTheDocument()
      expect(screen.getByText('patricia.lopez@enteturismo.gov.ar')).toBeInTheDocument()
      expect(screen.getByText('Entity Staff')).toBeInTheDocument()
    })

    it('should render empty state when no users', () => {
      render(<UserTable {...defaultProps} users={[]} />)

      expect(screen.getByText('No hay usuarios del equipo')).toBeInTheDocument()
      expect(screen.getByText(/Invita a nuevos miembros/)).toBeInTheDocument()
    })

    it('should render multiple users', () => {
      render(<UserTable {...defaultProps} users={[mockUser, suspendedUser]} />)

      expect(screen.getByText('Patricia López')).toBeInTheDocument()
      expect(screen.getByText('Miguel Sánchez')).toBeInTheDocument()
    })

    it('should show user initials avatar', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('PL')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should render loading skeleton', () => {
      render(<UserTable {...defaultProps} loading={true} />)

      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should not render table when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />)

      expect(screen.queryByText('Patricia López')).not.toBeInTheDocument()
    })
  })

  describe('status display', () => {
    it('should show "Activo" badge for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />)

      expect(screen.getByText('Activo')).toBeInTheDocument()
    })

    it('should show "Suspendido" badge for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />)

      expect(screen.getByText('Suspendido')).toBeInTheDocument()
    })

    it('should show green badge for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />)

      const badge = screen.getByText('Activo')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-800')
    })

    it('should show red badge for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />)

      const badge = screen.getByText('Suspendido')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-800')
    })
  })

  describe('action buttons', () => {
    it('should render Edit button', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Editar')).toBeInTheDocument()
    })

    it('should render Suspend button for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />)

      expect(screen.getByText('Suspender')).toBeInTheDocument()
      expect(screen.queryByText('Reactivar')).not.toBeInTheDocument()
    })

    it('should render Unsuspend button for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />)

      expect(screen.getByText('Reactivar')).toBeInTheDocument()
      expect(screen.queryByText('Suspender')).not.toBeInTheDocument()
    })

    it('should render Delete button', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Eliminar')).toBeInTheDocument()
    })

    it('should call onEdit when clicking Edit button', () => {
      render(<UserTable {...defaultProps} />)

      fireEvent.click(screen.getByText('Editar'))

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser)
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1)
    })

    it('should call onSuspend when clicking Suspend button', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />)

      fireEvent.click(screen.getByText('Suspender'))

      expect(defaultProps.onSuspend).toHaveBeenCalledWith(1)
      expect(defaultProps.onSuspend).toHaveBeenCalledTimes(1)
    })

    it('should call onUnsuspend when clicking Unsuspend button', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />)

      fireEvent.click(screen.getByText('Reactivar'))

      expect(defaultProps.onUnsuspend).toHaveBeenCalledWith(2)
      expect(defaultProps.onUnsuspend).toHaveBeenCalledTimes(1)
    })

    it('should call onDelete when clicking Delete button', () => {
      render(<UserTable {...defaultProps} />)

      fireEvent.click(screen.getByText('Eliminar'))

      expect(defaultProps.onDelete).toHaveBeenCalledWith(1)
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('action loading states', () => {
    it('should show loading state on Suspend button', () => {
      render(<UserTable {...defaultProps} actionLoading={1} />)

      const suspendButton = screen.getByText('Suspender').closest('button')
      expect(suspendButton).toBeInTheDocument()
    })

    it('should disable Edit button when loading', () => {
      render(<UserTable {...defaultProps} actionLoading={1} />)

      const editButton = screen.getByText('Editar').closest('button')
      expect(editButton).toBeDisabled()
    })

    it('should disable Delete button when loading', () => {
      render(<UserTable {...defaultProps} actionLoading={1} />)

      const deleteButton = screen.getByText('Eliminar').closest('button')
      expect(deleteButton).toBeDisabled()
    })

    it('should not disable other rows when one is loading', () => {
      render(
        <UserTable
          {...defaultProps}
          users={[mockUser, suspendedUser]}
          actionLoading={1}
        />
      )

      const buttons = screen.getAllByText('Editar')
      expect(buttons[0].closest('button')).toBeDisabled()
      expect(buttons[1].closest('button')).not.toBeDisabled()
    })
  })

  describe('pagination', () => {
    it('should render pagination when multiple pages', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Anterior')).toBeInTheDocument()
      expect(screen.getByText('Siguiente')).toBeInTheDocument()
    })

    it('should not render pagination when single page', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, last_page: 1 }}
        />
      )

      expect(screen.queryByText('Anterior')).not.toBeInTheDocument()
      expect(screen.queryByText('Siguiente')).not.toBeInTheDocument()
    })

    it('should disable Anterior button on first page', () => {
      render(<UserTable {...defaultProps} />)

      const anteriorButton = screen.getByText('Anterior').closest('button')
      expect(anteriorButton).toBeDisabled()
    })

    it('should disable Siguiente button on last page', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, current_page: 2 }}
        />
      )

      const siguienteButton = screen.getByText('Siguiente').closest('button')
      expect(siguienteButton).toBeDisabled()
    })

    it('should call onPageChange when clicking Siguiente', () => {
      render(<UserTable {...defaultProps} />)

      fireEvent.click(screen.getByText('Siguiente'))

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when clicking Anterior', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, current_page: 2 }}
        />
      )

      fireEvent.click(screen.getByText('Anterior'))

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1)
    })

    it('should show pagination info', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText(/Mostrando/)).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  describe('table structure', () => {
    it('should have correct column headers', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Usuario')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Rol')).toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.getByText('Fecha Alta')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })

    it('should display created date', () => {
      render(<UserTable {...defaultProps} />)

      // The date is formatted based on locale, check that some date-like text exists
      const dateCell = screen.getByText(/2025/)
      expect(dateCell).toBeInTheDocument()
    })
  })

  describe('role display', () => {
    it('should show role name', () => {
      render(<UserTable {...defaultProps} />)

      expect(screen.getByText('Entity Staff')).toBeInTheDocument()
    })

    it('should show "Sin rol" when role is null', () => {
      const userWithoutRole = { ...mockUser, role: null }
      render(<UserTable {...defaultProps} users={[userWithoutRole]} />)

      expect(screen.getByText('Sin rol')).toBeInTheDocument()
    })
  })
})
