<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        // Pre-trip
        'pre_trip_enabled',
        'pre_trip_schedule',
        // Abandoned cart
        'abandoned_cart_enabled',
        'cart_abandon_minutes',
        'first_reminder_hours',
        'second_reminder_hours',
        'final_reminder_hours',
        'offer_discount',
        'discount_percent',
        'discount_on_reminder',
        // Review requests
        'review_request_enabled',
        'review_request_hours',
        'review_reminder_days',
        'google_review_link',
        'tripadvisor_link',
        'facebook_page_link',
        // Communication
        'sms_enabled',
        'whatsapp_enabled',
        'whatsapp_number',
        // Quiet hours
        'quiet_start',
        'quiet_end',
        'timezone',
    ];

    protected $casts = [
        'pre_trip_enabled' => 'boolean',
        'pre_trip_schedule' => 'array',
        'abandoned_cart_enabled' => 'boolean',
        'offer_discount' => 'boolean',
        'discount_percent' => 'decimal:2',
        'review_request_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
    ];

    // Default pre-trip schedule
    const DEFAULT_PRE_TRIP_SCHEDULE = [
        ['type' => '7_days_before', 'enabled' => true, 'channel' => 'email'],
        ['type' => '3_days_before', 'enabled' => true, 'channel' => 'email'],
        ['type' => '1_day_before', 'enabled' => true, 'channel' => 'email'],
        ['type' => 'morning_of', 'enabled' => true, 'channel' => 'email'],
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Helper Methods

    /**
     * Get or create settings for a tenant
     */
    public static function getForTenant(int $tenantId): self
    {
        return self::firstOrCreate(
            ['tenant_id' => $tenantId],
            self::getDefaults()
        );
    }

    /**
     * Get default settings
     */
    public static function getDefaults(): array
    {
        return [
            'pre_trip_enabled' => true,
            'pre_trip_schedule' => self::DEFAULT_PRE_TRIP_SCHEDULE,
            'abandoned_cart_enabled' => true,
            'cart_abandon_minutes' => 60,
            'first_reminder_hours' => 1,
            'second_reminder_hours' => 24,
            'final_reminder_hours' => 48,
            'offer_discount' => true,
            'discount_percent' => 10,
            'discount_on_reminder' => 3,
            'review_request_enabled' => true,
            'review_request_hours' => 2,
            'review_reminder_days' => 3,
            'sms_enabled' => false,
            'whatsapp_enabled' => false,
            'quiet_start' => '21:00',
            'quiet_end' => '08:00',
            'timezone' => 'UTC',
        ];
    }

    /**
     * Check if current time is within quiet hours
     */
    public function isQuietHours(): bool
    {
        $now = now()->setTimezone($this->timezone ?? 'UTC');
        $quietStart = \Carbon\Carbon::parse($this->quiet_start, $this->timezone);
        $quietEnd = \Carbon\Carbon::parse($this->quiet_end, $this->timezone);

        // Handle overnight quiet hours (e.g., 21:00 to 08:00)
        if ($quietStart->gt($quietEnd)) {
            return $now->gte($quietStart) || $now->lte($quietEnd);
        }

        return $now->between($quietStart, $quietEnd);
    }

    /**
     * Get the next available send time (after quiet hours)
     */
    public function getNextSendTime(): \Carbon\Carbon
    {
        if (!$this->isQuietHours()) {
            return now();
        }

        $quietEnd = \Carbon\Carbon::parse($this->quiet_end, $this->timezone);
        $now = now()->setTimezone($this->timezone ?? 'UTC');

        // If quiet end is tomorrow
        if ($now->format('H:i') > $this->quiet_start) {
            $quietEnd->addDay();
        }

        return $quietEnd->setTimezone(config('app.timezone'));
    }

    /**
     * Get abandoned cart reminder schedule
     */
    public function getAbandonedCartSchedule(): array
    {
        return [
            1 => $this->first_reminder_hours,
            2 => $this->second_reminder_hours,
            3 => $this->final_reminder_hours,
        ];
    }

    /**
     * Should offer discount on this reminder?
     */
    public function shouldOfferDiscount(int $reminderNumber): bool
    {
        return $this->offer_discount && $reminderNumber >= $this->discount_on_reminder;
    }

    /**
     * Get pre-trip schedule with enabled status
     */
    public function getPreTripSchedule(): array
    {
        $schedule = $this->pre_trip_schedule ?? self::DEFAULT_PRE_TRIP_SCHEDULE;

        // Merge with message config
        return collect($schedule)->map(function ($item) {
            $config = AutomationMessage::PRE_TRIP_MESSAGES[$item['type']] ?? [];
            return array_merge($config, $item);
        })->toArray();
    }
}
