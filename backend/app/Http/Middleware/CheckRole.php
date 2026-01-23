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
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user) {
            Log::warning('CheckRole: No authenticated user');

            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Obtener el role_code del usuario (identificador interno, no cambia)
        $userRoleCode = $user->role?->role_code;

        if (! $userRoleCode) {
            Log::warning('CheckRole: User has no role', ['user_id' => $user->id]);

            return response()->json(['error' => 'No role assigned'], 403);
        }

        // Verificar si el usuario tiene alguno de los roles permitidos
        if (! in_array($userRoleCode, $roles)) {
            Log::warning('CheckRole: Access denied', [
                'user_id' => $user->id,
                'user_role' => $userRoleCode,
                'required_roles' => $roles,
                'route' => $request->path(),
            ]);

            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have permission to access this resource',
            ], 403);
        }

        // Note: Successful access is NOT logged to avoid excessive log volume.
        // Only failures are logged for security auditing purposes.

        return $next($request);
    }
}
