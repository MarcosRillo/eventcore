<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventSubtype extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type_id',
        'code',
        'name',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'event_type_id' => 'integer',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get the parent event type.
     */
    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }

    /**
     * Get events with this subtype.
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'subtype_id');
    }

    /**
     * Scope for active records only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered records.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('name');
    }

    /**
     * Scope for filtering by event type.
     */
    public function scopeForEventType($query, int $eventTypeId)
    {
        return $query->where('event_type_id', $eventTypeId);
    }
}
