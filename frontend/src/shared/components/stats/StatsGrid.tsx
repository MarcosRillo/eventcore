/**
 * StatsGrid - Grid container for StatsCards
 */

'use client';

import { ReactNode } from 'react';

interface StatsGridProps {
  /** Children stats cards */
  children: ReactNode;
  /** Number of columns (defaults to 4) */
  columns?: 2 | 3 | 4;
  /** Test ID for testing */
  testId?: string;
}

const columnClasses: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/**
 *
 * @param root0
 * @param root0.children
 * @param root0.columns
 * @param root0.testId
 */
export function StatsGrid({
  children,
  columns = 4,
  testId = 'stats-grid',
}: StatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 ${columnClasses[columns]} gap-6`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export default StatsGrid;
