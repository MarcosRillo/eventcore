<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\RefreshTokenRequest;
use App\Features\Auth\Services\AuthService;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Auth\AuthenticationException;
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
        private AuthService $authService,
    ) {}

    /**
     * Authenticate user and generate access + refresh tokens.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            // Calculate cookie expiration in minutes
            // expires_at is ISO string, convert to timestamp first
            $expiresAtTimestamp = strtotime($result['expires_at']);
            $accessTokenMinutes = (int) (($expiresAtTimestamp - time()) / 60);
            $refreshTokenMinutes = 10080; // 7 days

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($result['user']),
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_at' => $result['expires_at'],
                ],
                'message' => 'Login successful',
            ])
                ->cookie('access_token', $result['access_token'], $accessTokenMinutes, '/', null, config('session.secure'), true, false, 'strict')
                ->cookie('refresh_token', $result['refresh_token'], $refreshTokenMinutes, '/', null, config('session.secure'), true, false, 'strict');
        } catch (AuthenticationException $e) {
            // Return specific message for suspended users
            $message = str_contains($e->getMessage(), 'suspendida')
                ? $e->getMessage()
                : 'Invalid credentials';

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 401);
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
     * Accepts refresh token from cookie (preferred) or request body (backward compatibility).
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            // Accept token from cookie (httpOnly) or body (backward compatibility)
            $refreshToken = $request->cookie('refresh_token') ?? $request->input('refresh_token');

            if (! $refreshToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'The refresh token field is required.',
                    'errors' => [
                        'refresh_token' => ['The refresh token field is required.'],
                    ],
                ], 422);
            }

            $result = $this->authService->refresh($refreshToken);

            // Calculate cookie expiration in minutes
            // expires_at is ISO string, convert to timestamp first
            $expiresAtTimestamp = strtotime($result['expires_at']);
            $accessTokenMinutes = (int) (($expiresAtTimestamp - time()) / 60);
            $refreshTokenMinutes = 10080; // 7 days

            return response()->json([
                'success' => true,
                'data' => [
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_at' => $result['expires_at'],
                ],
                'message' => 'Token refreshed successfully',
            ])
                ->cookie('access_token', $result['access_token'], $accessTokenMinutes, '/', null, config('session.secure'), true, false, 'strict')
                ->cookie('refresh_token', $result['refresh_token'], $refreshTokenMinutes, '/', null, config('session.secure'), true, false, 'strict');
        } catch (\Exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired refresh token',
            ], 401);
        }
    }

    /**
     * Logout user and revoke all tokens (access + refresh).
     * Clears httpOnly cookies.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ])
                ->cookie('access_token', '', -1, '/', null, config('session.secure'), true, false, 'strict')
                ->cookie('refresh_token', '', -1, '/', null, config('session.secure'), true, false, 'strict');
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
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $user->load('role');

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
