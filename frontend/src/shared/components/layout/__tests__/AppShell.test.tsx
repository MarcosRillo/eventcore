import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar,Home } from 'lucide-react'

import { AppShell } from '@/shared/components/layout/AppShell'
import type { AppShellConfig } from '@/shared/components/layout/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

const mockUser = {
  id: 1,
  name: 'Juan Perez',
  email: 'juan@test.com',
  role: { id: 1, role_code: 'entity_admin', role_name: 'Administrador' },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockConfig: AppShellConfig = {
  brandTitle: 'Tucumán',
  brandSubtitle: 'Turismo',
  navSections: [
    {
      name: 'Principal',
      items: [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Calendario', href: '/calendar', icon: Calendar },
      ],
    },
  ],
  routeTitles: { '/': 'Dashboard' },
  defaultTitle: 'Panel',
  headerSubtitle: 'Demo Organization',
  collapsible: true,
  showSearch: true,
  showNotifications: true,
}

describe('AppShell', () => {
  it('renders children', () => {
    render(
      <AppShell
        config={mockConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
      >
        <div>Page content</div>
      </AppShell>
    )

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('renders sidebar', () => {
    render(
      <AppShell
        config={mockConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
      >
        <div>Content</div>
      </AppShell>
    )

    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' })
    ).toBeInTheDocument()
  })

  it('renders header', () => {
    render(
      <AppShell
        config={mockConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
      >
        <div>Content</div>
      </AppShell>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' })
    ).toBeInTheDocument()
  })

  it('renders main landmark', () => {
    render(
      <AppShell
        config={mockConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
      >
        <div>Content</div>
      </AppShell>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('mobile toggle opens sidebar overlay', async () => {
    const user = userEvent.setup()

    render(
      <AppShell
        config={mockConfig}
        user={mockUser as never}
        onLogout={jest.fn()}
      >
        <div>Content</div>
      </AppShell>
    )

    // Initially no overlay
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

    // Click hamburger
    await user.click(
      screen.getByRole('button', { name: 'Abrir menu de navegacion' })
    )

    // Overlay should appear
    expect(screen.getByRole('presentation')).toBeInTheDocument()
  })
})
