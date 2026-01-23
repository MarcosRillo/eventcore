/**
 * Tests for EventsPastToggle Component
 *
 * Dumb component that renders a checkbox for toggling between upcoming and past events.
 */

import { fireEvent,render, screen } from '@testing-library/react';

import { EventsPastToggle } from '@/features/entity-admin/components/dumb/EventsPastToggle';

describe('EventsPastToggle', () => {
  test('renders with unchecked state by default', () => {
    const handleChange = jest.fn();
    render(<EventsPastToggle checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /mostrar eventos pasados/i });
    const label = screen.getByText(/mostrar eventos pasados/i);

    // Assert: Checkbox exists and is unchecked
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    // Assert: Label is visible
    expect(label).toBeInTheDocument();
  });

  test('renders with checked state when prop is true', () => {
    const handleChange = jest.fn();
    render(<EventsPastToggle checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /mostrar eventos pasados/i });

    // Assert: Checkbox is checked
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  test('calls onChange with true when unchecked checkbox is clicked', () => {
    const handleChange = jest.fn();
    render(<EventsPastToggle checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /mostrar eventos pasados/i });
    fireEvent.click(checkbox);

    // Assert: onChange called with correct value
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('calls onChange with false when checked checkbox is clicked', () => {
    const handleChange = jest.fn();
    render(<EventsPastToggle checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /mostrar eventos pasados/i });
    fireEvent.click(checkbox);

    // Assert: onChange called with correct value
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  test('has accessible label with correct for attribute', () => {
    const handleChange = jest.fn();
    render(<EventsPastToggle checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /mostrar eventos pasados/i });
    const label = screen.getByText(/mostrar eventos pasados/i);

    // Assert: Label is associated with checkbox via htmlFor/id
    expect(label.closest('label')).toHaveAttribute('for', checkbox.id);
    expect(checkbox).toHaveAccessibleName('Mostrar eventos pasados');
  });
});
