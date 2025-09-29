<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Scopes\TenantScope;
use Carbon\Carbon;

/**
 * Event Model
 * 
 * Represents events that can be scheduled at one or multiple locations.
 * Each event belongs to an organization (multi-tenant) and optionally to a category.
 * 
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property \Carbon\Carbon $start_date
 * @property \Carbon\Carbon $end_date
 * @property string $status
 * @property string $type
 * @property string|null $virtual_link
 * @property string|null $cta_link
 * @property string|null $cta_text
 * @property array|null $metadata
 * @property string|null $featured_image
 * @property bool $is_featured
 * @property int|null $max_attendees
 * @property int|null $category_id
 * @property int $entity_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @property-read Organization $entity
 * @property-read Category|null $category
 * @property-read \Illuminate\Database\Eloquent\Collection|Location[] $locations
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
        'title',
        'description',
        'start_date',
        'end_date',
        'status_id',
        'type_id',
        'virtual_link',
        'cta_link',
        'cta_text',
        'metadata',
        'featured_image',
        'is_featured',
        'max_attendees',
        'category_id',
        'entity_id',
        'organization_id',
        'approval_comments',
        'approval_history',
        'created_by',
        'approved_by',
        'approved_at',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'metadata' => 'array',
        'approval_history' => 'array',
        'is_featured' => 'boolean',
        'max_attendees' => 'integer',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

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
     * Check if the event is virtual (has virtual link).
     */
    public function isVirtual(): bool
    {
        return !empty($this->virtual_link);
    }

    /**
     * Check if the event has multiple locations.
     */
    public function hasMultipleLocations(): bool
    {
        return $this->type?->allows_multiple_locations ?? false;
    }

    /**
     * Check if the event has a call-to-action.
     */
    public function hasCTA(): bool
    {
        return !empty($this->cta_link) && !empty($this->cta_text);
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
}
