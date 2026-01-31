<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'type',
        'description',
        'properties',
        'score_change',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    // Activity types
    public const TYPE_PAGE_VIEW = 'page_view';
    public const TYPE_PRODUCT_VIEW = 'product_view';
    public const TYPE_EMAIL_OPEN = 'email_open';
    public const TYPE_EMAIL_CLICK = 'email_click';
    public const TYPE_FORM_SUBMIT = 'form_submit';
    public const TYPE_CART_ADD = 'cart_add';
    public const TYPE_CART_ABANDON = 'cart_abandon';
    public const TYPE_CHECKOUT_START = 'checkout_start';
    public const TYPE_CONVERTED = 'converted';
    public const TYPE_NURTURE_STARTED = 'nurture_started';
    public const TYPE_NURTURE_STEP_ADVANCED = 'nurture_step_advanced';
    public const TYPE_NURTURE_ENDED = 'nurture_ended';
    public const TYPE_UNSUBSCRIBED = 'unsubscribed';
    public const TYPE_RESUBSCRIBED = 'resubscribed';
    public const TYPE_MARKED_LOST = 'marked_lost';
    public const TYPE_SCORE_DECAY = 'score_decay';
    public const TYPE_REFERRAL_SENT = 'referral_sent';
    public const TYPE_REFERRAL_CONVERTED = 'referral_converted';

    // Score values by type (default)
    public const DEFAULT_SCORES = [
        self::TYPE_PAGE_VIEW => 1,
        self::TYPE_PRODUCT_VIEW => 5,
        self::TYPE_EMAIL_OPEN => 2,
        self::TYPE_EMAIL_CLICK => 5,
        self::TYPE_FORM_SUBMIT => 10,
        self::TYPE_CART_ADD => 15,
        self::TYPE_CHECKOUT_START => 20,
        self::TYPE_CONVERTED => 50,
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public static function getDefaultScore(string $type): int
    {
        return self::DEFAULT_SCORES[$type] ?? 0;
    }

    /**
     * Get a human-readable description of the activity
     */
    public function getDescriptionAttribute(): string
    {
        if ($this->attributes['description']) {
            return $this->attributes['description'];
        }

        return match ($this->type) {
            self::TYPE_PAGE_VIEW => 'Viewed page: ' . ($this->properties['url'] ?? 'unknown'),
            self::TYPE_PRODUCT_VIEW => 'Viewed product: ' . ($this->properties['product_name'] ?? 'unknown'),
            self::TYPE_EMAIL_OPEN => 'Opened email: ' . ($this->properties['email_id'] ?? 'unknown'),
            self::TYPE_EMAIL_CLICK => 'Clicked link in email',
            self::TYPE_FORM_SUBMIT => 'Submitted form: ' . ($this->properties['form_id'] ?? 'unknown'),
            self::TYPE_CART_ADD => 'Added item to cart',
            self::TYPE_CART_ABANDON => 'Abandoned cart',
            self::TYPE_CHECKOUT_START => 'Started checkout',
            self::TYPE_CONVERTED => 'Converted to customer',
            self::TYPE_NURTURE_STARTED => 'Started nurture sequence: ' . ($this->properties['sequence'] ?? 'unknown'),
            self::TYPE_NURTURE_STEP_ADVANCED => 'Advanced to step ' . ($this->properties['step'] ?? '?'),
            self::TYPE_NURTURE_ENDED => 'Ended nurture sequence',
            self::TYPE_UNSUBSCRIBED => 'Unsubscribed from emails',
            self::TYPE_RESUBSCRIBED => 'Resubscribed to emails',
            self::TYPE_MARKED_LOST => 'Marked as lost lead',
            self::TYPE_SCORE_DECAY => 'Score decay applied',
            default => $this->type,
        };
    }
}
