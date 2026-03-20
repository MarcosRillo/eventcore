<?php

namespace App\Features\PublicEvents\Services;

use App\Features\Shared\Traits\CachesWithTags;
use App\Models\Event;
use App\Models\EventType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Public Event Service
 *
 * Handles public-facing event queries for the tourist calendar.
 * Delegates calendar operations to specialized services.
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Categories removed - now using EventType/EventSubtype (Dec 2, 2025).
 */
class PublicEventService
{
    use CachesWithTags;

    /**
     * Maximum events per page for pagination
     */
    private const MAX_PER_PAGE = 100;

    /**
     * Default events per page
     */
    private const DEFAULT_PER_PAGE = 15;

    public function __construct(
        private PublicCalendarService $calendarService,
    ) {}

    /**
     * Get paginated list of published events with optional filters.
     *
     * @param  array  $filters  Available filters: event_type_id, start_date, end_date, search, location_id
     * @param  int  $perPage  Items per page (max 50)
     */
    public function getPublishedEvents(array $filters = [], int $perPage = self::DEFAULT_PER_PAGE): LengthAwarePaginator
    {
        $perPage = $this->normalizePerPage($perPage);

        $query = Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'origin', 'theme', 'frequency', 'status'])
            ->orderBy('start_date', 'asc');

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    /**
     * Get a single published event by ID.
     *
     * @param  int  $id  Event ID
     *
     * @throws ModelNotFoundException When event not found or not published
     */
    public function getPublishedEventById(int $id): Event
    {
        $event = Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'creator', 'origin', 'theme', 'frequency', 'rotationType', 'services', 'status'])
            ->find($id);

        if (! $event) {
            throw new ModelNotFoundException('Event not found or not published');
        }

        return $event;
    }

    /**
     * @deprecated Categories removed - use event types instead (Dec 2, 2025)
     * Returns empty collection for backward compatibility
     */
    public function getPublicCategories(): \Illuminate\Support\Collection
    {
        return collect([]);
    }

    /**
     * Get calendar view data for a specific month.
     * Delegates to PublicCalendarService.
     *
     * @param  int  $year  Year (2020-2030)
     * @param  int  $month  Month (1-12)
     * @return array Calendar data with events and month info
     *
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
     * @param  string  $startDate  Start date (Y-m-d format)
     * @param  string  $endDate  End date (Y-m-d format)
     */
    public function getEventsByDateRange(string $startDate, string $endDate): Collection
    {
        return $this->calendarService->getEventsByDateRange($startDate, $endDate);
    }

    /**
     * Get upcoming published events.
     *
     * @param  int  $limit  Maximum events to return (max 50)
     */
    public function getUpcomingEvents(int $limit = 10): Collection
    {
        $limit = min($limit, self::MAX_PER_PAGE);

        return Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'status'])
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->take($limit)
            ->get();
    }

    /**
     * Get featured published events.
     *
     * @param  int  $limit  Maximum events to return (max 20)
     */
    public function getFeaturedEvents(int $limit = 6): Collection
    {
        $limit = min($limit, 20);

        return Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'status'])
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
     * @param  string  $query  Search query
     * @param  int|null  $eventTypeId  Optional event type filter
     * @param  int  $limit  Maximum results (max 50)
     * @return array Search results with metadata
     */
    public function searchEvents(string $query, ?int $eventTypeId = null, int $limit = 15): array
    {
        $limit = min($limit, self::MAX_PER_PAGE);
        $searchTerm = trim($query);

        $builder = Event::published()
            ->with(['eventType', 'eventSubtype', 'locations', 'status'])
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

        if ($eventTypeId !== null) {
            $builder->where('event_type_id', $eventTypeId);
        }

        // Order by relevance: title matches first, then description
        $events = $builder->orderByRaw('
            CASE
                WHEN title ILIKE ? THEN 1
                WHEN description ILIKE ? THEN 2
                ELSE 3
            END
        ', ["%{$searchTerm}%", "%{$searchTerm}%"])
            ->take($limit)
            ->get();

        return [
            'events' => $events,
            'search_query' => $searchTerm,
            'total_results' => $events->count(),
        ];
    }

    /**
     * Get public statistics for the calendar.
     *
     * @return array Stats with total_events, events_this_month
     */
    public function getStats(): array
    {
        return $this->taggedRemember(['public-stats'], 'public.stats', 300, function () {
            return [
                'total_events' => Event::published()->count(),
                'total_event_types' => EventType::where('is_active', true)->count(),
                'events_this_month' => Event::published()
                    ->whereMonth('start_date', now()->month)
                    ->whereYear('start_date', now()->year)
                    ->count(),
            ];
        });
    }

    /**
     * Get active event types for public consumption.
     * Cached for 1 hour — event types change rarely.
     */
    public function getActiveEventTypes(): Collection
    {
        return $this->taggedRemember(['event-types'], 'public.event-types', 3600, function () {
            return EventType::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'color', 'is_active']);
        });
    }

    /**
     * Get active subtypes for a specific event type.
     * Cached for 1 hour.
     */
    public function getActiveSubtypes(EventType $eventType): Collection
    {
        return $this->taggedRemember(
            ['event-subtypes'],
            "public.subtypes.{$eventType->id}",
            3600,
            fn () => $eventType->subtypes()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'event_type_id', 'is_active']),
        );
    }

    /**
     * Apply filters to the event query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['event_type_id'])) {
            $query->where('event_type_id', $filters['event_type_id']);
        }

        if (! empty($filters['start_date'])) {
            $query->where('start_date', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->where('start_date', '<=', $filters['end_date'].' 23:59:59');
        }

        if (! empty($filters['search'])) {
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
        if (! empty($filters['origin_id'])) {
            $query->where('origin_id', $filters['origin_id']);
        }

        // Filter by theme
        if (! empty($filters['theme_id'])) {
            $query->where('theme_id', $filters['theme_id']);
        }

        // Filter by location
        if (! empty($filters['location_id'])) {
            $query->whereHas('locations', fn ($q) => $q->where('locations.id', $filters['location_id']));
        }
    }

    /**
     * Normalize per_page value within bounds.
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
