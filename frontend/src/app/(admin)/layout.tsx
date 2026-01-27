/**
 * Admin Layout
 * Main layout wrapper for all admin pages with sidebar and header
 * Route protection handled by middleware.ts
 */

'use client';

import { Suspense,useState } from 'react';

import { Header, Sidebar } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

// Loading fallback for page content
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Cargando contenido..." />
  </div>
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading while fetching user data
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={handleToggleSidebar}
          role="presentation"
        >
          <div className="absolute inset-0 bg-neutral-600 opacity-75"></div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile, toggleable on desktop */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar 
            isCollapsed={false} 
            onToggleCollapse={handleToggleSidebar}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header 
            user={user}
            onLogout={handleLogout}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Main content with proper scrolling */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <Suspense fallback={<PageLoadingFallback />}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
