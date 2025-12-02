import { render, screen } from '@testing-library/react'
import { LandingContainer } from '../LandingContainer'
import { useLandingData } from '../../../hooks/useLandingData'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock hooks and components
jest.mock('../../../hooks/useLandingData')
jest.mock('@/features/landing/components/dumb', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  FeaturedEventsSection: ({ loading, events }: { loading: boolean; events: unknown[] }) => (
    <div data-testid="featured-section">
      Featured: {loading ? 'Loading' : events.length}
    </div>
  ),
  CategoriesSection: ({ loading, categories }: { loading: boolean; categories: unknown[] }) => (
    <div data-testid="categories-section">
      Categories: {loading ? 'Loading' : categories.length}
    </div>
  ),
  OrganizersSection: () => <div data-testid="organizers-section">Organizers Section</div>,
  Footer: () => <div data-testid="footer">Footer</div>
}))

describe('LandingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all sections', () => {
    ;(useLandingData as jest.Mock).mockReturnValue({
      featuredEvents: [],
      categories: [],
      loading: true,
      error: null
    })

    render(<LandingContainer />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-section')).toBeInTheDocument()
    expect(screen.getByTestId('categories-section')).toBeInTheDocument()
    expect(screen.getByTestId('organizers-section')).toBeInTheDocument()
    // Note: Footer is now rendered in the public layout, not in LandingContainer
  })

  it('passes data to sections', () => {
    const mockEvents = [{ id: 1 }]
    const mockCategories = [{ id: 1 }]

    ;(useLandingData as jest.Mock).mockReturnValue({
      featuredEvents: mockEvents,
      categories: mockCategories,
      loading: false,
      error: null
    })

    render(<LandingContainer />)

    expect(screen.getByText('Featured: 1')).toBeInTheDocument()
    expect(screen.getByText('Categories: 1')).toBeInTheDocument()
  })

  it('renders error state', () => {
    ;(useLandingData as jest.Mock).mockReturnValue({
      featuredEvents: [],
      categories: [],
      loading: false,
      error: 'Failed to load'
    })

    render(<LandingContainer />)
    // Assuming the container handles error, or at least renders sections with empty data
    // If there's specific error handling UI, test for it here.
    // For now, just ensuring it doesn't crash
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })
})
