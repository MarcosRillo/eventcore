/**
 * Tests for OverflowMenu Component
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OverflowMenu, { type OverflowMenuItem } from '@/shared/components/display/OverflowMenu'

describe('OverflowMenu', () => {
  const defaultItems: OverflowMenuItem[] = [
    { label: 'Enviar a revisión', onClick: jest.fn() },
    { label: 'Eliminar', onClick: jest.fn(), variant: 'danger' },
  ]

  test('renders trigger button with aria-label', () => {
    render(<OverflowMenu items={defaultItems} ariaLabel="Acciones del evento" />)

    expect(
      screen.getByRole('button', { name: 'Acciones del evento' })
    ).toBeInTheDocument()
  })

  test('uses default aria-label when not provided', () => {
    render(<OverflowMenu items={defaultItems} />)

    expect(
      screen.getByRole('button', { name: 'Más acciones' })
    ).toBeInTheDocument()
  })

  test('opens menu on click showing items', async () => {
    const user = userEvent.setup()
    render(<OverflowMenu items={defaultItems} />)

    await user.click(screen.getByRole('button', { name: 'Más acciones' }))

    expect(screen.getByRole('menuitem', { name: 'Enviar a revisión' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeInTheDocument()
  })

  test('calls onClick when item is clicked', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const items: OverflowMenuItem[] = [
      { label: 'Acción', onClick },
    ]

    render(<OverflowMenu items={items} />)

    await user.click(screen.getByRole('button', { name: 'Más acciones' }))
    await user.click(screen.getByRole('menuitem', { name: 'Acción' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('applies danger styling for danger variant', async () => {
    const user = userEvent.setup()
    const items: OverflowMenuItem[] = [
      { label: 'Normal', onClick: jest.fn() },
      { label: 'Peligro', onClick: jest.fn(), variant: 'danger' },
    ]

    render(<OverflowMenu items={items} />)

    await user.click(screen.getByRole('button', { name: 'Más acciones' }))

    const dangerItem = screen.getByRole('menuitem', { name: 'Peligro' })
    const dangerButton = dangerItem.querySelector('button') ?? dangerItem
    expect(dangerButton.className).toContain('text-error-600')
  })

  test('returns null when items array is empty', () => {
    const { container } = render(<OverflowMenu items={[]} />)

    expect(container.innerHTML).toBe('')
  })

  test('renders items with icons', async () => {
    const user = userEvent.setup()
    const items: OverflowMenuItem[] = [
      {
        label: 'Con icono',
        onClick: jest.fn(),
        icon: <span data-testid="custom-icon">icon</span>,
      },
    ]

    render(<OverflowMenu items={items} />)

    await user.click(screen.getByRole('button', { name: 'Más acciones' }))

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('is memoized', () => {
    expect(OverflowMenu).toHaveProperty('$$typeof', Symbol.for('react.memo'))
  })
})
