/**
 * Tests for FuzzySearchSelect component
 *
 * Verifies chip display logic works correctly in both create and edit modes.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import type { FuzzySelectOption } from '@/shared/components/form/FuzzySearchSelect';
import { FuzzySearchSelect } from '@/shared/components/form/FuzzySearchSelect';

// Mock Fuse.js to avoid complexity in unit tests
jest.mock('fuse.js', () => {
  return jest.fn().mockImplementation(() => ({
    search: jest.fn().mockReturnValue([]),
    setCollection: jest.fn(),
  }));
});

describe('FuzzySearchSelect', () => {
  const options: FuzzySelectOption[] = [
    { id: 1, name: 'Location A' },
    { id: 2, name: 'Location B' },
    { id: 3, name: 'Location C' },
  ];

  const defaultProps = {
    options,
    selected: [] as number[],
    onChange: jest.fn(),
    label: 'Ubicaciones',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create mode (no selectedOptions prop)', () => {
    test('shows chips for selected locations from options list', () => {
      render(
        <FuzzySearchSelect
          {...defaultProps}
          selected={[1, 3]}
        />
      );

      expect(screen.getByText('Location A')).toBeInTheDocument();
      expect(screen.getByText('Location C')).toBeInTheDocument();
      expect(screen.queryByText('Location B')).not.toBeInTheDocument();
    });
  });

  describe('Edit mode (with selectedOptions prop)', () => {
    const selectedOptions: FuzzySelectOption[] = [
      { id: 1, name: 'Location A' },
      { id: 2, name: 'Location B' },
    ];

    test('shows chips for existing selections from providedSelectedOptions', () => {
      render(
        <FuzzySearchSelect
          {...defaultProps}
          selected={[1, 2]}
          selectedOptions={selectedOptions}
        />
      );

      expect(screen.getByText('Location A')).toBeInTheDocument();
      expect(screen.getByText('Location B')).toBeInTheDocument();
    });

    test('shows chip for newly added location not in selectedOptions', () => {
      // Location C (id: 3) is newly selected — not in selectedOptions but in options
      render(
        <FuzzySearchSelect
          {...defaultProps}
          selected={[1, 3]}
          selectedOptions={selectedOptions}
        />
      );

      expect(screen.getByText('Location A')).toBeInTheDocument();
      expect(screen.getByText('Location C')).toBeInTheDocument();
    });

    test('shows chips for both existing and newly added locations', () => {
      render(
        <FuzzySearchSelect
          {...defaultProps}
          selected={[1, 2, 3]}
          selectedOptions={selectedOptions}
        />
      );

      expect(screen.getByText('Location A')).toBeInTheDocument();
      expect(screen.getByText('Location B')).toBeInTheDocument();
      expect(screen.getByText('Location C')).toBeInTheDocument();
    });
  });

  describe('Chip removal', () => {
    test('calls onChange without removed id when remove button is clicked', () => {
      const onChange = jest.fn();
      render(
        <FuzzySearchSelect
          {...defaultProps}
          selected={[1, 2]}
          onChange={onChange}
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remover/ });
      fireEvent.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalledWith([2]);
    });
  });
});
