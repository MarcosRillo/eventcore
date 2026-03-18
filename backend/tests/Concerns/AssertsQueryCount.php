<?php

namespace Tests\Concerns;

use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Trait for asserting database query counts in tests.
 *
 * Provides assertMaxQueries() to verify that a code block doesn't
 * exceed a query budget — essential for catching N+1 regressions.
 *
 * Usage:
 *   $this->assertMaxQueries(5, function () {
 *       $this->getJson('/api/v1/events')->assertOk();
 *   });
 */
trait AssertsQueryCount
{
    /**
     * Assert that a callback executes at most $max database queries.
     *
     * On failure, dumps the full list of executed queries for debugging.
     *
     * @param  int  $max  Maximum allowed queries
     * @param  Closure  $callback  Code to execute and measure
     * @return mixed The callback's return value
     */
    protected function assertMaxQueries(int $max, Closure $callback): mixed
    {
        $queries = new Collection;

        DB::listen(function ($query) use ($queries) {
            $queries->push($query->sql);
        });

        try {
            $result = $callback();
        } finally {
            DB::flushQueryLog();
        }

        $count = $queries->count();

        $this->assertLessThanOrEqual(
            $max,
            $count,
            "Expected max {$max} queries, but {$count} were executed:\n".
            $queries->map(fn ($sql, $i) => ($i + 1).". {$sql}")->implode("\n"),
        );

        return $result;
    }
}
