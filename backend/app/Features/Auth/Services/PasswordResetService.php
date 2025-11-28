<?php

namespace App\Features\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Features\Auth\Notifications\PasswordResetNotification;

class PasswordResetService
{
    /**
     * Token expiration in minutes.
     */
    private const TOKEN_EXPIRATION_MINUTES = 60;

    /**
     * Send password reset link to user's email.
     */
    public function sendResetLink(string $email): bool
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            // Return true even if user doesn't exist (security best practice)
            // This prevents email enumeration attacks
            return true;
        }

        return DB::transaction(function () use ($user, $email) {
            // Delete any existing tokens for this email
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            // Generate new token
            $token = Str::random(64);

            // Store hashed token
            DB::table('password_reset_tokens')->insert([
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send notification with plain token
            $user->notify(new PasswordResetNotification($token));

            return true;
        });
    }

    /**
     * Reset password using token.
     */
    public function resetPassword(string $email, string $token, string $newPassword): User
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'email' => ['No existe una solicitud de restablecimiento para este email.'],
            ]);
        }

        // Check if token has expired
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(self::TOKEN_EXPIRATION_MINUTES)->isPast()) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            throw ValidationException::withMessages([
                'token' => ['El enlace de restablecimiento ha expirado. Solicite uno nuevo.'],
            ]);
        }

        // Verify token
        if (!Hash::check($token, $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['El token de restablecimiento no es válido.'],
            ]);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No se encontró un usuario con este email.'],
            ]);
        }

        return DB::transaction(function () use ($user, $newPassword, $email) {
            // Update password
            $user->update([
                'password' => Hash::make($newPassword),
            ]);

            // Delete used token
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            // Revoke all existing tokens (logout from all devices)
            $user->tokens()->delete();

            Log::info('Password reset completed', [
                'user_id' => $user->id,
                'email' => $email,
                'tokens_revoked' => true,
            ]);

            return $user;
        });
    }

    /**
     * Validate if a reset token is valid (for frontend validation before showing form).
     */
    public function validateToken(string $email, string $token): bool
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            return false;
        }

        // Check expiration
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(self::TOKEN_EXPIRATION_MINUTES)->isPast()) {
            return false;
        }

        // Verify token
        return Hash::check($token, $record->token);
    }
}
