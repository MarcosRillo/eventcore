<?php

namespace App\Features\Users\Controllers;

use App\Features\Users\Requests\UpdateUserRequest;
use App\Features\Users\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    /**
     * List entity_staff users.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'per_page', 'page']);
        $users = $this->userService->getUsers($request->user(), $filters);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Show user detail.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $this->userService->getUser($id);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update user profile (name, email).
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $updated = $this->userService->updateUser($user, $request->validated(), $request->user());

            return response()->json([
                'success' => true,
                'data' => new UserResource($updated),
                'message' => 'Usuario actualizado correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Suspend a user.
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $suspended = $this->userService->suspendUser($user, $request->user());

            return response()->json([
                'success' => true,
                'data' => new UserResource($suspended),
                'message' => 'Usuario suspendido correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Unsuspend a user.
     */
    public function unsuspend(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $unsuspended = $this->userService->unsuspendUser($user, $request->user());

            return response()->json([
                'success' => true,
                'data' => new UserResource($unsuspended),
                'message' => 'Usuario reactivado correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Soft delete a user.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $this->userService->deleteUser($user, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }
}
