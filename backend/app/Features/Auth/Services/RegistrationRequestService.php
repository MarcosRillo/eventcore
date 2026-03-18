<?php

namespace App\Features\Auth\Services;

use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegistrationRequestService
{
    /**
     * Submit a new registration request.
     */
    public function submitRequest(array $data): RegistrationRequest
    {
        return DB::transaction(function () use ($data) {
            // Handle file uploads
            $profilePhotoPath = null;
            $logoPath = null;

            if (isset($data['profile_photo'])) {
                $profilePhotoPath = $data['profile_photo']->store('registration-requests/photos', 'public');
            }

            if (isset($data['organization_logo'])) {
                $logoPath = $data['organization_logo']->store('registration-requests/logos', 'public');
            }

            return RegistrationRequest::create([
                'dni' => $data['dni'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'whatsapp' => $data['whatsapp'],
                'profile_photo' => $profilePhotoPath,
                'organization_name' => $data['organization_name'],
                'organization_cuit' => $data['organization_cuit'],
                'organization_sector' => $data['organization_sector'],
                'organization_logo' => $logoPath,
                'website' => $data['website'] ?? null,
                'motivation' => $data['motivation'],
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Approve a registration request and create user + organization.
     */
    public function approveRequest(int $id, User $reviewer): array
    {
        $request = RegistrationRequest::findOrFail($id);

        if (! $request->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud ya fue procesada.'],
            ]);
        }

        return DB::transaction(function () use ($request, $reviewer) {
            // Get organizer_admin role
            $organizerRole = UserRole::where('role_code', 'organizer_admin')->firstOrFail();

            // Get default organization status and type
            $statusId = DB::table('organization_statuses')->where('status_code', 'active')->value('id') ?? 1;
            $typeId = DB::table('organization_types')->where('type_code', 'event_organizer')->value('id') ?? 2;

            // Determine parent_id for the new organization
            // For entity_admin: use their organization as parent
            // For platform_admin without organization: use first primary entity as fallback
            $parentId = $reviewer->organization_id;
            if (! $parentId) {
                $parentId = Organization::whereNull('parent_id')
                    ->whereHas('type', fn ($q) => $q->where('type_code', 'primary_entity'))
                    ->first()?->id;
            }

            // Create organization
            $organization = Organization::create([
                'name' => $request->organization_name,
                'cuit' => $request->organization_cuit,
                'description' => "Organización de {$request->full_name}",
                'status_id' => $statusId,
                'type_id' => $typeId,
                'logo_url' => $request->organization_logo,
                'website' => $request->website,
                'parent_id' => $parentId,
            ]);

            // Create user with placeholder password (will be set via reset link)
            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(64)),
                'role_id' => $organizerRole->id,
            ]);

            // Generate password reset token
            $resetToken = Str::random(64);
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($resetToken),
                'created_at' => now(),
            ]);

            // Associate user with organization
            $user->organizations()->attach($organization->id);

            // Update request status with references to created entities
            $request->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'user_id' => $user->id,
                'organization_id' => $organization->id,
            ]);

            Log::info('Registration request approved', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'organization_id' => $organization->id,
                'reviewer_id' => $reviewer->id,
                'email' => $request->email,
            ]);

            // Log password setup URL for development testing
            if (config('app.debug')) {
                $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
                Log::info('Registration approved - Password setup URL (copy for testing):', [
                    'url' => "{$frontendUrl}/reset-password?token={$resetToken}&email=".urlencode($user->email),
                ]);
            }

            return [
                'user' => $user->load('role'),
                'organization' => $organization,
                'reset_token' => $resetToken,
                'request' => $request,
            ];
        });
    }

    /**
     * Reject a registration request.
     */
    public function rejectRequest(int $id, User $reviewer, string $reason): RegistrationRequest
    {
        $request = RegistrationRequest::findOrFail($id);

        if (! $request->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud ya fue procesada.'],
            ]);
        }

        return DB::transaction(function () use ($request, $reviewer, $reason) {
            $request->update([
                'status' => 'rejected',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            Log::info('Registration request rejected', [
                'request_id' => $request->id,
                'reviewer_id' => $reviewer->id,
                'email' => $request->email,
            ]);

            return $request->load('reviewer');
        });
    }

    /**
     * Get pending registration requests.
     */
    public function getPendingRequests(): Collection
    {
        return RegistrationRequest::pending()
            ->with(['reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all registration requests with optional status filter.
     * Uses withTrashed to include soft-deleted users and organizations.
     */
    public function getRequests(?string $status = null): Collection
    {
        $query = RegistrationRequest::with([
            'reviewer',
            'user' => fn ($q) => $q->withTrashed(),
            'organization' => fn ($q) => $q->withTrashed()->with('status'),
        ])
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Get a single registration request by ID.
     * Uses withTrashed to include soft-deleted users and organizations.
     */
    public function getRequest(int $id): RegistrationRequest
    {
        return RegistrationRequest::with([
            'reviewer',
            'user' => fn ($q) => $q->withTrashed(),
            'organization' => fn ($q) => $q->withTrashed()->with('status'),
        ])->findOrFail($id);
    }

    /**
     * Suspend an approved registration request's user and organization.
     */
    public function suspendApprovedRequest(int $id, User $admin): RegistrationRequest
    {
        $request = RegistrationRequest::with(['user', 'organization.status'])->findOrFail($id);

        if (! $request->isApproved()) {
            throw ValidationException::withMessages([
                'request' => ['Solo se pueden suspender solicitudes aprobadas.'],
            ]);
        }

        if (! $request->user || ! $request->organization) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud no tiene usuario u organización asociados.'],
            ]);
        }

        if ($request->user->isSuspended()) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud ya está suspendida.'],
            ]);
        }

        return DB::transaction(function () use ($request, $admin) {
            $suspendedStatusId = DB::table('organization_statuses')
                ->where('status_code', 'suspended')
                ->value('id');

            $request->user->update(['status' => 'suspended']);
            $request->organization->update(['status_id' => $suspendedStatusId]);

            Log::info('Registration request suspended', [
                'request_id' => $request->id,
                'user_id' => $request->user_id,
                'organization_id' => $request->organization_id,
                'admin_id' => $admin->id,
            ]);

            return $request->load(['user', 'organization.status', 'reviewer']);
        });
    }

    /**
     * Unsuspend (reactivate) an approved registration request's user and organization.
     */
    public function unsuspendApprovedRequest(int $id, User $admin): RegistrationRequest
    {
        $request = RegistrationRequest::with(['user', 'organization.status'])->findOrFail($id);

        if (! $request->isApproved()) {
            throw ValidationException::withMessages([
                'request' => ['Solo se pueden reactivar solicitudes aprobadas.'],
            ]);
        }

        if (! $request->user || ! $request->organization) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud no tiene usuario u organización asociados.'],
            ]);
        }

        if ($request->user->isActive()) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud ya está activa.'],
            ]);
        }

        return DB::transaction(function () use ($request, $admin) {
            $activeStatusId = DB::table('organization_statuses')
                ->where('status_code', 'active')
                ->value('id');

            $request->user->update(['status' => 'active']);
            $request->organization->update(['status_id' => $activeStatusId]);

            Log::info('Registration request unsuspended', [
                'request_id' => $request->id,
                'user_id' => $request->user_id,
                'organization_id' => $request->organization_id,
                'admin_id' => $admin->id,
            ]);

            return $request->load(['user', 'organization.status', 'reviewer']);
        });
    }

    /**
     * Delete an approved registration request's user and organization.
     * Only allowed if the request is currently suspended.
     */
    public function deleteApprovedRequest(int $id, User $admin): void
    {
        $request = RegistrationRequest::with(['user', 'organization.status'])->findOrFail($id);

        if (! $request->isApproved()) {
            throw ValidationException::withMessages([
                'request' => ['Solo se pueden eliminar solicitudes aprobadas.'],
            ]);
        }

        if (! $request->user || ! $request->organization) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud no tiene usuario u organización asociados.'],
            ]);
        }

        if (! $request->user->isSuspended()) {
            throw ValidationException::withMessages([
                'request' => ['Solo se pueden eliminar solicitudes suspendidas. Primero debe suspender la solicitud.'],
            ]);
        }

        DB::transaction(function () use ($request, $admin) {
            $userId = $request->user_id;
            $organizationId = $request->organization_id;
            $userEmail = $request->user->email;
            $organizationName = $request->organization->name;

            // Soft delete organization (setea deleted_at)
            $request->organization->delete();

            // Soft delete user (setea deleted_at)
            $request->user->delete();

            // MANTENER referencias user_id y organization_id para trazabilidad
            // Esto permite restaurar y ver histórico

            Log::info('Registration request user and organization soft deleted', [
                'request_id' => $request->id,
                'deleted_user_id' => $userId,
                'deleted_user_email' => $userEmail,
                'deleted_organization_id' => $organizationId,
                'deleted_organization_name' => $organizationName,
                'admin_id' => $admin->id,
            ]);
        });
    }
}
