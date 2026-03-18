<?php

namespace App\Features\Auth\Services;

use App\Features\Auth\Notifications\InvitationNotification;
use App\Models\Invitation;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class InvitationService
{
    /**
     * Role hierarchy: who can invite whom.
     */
    private const INVITATION_PERMISSIONS = [
        'platform_admin' => ['entity_admin'],
        'entity_admin' => ['entity_staff', 'organizer_admin'],
    ];

    /**
     * Selector length for token lookup (not hashed).
     */
    private const SELECTOR_LENGTH = 32;

    /**
     * Validator length for token verification (hashed).
     */
    private const VALIDATOR_LENGTH = 32;

    /**
     * Send an invitation to create an account.
     *
     * Security: Token is split into selector (for DB lookup) and validator (hashed).
     * This prevents token theft if the database is compromised.
     */
    public function sendInvitation(array $data, User $invitedBy): Invitation
    {
        $this->validateInvitationPermission($invitedBy, $data['role_id']);

        return DB::transaction(function () use ($data, $invitedBy) {
            // Cancel any existing pending invitations for this email
            Invitation::where('email', $data['email'])
                ->whereNull('accepted_at')
                ->delete();

            // Generate secure token parts
            $selector = $this->generateSelector();
            $validator = $this->generateValidator();

            $invitation = Invitation::create([
                'email' => $data['email'],
                'selector' => $selector,
                'token' => Hash::make($validator), // Store hashed validator
                'role_id' => $data['role_id'],
                'invited_by' => $invitedBy->id,
                'expires_at' => now()->addHours(24),
            ]);

            // Store plain token temporarily for email (selector + validator)
            $invitation->plain_token = $selector.$validator;

            $invitation->load(['role', 'inviter']);

            Log::info('Invitation sent', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role->role_code,
                'invited_by' => $invitedBy->id,
            ]);

            return $invitation;
        });
    }

    /**
     * Accept an invitation and create the user account.
     */
    public function acceptInvitation(string $token, array $userData): User
    {
        $invitation = $this->validateToken($token);

        if (! $invitation) {
            throw ValidationException::withMessages([
                'token' => ['Token de invitación inválido o expirado.'],
            ]);
        }

        return DB::transaction(function () use ($invitation, $userData) {
            // Create the user
            $user = User::create([
                'name' => $userData['name'],
                'email' => $invitation->email,
                'password' => Hash::make($userData['password']),
                'role_id' => $invitation->role_id,
            ]);

            // If the inviter belongs to an organization, associate the new user
            $inviter = $invitation->inviter;
            if ($inviter && $inviter->organization_id) {
                $user->organizations()->attach($inviter->organization_id);
            }

            // Mark invitation as accepted
            $invitation->update(['accepted_at' => now()]);

            $user->load('role');

            Log::info('Invitation accepted, user created', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role->role_code,
                'invitation_id' => $invitation->id,
            ]);

            return $user;
        });
    }

    /**
     * Validate an invitation token.
     *
     * Security: Token format is selector (32 chars) + validator (32 chars).
     * Selector is used for DB lookup, validator is verified against stored hash.
     */
    public function validateToken(string $token): ?Invitation
    {
        // Token must be exactly selector + validator length
        $expectedLength = self::SELECTOR_LENGTH + self::VALIDATOR_LENGTH;
        if (strlen($token) !== $expectedLength) {
            return null;
        }

        // Extract selector and validator from token
        $selector = substr($token, 0, self::SELECTOR_LENGTH);
        $validator = substr($token, self::SELECTOR_LENGTH);

        // Find invitation by selector (fast indexed lookup)
        $invitation = Invitation::where('selector', $selector)->first();

        if (! $invitation || ! $invitation->isValid()) {
            return null;
        }

        // Verify validator against stored hash (timing-safe comparison)
        if (! Hash::check($validator, $invitation->token)) {
            return null;
        }

        return $invitation->load(['role', 'inviter']);
    }

    /**
     * Cancel a pending invitation.
     */
    public function cancelInvitation(int $invitationId, User $cancelledBy): bool
    {
        $invitation = Invitation::findOrFail($invitationId);

        // Only the inviter or a platform admin can cancel
        if ($invitation->invited_by !== $cancelledBy->id && ! $cancelledBy->isPlatformAdmin()) {
            throw ValidationException::withMessages([
                'invitation' => ['You do not have permission to cancel this invitation.'],
            ]);
        }

        if ($invitation->isAccepted()) {
            throw ValidationException::withMessages([
                'invitation' => ['Cannot cancel an already accepted invitation.'],
            ]);
        }

        return $invitation->delete();
    }

    /**
     * Resend an invitation with a new token.
     *
     * This generates a completely new token, invalidating the previous one,
     * and extends the expiration by 24 hours.
     */
    public function resendInvitation(int $invitationId, User $requestedBy): Invitation
    {
        $invitation = Invitation::findOrFail($invitationId);

        // Only the inviter or a platform admin can resend
        if ($invitation->invited_by !== $requestedBy->id && ! $requestedBy->isPlatformAdmin()) {
            throw new AccessDeniedHttpException('You do not have permission to resend this invitation.');
        }

        if ($invitation->isAccepted()) {
            throw ValidationException::withMessages([
                'invitation' => ['Cannot resend an already accepted invitation.'],
            ]);
        }

        return DB::transaction(function () use ($invitation, $requestedBy) {
            // Generate new token (invalidates the old one)
            $selector = $this->generateSelector();
            $validator = $this->generateValidator();

            $invitation->update([
                'selector' => $selector,
                'token' => Hash::make($validator),
                'expires_at' => now()->addHours(24),
            ]);

            // Send notification with new token
            $plainToken = $selector.$validator;
            $invitation->load(['role', 'inviter']);
            $invitation->notify(new InvitationNotification($plainToken));

            Log::info('Invitation resent', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'resent_by' => $requestedBy->id,
            ]);

            return $invitation;
        });
    }

    /**
     * Get pending invitations for a user.
     */
    public function getPendingInvitations(User $user): \Illuminate\Database\Eloquent\Collection
    {
        $query = Invitation::valid()->with(['role', 'inviter']);

        // Platform admins see all, others see only their own
        if (! $user->isPlatformAdmin()) {
            $query->where('invited_by', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Clean up expired invitations.
     */
    public function cleanupExpiredInvitations(): int
    {
        return Invitation::expired()
            ->whereNull('accepted_at')
            ->delete();
    }

    /**
     * Validate that the inviter has permission to invite for the given role.
     */
    private function validateInvitationPermission(User $inviter, int $roleId): void
    {
        $inviterRole = $inviter->getRoleCode();
        $targetRole = UserRole::find($roleId)?->role_code;

        if (! $inviterRole || ! $targetRole) {
            throw ValidationException::withMessages([
                'role_id' => ['Invalid role specified.'],
            ]);
        }

        $allowedRoles = self::INVITATION_PERMISSIONS[$inviterRole] ?? [];

        if (! in_array($targetRole, $allowedRoles)) {
            throw ValidationException::withMessages([
                'role_id' => ["You do not have permission to invite users with the '{$targetRole}' role."],
            ]);
        }
    }

    /**
     * Generate a secure random selector for DB lookup.
     */
    private function generateSelector(): string
    {
        return Str::random(self::SELECTOR_LENGTH);
    }

    /**
     * Generate a secure random validator (will be hashed before storage).
     */
    private function generateValidator(): string
    {
        return Str::random(self::VALIDATOR_LENGTH);
    }
}
