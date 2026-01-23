/**
 * Organizer Layout
 * Layout wrapper for organizer panel with sidebar
 * Route protection handled by middleware.ts
 */

'use client';

import { OrganizerSidebar } from '@/components/organizer/OrganizerSidebar';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const { user, isLoading } = useAuth();

  // Show loading while fetching user data
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <OrganizerSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
