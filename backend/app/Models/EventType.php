<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EventType Model
 * Parent container for EventSubtypes in hierarchical event categorization
 */
class EventType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
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
     * Scope to filter only active event types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the organization (entity) that owns this event type
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'entity_id');
    }

    /**
     * Get the subtypes for this event type
     */
    public function subtypes(): HasMany
    {
        return $this->hasMany(EventSubtype::class);
    }

    /**
     * Get events with this type
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
