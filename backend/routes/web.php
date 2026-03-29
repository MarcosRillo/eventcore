<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// ===== HEALTH CHECK (public, no auth, resolves at /health) =====
Route::get('health', function () {
    $checks = [];
    try {
        \DB::select('SELECT 1');
        $checks['database'] = 'ok';
    } catch (\Throwable $e) {
        $checks['database'] = 'fail';
    }
    try {
        \Cache::store('redis')->set('__health', 1, 5);
        $checks['cache'] = 'ok';
    } catch (\Throwable $e) {
        $checks['cache'] = 'fail';
    }
    $allOk = ! in_array('fail', $checks);

    return response()->json(['status' => $allOk ? 'ok' : 'degraded', 'checks' => $checks], $allOk ? 200 : 503);
});
