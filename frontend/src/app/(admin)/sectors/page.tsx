/**
 * Sectors Page
 * Server Component with static metadata for SEO
 */

import { Metadata } from 'next';

import { SectorsPageContainer } from '@/features/sectors/components/smart/SectorsPageContainer';

export const metadata: Metadata = {
  title: 'Sectores | Admin',
  description: 'Gestión de sectores - Panel de administración',
};

export default function SectorsPage() {
  return <SectorsPageContainer />;
}
