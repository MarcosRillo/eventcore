<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     * Blocks suspended users from accessing protected routes.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Refresh user from database to get current status
            // This ensures suspension takes effect immediately
            $user->refresh();

            if ($user->isSuspended()) {
                return response()->json([
                    'error' => 'Account suspended',
                    'message' => 'Tu cuenta ha sido suspendida. Contacta al administrador.'
                ], 403);
            }
        }

        return $next($request);
    }
}
