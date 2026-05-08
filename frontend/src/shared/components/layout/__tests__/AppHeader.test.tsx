import { render, screen } from '@testing-library/react'

import { AppHeader } from '@/shared/components/layout/AppHeader'

// Mock next/navigation
const mockPathname = jest.fn().mockReturnValue('/')
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

const mockUser = {
  id: 1,
  name: 'Juan Perez',
  email: 'juan@test.com',
  role: { id: 1, role_code: 'entity_admin', role_name: 'Administrador' },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const defaultConfig = {
  routeTitles: {
    '/': 'Dashboard',
    '/events': 'Gestión de Eventos',
  } as Record<string, string>,
  defaultTitle: 'Panel de Administración',
  headerSubtitle: 'Demo Organization',
  showSearch: true,
  showNotifications: true,
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/')
  })

  it('renders page title from routeTitles', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' })
    ).toBeInTheDocument()
  })

  it('renders default title when route not in map', () => {
    mockPathname.mockReturnValue('/unknown-page')

    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Panel de Administración' })
    ).toBeInTheDocument()
  })

  it('renders header subtitle', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(screen.getByText('Demo Organization')).toBeInTheDocument()
  })

  it('shows hamburger with aria-label', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Abrir menu de navegacion' })
    ).toBeInTheDocument()
  })

  it('shows search button when config says true', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Buscar' })
    ).toBeInTheDocument()
  })

  it('shows notification button when config says true', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Ver notificaciones' })
    ).toBeInTheDocument()
  })

  it('hides search when config says false', () => {
    render(
      <AppHeader
        config={{ ...defaultConfig, showSearch: false }}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.queryByRole('button', { name: 'Buscar' })
    ).not.toBeInTheDocument()
  })

  it('hides notifications when config says false', () => {
    render(
      <AppHeader
        config={{ ...defaultConfig, showNotifications: false }}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.queryByRole('button', { name: 'Ver notificaciones' })
    ).not.toBeInTheDocument()
  })

  it('renders user menu', () => {
    render(
      <AppHeader
        config={defaultConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
        onToggleSidebar={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Menu de usuario' })
    ).toBeInTheDocument()
  })

  it('is memoized', () => {
    expect(AppHeader.$$typeof).toBe(Symbol.for('react.memo'))
  })
})
