<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DisableInProduction
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (app()->isProduction()) {
            abort(404);
        }

        return $next($request);
    }
}
