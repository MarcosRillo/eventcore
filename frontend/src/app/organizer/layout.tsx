/**
 * Organizer Layout
 * Layout wrapper for organizer panel with sidebar
 * Protected route - redirects to login if user is not authenticated
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { OrganizerSidebar } from '@/components/organizer/OrganizerSidebar';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

/**
 *
 * @param root0
 * @param root0.children
 */
export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
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
