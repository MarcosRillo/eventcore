<?php

namespace App\Features\PublicEvents\Services;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Public Calendar Service
 *
 * Handles calendar-related queries for the public calendar.
 * Includes monthly views and date range queries.
 */
class PublicCalendarService
{
    /**
     * Cache TTL for calendar data (1 hour)
     */
    private const CACHE_TTL_CALENDAR = 3600;

    /**
     * Get calendar view data for a specific month.
     * Results are cached for performance.
     *
     * @param int $year Year (2020-2030)
     * @param int $month Month (1-12)
     * @return array Calendar data with events and month info
     * @throws \InvalidArgumentException When year/month out of range
     */
    public function getCalendarMonth(int $year, int $month): array
    {
        $this->validateYearMonth($year, $month);

        $cacheKey = "calendar.{$year}.{$month}";

        return Cache::remember($cacheKey, self::CACHE_TTL_CALENDAR, function () use ($year, $month) {
            $startDate = Carbon::create($year, $month, 1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();

            $events = Event::published()
                ->with(['category', 'locations'])
                ->whereBetween('start_date', [$startDate, $endDate])
                ->orderBy('start_date')
                ->get();

            $calendar = $this->buildCalendarDays($events, $startDate, $month);

            return [
                'events' => $events,
                'calendar' => $calendar,
                'month_info' => [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => $startDate->translatedFormat('F'),
                    'total_events' => $events->count(),
                    'featured_events' => $events->where('is_featured', true)->count(),
                ],
            ];
        });
    }

    /**
     * Get events within a date range.
     *
     * @param string $startDate Start date (Y-m-d format)
     * @param string $endDate End date (Y-m-d format)
     * @return Collection
     */
    public function getEventsByDateRange(string $startDate, string $endDate): Collection
    {
        return Event::published()
            ->with(['category', 'locations'])
            ->whereBetween('start_date', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59',
            ])
            ->orderBy('start_date')
            ->get();
    }

    /**
     * Clear calendar cache for a specific month.
     *
     * @param int $year
     * @param int $month
     */
    public function clearMonthCache(int $year, int $month): void
    {
        Cache::forget("calendar.{$year}.{$month}");
    }

    /**
     * Build calendar days array from events.
     *
     * @param Collection $events
     * @param Carbon $startDate
     * @param int $month
     * @return array
     */
    private function buildCalendarDays(Collection $events, Carbon $startDate, int $month): array
    {
        $calendar = [];
        $currentDate = $startDate->copy();

        while ($currentDate->month === $month) {
            $dateString = $currentDate->toDateString();
            $dayEvents = $events->filter(function ($event) use ($currentDate) {
                return Carbon::parse($event->start_date)->toDateString() === $currentDate->toDateString();
            });

            $calendar[] = [
                'date' => $dateString,
                'event_count' => $dayEvents->count(),
                'has_featured' => $dayEvents->where('is_featured', true)->count() > 0,
            ];

            $currentDate->addDay();
        }

        return $calendar;
    }

    /**
     * Validate year and month are within acceptable range.
     *
     * @param int $year
     * @param int $month
     * @throws \InvalidArgumentException
     */
    private function validateYearMonth(int $year, int $month): void
    {
        if ($year < 2020 || $year > 2030) {
            throw new \InvalidArgumentException('Year must be between 2020 and 2030');
        }

        if ($month < 1 || $month > 12) {
            throw new \InvalidArgumentException('Month must be between 1 and 12');
        }
    }
}
