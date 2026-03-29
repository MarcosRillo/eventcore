<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService,
    ) {}

    /**
     * Get roles that the current user can assign to invitations.
     * Platform admin can assign any role.
     * Entity admin can assign entity_staff and organizer_admin.
     */
    public function assignable(Request $request): JsonResponse
    {
        $roles = $this->roleService->getAssignableRoles($request->user());

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
