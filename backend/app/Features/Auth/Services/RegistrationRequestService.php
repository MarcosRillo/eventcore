<?php

namespace App\Features\Auth\Services;

use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Collection;

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

        if (!$request->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['Esta solicitud ya fue procesada.'],
            ]);
        }

        return DB::transaction(function () use ($request, $reviewer) {
            // Get organizer_admin role
            $organizerRole = UserRole::where('role_code', 'organizer_admin')->firstOrFail();

            // Get default organization status and type
            $statusId = DB::table('organization_statuses')->where('status_code', 'active')->value('id') ?? 1;
            $typeId = DB::table('organization_types')->first()?->id ?? 1;

            // Create organization
            $organization = Organization::create([
                'name' => $request->organization_name,
                'cuit' => $request->organization_cuit,
                'description' => "Organización de {$request->full_name}",
                'status_id' => $statusId,
                'type_id' => $typeId,
                'logo_url' => $request->organization_logo,
                'website' => $request->website,
            ]);

            // Generate temporary password
            $tempPassword = $this->generateTemporaryPassword();

            // Create user
            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($tempPassword),
                'role_id' => $organizerRole->id,
            ]);

            // Associate user with organization
            $user->organizations()->attach($organization->id);

            // Update request status
            $request->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            Log::info('Registration request approved', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'organization_id' => $organization->id,
                'reviewer_id' => $reviewer->id,
                'email' => $request->email,
            ]);

            return [
                'user' => $user->load('role'),
                'organization' => $organization,
                'temporary_password' => $tempPassword,
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

        if (!$request->isPending()) {
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
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all registration requests with optional status filter.
     */
    public function getRequests(?string $status = null): Collection
    {
        $query = RegistrationRequest::with('reviewer')
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Get a single registration request by ID.
     */
    public function getRequest(int $id): RegistrationRequest
    {
        return RegistrationRequest::with('reviewer')->findOrFail($id);
    }

    /**
     * Generate a temporary password.
     */
    private function generateTemporaryPassword(): string
    {
        return bin2hex(random_bytes(8)); // 16 character hex string
    }
}
