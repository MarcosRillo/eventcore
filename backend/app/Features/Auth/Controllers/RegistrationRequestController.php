<?php

namespace App\Features\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Auth\Services\RegistrationRequestService;
use App\Features\Auth\Requests\SubmitRegistrationRequest;
use App\Features\Auth\Requests\RejectRegistrationRequest;
use App\Features\Auth\Notifications\RegistrationRequestReceivedNotification;
use App\Features\Auth\Notifications\RegistrationApprovedNotification;
use App\Features\Auth\Notifications\RegistrationRejectedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationRequestController extends Controller
{
    public function __construct(
        private RegistrationRequestService $service
    ) {}

    /**
     * Submit a registration request (public endpoint).
     */
    public function store(SubmitRegistrationRequest $request): JsonResponse
    {
        try {
            $registrationRequest = $this->service->submitRequest($request->validated());

            // Send confirmation notification
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar la solicitud.',
                'error' => $e->getMessage(),
            ], 500);
        }
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
            'data' => $requests->map(fn($req) => $this->formatRequestResponse($req)),
        ]);
    }

    /**
     * Get a single registration request (admin endpoint).
     */
    public function show(int $id): JsonResponse
    {
        try {
            $req = $this->service->getRequest($id);

            $data = $this->formatRequestResponse($req);
            $data['first_name'] = $req->first_name;
            $data['last_name'] = $req->last_name;
            $data['profile_photo'] = $req->profile_photo;
            $data['organization_cuit'] = $req->organization_cuit;
            $data['organization_logo'] = $req->organization_logo;

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Approve a registration request (admin endpoint).
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->service->approveRequest($id, $request->user());

            // Send approval notification with temporary password
            $result['request']->notify(new RegistrationApprovedNotification(
                $result['request'],
                $result['user'],
                $result['temporary_password']
            ));

            return response()->json([
                'success' => true,
                'message' => 'Solicitud aprobada. Se ha enviado un email al usuario con sus credenciales.',
                'data' => [
                    'user_id' => $result['user']->id,
                    'organization_id' => $result['organization']->id,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al aprobar.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Reject a registration request (admin endpoint).
     */
    public function reject(RejectRegistrationRequest $request, int $id): JsonResponse
    {
        try {
            $registrationRequest = $this->service->rejectRequest(
                $id,
                $request->user(),
                $request->input('reason')
            );

            // Send rejection notification
            $registrationRequest->notify(new RegistrationRejectedNotification($registrationRequest));

            return response()->json([
                'success' => true,
                'message' => 'Solicitud rechazada. Se ha notificado al solicitante.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al rechazar.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Suspend an approved registration request (admin endpoint).
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        try {
            $registrationRequest = $this->service->suspendApprovedRequest($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Usuario y organización suspendidos exitosamente.',
                'data' => $this->formatRequestResponse($registrationRequest),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al suspender.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Unsuspend (reactivate) an approved registration request (admin endpoint).
     */
    public function unsuspend(Request $request, int $id): JsonResponse
    {
        try {
            $registrationRequest = $this->service->unsuspendApprovedRequest($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Usuario y organización reactivados exitosamente.',
                'data' => $this->formatRequestResponse($registrationRequest),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Delete an approved registration request's user and organization (admin endpoint).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->service->deleteApprovedRequest($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Usuario y organización eliminados exitosamente.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada.',
            ], 404);
        }
    }

    /**
     * Format a registration request for API response.
     */
    private function formatRequestResponse($req): array
    {
        return [
            'id' => $req->id,
            'dni' => $req->dni,
            'full_name' => $req->full_name,
            'email' => $req->email,
            'whatsapp' => $req->whatsapp,
            'organization_name' => $req->organization_name,
            'organization_sector' => $req->organization_sector,
            'website' => $req->website,
            'motivation' => $req->motivation,
            'status' => $req->status,
            'reviewed_by' => $req->reviewer?->name,
            'reviewed_at' => $req->reviewed_at?->toIso8601String(),
            'rejection_reason' => $req->rejection_reason,
            'created_at' => $req->created_at->toIso8601String(),
            'user_id' => $req->user_id,
            'organization_id' => $req->organization_id,
            'user_status' => $req->user?->status,
            'organization_status' => $req->organization?->status?->status_code ?? null,
            'is_deleted' => $req->user?->trashed() ?? false,
        ];
    }
}
