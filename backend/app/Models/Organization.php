<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'cuit',
        'description',
        'status_id',
        'type_id',
        'parent_id',
        'slug',
        'trust_level',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status_id' => 'integer',
        'type_id' => 'integer',
        'trust_level' => 'integer',
    ];

    /**
     * Get the parent entity that owns this organization.
     */
    public function parentEntity(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'parent_id');
    }

    /**
     * Get the organizers (child organizations) for this entity.
     */
    public function organizers(): HasMany
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    /**
     * Get all child organizations (recursive).
     */
    public function children(): HasMany
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    /**
     * Get all child organizations with their children (recursive).
     */
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    /**
     * The users that belong to this organization.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_user')
            ->withTimestamps();
    }

    /**
     * Get the categories for this organization.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'entity_id');
    }

    /**
     * Get the sections for this organization.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'entity_id');
    }

    /**
     * Get the custom fields for this organization.
     */
    public function customFields(): HasMany
    {
        return $this->hasMany(CustomField::class, 'entity_id');
    }

    /**
     * Get the events for this organization.
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'entity_id');
    }

    /**
     * Get the status that this organization belongs to.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(OrganizationStatus::class, 'status_id');
    }

    /**
     * Get the type that this organization belongs to.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(OrganizationType::class, 'type_id');
    }

    /**
     * Scope a query to only include primary entities.
     */
    public function scopePrimaryEntities($query)
    {
        return $query->whereHas('type', fn ($q) => $q->where('type_code', 'primary_entity'));
    }

    /**
     * Scope a query to only include event organizers.
     */
    public function scopeEventOrganizers($query)
    {
        return $query->whereHas('type', fn ($q) => $q->where('type_code', 'event_organizer'));
    }

    /**
     * Scope a query to only include active organizations.
     */
    public function scopeActive($query)
    {
        return $query->whereHas('status', fn ($q) => $q->where('status_code', 'active'));
    }

    /**
     * Check if this organization is a primary entity.
     */
    public function isPrimaryEntity(): bool
    {
        return $this->type?->type_code === 'primary_entity';
    }

    /**
     * Check if this organization is an event organizer.
     */
    public function isEventOrganizer(): bool
    {
        return $this->type?->type_code === 'event_organizer';
    }

    /**
     * Check if this organization is active.
     */
    public function isActive(): bool
    {
        return $this->status?->status_code === 'active';
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
