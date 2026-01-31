<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'location_id',
        'type',
        'day_of_week',
        'start_time',
        'end_time',
        'date',
        'is_available',
        'reason',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'date' => 'date',
        'is_available' => 'boolean',
    ];

    // Relationships

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    // Scopes

    public function scopeRecurring($query)
    {
        return $query->where('type', 'recurring');
    }

    public function scopeTimeOff($query)
    {
        return $query->where('type', 'time_off');
    }

    public function scopeOverride($query)
    {
        return $query->where('type', 'override');
    }

    public function scopeForDate($query, \Carbon\Carbon $date)
    {
        return $query->where(function ($q) use ($date) {
            $q->where(function ($inner) use ($date) {
                // Specific date override or time off
                $inner->whereIn('type', ['override', 'time_off'])
                    ->where('date', $date->format('Y-m-d'));
            })->orWhere(function ($inner) use ($date) {
                // Recurring availability for the day of week
                $inner->where('type', 'recurring')
                    ->where('day_of_week', $date->dayOfWeek);
            });
        });
    }
}
