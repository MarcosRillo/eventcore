<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cookie Token Middleware
 *
 * Injects access_token from httpOnly cookie into Authorization header for Laravel Sanctum.
 * This enables authentication via httpOnly cookies (XSS protection) while maintaining
 * backward compatibility with Bearer token authentication.
 *
 * Security benefits:
 * - HttpOnly cookies are not accessible via JavaScript (XSS protection)
 * - SameSite attribute follows session config (Strict locally, None cross-domain)
 * - Maintains existing Sanctum authentication flow
 */
class CookieTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only inject cookie token if no Bearer token already present
        // This maintains backward compatibility with existing token-based auth
        if (! $request->bearerToken() && $request->hasCookie('access_token')) {
            $token = $request->cookie('access_token');
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        return $next($request);
    }
}
