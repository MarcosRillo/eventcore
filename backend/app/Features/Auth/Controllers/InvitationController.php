<?php

namespace App\Features\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Auth\Services\InvitationService;
use App\Features\Auth\Requests\SendInvitationRequest;
use App\Features\Auth\Requests\AcceptInvitationRequest;
use App\Features\Auth\Notifications\InvitationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(
        private InvitationService $invitationService
    ) {}

    /**
     * Send an invitation.
     */
    public function store(SendInvitationRequest $request): JsonResponse
    {
        try {
            $invitation = $this->invitationService->sendInvitation(
                $request->validated(),
                $request->user()
            );

            // Send notification email with plain token (selector + validator)
            $invitation->notify(new InvitationNotification($invitation->plain_token));

            return response()->json([
                'success' => true,
                'message' => 'Invitación enviada exitosamente.',
                'data' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role->role_name,
                    'expires_at' => $invitation->expires_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * List pending invitations.
     */
    public function index(Request $request): JsonResponse
    {
        $invitations = $this->invitationService->getPendingInvitations($request->user());

        return response()->json([
            'success' => true,
            'data' => $invitations->map(fn($inv) => [
                'id' => $inv->id,
                'email' => $inv->email,
                'role' => $inv->role->role_name,
                'invited_by' => $inv->inviter->name,
                'expires_at' => $inv->expires_at->toIso8601String(),
                'created_at' => $inv->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Cancel an invitation.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->invitationService->cancelInvitation($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Invitación cancelada.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invitación no encontrada.',
            ], 404);
        }
    }

    /**
     * Resend an invitation with a new token.
     */
    public function resend(Request $request, int $id): JsonResponse
    {
        try {
            $invitation = $this->invitationService->resendInvitation($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Invitación reenviada exitosamente.',
                'data' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role->role_name,
                    'expires_at' => $invitation->expires_at->toIso8601String(),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reenviar invitación.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invitación no encontrada.',
            ], 404);
        }
    }

    /**
     * Validate an invitation token (public endpoint).
     */
    public function validateToken(string $token): JsonResponse
    {
        $invitation = $this->invitationService->validateToken($token);

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Token de invitación inválido o expirado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'email' => $invitation->email,
                'role' => $invitation->role->role_name,
                'invited_by' => $invitation->inviter->name,
                'expires_at' => $invitation->expires_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Accept an invitation and create account (public endpoint).
     */
    public function accept(AcceptInvitationRequest $request): JsonResponse
    {
        try {
            $user = $this->invitationService->acceptInvitation(
                $request->input('token'),
                $request->validated()
            );

            // Generate auth token for the new user
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Cuenta creada exitosamente.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role->role_name,
                    ],
                    'token' => $token,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al aceptar invitación.',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
