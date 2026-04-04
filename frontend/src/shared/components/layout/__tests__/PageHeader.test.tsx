import { render, screen } from '@testing-library/react'

import { PageHeader } from '@/shared/components/layout/PageHeader'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Mis Eventos" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Mis Eventos' })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Mis Eventos" subtitle="Gestiona tus eventos" />)

    expect(screen.getByText('Gestiona tus eventos')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(<PageHeader title="Mis Eventos" />)

    expect(container.querySelector('p')).toBeNull()
  })

  it('renders action slot when provided', () => {
    render(
      <PageHeader
        title="Test"
        action={<button>Create</button>}
      />
    )

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('does not render action wrapper when not provided', () => {
    const { container } = render(<PageHeader title="Test" />)

    // Only one child div (the title container)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(1)
  })

  it('applies custom className', () => {
    const { container } = render(<PageHeader title="Test" className="mb-6" />)

    expect(container.firstChild).toHaveClass('mb-6')
  })

  it('has correct title styling', () => {
    render(<PageHeader title="Styled Title" />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-neutral-900')
  })

  it('has correct subtitle styling', () => {
    render(<PageHeader title="Test" subtitle="Sub" />)

    const subtitle = screen.getByText('Sub')
    expect(subtitle).toHaveClass('text-neutral-600', 'mt-1')
  })

  it('has flex layout for title and action alignment', () => {
    const { container } = render(
      <PageHeader title="Test" action={<button>Act</button>} />
    )

    expect(container.firstChild).toHaveClass('flex', 'justify-between', 'items-center')
  })
})
