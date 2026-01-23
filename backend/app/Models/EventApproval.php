<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * EventApproval Model
 *
 * Stores the complete approval history for events.
 * Each approval action creates a new record for audit trail.
 *
 * @property int $id
 * @property int $event_id
 * @property int $performed_by
 * @property string $action
 * @property string|null $comments
 * @property \Illuminate\Support\Carbon $performed_at
 * @property \Illuminate\Support\Carbon|null $scheduled_publish_at
 * @property array|null $metadata
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class EventApproval extends Model
{
    // Action type constants
    public const ACTION_APPROVE_INTERNAL = 'approve_internal';

    public const ACTION_REQUEST_PUBLIC = 'request_public';

    public const ACTION_PUBLISH = 'publish';

    public const ACTION_REQUEST_CHANGES = 'request_changes';

    public const ACTION_REJECT = 'reject';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'event_id',
        'performed_by',
        'action',
        'comments',
        'performed_at',
        'scheduled_publish_at',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'performed_at' => 'datetime',
        'scheduled_publish_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the event that this approval belongs to.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who performed this approval action.
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
