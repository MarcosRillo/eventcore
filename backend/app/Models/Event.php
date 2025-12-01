<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Scopes\TenantScope;
use Carbon\Carbon;

/**
 * Event Model
 *
 * Represents events that can be scheduled at one or multiple locations.
 * Each event belongs to an organization (multi-tenant) and optionally to a category.
 *
 * Normalized to 3NF (Nov 30, 2025):
 * - String fields replaced with FK relationships
 * - Boolean services moved to pivot table
 * - JSON async dates moved to separate table
 */
class Event extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Core fields
        'title',
        'description',
        'start_date',
        'end_date',
        'status_id',
        'type_id',
        'category_id',
        'entity_id',
        'organization_id',

        // Approval workflow
        'approval_comments',
        'approval_history',
        'created_by',
        'approved_by',
        'approved_at',
        'published_at',

        // Display
        'featured_image',
        'is_featured',
        'logo_url',
        'responsive_image_url',

        // Event info
        'edition_number',
        'maps_url',
        'previous_venue',
        'next_venue',
        'event_website',
        'virtual_transmission',

        // Attendance (integers)
        'local_attendance',
        'national_attendance',
        'international_attendance',

        // Foreign keys (normalized - Nov 30, 2025)
        'subtype_id',
        'origin_id',
        'theme_id',
        'frequency_id',
        'rotation_type_id',
        'producer_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'approval_history' => 'array',
        'is_featured' => 'boolean',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'virtual_transmission' => 'boolean',
        'local_attendance' => 'integer',
        'national_attendance' => 'integer',
        'international_attendance' => 'integer',
        'subtype_id' => 'integer',
        'origin_id' => 'integer',
        'theme_id' => 'integer',
        'frequency_id' => 'integer',
        'rotation_type_id' => 'integer',
        'producer_id' => 'integer',
    ];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    // =====================================================
    // RELATIONSHIPS - Core
    // =====================================================

    /**
     * Get the organization that owns this event (entity relationship).
     */
    public function entity(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'entity_id');
    }

    /**
     * Get the organization that created this event (organization relationship).
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Get the category that this event belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the status that this event belongs to.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(EventStatus::class, 'status_id');
    }

    /**
     * Get the type that this event belongs to.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(EventType::class, 'type_id');
    }

    /**
     * Get the user who created this event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this event.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the locations associated with this event.
     */
    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'event_location')
                    ->withPivot([
                        'location_specific_notes',
                        'max_attendees_for_location',
                        'location_metadata'
                    ])
                    ->withTimestamps();
    }

    // =====================================================
    // RELATIONSHIPS - Normalized (Nov 30, 2025)
    // =====================================================

    /**
     * Get the subtype of this event.
     */
    public function subtype(): BelongsTo
    {
        return $this->belongsTo(EventSubtype::class, 'subtype_id');
    }

    /**
     * Get the origin of this event.
     */
    public function origin(): BelongsTo
    {
        return $this->belongsTo(EventOrigin::class, 'origin_id');
    }

    /**
     * Get the theme of this event.
     */
    public function theme(): BelongsTo
    {
        return $this->belongsTo(EventTheme::class, 'theme_id');
    }

    /**
     * Get the frequency of this event.
     */
    public function frequency(): BelongsTo
    {
        return $this->belongsTo(EventFrequency::class, 'frequency_id');
    }

    /**
     * Get the rotation type of this event.
     */
    public function rotationType(): BelongsTo
    {
        return $this->belongsTo(EventRotationType::class, 'rotation_type_id');
    }

    /**
     * Get the producer (organization) of this event.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'producer_id');
    }

    /**
     * Get the services for this event.
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(EventService::class, 'event_service', 'event_id', 'service_id')
                    ->withPivot(['is_included', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Get the rooms for this event.
     */
    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(EventRoom::class, 'event_room', 'event_id', 'room_id')
                    ->withTimestamps();
    }

    /**
     * Get the asynchronous dates for this event.
     */
    public function asyncDates(): HasMany
    {
        return $this->hasMany(EventAsyncDate::class);
    }

    // =====================================================
    // SCOPES
    // =====================================================

    /**
     * Scope a query to only include published events.
     */
    public function scopePublished($query)
    {
        return $query->whereHas('status', fn($q) => $q->where('status_code', 'published'));
    }

    /**
     * Scope a query to only include featured events.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to search events by title or description.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to filter events by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($query) use ($startDate, $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($query) use ($startDate, $endDate) {
                      $query->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                  });
        });
    }

    /**
     * Scope a query to filter events by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to filter events by type.
     */
    public function scopeByType($query, $typeCode)
    {
        return $query->whereHas('type', fn($q) => $q->where('type_code', $typeCode));
    }

    /**
     * Scope a query to filter events by origin.
     */
    public function scopeByOrigin($query, $originCode)
    {
        return $query->whereHas('origin', fn($q) => $q->where('code', $originCode));
    }

    /**
     * Scope a query to filter events by theme.
     */
    public function scopeByTheme($query, $themeCode)
    {
        return $query->whereHas('theme', fn($q) => $q->where('code', $themeCode));
    }

    // =====================================================
    // ACCESSORS
    // =====================================================

    /**
     * Get the duration of the event in minutes.
     */
    public function getDurationInMinutesAttribute(): int
    {
        return $this->start_date->diffInMinutes($this->end_date);
    }

    /**
     * Get the duration of the event in hours.
     */
    public function getDurationInHoursAttribute(): float
    {
        return round($this->getDurationInMinutesAttribute() / 60, 2);
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    /**
     * Check if the event is currently happening.
     */
    public function isHappening(): bool
    {
        $now = Carbon::now();
        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Check if the event has ended.
     */
    public function hasEnded(): bool
    {
        return Carbon::now()->isAfter($this->end_date);
    }

    /**
     * Check if the event is upcoming.
     */
    public function isUpcoming(): bool
    {
        return Carbon::now()->isBefore($this->start_date);
    }

    /**
     * Check if the event has virtual transmission.
     */
    public function isVirtual(): bool
    {
        return $this->virtual_transmission === true;
    }

    /**
     * Check if the event has multiple locations.
     */
    public function hasMultipleLocations(): bool
    {
        return $this->type?->allows_multiple_locations ?? false;
    }

    /**
     * Check if the event has a specific service.
     */
    public function hasService(string $serviceCode): bool
    {
        return $this->services()
            ->where('code', $serviceCode)
            ->wherePivot('is_included', true)
            ->exists();
    }

    /**
     * Check if the event is in an approval workflow state.
     */
    public function isInApprovalWorkflow(): bool
    {
        $statusCode = $this->status?->status_code;
        return in_array($statusCode, [
            'pending_internal_approval',
            'approved_internal',
            'pending_public_approval',
            'requires_changes',
        ]);
    }

    /**
     * Add an entry to the approval history.
     */
    public function addApprovalHistoryEntry(string $action, int $userId, ?string $comment = null): void
    {
        $history = $this->approval_history ?? [];

        $history[] = [
            'action' => $action,
            'user_id' => $userId,
            'comment' => $comment,
            'timestamp' => now()->toISOString(),
        ];

        $this->approval_history = $history;
    }

    /**
     * Get total attendance (sum of all attendance types).
     */
    public function getTotalAttendanceAttribute(): int
    {
        return ($this->local_attendance ?? 0)
             + ($this->national_attendance ?? 0)
             + ($this->international_attendance ?? 0);
    }
}
