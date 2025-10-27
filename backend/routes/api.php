<?php

// Feature Controllers - Dashboard
use App\Features\Dashboard\Controllers\DashboardController;
use App\Features\Dashboard\Controllers\OrganizerStatsController;

// Feature Controllers - Auth
use App\Features\Auth\Controllers\AuthController;

// Feature Controllers - PublicEvents
use App\Features\PublicEvents\Controllers\PublicEventController;

// Feature Controllers - Appearance
use App\Features\Appearance\Controllers\AppearanceController;

// Feature Controllers - SIMPLE
use App\Features\Events\Controllers\EventController as FeatureEventController;
use App\Features\Approval\Controllers\ApprovalController;
use App\Features\Categories\Controllers\CategoryController;
use App\Features\Locations\Controllers\LocationController;
use App\Features\Organizer\Controllers\OrganizerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // ===== AUTHENTICATION (público) =====
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Protected routes con roles específicos
    Route::middleware('auth:sanctum')->group(function () {

        // ===== PLATFORM ADMIN + ENTITY ADMIN =====
        // Full CRUD, approval, admin features
        Route::middleware(['role:platform_admin,entity_admin'])->group(function () {
            // Event statistics y features avanzadas
            Route::get('events/statistics', [FeatureEventController::class, 'statistics']);
            Route::patch('events/{id}/toggle-featured', [FeatureEventController::class, 'toggleFeatured']);
            Route::post('events/{id}/duplicate', [FeatureEventController::class, 'duplicate']);

            // Approval routes
            Route::patch('events/{id}/approve', [ApprovalController::class, 'approve']);
            Route::patch('events/{id}/request-public', [ApprovalController::class, 'requestPublicApproval']);
            Route::patch('events/{id}/publish', [ApprovalController::class, 'publish']);
            Route::patch('events/{id}/request-changes', [ApprovalController::class, 'requestChanges']);
            Route::patch('events/{id}/reject', [ApprovalController::class, 'reject']);
            Route::get('events/approval/statistics', [ApprovalController::class, 'statistics']);

            // Event CRUD (solo para eventos del Ente)
            Route::post('events', [FeatureEventController::class, 'store']);
            Route::put('events/{id}', [FeatureEventController::class, 'update']);
            Route::patch('events/{id}', [FeatureEventController::class, 'update']);
            Route::delete('events/{id}', [FeatureEventController::class, 'destroy']);

            // Categories CRUD
            Route::post('categories', [CategoryController::class, 'store']);
            Route::put('categories/{category}', [CategoryController::class, 'update']);
            Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

            // Locations CRUD
            Route::post('locations', [LocationController::class, 'store']);
            Route::put('locations/{location}', [LocationController::class, 'update']);
            Route::delete('locations/{location}', [LocationController::class, 'destroy']);

            // Admin routes
            Route::prefix('admin')->group(function () {
                Route::apiResource('appearance', AppearanceController::class);
            });
        });

        // ===== EVENT ORGANIZER =====
        // Only /organizer/* routes for own events
        Route::middleware(['role:organizer'])->group(function () {
            Route::prefix('organizer')->group(function () {
                Route::get('dashboard/stats', [OrganizerController::class, 'dashboardStats']);
                Route::get('events', [OrganizerController::class, 'index']);
                Route::post('events', [OrganizerController::class, 'store']);
                Route::get('events/{id}', [OrganizerController::class, 'show']);
                Route::put('events/{id}', [OrganizerController::class, 'update']);
                Route::delete('events/{id}', [OrganizerController::class, 'destroy']);
            });
        });

        // ===== ORGANIZER STATS (any authenticated user) =====
        Route::get('organizer/stats', [OrganizerStatsController::class, 'index']);

        // ===== PLATFORM ADMIN + ENTITY ADMIN + ENTITY STAFF =====
        // Dashboard del Ente + read-only events
        Route::middleware(['role:platform_admin,entity_admin,entity_staff'])->group(function () {
            // Dashboard del Ente
            Route::prefix('dashboard')->group(function () {
                Route::get('events/summary', [DashboardController::class, 'eventsSummary']);
                Route::get('events', [DashboardController::class, 'events']);
            });

            // Event detail (for dashboard modal)
            Route::get('events/{id}/detail', [DashboardController::class, 'eventDetail']);

            // Event read-only
            Route::get('events', [FeatureEventController::class, 'index']);
            Route::get('events/{id}', [FeatureEventController::class, 'show']);

            // Categories y Locations - solo lectura
            Route::get('categories', [CategoryController::class, 'index']);
            Route::get('categories/active', [CategoryController::class, 'active']);
            Route::get('categories/{category}', [CategoryController::class, 'show']);

            Route::get('locations', [LocationController::class, 'index']);
            Route::get('locations/active', [LocationController::class, 'active']);
            Route::get('locations/{location}', [LocationController::class, 'show']);
        });
    });

    // ===== PUBLIC ROUTES (sin autenticación) =====
    Route::prefix('public')->group(function () {
        // Events
        Route::get('events', [PublicEventController::class, 'index']);
        Route::get('events/upcoming', [PublicEventController::class, 'upcoming']);
        Route::get('events/featured', [PublicEventController::class, 'featured']);
        Route::get('events/search', [PublicEventController::class, 'search']);
        Route::get('events/calendar/{year}/{month}', [PublicEventController::class, 'calendarMonth']);
        Route::get('events/date-range', [PublicEventController::class, 'dateRange']);
        Route::get('events/category/{categoryId}', [PublicEventController::class, 'byCategory']);
        Route::get('events/{id}', [PublicEventController::class, 'show']);

        // Categories
        Route::get('categories', [PublicEventController::class, 'categories']);
        Route::get('categories/active', [CategoryController::class, 'active']);

        // Locations
        Route::get('locations/active', [LocationController::class, 'active']);
    });

    // Legacy public routes (keep for backward compatibility)
    Route::get('events/public', [PublicEventController::class, 'index']);
    Route::get('categories/public', [CategoryController::class, 'publicIndex']);
});
