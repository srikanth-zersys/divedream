<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Quote/Proposal system for group bookings and B2B customers
 */
class Quote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'quote_number',
        'status',
        // Customer info
        'customer_type', // individual, corporate, travel_agent, group
        'company_name',
        'contact_name',
        'contact_email',
        'contact_phone',
        'member_id',
        // Quote details
        'title',
        'description',
        'valid_until',
        'proposed_dates',
        'flexibility_notes',
        // Pricing
        'subtotal',
        'discount_percent',
        'discount_amount',
        'discount_reason',
        'tax_amount',
        'total_amount',
        'currency',
        'deposit_required',
        'deposit_amount',
        // Terms
        'terms_and_conditions',
        'cancellation_policy',
        'special_requirements',
        'internal_notes',
        // Tracking
        'sent_at',
        'viewed_at',
        'responded_at',
        'converted_at',
        'converted_booking_id',
        'created_by',
        'last_followup_at',
        'followup_count',
    ];

    protected $casts = [
        'proposed_dates' => 'array',
        'valid_until' => 'date',
        'subtotal' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'deposit_required' => 'boolean',
        'deposit_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'viewed_at' => 'datetime',
        'responded_at' => 'datetime',
        'converted_at' => 'datetime',
        'last_followup_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quote) {
            if (!$quote->quote_number) {
                $quote->quote_number = self::generateQuoteNumber();
            }
            if (!$quote->status) {
                $quote->status = 'draft';
            }
            if (!$quote->created_by) {
                $quote->created_by = auth()->id();
            }
        });
    }

    public static function generateQuoteNumber(): string
    {
        $prefix = 'QT-' . date('Ym') . '-';
        $lastQuote = self::where('quote_number', 'like', $prefix . '%')
            ->orderBy('quote_number', 'desc')
            ->first();

        if ($lastQuote) {
            $lastNumber = (int) substr($lastQuote->quote_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
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

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function convertedBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'converted_booking_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(QuoteActivity::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'sent')
            ->where('valid_until', '<', now());
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'sent', 'negotiating']);
    }

    // Status management

    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->logActivity('sent', 'Quote sent to customer');
    }

    public function markAsViewed(): void
    {
        if (!$this->viewed_at) {
            $this->update(['viewed_at' => now()]);
            $this->logActivity('viewed', 'Customer viewed the quote');
        }
    }

    public function markAsAccepted(): void
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        $this->logActivity('accepted', 'Customer accepted the quote');
    }

    public function markAsDeclined(?string $reason = null): void
    {
        $this->update([
            'status' => 'declined',
            'responded_at' => now(),
            'internal_notes' => $this->internal_notes . "\n\nDecline reason: " . ($reason ?? 'Not specified'),
        ]);

        $this->logActivity('declined', 'Customer declined: ' . ($reason ?? 'No reason given'));
    }

    public function markAsExpired(): void
    {
        $this->update(['status' => 'expired']);
        $this->logActivity('expired', 'Quote validity expired');
    }

    public function convertToBooking(array $bookingData = []): Booking
    {
        $booking = Booking::create(array_merge([
            'tenant_id' => $this->tenant_id,
            'location_id' => $this->location_id,
            'member_id' => $this->member_id,
            'customer_name' => $this->contact_name,
            'customer_email' => $this->contact_email,
            'customer_phone' => $this->contact_phone,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'source' => 'quote',
            'status' => 'confirmed',
            'internal_notes' => "Converted from Quote #{$this->quote_number}",
        ], $bookingData));

        $this->update([
            'status' => 'converted',
            'converted_at' => now(),
            'converted_booking_id' => $booking->id,
        ]);

        $this->logActivity('converted', "Converted to Booking #{$booking->booking_number}");

        return $booking;
    }

    public function logActivity(string $type, string $description, ?int $userId = null): void
    {
        $this->activities()->create([
            'type' => $type,
            'description' => $description,
            'user_id' => $userId ?? auth()->id(),
        ]);
    }

    public function recordFollowup(?string $notes = null): void
    {
        $this->increment('followup_count');
        $this->update(['last_followup_at' => now()]);
        $this->logActivity('followup', $notes ?? 'Follow-up contact made');
    }

    // Helpers

    public function isExpired(): bool
    {
        return $this->valid_until && $this->valid_until < now();
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'negotiating']);
    }

    public function canBeSent(): bool
    {
        return in_array($this->status, ['draft', 'negotiating']) && !$this->isExpired();
    }

    public function canBeConverted(): bool
    {
        return $this->status === 'accepted' && !$this->converted_booking_id;
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum(fn($item) => $item->quantity * $item->unit_price);

        $discountAmount = $this->discount_percent > 0
            ? round($subtotal * ($this->discount_percent / 100), 2)
            : $this->discount_amount;

        $taxableAmount = $subtotal - $discountAmount;
        $taxRate = $this->tenant?->tax_rate ?? 0;
        $taxAmount = round($taxableAmount * ($taxRate / 100), 2);

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $taxableAmount + $taxAmount,
        ]);
    }

    public function getPublicUrl(): string
    {
        return url("/quote/{$this->quote_number}");
    }
}
