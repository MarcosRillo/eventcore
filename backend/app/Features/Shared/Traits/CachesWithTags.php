<?php

namespace App\Features\Shared\Traits;

use Closure;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

/**
 * Provides tag-aware caching with graceful fallback.
 *
 * When the cache store supports tags (Redis, Memcached), uses Cache::tags()
 * for precise invalidation. When it doesn't (database, file), falls back
 * to simple Cache::remember() with TTL-based expiry.
 */
trait CachesWithTags
{
    protected function taggedRemember(array $tags, string $key, int $ttl, Closure $callback): mixed
    {
        if (Cache::getStore() instanceof TaggableStore) {
            return Cache::tags($tags)->remember($key, $ttl, $callback);
        }

        return Cache::remember($key, $ttl, $callback);
    }

    protected function taggedRememberForever(array $tags, string $key, Closure $callback): mixed
    {
        if (Cache::getStore() instanceof TaggableStore) {
            return Cache::tags($tags)->rememberForever($key, $callback);
        }

        return Cache::rememberForever($key, $callback);
    }

    protected function flushTags(array $tags): void
    {
        if (Cache::getStore() instanceof TaggableStore) {
            Cache::tags($tags)->flush();
        }
    }
}
