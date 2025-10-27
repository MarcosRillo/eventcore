import { OrganizerStatsWidget } from '@/features/organizer/components/smart/OrganizerStatsWidget';

export default function TestWidgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test: Organizer Stats Widget
        </h1>
        
        <OrganizerStatsWidget />
      </div>
    </div>
  );
}
