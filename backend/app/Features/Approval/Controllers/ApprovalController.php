<?php

namespace App\Features\Approval\Controllers;

use App\Features\Approval\Services\ApprovalService;
use App\Http\Controllers\Controller;
use App\Features\Approval\Requests\ApproveAndPublishEventRequest;
use App\Features\Approval\Requests\ApproveEventRequest;
use App\Features\Approval\Requests\PublishEventRequest;
use App\Features\Approval\Requests\RejectEventRequest;
use App\Features\Approval\Requests\RequestChangesRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

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
        Gate::authorize('approve', $event);

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
        Gate::authorize('approve', $event);

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
        $event = Event::findOrFail($id);
        Gate::authorize('approve', $event);

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
        Gate::authorize('publish', $event);

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
        Gate::authorize('requestChanges', $event);

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
        Gate::authorize('reject', $event);

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
