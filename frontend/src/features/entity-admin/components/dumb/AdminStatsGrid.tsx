/**
 * AdminStatsGrid Component
 *
 * Displays approval statistics in a responsive grid of cards.
 * Dumb component - receives data via props, no business logic.
 */

import type { AdminStatCardData } from '@/features/entity-admin/types';
import type { EventStatusCode } from '@/types/event.types';

interface AdminStatsGridProps {
  cardData: AdminStatCardData[];
  isLoading?: boolean;
  onStatClick?: (status: EventStatusCode) => void;
}

/**
 * Color mapping for card backgrounds and text
 */
const colorStyles: Record<AdminStatCardData['color'], { card: string; text: string }> = {
  primary: {
    card: 'border-primary-200 bg-primary-50',
    text: 'text-primary-600',
  },
  success: {
    card: 'border-success-200 bg-success-50',
    text: 'text-success-600',
  },
  warning: {
    card: 'border-warning-200 bg-warning-50',
    text: 'text-warning-600',
  },
  error: {
    card: 'border-error-200 bg-error-50',
    text: 'text-error-600',
  },
  neutral: {
    card: 'border-neutral-200 bg-neutral-50',
    text: 'text-neutral-600',
  },
};

export const AdminStatsGrid = ({
  cardData,
  isLoading = false,
  onStatClick,
}: AdminStatsGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-neutral-500">Cargando estadísticas...</span>
      </div>
    );
  }

  if (!cardData || cardData.length === 0) {
    return null;
  }

  const isInteractive = !!onStatClick;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card) => {
        const styles = colorStyles[card.color];
        const baseClasses = `
          p-4 rounded-lg border-2 transition-all duration-150
          ${styles.card}
        `;

        const interactiveClasses = isInteractive
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/20'
          : '';

        const content = (
          <>
            <div className="text-sm font-medium text-neutral-600 mb-1">
              {card.label}
            </div>
            <div className={`text-3xl font-bold ${styles.text}`}>
              {card.value}
            </div>
          </>
        );

        if (isInteractive && card.statusFilter) {
          return (
            <button
              key={card.key}
              type="button"
              className={`${baseClasses} ${interactiveClasses} text-left w-full`}
              onClick={() => onStatClick(card.statusFilter!)}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={card.key} className={baseClasses}>
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsGrid;
