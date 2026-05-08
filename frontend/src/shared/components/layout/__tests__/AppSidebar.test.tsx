import { render, screen } from '@testing-library/react'
import { Calendar,Home } from 'lucide-react'

import { AppSidebar } from '@/shared/components/layout/AppSidebar'

// Mock next/navigation
const mockPathname = jest.fn().mockReturnValue('/')
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

const defaultConfig = {
  brandTitle: 'Demo Region',
  brandSubtitle: 'Turismo',
  collapsible: true,
  navSections: [
    {
      name: 'Principal',
      items: [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Calendario', href: '/calendar', icon: Calendar },
      ],
    },
  ],
}

describe('AppSidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/')
  })

  it('renders brand title', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.getByText('Demo Region')).toBeInTheDocument()
    expect(screen.getByText('Turismo')).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Calendario')).toBeInTheDocument()
  })

  it('marks active link based on pathname', () => {
    mockPathname.mockReturnValue('/calendar')

    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    const calendarLink = screen.getByRole('link', { name: /Calendario/ })
    expect(calendarLink).toHaveClass('bg-primary-50', 'text-primary-600')
  })

  it('nav has aria-label', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' })
    ).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.getByText('Principal')).toBeInTheDocument()
  })

  it('hides labels when collapsed', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={true}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Demo Region')).not.toBeInTheDocument()
  })

  it('renders collapse toggle with aria-label', () => {
    render(
      <AppSidebar
        config={defaultConfig}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Contraer sidebar' })
    ).toBeInTheDocument()
  })

  it('hides collapse toggle when not collapsible', () => {
    render(
      <AppSidebar
        config={{ ...defaultConfig, collapsible: false }}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(
      screen.queryByRole('button', { name: /sidebar/ })
    ).not.toBeInTheDocument()
  })

  it('renders badge when present', () => {
    const configWithBadge = {
      ...defaultConfig,
      navSections: [
        {
          name: 'Principal',
          items: [
            { name: 'Eventos', href: '/events', icon: Home, badge: '5' },
          ],
        },
      ],
    }

    render(
      <AppSidebar
        config={configWithBadge}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('skips empty sections', () => {
    const configWithEmpty = {
      ...defaultConfig,
      navSections: [
        { name: 'Empty', items: [] },
        {
          name: 'Full',
          items: [{ name: 'Item', href: '/item', icon: Home }],
        },
      ],
    }

    render(
      <AppSidebar
        config={configWithEmpty}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )

    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
    expect(screen.getByText('Full')).toBeInTheDocument()
  })

  it('is memoized', () => {
    expect(AppSidebar.$$typeof).toBe(Symbol.for('react.memo'))
  })
})
