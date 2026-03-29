/**
 * Sectors Feature - Barrel Exports
 * Central export point for all sector-related components, hooks, and services
 */

// Types
export type { Sector, SectorFormData, SectorPagination } from '@/features/sectors/types/sector.types';

// Services
export { default as sectorService } from '@/features/sectors/services/sector.service';
export {
  createSector,
  deleteSector,
  getActiveSectors,
  getSectors,
  toggleSectorStatus,
  updateSector,
} from '@/features/sectors/services/sector.service';

// Hooks
export { useSectorManager } from '@/features/sectors/hooks/useSectorManager';

// Components - Smart
export { SectorsPageContainer } from '@/features/sectors/components/smart/SectorsPageContainer';
export { SectorTableContainer } from '@/features/sectors/components/smart/SectorTableContainer';

// Components - Modals
export { default as CreateSectorModal } from '@/features/sectors/components/dumb/CreateSectorModal';
export { default as EditSectorModal } from '@/features/sectors/components/smart/EditSectorModal';
