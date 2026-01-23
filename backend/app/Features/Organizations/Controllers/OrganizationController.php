<?php

namespace App\Features\Organizations\Controllers;

use App\Features\Organizations\Services\OrganizationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Organization Controller
 *
 * Handles organization management for entity admins.
 * Allows viewing linked organizations and toggling their status.
 */
class OrganizationController extends Controller
{
    public function __construct(
        private OrganizationService $organizationService,
    ) {}

    /**
     * Display a listing of organizations linked to the user's entity.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'status', 'per_page', 'page']);
            $organizations = $this->organizationService->getLinkedOrganizations(
                $request->user(),
                $filters,
            );

            return response()->json([
                'success' => true,
                'message' => 'Organizations retrieved successfully',
                'data' => $organizations->items(),
                'pagination' => [
                    'current_page' => $organizations->currentPage(),
                    'last_page' => $organizations->lastPage(),
                    'per_page' => $organizations->perPage(),
                    'total' => $organizations->total(),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified organization with details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $organization = $this->organizationService->getOrganizationDetail(
                $id,
                $request->user(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Organization retrieved successfully',
                'data' => $organization,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Toggle organization status between active and suspended.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        try {
            $organization = $this->organizationService->toggleOrganizationStatus(
                $id,
                $request->user(),
            );

            $statusName = $organization->status?->status_name ?? 'Unknown';

            return response()->json([
                'success' => true,
                'message' => "Organization status changed to {$statusName}",
                'data' => $organization,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error toggling organization status', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle organization status',
            ], 500);
        }
    }
}
