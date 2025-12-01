<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAsyncDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'date_value',
        'notes',
    ];

    protected $casts = [
        'event_id' => 'integer',
        'date_value' => 'date',
    ];

    /**
     * Alias accessor for date_value.
     */
    public function getDateAttribute()
    {
        return $this->date_value;
    }

    /**
     * Get the event this date belongs to.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Scope for dates in a range.
     */
    public function scopeInRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date_value', [$startDate, $endDate]);
    }

    /**
     * Scope for future dates only.
     */
    public function scopeFuture($query)
    {
        return $query->where('date_value', '>=', now()->toDateString());
    }
}
