<?php

namespace App\Features\Approval\Controllers;

use App\Features\Approval\Services\ApprovalService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\ApproveAndPublishEventRequest;
use App\Http\Requests\Approval\ApproveEventRequest;
use App\Http\Requests\Approval\PublishEventRequest;
use App\Http\Requests\Approval\RejectEventRequest;
use App\Http\Requests\Approval\RequestChangesRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        private ApprovalService $approvalService,
    ) {}

    /**
     * Approve event internally (entity_admin, entity_staff).
     */
    public function approve(ApproveEventRequest $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->approveInternal(
            $event,
            $request->user(),
            $request->input('comments'),
        );

        return response()->json([
            'message' => 'Evento aprobado internamente',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Approve and publish event atomically (entity_admin, entity_staff).
     */
    public function approveAndPublish(ApproveAndPublishEventRequest $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->approveAndPublish(
            $event,
            $request->user(),
            $request->input('comments'),
        );

        return response()->json([
            'message' => 'Evento aprobado y publicado exitosamente',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Request public approval (entity_admin, entity_staff).
     */
    public function requestPublicApproval(Request $request, string $id): JsonResponse
    {
        // Authorization checked in middleware
        $event = Event::findOrFail($id);

        $this->approvalService->requestPublicApproval(
            $event,
            $request->user(),
        );

        return response()->json([
            'message' => 'Aprobación pública solicitada',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Publish event (entity_admin, entity_staff).
     */
    public function publish(PublishEventRequest $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->publishEvent(
            $event,
            $request->user(),
            $request->input('scheduled_at'),
        );

        return response()->json([
            'message' => 'Evento publicado exitosamente',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Request changes on event (entity_admin, entity_staff).
     */
    public function requestChanges(RequestChangesRequest $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->requestChanges(
            $event,
            $request->input('reason'),
            $request->user(),
        );

        return response()->json([
            'message' => 'Cambios solicitados',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Reject event (entity_admin, entity_staff).
     */
    public function reject(RejectEventRequest $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $this->approvalService->reject(
            $event,
            $request->input('reason'),
            $request->user(),
        );

        return response()->json([
            'message' => 'Evento rechazado',
            'data' => new EventResource($event->fresh()->load(['status', 'approvals'])),
        ]);
    }

    /**
     * Get approval statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $showPast = $request->query('show_past') === '1';
        $statistics = $this->approvalService->getApprovalStatistics($showPast);

        return response()->json(['data' => $statistics]);
    }
}
