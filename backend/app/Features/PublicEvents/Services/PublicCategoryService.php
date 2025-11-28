<?php

namespace App\Features\PublicEvents\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Public Category Service
 *
 * Handles category queries for the public calendar.
 * All methods are read-only and cached for performance.
 */
class PublicCategoryService
{
    /**
     * Cache TTL for categories (5 minutes)
     */
    private const CACHE_TTL_CATEGORIES = 300;

    /**
     * Get all active categories with published event counts.
     * Results are cached for performance.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getPublicCategories(): \Illuminate\Support\Collection
    {
        return Cache::remember('public.categories', self::CACHE_TTL_CATEGORIES, function () {
            return Category::active()
                ->withCount(['events as published_events_count' => function ($query) {
                    $query->whereHas('status', fn($q) => $q->where('status_code', 'published'));
                }])
                ->orderBy('name')
                ->get()
                ->filter(fn($category) => $category->published_events_count > 0)
                ->map(fn($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => Str::slug($category->name),
                    'color' => $category->color,
                    'description' => $category->description,
                    'event_count' => $category->published_events_count,
                ])
                ->values();
        });
    }

    /**
     * Clear the categories cache.
     * Call this when categories or events are modified.
     */
    public function clearCache(): void
    {
        Cache::forget('public.categories');
    }
}
