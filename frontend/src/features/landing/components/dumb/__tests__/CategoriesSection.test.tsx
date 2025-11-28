import { render, screen } from '@testing-library/react'
import { CategoriesSection } from '../CategoriesSection'

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('CategoriesSection', () => {
  const mockCategories = [
    { id: 1, name: 'Music', slug: 'music', icon: 'music' },
    { id: 2, name: 'Sports', slug: 'sports', icon: 'activity' }
  ]

  it('renders section title', () => {
    render(<CategoriesSection categories={[]} loading={false} onCategoryClick={jest.fn()} />)
    expect(screen.getByText(/Explorar por Categoría/i)).toBeInTheDocument()
  })

  it('renders categories list', () => {
    render(<CategoriesSection categories={mockCategories} loading={false} onCategoryClick={jest.fn()} />)
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.getByText('Sports')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<CategoriesSection categories={[]} loading={true} onCategoryClick={jest.fn()} />)
    // Check for skeletons or absence of empty message
    expect(screen.queryByText(/No hay categorías disponibles/i)).not.toBeInTheDocument()
  })
})
