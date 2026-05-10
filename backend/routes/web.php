<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// TEMPORARY DEBUG ENDPOINT — REMOVE AFTER OPS-042 IS RESOLVED
Route::get('debug-events', function () {
    $info = [
        'config' => [
            'cache_default' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'queue_default' => config('queue.default'),
            'app_debug' => config('app.debug'),
            'app_env' => config('app.env'),
        ],
        'env' => [
            'CACHE_STORE' => env('CACHE_STORE'),
            'CACHE_DRIVER' => env('CACHE_DRIVER'),
            'APP_DEBUG' => env('APP_DEBUG'),
            'REDIS_URL_set' => env('REDIS_URL') ? 'yes' : 'no',
        ],
    ];
    try {
        $events = \App\Models\Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'status'])
            ->paginate(15);
        $info['events_count'] = $events->total();
        $info['result'] = 'ok';
    } catch (\Throwable $e) {
        $info['result'] = 'exception';
        $info['exception'] = [
            'class' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace_first_5' => array_slice(explode("\n", $e->getTraceAsString()), 0, 10),
        ];
    }

    return response()->json($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
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
