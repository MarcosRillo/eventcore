/**
 * Tests for StatsGrid Component
 */

import { render, screen } from '@testing-library/react';
import { StatsGrid } from '../StatsGrid';

describe('StatsGrid', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <StatsGrid>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </StatsGrid>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should use default testId', () => {
      render(
        <StatsGrid>
          <div>Content</div>
        </StatsGrid>
      );

      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    });

    it('should use custom testId', () => {
      render(
        <StatsGrid testId="custom-grid">
          <div>Content</div>
        </StatsGrid>
      );

      expect(screen.getByTestId('custom-grid')).toBeInTheDocument();
    });
  });

  describe('columns', () => {
    it('should use 4 columns by default', () => {
      render(
        <StatsGrid>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('md:grid-cols-4');
    });

    it('should support 2 columns', () => {
      render(
        <StatsGrid columns={2}>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should support 3 columns', () => {
      render(
        <StatsGrid columns={3}>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('should always have single column on mobile', () => {
      render(
        <StatsGrid columns={4}>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('grid-cols-1');
    });
  });

  describe('styling', () => {
    it('should have grid layout', () => {
      render(
        <StatsGrid>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('grid');
    });

    it('should have gap between items', () => {
      render(
        <StatsGrid>
          <div>Content</div>
        </StatsGrid>
      );

      const grid = screen.getByTestId('stats-grid');
      expect(grid).toHaveClass('gap-6');
    });
  });
});
