<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EventRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'code',
        'name',
        'capacity',
        'description',
        'is_active',
    ];

    protected $casts = [
        'location_id' => 'integer',
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the location this room belongs to.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get events that use this room.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_room', 'room_id', 'event_id')
            ->withTimestamps();
    }

    /**
     * Scope for active records only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for filtering by location.
     */
    public function scopeForLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }
}
