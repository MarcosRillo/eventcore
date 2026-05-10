<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// TEMPORARY DEBUG ENDPOINT — REMOVE AFTER OPS-042 IS RESOLVED
Route::get('debug-cfg', function () {
    return response()->json([
        'cache_default' => config('cache.default'),
        'session_driver' => config('session.driver'),
        'queue_default' => config('queue.default'),
        'app_debug' => config('app.debug'),
        'app_env' => config('app.env'),
        'env_CACHE_STORE' => env('CACHE_STORE'),
        'env_CACHE_DRIVER' => env('CACHE_DRIVER'),
    ]);
});

Route::get('debug-events', function () {
    try {
        $events = \App\Models\Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'status'])
            ->paginate(15);

        return response()->json([
            'result' => 'ok',
            'count' => $events->total(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'result' => 'exception',
            'class' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile().':'.$e->getLine(),
            'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 8),
        ], 500);
    }
});

// ===== HEALTH CHECK (public, no auth, resolves at /health) =====
Route::get('health', function () {
    $checks = [];
    try {
        DB::select('SELECT 1');
        $checks['database'] = 'ok';
    } catch (Throwable $e) {
        $checks['database'] = 'fail';
    }
    try {
        Cache::store('redis')->set('__health', 1, 5);
        $checks['cache'] = 'ok';
    } catch (Throwable $e) {
        $checks['cache'] = 'fail';
    }
    $allOk = ! in_array('fail', $checks);

    return response()->json(['status' => $allOk ? 'ok' : 'degraded', 'checks' => $checks], $allOk ? 200 : 503);
});
