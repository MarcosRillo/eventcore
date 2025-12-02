<?php

namespace App\Features\PublicEvents\Services;

use App\Models\Category;
use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Public Event Service
 *
 * Handles public-facing event queries for the tourist calendar.
 * Delegates category and calendar operations to specialized services.
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 *
 * @package App\Features\PublicEvents\Services
 */
class PublicEventService
{
    /**
     * Maximum events per page for pagination
     */
    private const MAX_PER_PAGE = 50;

    /**
     * Default events per page
     */
    private const DEFAULT_PER_PAGE = 15;

    public function __construct(
        private PublicCategoryService $categoryService,
        private PublicCalendarService $calendarService
    ) {}

    /**
     * Get paginated list of published events with optional filters.
     *
     * @param array $filters Available filters: category_id, date_from, date_to, search
     * @param int $perPage Items per page (max 50)
     * @return LengthAwarePaginator
     */
    public function getPublishedEvents(array $filters = [], int $perPage = self::DEFAULT_PER_PAGE): LengthAwarePaginator
    {
        $perPage = $this->normalizePerPage($perPage);

        $query = Event::published()
            ->with(['category', 'locations', 'origin', 'theme', 'frequency'])
            ->orderBy('start_date', 'asc');

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    /**
     * Get a single published event by ID.
     *
     * @param int $id Event ID
     * @return Event
     * @throws ModelNotFoundException When event not found or not published
     */
    public function getPublishedEventById(int $id): Event
    {
        $event = Event::published()
            ->with(['category', 'locations', 'creator', 'origin', 'theme', 'frequency', 'rotationType', 'services'])
            ->find($id);

        if (!$event) {
            throw new ModelNotFoundException('Event not found or not published');
        }

        return $event;
    }

    /**
     * Get all active categories with published event counts.
     * Delegates to PublicCategoryService.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getPublicCategories(): \Illuminate\Support\Collection
    {
        return $this->categoryService->getPublicCategories();
    }

    /**
     * Get calendar view data for a specific month.
     * Delegates to PublicCalendarService.
     *
     * @param int $year Year (2020-2030)
     * @param int $month Month (1-12)
     * @return array Calendar data with events and month info
     * @throws \InvalidArgumentException When year/month out of range
     */
    public function getCalendarMonth(int $year, int $month): array
    {
        return $this->calendarService->getCalendarMonth($year, $month);
    }

    /**
     * Get events within a date range.
     * Delegates to PublicCalendarService.
     *
     * @param string $startDate Start date (Y-m-d format)
     * @param string $endDate End date (Y-m-d format)
     * @return Collection
     */
    public function getEventsByDateRange(string $startDate, string $endDate): Collection
    {
        return $this->calendarService->getEventsByDateRange($startDate, $endDate);
    }

    /**
     * Get upcoming published events.
     *
     * @param int $limit Maximum events to return (max 50)
     * @return Collection
     */
    public function getUpcomingEvents(int $limit = 10): Collection
    {
        $limit = min($limit, self::MAX_PER_PAGE);

        return Event::published()
            ->with(['category', 'locations'])
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->take($limit)
            ->get();
    }

    /**
     * Get featured published events.
     *
     * @param int $limit Maximum events to return (max 20)
     * @return Collection
     */
    public function getFeaturedEvents(int $limit = 6): Collection
    {
        $limit = min($limit, 20);

        return Event::published()
            ->with(['category', 'locations'])
            ->where('is_featured', true)
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->take($limit)
            ->get();
    }

    /**
     * Search published events by query string.
     * Searches in title, description, and related locations.
     *
     * @param string $query Search query
     * @param int|null $categoryId Optional category filter
     * @param int $limit Maximum results (max 50)
     * @return array Search results with metadata
     */
    public function searchEvents(string $query, ?int $categoryId = null, int $limit = 15): array
    {
        $limit = min($limit, self::MAX_PER_PAGE);
        $searchTerm = trim($query);

        $builder = Event::published()
            ->with(['category', 'locations'])
            ->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ilike', "%{$searchTerm}%")
                    ->orWhere('description', 'ilike', "%{$searchTerm}%")
                    // Search in related locations (city, name, address)
                    ->orWhereHas('locations', function ($locationQuery) use ($searchTerm) {
                        $locationQuery->where('name', 'ilike', "%{$searchTerm}%")
                            ->orWhere('city', 'ilike', "%{$searchTerm}%")
                            ->orWhere('address', 'ilike', "%{$searchTerm}%");
                    });
            });

        if ($categoryId !== null) {
            $builder->where('category_id', $categoryId);
        }

        // Order by relevance: title matches first, then description
        $events = $builder->orderByRaw("
            CASE
                WHEN title ILIKE ? THEN 1
                WHEN description ILIKE ? THEN 2
                ELSE 3
            END
        ", ["%{$searchTerm}%", "%{$searchTerm}%"])
            ->take($limit)
            ->get();

        return [
            'events' => $events,
            'search_query' => $searchTerm,
            'total_results' => $events->count(),
        ];
    }

    /**
     * Get published events by category.
     *
     * @param int $categoryId Category ID
     * @param int $perPage Items per page
     * @return array Category info and paginated events
     * @throws ModelNotFoundException When category not found or inactive
     */
    public function getEventsByCategory(int $categoryId, int $perPage = self::DEFAULT_PER_PAGE): array
    {
        $category = Category::active()->find($categoryId);

        if (!$category) {
            throw new ModelNotFoundException('Category not found or inactive');
        }

        $perPage = $this->normalizePerPage($perPage);

        $events = Event::published()
            ->with(['category', 'locations'])
            ->where('category_id', $categoryId)
            ->orderBy('start_date')
            ->paginate($perPage);

        return [
            'category' => $category,
            'events' => $events,
        ];
    }

    /**
     * Get public statistics for the calendar.
     *
     * @return array Stats with total_events, total_categories, events_this_month
     */
    public function getStats(): array
    {
        $totalEvents = Event::published()->count();
        $totalCategories = Category::active()->count();
        $eventsThisMonth = Event::published()
            ->whereMonth('start_date', now()->month)
            ->whereYear('start_date', now()->year)
            ->count();

        return [
            'total_events' => $totalEvents,
            'total_categories' => $totalCategories,
            'events_this_month' => $eventsThisMonth,
        ];
    }

    /**
     * Apply filters to the event query.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return void
     */
    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('start_date', '<=', $filters['date_to'] . ' 23:59:59');
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%")
                    ->orWhereHas('locations', function ($locationQuery) use ($search) {
                        $locationQuery->where('name', 'ilike', "%{$search}%")
                            ->orWhere('city', 'ilike', "%{$search}%");
                    });
            });
        }

        // Filter by origin
        if (!empty($filters['origin_id'])) {
            $query->where('origin_id', $filters['origin_id']);
        }

        // Filter by theme
        if (!empty($filters['theme_id'])) {
            $query->where('theme_id', $filters['theme_id']);
        }
    }

    /**
     * Normalize per_page value within bounds.
     *
     * @param int $perPage
     * @return int
     */
    private function normalizePerPage(int $perPage): int
    {
        if ($perPage < 1) {
            return self::DEFAULT_PER_PAGE;
        }

        if ($perPage > self::MAX_PER_PAGE) {
            return self::MAX_PER_PAGE;
        }

        return $perPage;
    }
}
