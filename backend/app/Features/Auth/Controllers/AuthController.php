<?php

namespace App\Features\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\RefreshTokenRequest;
use App\Http\Resources\UserResource;
use App\Features\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Authentication Controller
 *
 * Handles user authentication operations: login, logout, refresh, and profile retrieval.
 * Swagger documentation is in App\Features\Auth\Docs\AuthSwaggerDocs
 */
class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Authenticate user and generate access + refresh tokens.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($result['user']),
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_at' => $result['expires_at'],
                ],
                'message' => 'Login successful',
            ]);
        } catch (\Exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }
    }

    /**
     * Refresh access token using refresh token.
     * Implements token rotation for security.
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->refresh($request->validated()['refresh_token']);

            return response()->json([
                'success' => true,
                'data' => [
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_at' => $result['expires_at'],
                ],
                'message' => 'Token refreshed successfully',
            ]);
        } catch (\Exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired refresh token',
            ], 401);
        }
    }

    /**
     * Logout user and revoke all tokens (access + refresh).
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user()->load('role');

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'User profile retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
