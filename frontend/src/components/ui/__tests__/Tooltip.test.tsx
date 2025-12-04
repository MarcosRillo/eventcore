import { render, screen, fireEvent } from '@testing-library/react'
import { Tooltip } from '../Tooltip'

describe('Tooltip', () => {
  it('shows tooltip on hover', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.mouseEnter(button)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Test tooltip')

    fireEvent.mouseLeave(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    )

    const button = screen.getByRole('button')
    fireEvent.focus(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.blur(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <Tooltip content="Test tooltip">
        <span>Test content</span>
      </Tooltip>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('supports different positions', () => {
    const { rerender } = render(
      <Tooltip content="Test tooltip" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()

    // Test position changes
    rerender(
      <Tooltip content="Test tooltip" position="left">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})
