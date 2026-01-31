<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'booking_number',
        'access_token',
        'source',
        'member_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'schedule_id',
        'product_id',
        'booking_date',
        'booking_time',
        'participant_count',
        'participants',
        'subtotal',
        'discount_amount',
        'discount_code',
        'online_discount_enabled',
        'online_discount_percent',
        'online_discount_amount',
        'tax_amount',
        'total_amount',
        'currency',
        'payment_status',
        'payment_method',
        'amount_paid',
        'deposit_amount',
        'deposit_paid_at',
        'amount_refunded',
        'balance_due',
        'payment_due_date',
        'status',
        'confirmed_at',
        'checked_in_at',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by',
        'waiver_completed',
        'waiver_completed_at',
        'medical_form_completed',
        'customer_notes',
        'internal_notes',
        'equipment_requests',
        'assigned_instructor_id',
        'reminder_sent_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'participants' => 'array',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'online_discount_enabled' => 'boolean',
        'online_discount_percent' => 'decimal:2',
        'online_discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'deposit_paid_at' => 'datetime',
        'amount_refunded' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'payment_due_date' => 'datetime',
        'confirmed_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'waiver_completed' => 'boolean',
        'waiver_completed_at' => 'datetime',
        'medical_form_completed' => 'boolean',
        'equipment_requests' => 'array',
        'reminder_sent_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (!$booking->booking_number) {
                $booking->booking_number = self::generateBookingNumber();
            }
            if (!$booking->access_token) {
                $booking->access_token = Str::random(64);
            }
        });
    }

    public static function generateBookingNumber(): string
    {
        do {
            $number = 'BK-' . strtoupper(Str::random(8));
        } while (self::where('booking_number', $number)->exists());

        return $number;
    }

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedInstructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'assigned_instructor_id');
    }

    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(BookingParticipant::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(BookingEquipment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function bookingPayments(): HasMany
    {
        return $this->hasMany(BookingPayment::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('booking_date', $date);
    }

    public function scopeToday($query)
    {
        return $query->where('booking_date', now()->toDateString());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', now()->toDateString())
            ->orderBy('booking_date')
            ->orderBy('booking_time');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed', 'checked_in', 'in_progress']);
    }

    public function scopeNeedsCheckIn($query)
    {
        return $query->where('status', 'confirmed')
            ->where('booking_date', now()->toDateString());
    }

    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('booking_number', 'like', "%{$search}%")
              ->orWhere('customer_name', 'like', "%{$search}%")
              ->orWhere('customer_email', 'like', "%{$search}%")
              ->orWhereHas('member', function ($mq) use ($search) {
                  $mq->where('first_name', 'like', "%{$search}%")
                     ->orWhere('last_name', 'like', "%{$search}%")
                     ->orWhere('email', 'like', "%{$search}%");
              });
        });
    }

    // Helpers

    public function getCustomerNameAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        return $this->member?->full_name ?? 'Unknown Customer';
    }

    public function getCustomerEmailAttribute($value): ?string
    {
        return $value ?? $this->member?->email;
    }

    public function getCustomerPhoneAttribute($value): ?string
    {
        return $value ?? $this->member?->phone;
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'fully_paid';
    }

    public function hasDeposit(): bool
    {
        return $this->payment_status === 'deposit_paid';
    }

    public function needsPayment(): bool
    {
        return $this->balance_due > 0;
    }

    public function canBeCheckedIn(): bool
    {
        return $this->status === 'confirmed'
            && $this->booking_date->isToday();
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function checkIn(?int $userId = null): void
    {
        // CRITICAL: Explicitly reject cancelled/no_show/completed bookings
        $disallowedStatuses = ['cancelled', 'no_show', 'completed'];
        if (in_array($this->status, $disallowedStatuses)) {
            throw new \InvalidArgumentException(
                "Cannot check in a booking with status '{$this->status}'. Only pending or confirmed bookings can be checked in."
            );
        }

        // Only allow confirmed and pending bookings
        if (!in_array($this->status, ['confirmed', 'pending'])) {
            throw new \InvalidArgumentException('Only confirmed or pending bookings can be checked in.');
        }

        $this->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
        ]);

        // Record visit for member
        if ($this->member_id) {
            $this->member->recordVisit($this->location_id);
        }
    }

    public function checkOut(?int $userId = null): void
    {
        if ($this->status !== 'checked_in') {
            throw new \InvalidArgumentException('Only checked-in bookings can be checked out.');
        }

        $this->update([
            'status' => 'completed',
        ]);
    }

    public function cancel(?string $reason = null, ?int $userId = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $userId,
            'cancellation_reason' => $reason,
        ]);

        // Update schedule booked count
        if ($this->schedule_id) {
            $this->schedule->decrementBookedCount($this->participant_count);
        }
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function markNoShow(): void
    {
        $this->update(['status' => 'no_show']);
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('total_price');
        $total = $subtotal - $this->discount_amount + $this->tax_amount;
        $balance = $total - $this->amount_paid + $this->amount_refunded;

        $this->update([
            'subtotal' => $subtotal,
            'total_amount' => $total,
            'balance_due' => max(0, $balance),
        ]);
    }

    public function getBookingDateTime(): ?\Carbon\Carbon
    {
        if (!$this->booking_date) {
            return null;
        }

        $time = $this->booking_time ?? $this->schedule?->start_time ?? '00:00';

        return $this->booking_date->setTimeFromTimeString($time);
    }

    /**
     * Get the public URL for customer access via magic link
     */
    public function getPublicUrl(): string
    {
        return url("/booking/{$this->access_token}");
    }

    /**
     * Find booking by access token
     */
    public static function findByToken(string $token): ?self
    {
        return static::where('access_token', $token)->first();
    }

    /**
     * Recalculate payment totals from all completed payments
     */
    public function recalculatePayments(): void
    {
        $completedPayments = $this->bookingPayments()->completed()->get();

        $totalPaid = $completedPayments->where('type', '!=', 'refund')->sum('amount');
        $totalRefunded = $completedPayments->where('type', 'refund')->sum('amount');
        $balance = $this->total_amount - $totalPaid + $totalRefunded;

        // Check if deposit was paid
        $depositPaid = $completedPayments->where('type', 'deposit')->first();

        $this->update([
            'amount_paid' => $totalPaid,
            'amount_refunded' => $totalRefunded,
            'balance_due' => max(0, $balance),
            'deposit_paid_at' => $depositPaid?->paid_at,
            'payment_status' => $this->determinePaymentStatus($totalPaid, $totalRefunded),
        ]);
    }

    /**
     * Determine payment status based on amounts
     * Valid values: pending, deposit_paid, fully_paid, partially_refunded, fully_refunded, failed
     */
    protected function determinePaymentStatus(float $paid, float $refunded): string
    {
        $net = $paid - $refunded;

        // Check for refund states first
        if ($refunded > 0) {
            if ($net <= 0) {
                return 'fully_refunded';
            }
            return 'partially_refunded';
        }

        // No refunds - check payment states
        if ($net <= 0) {
            return 'pending';
        }

        if ($net >= $this->total_amount) {
            return 'fully_paid';
        }

        // Any partial payment is recorded as deposit_paid
        return 'deposit_paid';
    }

    /**
     * Record a payment for this booking
     */
    public function recordPayment(
        float $amount,
        string $type = 'partial',
        string $method = 'cash',
        ?int $receivedBy = null,
        ?string $notes = null
    ): BookingPayment {
        $payment = $this->bookingPayments()->create([
            'tenant_id' => $this->tenant_id,
            'amount' => $amount,
            'currency' => $this->currency ?? 'USD',
            'type' => $type,
            'method' => $method,
            'status' => 'completed',
            'received_by' => $receivedBy ?? auth()->id(),
            'notes' => $notes,
            'paid_at' => now(),
        ]);

        $this->recalculatePayments();

        return $payment;
    }

    /**
     * Record deposit payment
     */
    public function recordDeposit(
        float $amount,
        string $method = 'cash',
        ?int $receivedBy = null
    ): BookingPayment {
        $this->update(['deposit_amount' => $amount]);

        return $this->recordPayment($amount, 'deposit', $method, $receivedBy);
    }

    /**
     * Check if deposit has been paid
     */
    public function hasDepositPaid(): bool
    {
        return $this->deposit_paid_at !== null;
    }

    /**
     * Check if fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'fully_paid';
    }

    /**
     * Get remaining balance
     */
    public function getRemainingBalance(): float
    {
        return max(0, $this->total_amount - $this->amount_paid + $this->amount_refunded);
    }

    /**
     * Get the amount that can be refunded
     */
    public function getRefundableAmount(): float
    {
        return max(0, $this->amount_paid - $this->amount_refunded);
    }
}
