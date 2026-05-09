<?php

namespace App\Features\Locations\Controllers;

use App\Features\Locations\Requests\IndexLocationsRequest;
use App\Features\Locations\Requests\StoreLocationRequest;
use App\Features\Locations\Requests\UpdateLocationRequest;
use App\Features\Locations\Services\LocationService;
use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Location Controller
 *
 * Handles location CRUD operations.
 * Error logging is handled by Laravel's exception handler.
 */
class LocationController extends Controller
{
    public function __construct(
        private LocationService $locationService,
    ) {}

    /**
     * Display a listing of locations for the authenticated user's entity.
     */
    public function index(IndexLocationsRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $locations = $this->locationService->getAllLocations($filters);

        return LocationResource::collection($locations);
    }

    /**
     * Get all active locations (useful for dropdowns and selects).
     */
    public function active(): JsonResponse
    {
        $activeLocations = $this->locationService->getActiveLocations();

        return response()->json([
            'success' => true,
            'message' => 'Active locations retrieved successfully',
            'data' => LocationResource::collection($activeLocations),
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $location = $this->locationService->createLocation($validatedData, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Location created successfully',
            'data' => new LocationResource($location),
        ], 201);
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Location retrieved successfully',
            'data' => new LocationResource($location),
        ]);
    }

    /**
     * Update the specified location.
     */
    public function update(UpdateLocationRequest $request, Location $location): JsonResponse
    {
        $validatedData = $request->validated();

        $updatedLocation = $this->locationService->updateLocation($location, $validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => new LocationResource($updatedLocation),
        ]);
    }

    /**
     * Remove the specified location.
     */
    public function destroy(Location $location): Response
    {
        $this->locationService->deleteLocation($location);

        return response()->noContent();
    }

    /**
     * Toggle the active status of the specified location.
     */
    public function toggleStatus(Location $location): JsonResponse
    {
        $updatedLocation = $this->locationService->toggleLocationStatus($location);

        return response()->json([
            'success' => true,
            'message' => 'Location status updated successfully',
            'data' => new LocationResource($updatedLocation),
        ]);
    }

    /**
     * Get location statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->locationService->getLocationStats();

        return response()->json([
            'success' => true,
            'message' => 'Location statistics retrieved successfully',
            'data' => $stats,
        ]);
    }
}
