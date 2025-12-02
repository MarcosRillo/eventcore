<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * EventFormat Model
 * Represents event formats: presencial, virtual, híbrido
 * Renamed from EventType to avoid confusion with new event categorization
 */
class EventFormat extends Model
{
    protected $fillable = [
        'format_code',
        'format_name',
        'description',
        'allows_multiple_locations',
    ];

    protected $casts = [
        'allows_multiple_locations' => 'boolean',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'format_id');
    }
}
