<?php

// Feature Controllers - Dashboard
use App\Features\Approval\Controllers\ApprovalController;
// Feature Controllers - Auth
use App\Features\Auth\Controllers\AuthController;
use App\Features\Auth\Controllers\InvitationController;
use App\Features\Auth\Controllers\PasswordResetController;
use App\Features\Auth\Controllers\RegistrationRequestController;
use App\Features\Auth\Controllers\RoleController;
// Feature Controllers - Users
use App\Features\Dashboard\Controllers\DashboardController;
// Feature Controllers - PublicEvents
use App\Features\Dashboard\Controllers\OrganizerStatsController;
// Feature Controllers - InternalCalendar
use App\Features\Events\Controllers\EventController as FeatureEventController;
use App\Features\EventTypes\Controllers\EventSubtypeController;
use App\Features\EventTypes\Controllers\EventTypeController;
// Feature Controllers - Sectors
use App\Features\Sectors\Controllers\SectorController;
// Feature Controllers - SIMPLE
use App\Features\InternalCalendar\Controllers\InternalCalendarController;
use App\Features\InternalCalendar\Controllers\InternalCalendarStatsController;
use App\Features\Locations\Controllers\LocationController;
use App\Features\Organizations\Controllers\OrganizationController;
use App\Features\Organizer\Controllers\OrganizerController;
use App\Features\PublicEvents\Controllers\PublicEventController;
use App\Features\Users\Controllers\UserController;
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
    Route::post('/auth/logout', [AuthController::class, 'logout'])
        ->middleware(['auth:sanctum', 'throttle:authenticated']);
    Route::get('/auth/me', [AuthController::class, 'me'])
        ->middleware(['auth:sanctum', 'throttle:authenticated']);

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
    // 'active' middleware blocks suspended users from accessing any protected route
    Route::middleware(['auth:sanctum', 'active', 'throttle:authenticated'])->group(function () {

        // ===== PLATFORM ADMIN + ENTITY ADMIN =====
        // Full CRUD, admin features (NO entity_staff - admin-only operations)
        Route::middleware(['role:platform_admin,entity_admin'])->group(function () {
            // Users management
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{id}', [UserController::class, 'show']);
            Route::put('users/{id}', [UserController::class, 'update']);
            Route::delete('users/{id}', [UserController::class, 'destroy']);
            Route::patch('users/{id}/suspend', [UserController::class, 'suspend']);
            Route::patch('users/{id}/unsuspend', [UserController::class, 'unsuspend']);

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
            Route::post('registration-requests/{id}/suspend', [RegistrationRequestController::class, 'suspend']);
            Route::post('registration-requests/{id}/unsuspend', [RegistrationRequestController::class, 'unsuspend']);
            Route::delete('registration-requests/{id}', [RegistrationRequestController::class, 'destroy']);

            // Event statistics y features avanzadas
            Route::get('events/statistics', [FeatureEventController::class, 'statistics']);
            Route::patch('events/{id}/toggle-featured', [FeatureEventController::class, 'toggleFeatured']);
            Route::post('events/{id}/duplicate', [FeatureEventController::class, 'duplicate']);

            // Event CRUD (solo para eventos del Ente)
            Route::post('events', [FeatureEventController::class, 'store']);
            Route::put('events/{id}', [FeatureEventController::class, 'update']);
            Route::patch('events/{id}', [FeatureEventController::class, 'update']);
            Route::delete('events/{id}', [FeatureEventController::class, 'destroy']);

            // Locations CRUD
            Route::post('locations', [LocationController::class, 'store']);
            Route::put('locations/{location}', [LocationController::class, 'update']);
            Route::delete('locations/{location}', [LocationController::class, 'destroy']);
            Route::patch('locations/{location}/toggle-status', [LocationController::class, 'toggleStatus']);
            Route::get('locations/statistics', [LocationController::class, 'statistics']);

            // Event Types CRUD (write operations only - read is in shared section below)
            Route::post('event-types', [EventTypeController::class, 'store']);
            Route::get('event-types/stats', [EventTypeController::class, 'stats']);
            Route::put('event-types/{eventType}', [EventTypeController::class, 'update']);
            Route::delete('event-types/{eventType}', [EventTypeController::class, 'destroy']);
            Route::patch('event-types/{eventType}/toggle-status', [EventTypeController::class, 'toggleStatus']);

            // Event Subtypes CRUD (write operations only - read is in shared section below)
            Route::post('event-types/{eventType}/subtypes', [EventSubtypeController::class, 'store']);
            Route::get('event-types/{eventType}/subtypes/{subtype}', [EventSubtypeController::class, 'show'])
                ->where('subtype', '[0-9]+');
            Route::put('event-types/{eventType}/subtypes/{subtype}', [EventSubtypeController::class, 'update'])
                ->where('subtype', '[0-9]+');
            Route::delete('event-types/{eventType}/subtypes/{subtype}', [EventSubtypeController::class, 'destroy'])
                ->where('subtype', '[0-9]+');
            Route::patch('event-types/{eventType}/subtypes/{subtype}/toggle-status', [EventSubtypeController::class, 'toggleStatus'])
                ->where('subtype', '[0-9]+');

            // Sectors CRUD (write operations only - read is in shared section below)
            Route::post('sectors', [SectorController::class, 'store']);
            Route::put('sectors/{sector}', [SectorController::class, 'update']);
            Route::delete('sectors/{sector}', [SectorController::class, 'destroy']);
            Route::patch('sectors/{sector}/toggle-status', [SectorController::class, 'toggleStatus']);

            // Organizations management (write operations)
            Route::patch('organizations/{id}/status', [OrganizationController::class, 'toggleStatus']);
        });

        // ===== APPROVAL ROUTES (PLATFORM ADMIN + ENTITY ADMIN + ENTITY STAFF) =====
        // Event approval workflow - entity_staff can approve/reject events
        Route::middleware(['role:platform_admin,entity_admin,entity_staff'])->group(function () {
            Route::patch('events/{id}/approve', [ApprovalController::class, 'approve']);
            Route::patch('events/{id}/approve-and-publish', [ApprovalController::class, 'approveAndPublish']);
            Route::patch('events/{id}/request-public', [ApprovalController::class, 'requestPublicApproval']);
            Route::patch('events/{id}/publish', [ApprovalController::class, 'publish']);
            Route::patch('events/{id}/request-changes', [ApprovalController::class, 'requestChanges']);
            Route::patch('events/{id}/reject', [ApprovalController::class, 'reject']);
            Route::get('events/approval/statistics', [ApprovalController::class, 'statistics']);
        });

        // ===== EVENT ORGANIZER =====
        // Only /organizer/* routes for own events
        Route::middleware(['role:organizer_admin'])->group(function () {
            Route::prefix('organizer')->group(function () {
                Route::get('dashboard/stats', [OrganizerController::class, 'dashboardStats']);
                Route::get('stats', [OrganizerStatsController::class, 'index']);
                Route::get('events', [OrganizerController::class, 'index']);
                Route::post('events', [OrganizerController::class, 'store']);
                Route::get('events/{id}', [OrganizerController::class, 'show']);
                Route::put('events/{id}', [OrganizerController::class, 'update']);
                Route::delete('events/{id}', [OrganizerController::class, 'destroy']);
                Route::post('events/{id}/submit', [OrganizerController::class, 'submit']);
            });
        });

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

            // Organizations read-only
            Route::get('organizations', [OrganizationController::class, 'index']);
            Route::get('organizations/{id}', [OrganizationController::class, 'show']);
        });

        // ===== INTERNAL CALENDAR (entity_admin, entity_staff, organizer_admin) =====
        Route::middleware(['role:platform_admin,entity_admin,entity_staff,organizer_admin'])->group(function () {
            Route::prefix('internal-calendar')->group(function () {
                // Events listing - moderate limit (consulta frecuente)
                Route::get('events', [InternalCalendarController::class, 'index'])
                    ->middleware('throttle:60,1');

                // Single event detail - moderate limit
                Route::get('events/{id}', [InternalCalendarController::class, 'show'])
                    ->middleware('throttle:60,1')
                    ->where('id', '[0-9]+');

                // Event statuses - low limit (consultado ocasionalmente)
                Route::get('event-statuses', [InternalCalendarController::class, 'eventStatuses'])
                    ->middleware('throttle:30,1');

                // Stats - moderate limit (puede ser costoso computacionalmente)
                Route::get('stats', [InternalCalendarStatsController::class, 'index'])
                    ->middleware('throttle:30,1');
            });
        });

        // ===== LOCATIONS, EVENT TYPES READ ACCESS (All authenticated users need this) =====
        Route::middleware(['role:platform_admin,entity_admin,entity_staff,organizer_admin'])->group(function () {
            // Locations - solo lectura (necesario para formularios)
            Route::get('locations', [LocationController::class, 'index']);
            Route::get('locations/active', [LocationController::class, 'active']);
            Route::get('locations/{location}', [LocationController::class, 'show']);

            // Event Types - solo lectura (necesario para formularios de eventos)
            Route::get('event-types', [EventTypeController::class, 'index']);
            Route::get('event-types/active', [EventTypeController::class, 'active']);
            Route::get('event-types/{eventType}', [EventTypeController::class, 'show']);

            // Event Subtypes - read only (necesario para formularios de eventos)
            // All authenticated users (including organizers) need to read subtypes for event forms
            Route::get('event-types/{eventType}/subtypes', [EventSubtypeController::class, 'index']);

            // Active subtypes endpoint (for dropdown filters)
            // Note: This route is safe here because show route uses ->where('subtype', '[0-9]+')
            // which prevents 'active' from being matched as an ID parameter
            Route::get('event-types/{eventType}/subtypes/active', [EventSubtypeController::class, 'active']);

            // Sectors - read only (necesario para formularios de registro)
            Route::get('sectors', [SectorController::class, 'index']);
            Route::get('sectors/active', [SectorController::class, 'active']);
            Route::get('sectors/{sector}', [SectorController::class, 'show']);
        });
    });

    // ===== PUBLIC ROUTES (sin autenticación) =====
    // 60 req/min por IP (group-level), 20 req/min para queries costosos (per-route)
    Route::prefix('public')->middleware('throttle:public')->group(function () {
        // Stats — heavy query (multiple COUNTs)
        Route::get('stats', [PublicEventController::class, 'stats'])
            ->middleware('throttle:public-heavy');

        // Events
        Route::get('events', [PublicEventController::class, 'index']);
        Route::get('events/upcoming', [PublicEventController::class, 'upcoming']);
        Route::get('events/featured', [PublicEventController::class, 'featured']);
        Route::get('events/search', [PublicEventController::class, 'search'])
            ->middleware('throttle:public-heavy');
        Route::get('events/calendar/{year}/{month}', [PublicEventController::class, 'calendarMonth'])
            ->middleware('throttle:public-heavy');
        Route::get('events/date-range', [PublicEventController::class, 'dateRange'])
            ->middleware('throttle:public-heavy');
        Route::get('events/{id}', [PublicEventController::class, 'show'])
            ->where('id', '[0-9]+');

        // Locations
        Route::get('locations/active', [LocationController::class, 'active']);

        // Sectors (public - for registration forms, no tenant scope)
        Route::get('sectors/active', [SectorController::class, 'publicActive']);

        // Event Types (public - for landing and calendar filters)
        Route::get('event-types', [PublicEventController::class, 'eventTypes'])
            ->name('public.event-types.index');
        Route::get('event-types/{eventType}/subtypes', [PublicEventController::class, 'eventSubtypes'])
            ->name('public.event-types.subtypes');
    });

    // Legacy public routes (keep for backward compatibility)
    Route::get('events/public', function (\Illuminate\Http\Request $request) {
        $response = app()->call([app(PublicEventController::class), 'index'], ['request' => $request]);

        return $response
            ->header('Deprecation', 'true')
            ->header('Sunset', 'Thu, 01 Jul 2026 00:00:00 GMT');
    })->middleware('throttle:public');
});
