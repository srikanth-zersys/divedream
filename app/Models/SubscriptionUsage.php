<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionUsage extends Model
{
    use HasFactory;

    protected $table = 'subscription_usage';

    protected $fillable = [
        'subscription_id',
        'type',
        'quantity',
        'unit_price',
        'total',
        'description',
        'metadata',
        'recorded_at',
        'billed',
        'invoice_id',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
        'recorded_at' => 'datetime',
        'billed' => 'boolean',
    ];

    public const TYPE_BOOKING = 'booking';
    public const TYPE_API_CALL = 'api_call';
    public const TYPE_SMS = 'sms';
    public const TYPE_STORAGE = 'storage';
    public const TYPE_OVERAGE = 'overage';

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(SubscriptionInvoice::class, 'invoice_id');
    }

    public function scopeUnbilled($query)
    {
        return $query->where('billed', false);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function markBilled(int $invoiceId): void
    {
        $this->update([
            'billed' => true,
            'invoice_id' => $invoiceId,
        ]);
    }
}
