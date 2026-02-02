<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Notifications\RegistrationApprovedNotification;
use App\Features\Auth\Notifications\RegistrationRejectedNotification;
use App\Features\Auth\Notifications\RegistrationRequestReceivedNotification;
use App\Features\Auth\Requests\RejectRegistrationRequest;
use App\Features\Auth\Requests\SubmitRegistrationRequest;
use App\Features\Auth\Services\RegistrationRequestService;
use App\Http\Controllers\Controller;
use App\Http\Resources\RegistrationRequestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationRequestController extends Controller
{
    public function __construct(
        private RegistrationRequestService $service,
    ) {}

    /**
     * Submit a registration request (public endpoint).
     */
    public function store(SubmitRegistrationRequest $request): JsonResponse
    {
        $registrationRequest = $this->service->submitRequest($request->validated());

        $registrationRequest->notify(new RegistrationRequestReceivedNotification($registrationRequest));

        return response()->json([
            'success' => true,
            'message' => 'Solicitud enviada exitosamente. Recibirá un email de confirmación.',
            'data' => [
                'id' => $registrationRequest->id,
                'email' => $registrationRequest->email,
                'status' => $registrationRequest->status,
            ],
        ], 201);
    }

    /**
     * List registration requests (admin endpoint).
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $requests = $this->service->getRequests($status);

        return response()->json([
            'success' => true,
            'data' => RegistrationRequestResource::collection($requests),
        ]);
    }

    /**
     * Get a single registration request (admin endpoint).
     */
    public function show(int $id): JsonResponse
    {
        $req = $this->service->getRequest($id);

        return response()->json([
            'success' => true,
            'data' => (new RegistrationRequestResource($req))->additional([
                'first_name' => $req->first_name,
                'last_name' => $req->last_name,
                'profile_photo' => $req->profile_photo,
                'organization_cuit' => $req->organization_cuit,
                'organization_logo' => $req->organization_logo,
            ])->resolve(),
        ]);
    }

    /**
     * Approve a registration request (admin endpoint).
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $result = $this->service->approveRequest($id, $request->user());

        $result['request']->notify(new RegistrationApprovedNotification(
            $result['request'],
            $result['user'],
            $result['reset_token'],
        ));

        return response()->json([
            'success' => true,
            'message' => 'Solicitud aprobada. Se ha enviado un email al usuario con sus credenciales.',
            'data' => [
                'user_id' => $result['user']->id,
                'organization_id' => $result['organization']->id,
            ],
        ]);
    }

    /**
     * Reject a registration request (admin endpoint).
     */
    public function reject(RejectRegistrationRequest $request, int $id): JsonResponse
    {
        $registrationRequest = $this->service->rejectRequest(
            $id,
            $request->user(),
            $request->input('reason'),
        );

        $registrationRequest->notify(new RegistrationRejectedNotification($registrationRequest));

        return response()->json([
            'success' => true,
            'message' => 'Solicitud rechazada. Se ha notificado al solicitante.',
        ]);
    }

    /**
     * Suspend an approved registration request (admin endpoint).
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        $registrationRequest = $this->service->suspendApprovedRequest($id, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuario y organización suspendidos exitosamente.',
            'data' => new RegistrationRequestResource($registrationRequest),
        ]);
    }

    /**
     * Unsuspend (reactivate) an approved registration request (admin endpoint).
     */
    public function unsuspend(Request $request, int $id): JsonResponse
    {
        $registrationRequest = $this->service->unsuspendApprovedRequest($id, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuario y organización reactivados exitosamente.',
            'data' => new RegistrationRequestResource($registrationRequest),
        ]);
    }

    /**
     * Delete an approved registration request's user and organization (admin endpoint).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->deleteApprovedRequest($id, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuario y organización eliminados exitosamente.',
        ]);
    }
}
