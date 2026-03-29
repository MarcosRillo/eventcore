<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Sector Model
 * Represents the industry/sector of an organization for event categorization
 */
class Sector extends Model
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
     * Scope to filter only active sectors
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the organization (entity) that owns this sector
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'entity_id');
    }
}
