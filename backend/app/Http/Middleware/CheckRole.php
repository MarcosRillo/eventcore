<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('CheckRole: No authenticated user');
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Obtener el role_name del usuario
        $userRole = $user->role?->role_name;

        if (!$userRole) {
            Log::warning('CheckRole: User has no role', ['user_id' => $user->id]);
            return response()->json(['error' => 'No role assigned'], 403);
        }

        // Normalizar nombres de roles (ambos formatos aceptados)
        $normalizedRoles = collect($roles)->map(function ($role) {
            return match($role) {
                'platform_admin' => 'Platform Administrator',
                'entity_admin' => 'Entity Administrator',
                'entity_staff' => 'Entity Staff',
                'organizer' => 'Event Organizer',
                default => $role,
            };
        });

        // Verificar si el usuario tiene alguno de los roles permitidos
        if (!$normalizedRoles->contains($userRole)) {
            Log::warning('CheckRole: Access denied', [
                'user_id' => $user->id,
                'user_role' => $userRole,
                'required_roles' => $normalizedRoles->toArray(),
                'route' => $request->path()
            ]);

            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have permission to access this resource'
            ], 403);
        }

        Log::info('CheckRole: Access granted', [
            'user_id' => $user->id,
            'user_role' => $userRole,
            'route' => $request->path()
        ]);

        return $next($request);
    }
}
