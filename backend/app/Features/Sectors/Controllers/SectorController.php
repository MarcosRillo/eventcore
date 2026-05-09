<?php

namespace App\Features\Sectors\Controllers;

use App\Features\Sectors\Requests\StoreSectorRequest;
use App\Features\Sectors\Requests\UpdateSectorRequest;
use App\Features\Sectors\Services\SectorService;
use App\Http\Controllers\Controller;
use App\Http\Resources\SectorResource;
use App\Models\Sector;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Sector Controller
 *
 * Handles sector CRUD operations.
 */
class SectorController extends Controller
{
    public function __construct(
        private SectorService $sectorService,
    ) {}

    /**
     * Display a listing of sectors.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = [
            'search' => $request->input('search'),
            'is_active' => $request->has('is_active') ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) : null,
            'per_page' => $request->input('per_page', 15),
            'page' => $request->input('page', 1),
        ];

        $sectors = $this->sectorService->getAllSectors(array_filter($filters, fn ($v) => $v !== null));

        return SectorResource::collection($sectors);
    }

    /**
     * Store a newly created sector.
     */
    public function store(StoreSectorRequest $request): JsonResponse
    {
        try {
            $sector = $this->sectorService->createSector(
                $request->validated(),
                $request->user(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Sector created successfully',
                'data' => new SectorResource($sector),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error creating sector', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create sector due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified sector.
     */
    public function show(Sector $sector): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Sector retrieved successfully',
            'data' => new SectorResource($sector),
        ]);
    }

    /**
     * Update the specified sector.
     */
    public function update(UpdateSectorRequest $request, Sector $sector): JsonResponse
    {
        try {
            $updatedSector = $this->sectorService->updateSector(
                $sector,
                $request->validated(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Sector updated successfully',
                'data' => new SectorResource($updatedSector),
            ]);
        } catch (QueryException $e) {
            Log::error('Database error updating sector', ['id' => $sector->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update sector due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified sector.
     */
    public function destroy(Sector $sector): JsonResponse|Response
    {
        try {
            $this->sectorService->deleteSector($sector);

            return response()->noContent();
        } catch (QueryException $e) {
            Log::error('Database error deleting sector', ['id' => $sector->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete sector due to database error',
            ], 409);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Toggle sector active status.
     */
    public function toggleStatus(Sector $sector): JsonResponse
    {
        $updatedSector = $this->sectorService->toggleSectorStatus($sector);

        return response()->json([
            'success' => true,
            'message' => 'Sector status updated successfully',
            'data' => new SectorResource($updatedSector),
        ]);
    }

    /**
     * Get only active sectors (useful for dropdowns).
     */
    public function active(): JsonResponse
    {
        $activeSectors = $this->sectorService->getActiveSectors();

        return response()->json([
            'success' => true,
            'message' => 'Active sectors retrieved successfully',
            'data' => SectorResource::collection($activeSectors),
        ]);
    }

    /**
     * Get all active sectors without tenant scope (for public registration forms).
     */
    public function publicActive(): JsonResponse
    {
        $activeSectors = $this->sectorService->getPublicActiveSectors();

        return response()->json([
            'success' => true,
            'message' => 'Active sectors retrieved successfully',
            'data' => SectorResource::collection($activeSectors),
        ]);
    }
}
