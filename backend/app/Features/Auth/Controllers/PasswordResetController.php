<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Requests\ForgotPasswordRequest;
use App\Features\Auth\Requests\ResetPasswordRequest;
use App\Features\Auth\Services\PasswordResetService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService,
    ) {}

    /**
     * Send password reset link.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->sendResetLink($request->email);

        // Always return success to prevent email enumeration
        return response()->json([
            'success' => true,
            'message' => 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        ]);
    }

    /**
     * Validate reset token (for frontend pre-validation).
     */
    public function validateToken(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
        ]);

        $valid = $this->passwordResetService->validateToken(
            $request->email,
            $request->token,
        );

        return response()->json([
            'success' => true,
            'data' => [
                'valid' => $valid,
            ],
        ]);
    }

    /**
     * Reset password using token.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $user = $this->passwordResetService->resetPassword(
            $request->email,
            $request->token,
            $request->password,
        );

        return response()->json([
            'success' => true,
            'message' => 'Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña.',
            'data' => [
                'user_id' => $user->id,
            ],
        ]);
    }
}
