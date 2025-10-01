<?php

namespace App\Features\PublicEvents\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\CategoryResource;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Public Event Controller
 * 
 * Handles public API endpoints for events that don't require authentication.
 * Used by the public calendar for tourists visiting Tucumán.
 */
class PublicEventController extends Controller
{
    /**
     * Get paginated list of published events for public consumption
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'search' => 'sometimes|string|max:255',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $query = Event::published()
            ->with(['category', 'locations'])
            ->orderBy('start_date', 'asc');

        // Apply filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('start_date', '<=', $request->date_to . ' 23:59:59');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location_text', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Get a single published event by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $event = Event::published()
            ->with(['category', 'locations', 'creator'])
            ->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found or not published'
            ], 404);
        }

        return response()->json([
            'data' => new EventResource($event)
        ]);
    }

    /**
     * Get published categories with event counts
     * 
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {
        $categories = Cache::remember('public.categories', 300, function () {
            return Category::active()
                ->orderBy('name')
                ->get()
                ->map(function ($category) {
                    // Count published events manually to avoid PostgreSQL issues with complex withCount
                    $eventCount = $category->events()->whereHas('status', fn($q) => $q->where('status_code', 'published'))->count();
                    
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => \Str::slug($category->name),
                        'color' => $category->color,
                        'description' => $category->description,
                        'event_count' => $eventCount,
                    ];
                })
                ->filter(function ($category) {
                    return $category['event_count'] > 0;
                })
                ->values();
        });

        return response()->json([
            'data' => $categories
        ]);
    }

    /**
     * Get calendar view data for a specific month
     * 
     * @param int $year
     * @param int $month
     * @return JsonResponse
     */
    public function calendarMonth(int $year, int $month): JsonResponse
    {
        // Validate year and month
        if ($year < 2020 || $year > 2030 || $month < 1 || $month > 12) {
            return response()->json([
                'message' => 'Invalid year or month'
            ], 400);
        }

        $cacheKey = "calendar.{$year}.{$month}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($year, $month) {
            $startDate = Carbon::create($year, $month, 1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();

            // Get all events for the month
            $events = Event::published()
                ->with(['category', 'locations'])
                ->whereBetween('start_date', [$startDate, $endDate])
                ->orderBy('start_date')
                ->get();

            // Generate calendar data
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

            return [
                'events' => EventResource::collection($events),
                'calendar' => $calendar,
                'month_info' => [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => $startDate->translatedFormat('F'),
                    'total_events' => $events->count(),
                    'featured_events' => $events->where('is_featured', true)->count(),
                ]
            ];
        });

        return response()->json($data);
    }

    /**
     * Get events by date range
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function dateRange(Request $request): JsonResponse
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $events = Event::published()
            ->with(['category', 'locations'])
            ->whereBetween('start_date', [
                $request->start . ' 00:00:00',
                $request->end . ' 23:59:59'
            ])
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'data' => EventResource::collection($events)
        ]);
    }

    /**
     * Get upcoming published events
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function upcoming(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $limit = min($limit, 50); // Max 50 events

        $events = Event::published()
            ->with(['category', 'locations'])
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->take($limit)
            ->get();

        return response()->json([
            'data' => EventResource::collection($events)
        ]);
    }

    /**
     * Get featured published events
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 6);
        $limit = min($limit, 20); // Max 20 events

        $events = Event::published()
            ->with(['category', 'locations'])
            ->where('is_featured', true)
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->take($limit)
            ->get();

        return response()->json([
            'data' => EventResource::collection($events)
        ]);
    }

    /**
     * Search published events
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $search = $request->q;
        $limit = $request->get('limit', 15);

        $query = Event::published()
            ->with(['category', 'locations'])
            ->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location_text', 'like', "%{$search}%");
            });

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $events = $query->orderByRaw("
            CASE 
                WHEN title LIKE ? THEN 1
                WHEN description LIKE ? THEN 2
                ELSE 3
            END
        ", ["%{$search}%", "%{$search}%"])
        ->take($limit)
        ->get();

        return response()->json([
            'data' => EventResource::collection($events),
            'search_query' => $search,
            'total_results' => $events->count(),
        ]);
    }

    /**
     * Get events by category
     * 
     * @param int $categoryId
     * @param Request $request
     * @return JsonResponse
     */
    public function byCategory(int $categoryId, Request $request): JsonResponse
    {
        $category = Category::active()->find($categoryId);
        
        if (!$category) {
            return response()->json([
                'message' => 'Category not found or inactive'
            ], 404);
        }

        $perPage = $request->get('per_page', 15);
        $events = Event::published()
            ->with(['category', 'locations'])
            ->where('category_id', $categoryId)
            ->orderBy('start_date')
            ->paginate($perPage);

        return response()->json([
            'category' => new CategoryResource($category),
            'events' => $events
        ]);
    }
}