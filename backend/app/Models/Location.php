<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Location Model
 *
 * Represents physical locations where events can take place.
 * Each location belongs to an organization (multi-tenant).
 *
 * @property int $id
 * @property string $name
 * @property string|null $address
 * @property string|null $city
 * @property string|null $state
 * @property string|null $country
 * @property string|null $postal_code
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $description
 * @property string|null $phone
 * @property string|null $email
 * @property array|null $additional_info
 * @property bool $is_active
 * @property int $entity_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Organization $entity
 * @property-read Collection|Event[] $events
 */
class Location extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'description',
        'phone',
        'email',
        'additional_info',
        'is_active',
        'entity_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'additional_info' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
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
     * Get the organization that owns this location.
     */
    public function entity(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'entity_id');
    }

    /**
     * Get the events that use this location.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_location')
            ->withPivot([
                'location_specific_notes',
                'max_attendees_for_location',
                'location_metadata',
            ])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include active locations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to search locations by name or address.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%");
        });
    }

    /**
     * Get the full address as a formatted string.
     */
    public function getFullAddressAttribute(): ?string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return ! empty($parts) ? implode(', ', $parts) : null;
    }

    /**
     * Check if location has coordinates.
     */
    public function hasCoordinates(): bool
    {
        return ! is_null($this->latitude) && ! is_null($this->longitude);
    }
}
