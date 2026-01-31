<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id',
        'user_id',
        'type',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Activity types
    const TYPE_CREATED = 'created';
    const TYPE_UPDATED = 'updated';
    const TYPE_SENT = 'sent';
    const TYPE_VIEWED = 'viewed';
    const TYPE_ACCEPTED = 'accepted';
    const TYPE_REJECTED = 'rejected';
    const TYPE_EXPIRED = 'expired';
    const TYPE_CONVERTED = 'converted';
    const TYPE_COMMENT = 'comment';
    const TYPE_ITEM_ADDED = 'item_added';
    const TYPE_ITEM_REMOVED = 'item_removed';
    const TYPE_RESENT = 'resent';

    // Relationships

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Helper methods

    public static function log(
        Quote $quote,
        string $type,
        ?string $description = null,
        ?array $metadata = null,
        ?int $userId = null
    ): self {
        return self::create([
            'quote_id' => $quote->id,
            'user_id' => $userId ?? auth()->id(),
            'type' => $type,
            'description' => $description ?? self::getDefaultDescription($type),
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    protected static function getDefaultDescription(string $type): string
    {
        return match ($type) {
            self::TYPE_CREATED => 'Quote was created',
            self::TYPE_UPDATED => 'Quote was updated',
            self::TYPE_SENT => 'Quote was sent to customer',
            self::TYPE_VIEWED => 'Customer viewed the quote',
            self::TYPE_ACCEPTED => 'Customer accepted the quote',
            self::TYPE_REJECTED => 'Customer rejected the quote',
            self::TYPE_EXPIRED => 'Quote has expired',
            self::TYPE_CONVERTED => 'Quote was converted to a booking',
            self::TYPE_COMMENT => 'Comment was added',
            self::TYPE_ITEM_ADDED => 'Item was added to quote',
            self::TYPE_ITEM_REMOVED => 'Item was removed from quote',
            self::TYPE_RESENT => 'Quote was resent to customer',
            default => 'Activity recorded',
        };
    }

    public function getIconAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_CREATED => 'plus-circle',
            self::TYPE_UPDATED => 'edit',
            self::TYPE_SENT => 'send',
            self::TYPE_VIEWED => 'eye',
            self::TYPE_ACCEPTED => 'check-circle',
            self::TYPE_REJECTED => 'x-circle',
            self::TYPE_EXPIRED => 'clock',
            self::TYPE_CONVERTED => 'arrow-right-circle',
            self::TYPE_COMMENT => 'message-circle',
            self::TYPE_ITEM_ADDED => 'plus',
            self::TYPE_ITEM_REMOVED => 'minus',
            self::TYPE_RESENT => 'refresh-cw',
            default => 'activity',
        };
    }

    public function getColorAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_CREATED => 'blue',
            self::TYPE_UPDATED => 'yellow',
            self::TYPE_SENT => 'purple',
            self::TYPE_VIEWED => 'gray',
            self::TYPE_ACCEPTED => 'green',
            self::TYPE_REJECTED => 'red',
            self::TYPE_EXPIRED => 'orange',
            self::TYPE_CONVERTED => 'green',
            self::TYPE_COMMENT => 'blue',
            default => 'gray',
        };
    }
}
