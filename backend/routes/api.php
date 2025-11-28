<?php

// Feature Controllers - Dashboard
use App\Features\Dashboard\Controllers\DashboardController;
use App\Features\Dashboard\Controllers\OrganizerStatsController;

// Feature Controllers - Auth
use App\Features\Auth\Controllers\AuthController;
use App\Features\Auth\Controllers\InvitationController;
use App\Features\Auth\Controllers\RegistrationRequestController;
use App\Features\Auth\Controllers\PasswordResetController;
use App\Features\Auth\Controllers\RoleController;

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
    // Login: 5 attempts per minute per IP (brute force protection)
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
    // Refresh: 10 attempts per minute (higher than login since it's automated)
    Route::post('/auth/refresh', [AuthController::class, 'refresh'])
        ->middleware('throttle:10,1');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // ===== INVITATIONS (public endpoints) =====
    // Validate: 30 per minute (may be called multiple times during form load)
    Route::get('/auth/invitations/validate/{token}', [InvitationController::class, 'validateToken'])
        ->middleware('throttle:30,1');
    // Accept: 10 per minute (form submission)
    Route::post('/auth/invitations/accept', [InvitationController::class, 'accept'])
        ->middleware('throttle:10,1');

    // ===== REGISTRATION REQUESTS (public endpoint) =====
    // Register request: 3 per minute (prevent spam)
    Route::post('/auth/register-request', [RegistrationRequestController::class, 'store'])
        ->middleware('throttle:3,1');

    // ===== PASSWORD RESET (public endpoints) =====
    // Forgot password: 5 per minute (email enumeration protection)
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword'])
        ->middleware('throttle:5,1');
    // Reset password: 5 per minute (brute force protection)
    Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:5,1');
    // Validate token: 30 per minute (may be called during form load)
    Route::post('/auth/validate-reset-token', [PasswordResetController::class, 'validateToken'])
        ->middleware('throttle:30,1');

    // Protected routes con roles específicos
    Route::middleware('auth:sanctum')->group(function () {

        // ===== PLATFORM ADMIN + ENTITY ADMIN =====
        // Full CRUD, approval, admin features
        Route::middleware(['role:platform_admin,entity_admin'])->group(function () {
            // Roles management
            Route::get('roles/assignable', [RoleController::class, 'assignable']);

            // Invitations management
            Route::get('invitations', [InvitationController::class, 'index']);
            Route::post('invitations', [InvitationController::class, 'store']);
            Route::post('invitations/{id}/resend', [InvitationController::class, 'resend']);
            Route::delete('invitations/{id}', [InvitationController::class, 'destroy']);

            // Registration requests management
            Route::get('registration-requests', [RegistrationRequestController::class, 'index']);
            Route::get('registration-requests/{id}', [RegistrationRequestController::class, 'show']);
            Route::post('registration-requests/{id}/approve', [RegistrationRequestController::class, 'approve']);
            Route::post('registration-requests/{id}/reject', [RegistrationRequestController::class, 'reject']);

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
        });

        // ===== CATEGORIES & LOCATIONS READ ACCESS (All authenticated users need this) =====
        Route::middleware(['role:platform_admin,entity_admin,entity_staff,organizer'])->group(function () {
            // Categories y Locations - solo lectura (necesario para formularios)
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
