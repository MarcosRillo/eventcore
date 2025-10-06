/**
 * Organizer Layout
 * Layout wrapper for organizer panel with green sidebar
 */

import { OrganizerSidebar } from '@/components/organizer/OrganizerSidebar';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <OrganizerSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
