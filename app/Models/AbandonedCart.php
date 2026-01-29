<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AbandonedCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'member_id',
        'session_id',
        'email',
        'phone',
        'product_id',
        'schedule_id',
        'participant_count',
        'cart_value',
        'cart_data',
        'last_step',
        'utm_source',
        'utm_campaign',
        'recovery_token',
        'status',
        'reminder_count',
        'last_reminder_at',
        'recovered_at',
        'recovered_booking_id',
        'discount_offered',
        'discount_percent',
        'discount_code',
        'discount_expires_at',
        'abandoned_at',
    ];

    protected $casts = [
        'cart_data' => 'array',
        'cart_value' => 'decimal:2',
        'discount_offered' => 'boolean',
        'discount_percent' => 'decimal:2',
        'abandoned_at' => 'datetime',
        'last_reminder_at' => 'datetime',
        'recovered_at' => 'datetime',
        'discount_expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cart) {
            if (empty($cart->recovery_token)) {
                $cart->recovery_token = Str::random(64);
            }
            if (empty($cart->abandoned_at)) {
                $cart->abandoned_at = now();
            }
        });
    }

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function recoveredBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'recovered_booking_id');
    }

    // Scopes

    public function scopeAbandoned($query)
    {
        return $query->where('status', 'abandoned');
    }

    public function scopeRecoverable($query)
    {
        return $query->whereIn('status', ['abandoned', 'reminded'])
            ->whereNotNull('email');
    }

    public function scopeNeedsReminder($query, int $afterMinutes)
    {
        return $query->recoverable()
            ->where('abandoned_at', '<=', now()->subMinutes($afterMinutes))
            ->where(function ($q) {
                $q->whereNull('last_reminder_at')
                    ->orWhere('last_reminder_at', '<=', now()->subHours(12));
            });
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Helper Methods

    public function getRecoveryUrl(): string
    {
        return route('public.cart.recover', $this->recovery_token);
    }

    public function markReminded(): void
    {
        $this->update([
            'status' => 'reminded',
            'reminder_count' => $this->reminder_count + 1,
            'last_reminder_at' => now(),
        ]);
    }

    public function markRecovered(Booking $booking): void
    {
        $this->update([
            'status' => 'recovered',
            'recovered_at' => now(),
            'recovered_booking_id' => $booking->id,
        ]);
    }

    public function markExpired(): void
    {
        $this->update(['status' => 'expired']);
    }

    public function applyDiscount(float $percent, int $validHours = 48): void
    {
        $this->update([
            'discount_offered' => true,
            'discount_percent' => $percent,
            'discount_code' => 'COMEBACK' . strtoupper(Str::random(6)),
            'discount_expires_at' => now()->addHours($validHours),
        ]);
    }

    public function isDiscountValid(): bool
    {
        return $this->discount_offered
            && $this->discount_expires_at
            && $this->discount_expires_at->isFuture();
    }

    public function getScheduleInfo(): ?array
    {
        if (!$this->schedule) {
            return null;
        }

        return [
            'date' => $this->schedule->date,
            'time' => $this->schedule->start_time,
            'product' => $this->product?->name,
            'spots_left' => $this->schedule->getAvailableSpots(),
        ];
    }

    /**
     * Create abandoned cart from checkout session
     */
    public static function createFromSession(
        int $tenantId,
        array $sessionData,
        string $step
    ): self {
        return self::create([
            'tenant_id' => $tenantId,
            'member_id' => $sessionData['member_id'] ?? null,
            'session_id' => $sessionData['session_id'] ?? null,
            'email' => $sessionData['email'] ?? null,
            'phone' => $sessionData['phone'] ?? null,
            'product_id' => $sessionData['product_id'] ?? null,
            'schedule_id' => $sessionData['schedule_id'] ?? null,
            'participant_count' => $sessionData['participant_count'] ?? 1,
            'cart_value' => $sessionData['total'] ?? 0,
            'cart_data' => $sessionData,
            'last_step' => $step,
            'utm_source' => $sessionData['utm_source'] ?? null,
            'utm_campaign' => $sessionData['utm_campaign'] ?? null,
        ]);
    }
}
