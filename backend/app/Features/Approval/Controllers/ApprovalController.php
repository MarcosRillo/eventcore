<?php

namespace App\Features\Approval\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Approval\Services\ApprovalService;
use App\Models\Event;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApprovalController extends Controller
{
    public function __construct(
        private ApprovalService $approvalService
    ) {}

    /**
     * Approve event internally (entity_admin).
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'comments' => 'nullable|string|max:500'
        ]);

        $event = Event::findOrFail($id);

        $this->approvalService->approveInternal(
            $event,
            $request->user(),
            $request->input('comments')
        );

        return response()->json([
            'message' => 'Evento aprobado internamente',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Request public approval (entity_staff).
     */
    public function requestPublicApproval(Request $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->requestPublicApproval(
            $event,
            $request->user()
        );

        return response()->json([
            'message' => 'Aprobación pública solicitada',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Publish event (platform_admin).
     */
    public function publish(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'publish_immediately' => 'boolean',
            'scheduled_at' => 'nullable|date|after:now'
        ]);

        $event = Event::findOrFail($id);

        $this->approvalService->publishEvent(
            $event,
            $request->user(),
            $request->input('scheduled_at')
        );

        return response()->json([
            'message' => 'Evento publicado exitosamente',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Request changes on event.
     */
    public function requestChanges(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000'
        ]);

        $event = Event::findOrFail($id);

        $this->approvalService->requestChanges(
            $event,
            $request->input('reason'),
            $request->user()
        );

        return response()->json([
            'message' => 'Cambios solicitados',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Reject event.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000'
        ]);

        $event = Event::findOrFail($id);

        $this->approvalService->reject(
            $event,
            $request->input('reason'),
            $request->user()
        );

        return response()->json([
            'message' => 'Evento rechazado',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Get approval statistics.
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->approvalService->getApprovalStatistics();

        return response()->json($statistics);
    }
}