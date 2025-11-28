<?php

namespace App\Features\Auth\Controllers;

use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class RoleController extends Controller
{
    /**
     * Get roles that the current user can assign to invitations.
     * Platform admin can assign any role.
     * Entity admin can only assign entity_staff.
     */
    public function assignable(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = UserRole::select('id', 'role_code', 'role_name');

        if ($user->isPlatformAdmin()) {
            $roles = $query->orderBy('role_name')->get();
        } else {
            $roles = $query->where('role_code', 'entity_staff')
                          ->orderBy('role_name')
                          ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
