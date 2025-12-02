<?php

namespace App\Features\Locations\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Features\Locations\Services\LocationService;
use App\Features\Locations\Requests\IndexLocationsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Location Controller
 *
 * Handles location CRUD operations.
 * Error logging is handled by Laravel's exception handler.
 */
class LocationController extends Controller
{
    public function __construct(
        private LocationService $locationService
    ) {}

    /**
     * Display a listing of locations for the authenticated user's entity.
     */
    public function index(IndexLocationsRequest $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
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
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

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
    public function update(Request $request, Location $location): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:500',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

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
    public function destroy(Location $location): JsonResponse
    {
        $result = $this->locationService->deleteLocation($location);

        return response()->json([
            'success' => true,
            'message' => $result,
        ]);
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
