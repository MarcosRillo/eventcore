<?php

namespace App\Features\Organizer\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrganizerController extends Controller
{
    /**
     * Lista eventos SOLO de la organización del usuario
     *
     * GET /api/v1/organizer/events
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        Log::info('Organizer listing events', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id
        ]);

        // CRÍTICO: Filtrar por organization_id del usuario
        // TenantScope se encarga automáticamente del filtrado
        $query = Event::with(['category', 'locations', 'status']);

        // Filtros opcionales
        if ($request->has('status_code')) {
            $query->whereHas('status', function ($q) use ($request) {
                $q->where('status_code', $request->status_code);
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        $events = $query->orderBy('start_date', 'desc')
            ->paginate(15);

        return response()->json($events);
    }

    /**
     * Ver detalle de evento (solo si es de su organización)
     *
     * GET /api/v1/organizer/events/{id}
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();

        $event = Event::where('id', $id)
            ->with(['category', 'locations', 'status', 'creator'])
            ->firstOrFail();

        Log::info('Organizer viewing event', [
            'user_id' => $user->id,
            'event_id' => $event->id
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
            'type_id' => 'required|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'location_text' => 'nullable|string|max:500',
        ]);

        // CRÍTICO: Forzar organization_id del usuario
        $validated['organization_id'] = $user->organization_id;
        $validated['entity_id'] = 1; // Default entity (ajustar según tu lógica)
        $validated['status_id'] = 1; // status = 'draft'
        $validated['created_by'] = $user->id;

        Log::info('Organizer creating event', [
            'user_id' => $user->id,
            'organization_id' => $validated['organization_id'],
            'title' => $validated['title']
        ]);

        // Crear evento
        $event = Event::create($validated);

        // Sync locations
        if (isset($validated['location_ids'])) {
            $event->locations()->sync($validated['location_ids']);
        }

        // Reload con relationships
        $event->load(['category', 'locations', 'status']);

        return response()->json($event, 201);
    }

    /**
     * Actualizar evento (solo si es de su organización y estado permite)
     *
     * PUT /api/v1/organizer/events/{id}
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        // Verificar ownership (TenantScope maneja el filtrado)
        $event = Event::where('id', $id)
            ->with('status')
            ->firstOrFail();

        // Validar estado editable
        $editableStatuses = ['draft', 'requires_changes'];
        if (!in_array($event->status->status_code, $editableStatuses)) {
            Log::warning('Organizer attempted to edit non-editable event', [
                'user_id' => $user->id,
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
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'category_id' => 'sometimes|exists:categories,id',
            'location_ids' => 'sometimes|array',
            'location_ids.*' => 'exists:locations,id',
            'type_id' => 'sometimes|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'location_text' => 'nullable|string|max:500',
        ]);

        Log::info('Organizer updating event', [
            'user_id' => $user->id,
            'event_id' => $event->id
        ]);

        $event->update($validated);

        if (isset($validated['location_ids'])) {
            $event->locations()->sync($validated['location_ids']);
        }

        $event->load(['category', 'locations', 'status']);

        return response()->json($event);
    }

    /**
     * Eliminar evento (solo si es de su organización y está en draft)
     *
     * DELETE /api/v1/organizer/events/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();

        // Verificar ownership (TenantScope maneja el filtrado)
        $event = Event::where('id', $id)
            ->with('status')
            ->firstOrFail();

        // Solo permitir eliminar en draft
        if ($event->status->status_code !== 'draft') {
            Log::warning('Organizer attempted to delete non-draft event', [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'current_status' => $event->status->status_code
            ]);

            return response()->json([
                'error' => 'Can only delete draft events',
                'current_status' => $event->status->status_code
            ], 403);
        }

        Log::info('Organizer deleting event', [
            'user_id' => $user->id,
            'event_id' => $event->id
        ]);

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }
}
