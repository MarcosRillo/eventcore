'use client';

interface EventViewTabsProps {
  activeTab: 'upcoming' | 'past'
  onTabChange: (tab: 'upcoming' | 'past') => void
  upcomingCount?: number
  pastCount?: number
}

export const EventViewTabs = ({
  activeTab,
  onTabChange,
  upcomingCount,
  pastCount,
}: EventViewTabsProps) => {
  return (
    <div className="flex gap-2 mb-4 border-b border-neutral-200">
      <button
        onClick={() => onTabChange('upcoming')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'upcoming'
            ? 'border-b-2 border-primary-500 text-primary-600'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        Próximos y En Curso
        {upcomingCount !== undefined && (
          <span className="ml-2 text-sm">({upcomingCount})</span>
        )}
      </button>
      <button
        onClick={() => onTabChange('past')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'past'
            ? 'border-b-2 border-primary-500 text-primary-600'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        Eventos Pasados
        {pastCount !== undefined && (
          <span className="ml-2 text-sm">({pastCount})</span>
        )}
      </button>
    </div>
  )
}
