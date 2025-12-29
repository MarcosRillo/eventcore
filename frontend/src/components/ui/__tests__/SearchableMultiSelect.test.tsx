/**
 * Tests for SearchableMultiSelect component
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect'

// Mock ResizeObserver for Headless UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockOptions = [
  { id: 1, name: 'Plaza Independencia' },
  { id: 2, name: 'Parque 9 de Julio' },
  { id: 3, name: 'Centro de Convenciones' },
  { id: 4, name: 'Teatro San Martín' },
]

describe('SearchableMultiSelect', () => {
  const defaultProps = {
    options: mockOptions,
    selected: [],
    onChange: jest.fn(),
    label: 'Ubicaciones',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render label correctly', () => {
      render(<SearchableMultiSelect {...defaultProps} />)

      expect(screen.getByText('Ubicaciones')).toBeInTheDocument()
    })

    it('should render required asterisk when required', () => {
      render(<SearchableMultiSelect {...defaultProps} required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should render placeholder in input', () => {
      render(<SearchableMultiSelect {...defaultProps} placeholder="Buscar ubicación..." />)

      expect(screen.getByPlaceholderText('Buscar ubicación...')).toBeInTheDocument()
    })

    it('should render error message when error prop is provided', () => {
      render(<SearchableMultiSelect {...defaultProps} error="Selecciona al menos una ubicación" />)

      expect(screen.getByRole('alert')).toHaveTextContent('Selecciona al menos una ubicación')
    })

    it('should show selected items as chips', () => {
      render(<SearchableMultiSelect {...defaultProps} selected={[1, 3]} />)

      expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
      expect(screen.getByText('Centro de Convenciones')).toBeInTheDocument()
    })
  })

  describe('Dropdown behavior', () => {
    it('should show all options when typing', async () => {
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} />)

      // Click on the dropdown button to open
      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Plaza Independencia/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Parque 9 de Julio/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Centro de Convenciones/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Teatro San Martín/i })).toBeInTheDocument()
      })
    })

    it('should filter options based on search query', async () => {
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} />)

      const input = screen.getByRole('combobox')
      await user.type(input, 'Plaza')

      await waitFor(() => {
        expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
        expect(screen.queryByText('Parque 9 de Julio')).not.toBeInTheDocument()
      })
    })

    it('should show no results message when no matches', async () => {
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} />)

      const input = screen.getByRole('combobox')
      await user.type(input, 'xyz123')

      await waitFor(() => {
        expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument()
      })
    })

    it('should be case insensitive when filtering', async () => {
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} />)

      const input = screen.getByRole('combobox')
      await user.type(input, 'plaza')

      await waitFor(() => {
        expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
      })
    })
  })

  describe('Selection', () => {
    it('should call onChange with new id when selecting an option', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} onChange={onChange} />)

      // Type to open dropdown and filter
      const input = screen.getByRole('combobox')
      await user.type(input, 'Plaza')

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Plaza Independencia/i })).toBeInTheDocument()
      })

      const option = screen.getByRole('option', { name: /Plaza Independencia/i })
      await user.click(option)

      expect(onChange).toHaveBeenCalledWith([1])
    })

    it('should add to existing selection when selecting another option', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} selected={[1]} onChange={onChange} />)

      // Type to open dropdown
      const input = screen.getByRole('combobox')
      await user.type(input, 'Parque')

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Parque 9 de Julio/i })).toBeInTheDocument()
      })

      const option = screen.getByRole('option', { name: /Parque 9 de Julio/i })
      await user.click(option)

      expect(onChange).toHaveBeenCalledWith([1, 2])
    })

    it('should remove selection via chip X button', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} selected={[1]} onChange={onChange} />)

      // Use chip X button to remove - this is the expected UX for removal
      const removeButton = screen.getByLabelText('Remover Plaza Independencia')
      await user.click(removeButton)

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Chip removal', () => {
    it('should remove item when clicking X on chip', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} selected={[1, 2]} onChange={onChange} />)

      const removeButton = screen.getByLabelText('Remover Plaza Independencia')
      await user.click(removeButton)

      expect(onChange).toHaveBeenCalledWith([2])
    })

    it('should not allow chip removal when disabled', () => {
      const onChange = jest.fn()
      render(<SearchableMultiSelect {...defaultProps} selected={[1]} onChange={onChange} disabled />)

      const removeButton = screen.getByLabelText('Remover Plaza Independencia')
      expect(removeButton).toBeDisabled()
    })
  })

  describe('Disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(<SearchableMultiSelect {...defaultProps} disabled />)

      const input = screen.getByRole('combobox')
      expect(input).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      render(<SearchableMultiSelect {...defaultProps} error="Error message" />)

      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should show error message with alert role for screen readers', () => {
      render(<SearchableMultiSelect {...defaultProps} error="Error message" />)

      // Error message should be announced to screen readers
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Error message')
    })

    it('should be navigable with keyboard', async () => {
      const user = userEvent.setup()
      render(<SearchableMultiSelect {...defaultProps} />)

      const input = screen.getByRole('combobox')
      await user.click(input)

      // Press down arrow to navigate
      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        // Check that options are visible
        expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
      })
    })
  })
})
