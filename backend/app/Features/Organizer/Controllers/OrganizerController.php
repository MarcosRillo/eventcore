<?php

namespace App\Features\Organizer\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class OrganizerController extends Controller
{
    /**
     * Get paginated list of organization's events with filters
     *
     * @queryParam status string Filter by status code (optional)
     * @queryParam search string Search by title (optional)
     * @queryParam per_page int Items per page (default: 10)
     * @queryParam page int Page number (default: 1)
     */
    public function events(Request $request)
    {
        $user = $request->user();

        if (!$user->organization_id) {
            Log::warning('User without organization tried to access events', [
                'user_id' => $user->id
            ]);
            return response()->json([
                'error' => 'User not associated with organization'
            ], 403);
        }

        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $statusFilter = $request->input('status');

        $query = Event::withoutGlobalScopes()
            ->with(['status', 'category', 'locations'])
            ->where('organization_id', $user->organization_id);

        // Apply search filter
        if ($search) {
            $query->where('title', 'ILIKE', "%{$search}%");
        }

        // Apply status filter
        if ($statusFilter) {
            $query->whereHas('status', function ($q) use ($statusFilter) {
                $q->where('status_code', $statusFilter);
            });
        }

        // Order by most recent first
        $query->orderBy('created_at', 'desc');

        $events = $query->paginate($perPage);

        Log::info('Organizer events list retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'total' => $events->total(),
            'per_page' => $perPage,
            'search' => $search,
            'status_filter' => $statusFilter
        ]);

        return response()->json($events);
    }

    /**
     * Lista eventos SOLO de la organización del usuario
     *
     * GET /api/v1/organizer/events (alias for events())
     */
    public function index(Request $request)
    {
        return $this->events($request);
    }

    /**
     * Ver detalle de evento (solo si es de su organización)
     *
     * GET /api/v1/organizer/events/{id}
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@show: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership por organization_id
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with(['category', 'locations', 'status', 'type', 'creator'])
            ->firstOrFail();

        Log::info('OrganizerController@show: Event retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'event_id' => $id
        ]);

        return response()->json($event);
    }

    /**
     * Crear evento (siempre con organization_id del usuario)
     *
     * POST /api/v1/organizer/events
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@store: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        $validated = $request->validate([
            // Campos básicos requeridos
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',

            // Información Básica (nuevos campos)
            'edition_number' => 'nullable|string|max:100',
            'event_type' => 'nullable|string|max:100',
            'event_subtype' => 'nullable|string|max:100',
            'origin' => 'nullable|string|max:100',
            'theme' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:100',
            'rotation_type' => 'nullable|string|max:100',

            // Servicios y Catering
            'coffee_break' => 'nullable|boolean',
            'lunch_catering' => 'nullable|boolean',
            'dinner_catering' => 'nullable|boolean',
            'pre_event_package' => 'nullable|boolean',
            'post_event_package' => 'nullable|boolean',

            // Ubicación
            'venue' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'rooms_used' => 'nullable|string|max:255',
            'maps_url' => 'nullable|string',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Fechas Asincrónicas
            'asynchronous_dates' => 'nullable|array',
            'asynchronous_dates.*.date' => 'required_with:asynchronous_dates|date',
            'asynchronous_dates.*.start_time' => 'required_with:asynchronous_dates|date_format:H:i',
            'asynchronous_dates.*.end_time' => 'required_with:asynchronous_dates|date_format:H:i',

            // Asistencia
            'local_attendance' => 'nullable|integer|min:0',
            'national_attendance' => 'nullable|integer|min:0',
            'international_attendance' => 'nullable|integer|min:0',
            'virtual_transmission' => 'nullable|boolean',

            // Información Adicional
            'producer' => 'nullable|string|max:255',
            'event_website' => 'nullable|url|max:500',

            // Imágenes
            'logo_url' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',

            // Campos legacy (mantener compatibilidad)
            'type_id' => 'nullable|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'cta_link' => 'nullable|url',
            'cta_text' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            // Get draft status
            $draftStatus = \App\Models\EventStatus::where('status_code', 'draft')->first();

            if (!$draftStatus) {
                throw new \Exception('Draft status not found in database');
            }

            // CRÍTICO: Forzar organization_id del usuario - NO confiar en input
            $eventData = [
                // Campos obligatorios del sistema
                'organization_id' => $user->organization_id,
                'entity_id' => $user->organization_id, // Same as organization for organizers
                'status_id' => $draftStatus->id,
                'created_by' => $user->id,

                // Campos básicos requeridos
                'title' => $validated['title'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? $validated['start_date'],
                'category_id' => $validated['category_id'],

                // Información Básica (nuevos campos)
                'edition_number' => $validated['edition_number'] ?? null,
                'event_type' => $validated['event_type'] ?? null,
                'event_subtype' => $validated['event_subtype'] ?? null,
                'origin' => $validated['origin'] ?? null,
                'theme' => $validated['theme'] ?? null,
                'frequency' => $validated['frequency'] ?? null,
                'rotation_type' => $validated['rotation_type'] ?? null,

                // Servicios y Catering
                'coffee_break' => $validated['coffee_break'] ?? false,
                'lunch_catering' => $validated['lunch_catering'] ?? false,
                'dinner_catering' => $validated['dinner_catering'] ?? false,
                'pre_event_package' => $validated['pre_event_package'] ?? false,
                'post_event_package' => $validated['post_event_package'] ?? false,

                // Ubicación
                'venue' => $validated['venue'] ?? null,
                'city' => $validated['city'] ?? null,
                'rooms_used' => $validated['rooms_used'] ?? null,
                'maps_url' => $validated['maps_url'] ?? null,
                'previous_venue' => $validated['previous_venue'] ?? null,
                'next_venue' => $validated['next_venue'] ?? null,

                // Fechas Asincrónicas (array - Model cast handles JSON encoding)
                'asynchronous_dates' => $validated['asynchronous_dates'] ?? null,

                // Asistencia
                'local_attendance' => $validated['local_attendance'] ?? null,
                'national_attendance' => $validated['national_attendance'] ?? null,
                'international_attendance' => $validated['international_attendance'] ?? null,
                'virtual_transmission' => $validated['virtual_transmission'] ?? false,

                // Información Adicional
                'producer' => $validated['producer'] ?? null,
                'event_website' => $validated['event_website'] ?? null,

                // Imágenes
                'logo_url' => $validated['logo_url'] ?? null,
                'featured_image' => $validated['featured_image'] ?? null,
                'responsive_image_url' => $validated['responsive_image_url'] ?? null,

                // Campos legacy (mantener compatibilidad)
                'type_id' => $validated['type_id'] ?? null,
                'max_attendees' => $validated['max_attendees'] ?? null,
                'virtual_link' => $validated['virtual_link'] ?? null,
                'cta_link' => $validated['cta_link'] ?? null,
                'cta_text' => $validated['cta_text'] ?? null,
            ];

            Log::info('OrganizerController@store: Creating event', [
                'user_id' => $user->id,
                'organization_id' => $eventData['organization_id'],
                'title' => $eventData['title']
            ]);

            // Crear evento
            $event = Event::create($eventData);

            // Sync locations
            if (isset($validated['location_ids'])) {
                $event->locations()->sync($validated['location_ids']);
                // Refresh model to ensure pivot data is in sync
                $event = $event->fresh(['category', 'locations', 'status', 'type']);
            }

            DB::commit();

            // Reload con relationships if not already loaded
            if (!$event->relationLoaded('locations')) {
                $event->load(['category', 'locations', 'status', 'type']);
            }

            Log::info('OrganizerController@store: Event created successfully', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id
            ]);

            return response()->json([
                'message' => 'Event created successfully',
                'event' => $event
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@store: Failed to create event', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error creating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar evento (solo si es de su organización y estado permite)
     *
     * PUT /api/v1/organizer/events/{id}
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@update: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership por organization_id
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();

        // Validar estado editable
        $editableStatuses = ['draft', 'requires_changes'];
        if (!in_array($event->status->status_code, $editableStatuses)) {
            Log::warning('OrganizerController@update: Attempted to edit non-editable event', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id,
                'current_status' => $event->status->status_code
            ]);

            return response()->json([
                'error' => 'Cannot edit event in current status',
                'current_status' => $event->status->status_code,
                'editable_statuses' => $editableStatuses
            ], 403);
        }

        $validated = $request->validate([
            // Campos básicos requeridos
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',

            // Información Básica (nuevos campos)
            'edition_number' => 'nullable|string|max:100',
            'event_type' => 'nullable|string|max:100',
            'event_subtype' => 'nullable|string|max:100',
            'origin' => 'nullable|string|max:100',
            'theme' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:100',
            'rotation_type' => 'nullable|string|max:100',

            // Servicios y Catering
            'coffee_break' => 'nullable|boolean',
            'lunch_catering' => 'nullable|boolean',
            'dinner_catering' => 'nullable|boolean',
            'pre_event_package' => 'nullable|boolean',
            'post_event_package' => 'nullable|boolean',

            // Ubicación
            'venue' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'rooms_used' => 'nullable|string|max:255',
            'maps_url' => 'nullable|string',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Fechas Asincrónicas
            'asynchronous_dates' => 'nullable|array',
            'asynchronous_dates.*.date' => 'required_with:asynchronous_dates|date',
            'asynchronous_dates.*.start_time' => 'required_with:asynchronous_dates|date_format:H:i',
            'asynchronous_dates.*.end_time' => 'required_with:asynchronous_dates|date_format:H:i',

            // Asistencia
            'local_attendance' => 'nullable|integer|min:0',
            'national_attendance' => 'nullable|integer|min:0',
            'international_attendance' => 'nullable|integer|min:0',
            'virtual_transmission' => 'nullable|boolean',

            // Información Adicional
            'producer' => 'nullable|string|max:255',
            'event_website' => 'nullable|url|max:500',

            // Imágenes
            'logo_url' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',

            // Campos legacy (mantener compatibilidad)
            'type_id' => 'nullable|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'cta_link' => 'nullable|url',
            'cta_text' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            Log::info('OrganizerController@update: Updating event', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id
            ]);

            $updateData = [
                // Campos básicos
                'title' => $validated['title'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? $validated['start_date'],
                'category_id' => $validated['category_id'],

                // Información Básica (nuevos campos)
                'edition_number' => $validated['edition_number'] ?? null,
                'event_type' => $validated['event_type'] ?? null,
                'event_subtype' => $validated['event_subtype'] ?? null,
                'origin' => $validated['origin'] ?? null,
                'theme' => $validated['theme'] ?? null,
                'frequency' => $validated['frequency'] ?? null,
                'rotation_type' => $validated['rotation_type'] ?? null,

                // Servicios y Catering
                'coffee_break' => $validated['coffee_break'] ?? false,
                'lunch_catering' => $validated['lunch_catering'] ?? false,
                'dinner_catering' => $validated['dinner_catering'] ?? false,
                'pre_event_package' => $validated['pre_event_package'] ?? false,
                'post_event_package' => $validated['post_event_package'] ?? false,

                // Ubicación
                'venue' => $validated['venue'] ?? null,
                'city' => $validated['city'] ?? null,
                'rooms_used' => $validated['rooms_used'] ?? null,
                'maps_url' => $validated['maps_url'] ?? null,
                'previous_venue' => $validated['previous_venue'] ?? null,
                'next_venue' => $validated['next_venue'] ?? null,

                // Fechas Asincrónicas (array - Model cast handles JSON encoding)
                'asynchronous_dates' => $validated['asynchronous_dates'] ?? null,

                // Asistencia
                'local_attendance' => $validated['local_attendance'] ?? null,
                'national_attendance' => $validated['national_attendance'] ?? null,
                'international_attendance' => $validated['international_attendance'] ?? null,
                'virtual_transmission' => $validated['virtual_transmission'] ?? false,

                // Información Adicional
                'producer' => $validated['producer'] ?? null,
                'event_website' => $validated['event_website'] ?? null,

                // Imágenes
                'logo_url' => $validated['logo_url'] ?? null,
                'featured_image' => $validated['featured_image'] ?? null,
                'responsive_image_url' => $validated['responsive_image_url'] ?? null,

                // Campos legacy
                'type_id' => $validated['type_id'] ?? $event->type_id,
                'max_attendees' => $validated['max_attendees'] ?? null,
                'virtual_link' => $validated['virtual_link'] ?? null,
                'cta_link' => $validated['cta_link'] ?? null,
                'cta_text' => $validated['cta_text'] ?? null,
            ];

            $event->update($updateData);

            if (isset($validated['location_ids'])) {
                $event->locations()->sync($validated['location_ids']);
                // Refresh model to ensure pivot data is in sync
                $event = $event->fresh(['category', 'locations', 'status', 'type']);
            }

            DB::commit();

            // Reload con relationships if not already loaded
            if (!$event->relationLoaded('locations')) {
                $event->load(['category', 'locations', 'status', 'type']);
            }

            Log::info('OrganizerController@update: Event updated successfully', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id
            ]);

            return response()->json([
                'message' => 'Event updated successfully',
                'event' => $event->fresh()->load(['category', 'locations', 'status', 'type'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@update: Failed to update event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Eliminar evento (solo si es de su organización y está en draft)
     *
     * DELETE /api/v1/organizer/events/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@destroy: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership por organization_id
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();

        // Solo permitir eliminar en draft
        if ($event->status->status_code !== 'draft') {
            Log::warning('OrganizerController@destroy: Attempted to delete non-draft event', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id,
                'current_status' => $event->status->status_code
            ]);

            return response()->json([
                'error' => 'Can only delete draft events',
                'current_status' => $event->status->status_code
            ], 403);
        }

        DB::beginTransaction();
        try {
            Log::info('OrganizerController@destroy: Deleting event', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id
            ]);

            $event->delete();

            DB::commit();

            Log::info('OrganizerController@destroy: Event deleted successfully', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $id
            ]);

            return response()->json([
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@destroy: Failed to delete event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene estadísticas del dashboard del organizador
     *
     * GET /api/v1/organizer/dashboard/stats
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@dashboardStats: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Filtrar EXPLÍCITAMENTE por organization_id
        $stats = [
            'total_events' => Event::where('organization_id', $user->organization_id)->count(),
            'draft' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'draft'))
                ->count(),
            'pending_approval' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'pending_internal_approval'))
                ->count(),
            'approved_internal' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'approved_internal'))
                ->count(),
            'published' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'published'))
                ->count(),
            'requires_changes' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'requires_changes'))
                ->count(),
            'rejected' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'rejected'))
                ->count(),
            'archived' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'cancelled'))
                ->count(),
        ];

        Log::info('OrganizerController@dashboardStats: Stats retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'stats' => $stats
        ]);

        return response()->json($stats);
    }
}
