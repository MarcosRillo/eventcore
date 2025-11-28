import { render, screen } from '@testing-library/react'
import { HeroSection } from '../HeroSection'

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('HeroSection', () => {
  it('renders title and subtitle', () => {
    render(<HeroSection onExploreClick={jest.fn()} />)
    
    expect(screen.getByText(/Descubrí Tucumán/i)).toBeInTheDocument()
    expect(screen.getByText(/Los mejores eventos turísticos y culturales de la provincia/i)).toBeInTheDocument()
  })

  it('renders call to action button', () => {
    render(<HeroSection onExploreClick={jest.fn()} />)
    
    expect(screen.getByRole('button', { name: /Ver todos los eventos/i })).toBeInTheDocument()
  })
})
