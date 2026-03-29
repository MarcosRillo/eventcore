<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Notifications\InvitationNotification;
use App\Features\Auth\Requests\AcceptInvitationRequest;
use App\Features\Auth\Requests\SendInvitationRequest;
use App\Features\Auth\Services\AuthService;
use App\Features\Auth\Services\InvitationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(
        private InvitationService $invitationService,
        private AuthService $authService,
    ) {}

    /**
     * Send an invitation.
     */
    public function store(SendInvitationRequest $request): JsonResponse
    {
        try {
            $invitation = $this->invitationService->sendInvitation(
                $request->validated(),
                $request->user(),
            );

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
            'data' => collect($invitations->items())->map(fn ($inv) => [
                'id' => $inv->id,
                'email' => $inv->email,
                'role' => $inv->role->role_name,
                'invited_by' => $inv->inviter->name,
                'expires_at' => $inv->expires_at->toIso8601String(),
                'created_at' => $inv->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $invitations->currentPage(),
                'last_page' => $invitations->lastPage(),
                'per_page' => $invitations->perPage(),
                'total' => $invitations->total(),
            ],
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
     * Validate an invitation token.
     */
    public function validateToken(string $token): JsonResponse
    {
        $invitation = $this->invitationService->validateToken($token);

        if (! $invitation) {
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
     * Accept an invitation and create account.
     */
    public function accept(AcceptInvitationRequest $request): JsonResponse
    {
        try {
            $user = $this->invitationService->acceptInvitation(
                $request->input('token'),
                $request->validated(),
            );

            $tokens = $this->authService->issueTokensForUser($user);
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
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'expires_at' => $tokens['expires_at'],
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