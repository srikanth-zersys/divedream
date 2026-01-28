<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'booking_id',
        'member_id',
        'payment_number',
        'amount',
        'currency',
        'type',
        'method',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_refund_id',
        'stripe_metadata',
        'status',
        'failure_reason',
        'original_payment_id',
        'refund_reason',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'stripe_metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_number) {
                $payment->payment_number = self::generatePaymentNumber();
            }
        });
    }

    public static function generatePaymentNumber(): string
    {
        do {
            $number = 'PAY-' . strtoupper(Str::random(10));
        } while (self::where('payment_number', $number)->exists());

        return $number;
    }

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function originalPayment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'original_payment_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Payment::class, 'original_payment_id');
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePayments($query)
    {
        return $query->whereIn('type', ['payment', 'deposit']);
    }

    public function scopeRefunds($query)
    {
        return $query->where('type', 'refund');
    }

    // Helpers

    public function isSuccessful(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRefund(): bool
    {
        return $this->type === 'refund';
    }

    public function canBeRefunded(): bool
    {
        return $this->isSuccessful()
            && !$this->isRefund()
            && $this->getRefundableAmount() > 0;
    }

    public function getRefundedAmount(): float
    {
        return $this->refunds()
            ->where('status', 'succeeded')
            ->sum('amount');
    }

    public function getRefundableAmount(): float
    {
        return max(0, $this->amount - $this->getRefundedAmount());
    }

    public function markAsSucceeded(): void
    {
        $this->update(['status' => 'succeeded']);

        // Update booking payment status
        if ($this->booking_id) {
            $this->booking->refresh();
            $paid = $this->booking->payments()
                ->successful()
                ->payments()
                ->sum('amount');

            $refunded = $this->booking->payments()
                ->successful()
                ->refunds()
                ->sum('amount');

            $netPaid = $paid - $refunded;
            $total = $this->booking->total_amount;

            $this->booking->update([
                'amount_paid' => $paid,
                'amount_refunded' => $refunded,
                'balance_due' => max(0, $total - $netPaid),
                'payment_status' => $netPaid >= $total ? 'fully_paid' :
                    ($netPaid > 0 ? 'deposit_paid' : 'pending'),
            ]);
        }
    }

    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    public function getFormattedAmount(): string
    {
        return number_format($this->amount, 2) . ' ' . strtoupper($this->currency);
    }
}
