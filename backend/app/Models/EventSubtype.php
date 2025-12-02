<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EventSubtype Model
 * Child of EventType in hierarchical event categorization
 */
class EventSubtype extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'event_type_id',
        'entity_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Scope to filter only active subtypes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for filtering by event type
     */
    public function scopeForEventType($query, int $eventTypeId)
    {
        return $query->where('event_type_id', $eventTypeId);
    }

    /**
     * Get the parent event type
     */
    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }

    /**
     * Get the organization (entity) that owns this subtype
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'entity_id');
    }

    /**
     * Get events with this subtype
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
