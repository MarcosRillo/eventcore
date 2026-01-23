<?php

namespace App\Features\Auth\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Authenticate a user with email and password.
     * Returns access token, refresh token, and expiration time.
     */
    public function login(array $credentials): array
    {
        if (! Auth::attempt($credentials)) {
            throw new AuthenticationException('Invalid credentials provided.');
        }

        /** @var User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        // Check if user account is suspended
        if ($user->isSuspended()) {
            throw new AuthenticationException('Tu cuenta ha sido suspendida. Contacta al administrador.');
        }

        return DB::transaction(function () use ($user) {
            // Revoke all existing access tokens for security
            $user->tokens()->delete();

            // Create access token with expiration
            $accessTokenExpiration = config('tokens.access_token_expiration', 15);
            $expiresAt = Carbon::now()->addMinutes($accessTokenExpiration);

            $accessToken = $user->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;

            // Create refresh token with new family
            $refreshTokenPlain = $this->createRefreshToken($user);

            return [
                'user' => $user,
                'access_token' => $accessToken,
                'refresh_token' => $refreshTokenPlain,
                'expires_at' => $expiresAt->toISOString(),
            ];
        });
    }

    /**
     * Refresh tokens using a valid refresh token.
     * Implements token rotation: old refresh token is revoked, new one issued.
     */
    public function refresh(string $refreshTokenPlain): array
    {
        // Find the refresh token by checking hash (outside transaction for security checks)
        $refreshToken = $this->findValidRefreshToken($refreshTokenPlain);

        if (! $refreshToken) {
            throw new AuthenticationException('Invalid or expired refresh token');
        }

        // Check if token is being reused (already revoked)
        // This MUST happen outside the main transaction so the revocation is not rolled back
        if ($refreshToken->isRevoked()) {
            // Token reuse detected - potential attack
            // Revoke entire family for security (this persists even if we throw)
            $this->revokeTokenFamily($refreshToken->family_id);
            throw new AuthenticationException('Invalid or expired refresh token');
        }

        // Check expiration
        if ($refreshToken->isExpired()) {
            throw new AuthenticationException('Invalid or expired refresh token');
        }

        // Perform the actual token rotation in a transaction
        return DB::transaction(function () use ($refreshToken) {
            $user = $refreshToken->user;

            // Revoke the used refresh token
            $refreshToken->revoke();

            // Revoke all existing access tokens
            $user->tokens()->delete();

            // Create new access token
            $accessTokenExpiration = config('tokens.access_token_expiration', 15);
            $expiresAt = Carbon::now()->addMinutes($accessTokenExpiration);
            $accessToken = $user->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;

            // Create new refresh token in same family
            $newRefreshTokenPlain = $this->createRefreshToken($user, $refreshToken->family_id);

            return [
                'access_token' => $accessToken,
                'refresh_token' => $newRefreshTokenPlain,
                'expires_at' => $expiresAt->toISOString(),
            ];
        });
    }

    /**
     * Logout the authenticated user.
     * Revokes all access and refresh tokens.
     */
    public function logout(User $user): void
    {
        DB::transaction(function () use ($user) {
            // Revoke all access tokens
            $user->tokens()->delete();

            // Revoke all refresh tokens
            RefreshToken::where('user_id', $user->id)
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);
        });
    }

    /**
     * Logout from current device only.
     */
    public function logoutCurrentDevice(User $user, string $tokenId): void
    {
        // Revoke only the current access token
        $user->tokens()->where('id', $tokenId)->delete();
    }

    /**
     * Create a new refresh token for a user.
     *
     * @param  User  $user  The user to create token for
     * @param  string|null  $familyId  Optional family ID (null creates new family)
     * @return string The plaintext refresh token
     */
    private function createRefreshToken(User $user, ?string $familyId = null): string
    {
        $tokenPlain = Str::random(64);
        // SHA256 for fast O(1) lookups (indexed)
        $tokenHash = hash('sha256', $tokenPlain);

        $refreshTokenExpiration = config('tokens.refresh_token_expiration', 10080);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $tokenHash,       // Keep for backward compatibility
            'token_hash' => $tokenHash,  // SHA256 for fast lookups
            'family_id' => $familyId ?? Str::uuid()->toString(),
            'expires_at' => Carbon::now()->addMinutes($refreshTokenExpiration),
        ]);

        return $tokenPlain;
    }

    /**
     * Find a valid refresh token by its plaintext value.
     * Uses SHA256 hash for O(1) indexed lookup.
     */
    private function findValidRefreshToken(string $tokenPlain): ?RefreshToken
    {
        $tokenHash = hash('sha256', $tokenPlain);

        // O(1) lookup using indexed token_hash column
        $token = RefreshToken::where('token_hash', $tokenHash)
            ->where('expires_at', '>', now())
            ->first();

        // Fallback for legacy tokens without token_hash (backward compatibility)
        if (! $token) {
            $token = RefreshToken::where('token', $tokenHash)
                ->where('expires_at', '>', now())
                ->first();
        }

        return $token;
    }

    /**
     * Revoke all tokens in a family (security measure for token reuse).
     */
    private function revokeTokenFamily(string $familyId): void
    {
        RefreshToken::where('family_id', $familyId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Revoke all refresh tokens for a user (used during password reset).
     */
    public function revokeAllRefreshTokens(User $user): void
    {
        RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }
}
