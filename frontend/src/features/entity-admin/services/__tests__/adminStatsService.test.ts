/**
 * Tests for adminStatsService
 *
 * Tests the service that fetches approval statistics from the backend.
 * Following TDD: RED phase - these tests should fail initially.
 */

import { adminStatsService } from '@/features/entity-admin/services/adminStatsService';
import type { AdminApprovalStats } from '@/features/entity-admin/types';
import apiClient from '@/services/apiClient';

// Mock the API client
jest.mock('@/services/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('adminStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApprovalStats', () => {
    const mockStats: AdminApprovalStats = {
      total: 100,
      pending_internal_approval: 15,
      pending_public_approval: 8,
      approved_internal: 12,
      published: 45,
      requires_changes: 5,
      rejected: 10,
      draft: 3,
      cancelled: 2,
    };

    test('fetches approval statistics successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockStats },
      });

      const result = await adminStatsService.getApprovalStats();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/approval/statistics');
      expect(result).toEqual(mockStats);
    });

    test('returns correct structure with all status counts', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockStats },
      });

      const result = await adminStatsService.getApprovalStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending_internal_approval');
      expect(result).toHaveProperty('pending_public_approval');
      expect(result).toHaveProperty('approved_internal');
      expect(result).toHaveProperty('published');
      expect(result).toHaveProperty('requires_changes');
      expect(result).toHaveProperty('rejected');
      expect(result).toHaveProperty('draft');
      expect(result).toHaveProperty('cancelled');
    });

    test('throws error when API call fails', async () => {
      const errorMessage = 'Network error';
      mockedApiClient.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(adminStatsService.getApprovalStats()).rejects.toThrow(errorMessage);
    });

    test('handles empty statistics response', async () => {
      const emptyStats: AdminApprovalStats = {
        total: 0,
        pending_internal_approval: 0,
        pending_public_approval: 0,
        approved_internal: 0,
        published: 0,
        requires_changes: 0,
        rejected: 0,
        draft: 0,
        cancelled: 0,
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: emptyStats },
      });

      const result = await adminStatsService.getApprovalStats();

      expect(result.total).toBe(0);
      expect(result.pending_internal_approval).toBe(0);
    });
  });

  describe('transformStatsToCardData', () => {
    const mockStats: AdminApprovalStats = {
      total: 100,
      pending_internal_approval: 15,
      pending_public_approval: 8,
      approved_internal: 12,
      published: 45,
      requires_changes: 5,
      rejected: 10,
      draft: 3,
      cancelled: 2,
    };

    test('transforms stats to card data array', () => {
      const result = adminStatsService.transformStatsToCardData(mockStats);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('each card has required properties', () => {
      const result = adminStatsService.transformStatsToCardData(mockStats);

      result.forEach((card) => {
        expect(card).toHaveProperty('key');
        expect(card).toHaveProperty('label');
        expect(card).toHaveProperty('value');
        expect(card).toHaveProperty('color');
      });
    });

    test('includes key stats for admin dashboard', () => {
      const result = adminStatsService.transformStatsToCardData(mockStats);
      const keys = result.map((card) => card.key);

      expect(keys).toContain('pending_internal_approval');
      expect(keys).toContain('pending_public_approval');
      expect(keys).toContain('published');
      expect(keys).toContain('requires_changes');
    });

    test('assigns correct colors to stat cards', () => {
      const result = adminStatsService.transformStatsToCardData(mockStats);

      const pendingInternalCard = result.find((c) => c.key === 'pending_internal_approval');
      const publishedCard = result.find((c) => c.key === 'published');
      const requiresChangesCard = result.find((c) => c.key === 'requires_changes');

      expect(pendingInternalCard?.color).toBe('warning');
      expect(publishedCard?.color).toBe('success');
      expect(requiresChangesCard?.color).toBe('error');
    });
  });
});
