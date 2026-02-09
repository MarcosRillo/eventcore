import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserMenu } from '@/shared/components/layout/UserMenu'

const mockUser = {
  id: 1,
  name: 'Juan Perez',
  email: 'juan@test.com',
  role: { id: 1, role_code: 'entity_admin', role_name: 'Administrador' },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('UserMenu', () => {
  it('renders trigger with user initials', () => {
    render(<UserMenu user={mockUser as never} onLogout={jest.fn()} />)

    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('renders trigger with aria-label', () => {
    render(<UserMenu user={mockUser as never} onLogout={jest.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Menu de usuario' })
    ).toBeInTheDocument()
  })

  it('opens menu on click showing items', async () => {
    const user = userEvent.setup()
    render(<UserMenu user={mockUser as never} onLogout={jest.fn()} />)

    await user.click(
      screen.getByRole('button', { name: 'Menu de usuario' })
    )

    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Configuración')).toBeInTheDocument()
    expect(screen.getByText('Ayuda')).toBeInTheDocument()
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
  })

  it('shows user info in dropdown header', async () => {
    const user = userEvent.setup()
    render(<UserMenu user={mockUser as never} onLogout={jest.fn()} />)

    await user.click(
      screen.getByRole('button', { name: 'Menu de usuario' })
    )

    expect(screen.getByText('juan@test.com')).toBeInTheDocument()
  })

  it('calls onLogout on Cerrar Sesion click', async () => {
    const user = userEvent.setup()
    const onLogout = jest.fn()
    render(<UserMenu user={mockUser as never} onLogout={onLogout} />)

    await user.click(
      screen.getByRole('button', { name: 'Menu de usuario' })
    )
    await user.click(screen.getByText('Cerrar Sesión'))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('is memoized', () => {
    expect(UserMenu.$$typeof).toBe(Symbol.for('react.memo'))
  })
})
