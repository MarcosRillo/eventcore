'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (!user) {
        hasRedirected.current = true;
        router.replace('/login');
      } else {
        // Redirect based on user role
        hasRedirected.current = true;

        if (user.role?.role_code === 'platform_admin') {
          router.replace('/admin/platform');
        } else if (user.role?.role_code === 'entity_admin' || user.role?.role_code === 'entity_staff') {
          router.replace('/events');
        } else {
          router.replace('/events');
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando..." />
      </div>
    );
  }

  return null;
}
