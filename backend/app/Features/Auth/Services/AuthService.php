<?php

namespace App\Features\Auth\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    /**
     * Authenticate a user with email and password.
     */
    public function login(array $credentials): array
    {
        if (! Auth::attempt($credentials)) {
            throw new AuthenticationException('Invalid credentials provided.');
        }

        /** @var User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(User $user): void
    {
        // Revoke all tokens for the user
        $user->tokens()->delete();
    }

    /**
     * Logout from current device only.
     */
    public function logoutCurrentDevice(User $user, string $tokenId): void
    {
        // Revoke only the current token
        $user->tokens()->where('id', $tokenId)->delete();
    }
}
