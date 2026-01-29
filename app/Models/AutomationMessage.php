<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'booking_id',
        'sequence',
        'message_type',
        'scheduled_for',
        'sent_at',
        'status',
        'channel',
        'subject',
        'content',
        'opened_at',
        'clicked_at',
        'failure_reason',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    // Sequence types
    const SEQUENCE_PRE_TRIP = 'pre_trip';
    const SEQUENCE_ABANDONED_CART = 'abandoned_cart';
    const SEQUENCE_REVIEW_REQUEST = 'review_request';
    const SEQUENCE_CONFIRMATION = 'confirmation';
    const SEQUENCE_REMINDER = 'reminder';

    // Pre-trip message types
    const PRE_TRIP_MESSAGES = [
        '7_days_before' => [
            'name' => '7 Days Before',
            'subject' => 'Your dive adventure is coming up!',
            'days_before' => 7,
        ],
        '3_days_before' => [
            'name' => '3 Days Before',
            'subject' => 'Getting ready for your dive',
            'days_before' => 3,
        ],
        '1_day_before' => [
            'name' => '1 Day Before',
            'subject' => 'See you tomorrow!',
            'days_before' => 1,
        ],
        'morning_of' => [
            'name' => 'Morning Of',
            'subject' => 'Today\'s the day!',
            'hours_before' => 3,
        ],
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // Scopes

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeDue($query)
    {
        return $query->scheduled()
            ->where('scheduled_for', '<=', now());
    }

    public function scopeForSequence($query, string $sequence)
    {
        return $query->where('sequence', $sequence);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Helper Methods

    public function markSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    public function markCancelled(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function markSkipped(): void
    {
        $this->update(['status' => 'skipped']);
    }

    public function trackOpen(): void
    {
        if (!$this->opened_at) {
            $this->update(['opened_at' => now()]);
        }
    }

    public function trackClick(): void
    {
        if (!$this->clicked_at) {
            $this->update(['clicked_at' => now()]);
        }
    }

    /**
     * Schedule pre-trip messages for a booking
     */
    public static function schedulePreTripSequence(Booking $booking): array
    {
        $scheduled = [];
        $activityDate = $booking->schedule?->date ?? $booking->booking_date;
        $activityTime = $booking->schedule?->start_time ?? '09:00';

        $activityDateTime = \Carbon\Carbon::parse($activityDate . ' ' . $activityTime);

        foreach (self::PRE_TRIP_MESSAGES as $type => $config) {
            // Calculate scheduled time
            if (isset($config['days_before'])) {
                $scheduledFor = $activityDateTime->copy()->subDays($config['days_before'])->setTime(9, 0);
            } else {
                $scheduledFor = $activityDateTime->copy()->subHours($config['hours_before']);
            }

            // Don't schedule messages in the past
            if ($scheduledFor->isPast()) {
                continue;
            }

            // Check if already scheduled
            $exists = self::where('booking_id', $booking->id)
                ->where('sequence', self::SEQUENCE_PRE_TRIP)
                ->where('message_type', $type)
                ->exists();

            if (!$exists) {
                $scheduled[] = self::create([
                    'tenant_id' => $booking->tenant_id,
                    'booking_id' => $booking->id,
                    'sequence' => self::SEQUENCE_PRE_TRIP,
                    'message_type' => $type,
                    'scheduled_for' => $scheduledFor,
                    'channel' => 'email',
                    'subject' => $config['subject'],
                ]);
            }
        }

        return $scheduled;
    }

    /**
     * Cancel all pending messages for a booking
     */
    public static function cancelForBooking(Booking $booking): int
    {
        return self::where('booking_id', $booking->id)
            ->where('status', 'scheduled')
            ->update(['status' => 'cancelled']);
    }
}
