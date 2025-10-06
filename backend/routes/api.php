<?php

// Feature Controllers - Dashboard
use App\Features\Dashboard\Controllers\DashboardController;

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
    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Events Feature Routes - SIMPLE
        Route::get('events/statistics', [FeatureEventController::class, 'statistics']);
        Route::patch('events/{id}/toggle-featured', [FeatureEventController::class, 'toggleFeatured']);
        Route::post('events/{id}/duplicate', [FeatureEventController::class, 'duplicate']);

        // Approval Feature Routes - SIMPLE
        Route::patch('events/{id}/approve', [ApprovalController::class, 'approve']);
        Route::patch('events/{id}/request-public', [ApprovalController::class, 'requestPublicApproval']);
        Route::patch('events/{id}/publish', [ApprovalController::class, 'publish']);
        Route::patch('events/{id}/request-changes', [ApprovalController::class, 'requestChanges']);
        Route::patch('events/{id}/reject', [ApprovalController::class, 'reject']);

        // Approval statistics route
        Route::get('events/approval/statistics', [ApprovalController::class, 'statistics']);

        // Event CRUD routes using Feature Controller - SIMPLE
        Route::get('events', [FeatureEventController::class, 'index']);
        Route::post('events', [FeatureEventController::class, 'store']);
        Route::get('events/{id}', [FeatureEventController::class, 'show']);
        Route::put('events/{id}', [FeatureEventController::class, 'update']);
        Route::patch('events/{id}', [FeatureEventController::class, 'update']);
        Route::delete('events/{id}', [FeatureEventController::class, 'destroy']);

        // Categories - specific routes first, then resource routes
        Route::get('categories/active', [CategoryController::class, 'active']);
        Route::apiResource('categories', CategoryController::class);

        // Locations - specific routes first, then resource routes
        Route::get('locations/active', [LocationController::class, 'active']);
        Route::apiResource('locations', LocationController::class);

        // Dashboard (Entity Admin/Staff only)
        Route::prefix('dashboard')->group(function () {
            Route::get('events/summary', [DashboardController::class, 'eventsSummary']);
            Route::get('events', [DashboardController::class, 'events']);
        });

        // Event Detail (for dashboard modal)
        Route::get('events/{id}/detail', [DashboardController::class, 'eventDetail']);

        // Admin
        Route::prefix('admin')->group(function () {
            Route::apiResource('appearance', AppearanceController::class);
        });

        // Organizer routes - Eventos con scoping por organization_id
        Route::prefix('organizer')->group(function () {
            Route::get('events', [OrganizerController::class, 'index']);
            Route::post('events', [OrganizerController::class, 'store']);
            Route::get('events/{id}', [OrganizerController::class, 'show']);
            Route::put('events/{id}', [OrganizerController::class, 'update']);
            Route::delete('events/{id}', [OrganizerController::class, 'destroy']);
        });
    });

    // Public routes (no authentication required)
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
    });

    // Legacy public routes (keep for backward compatibility)
    Route::get('events/public', [PublicEventController::class, 'index']);
    Route::get('categories/public', [CategoryController::class, 'publicIndex']);
});
