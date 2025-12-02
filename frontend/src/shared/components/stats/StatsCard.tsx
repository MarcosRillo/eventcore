/**
 * StatsCard - Reusable statistics card component
 */

'use client';

import { ReactNode } from 'react';

type SemanticColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface StatsCardProps {
  /** Label for the statistic */
  label: string;
  /** Value to display */
  value: number | string;
  /** Icon to display */
  icon: ReactNode;
  /** Semantic color for the icon background */
  color?: SemanticColor;
  /** Test ID for testing */
  testId?: string;
}

const colorClasses: Record<SemanticColor, string> = {
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  error: 'bg-error-100 text-error-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function StatsCard({
  label,
  value,
  icon,
  color = 'primary',
  testId,
}: StatsCardProps) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
      data-testid={testId}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
