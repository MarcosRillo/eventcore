<?php

namespace App\Features\Locations\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Features\Locations\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    public function __construct(
        private LocationService $locationService
    ) {}

    /**
     * Display a listing of locations for the authenticated user's entity.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'active', 'per_page']);
            $locations = $this->locationService->getAllLocations($filters);

            return response()->json([
                'success' => true,
                'message' => 'Locations retrieved successfully',
                'data' => $locations,
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@index: Failed to retrieve locations', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve locations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active locations (useful for dropdowns and selects).
     */
    public function active(): JsonResponse
    {
        try {
            $activeLocations = $this->locationService->getActiveLocations();

            return response()->json([
                'success' => true,
                'message' => 'Active locations retrieved successfully',
                'data' => LocationResource::collection($activeLocations),
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@active: Failed to retrieve active locations', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active locations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created location.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'description' => 'nullable|string|max:1000',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'additional_info' => 'nullable|array',
                'is_active' => 'nullable|boolean',
            ]);

            $location = $this->locationService->createLocation($validatedData, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Location created successfully',
                'data' => new LocationResource($location),
            ], 201);
        } catch (\Exception $e) {
            Log::error('LocationController@store: Failed to create location', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Location retrieved successfully',
                'data' => new LocationResource($location),
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@show: Failed to retrieve location', [
                'error' => $e->getMessage(),
                'location_id' => $location->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified location.
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'description' => 'nullable|string|max:1000',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'additional_info' => 'nullable|array',
                'is_active' => 'nullable|boolean',
            ]);

            $updatedLocation = $this->locationService->updateLocation($location, $validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Location updated successfully',
                'data' => new LocationResource($updatedLocation),
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@update: Failed to update location', [
                'error' => $e->getMessage(),
                'location_id' => $location->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified location.
     */
    public function destroy(Location $location): JsonResponse
    {
        try {
            $result = $this->locationService->deleteLocation($location);

            return response()->json([
                'success' => true,
                'message' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@destroy: Failed to delete location', [
                'error' => $e->getMessage(),
                'location_id' => $location->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle the active status of the specified location.
     */
    public function toggleStatus(Location $location): JsonResponse
    {
        try {
            $updatedLocation = $this->locationService->toggleLocationStatus($location);

            return response()->json([
                'success' => true,
                'message' => 'Location status updated successfully',
                'data' => new LocationResource($updatedLocation),
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@toggleStatus: Failed to toggle location status', [
                'error' => $e->getMessage(),
                'location_id' => $location->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle location status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get location statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->locationService->getLocationStats();

            return response()->json([
                'success' => true,
                'message' => 'Location statistics retrieved successfully',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('LocationController@statistics: Failed to retrieve location statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve location statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
