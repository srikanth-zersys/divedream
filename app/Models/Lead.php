<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'lead_source_id',
        'user_id',
        'referred_by_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'country',
        'city',
        'status',
        'qualification',
        'score',
        'score_breakdown',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'referrer_url',
        'landing_page',
        'page_views',
        'email_opens',
        'email_clicks',
        'form_submissions',
        'last_activity_at',
        'first_visit_at',
        'interested_products',
        'interested_locations',
        'certification_level',
        'experience_dives',
        'converted_booking_id',
        'converted_at',
        'conversion_value',
        'nurture_sequence',
        'nurture_step',
        'nurture_paused_until',
        'unsubscribed',
        'unsubscribed_at',
        'custom_fields',
        'tags',
        'notes',
    ];

    protected $casts = [
        'score_breakdown' => 'array',
        'interested_products' => 'array',
        'interested_locations' => 'array',
        'custom_fields' => 'array',
        'tags' => 'array',
        'last_activity_at' => 'datetime',
        'first_visit_at' => 'datetime',
        'converted_at' => 'datetime',
        'nurture_paused_until' => 'datetime',
        'unsubscribed' => 'boolean',
        'unsubscribed_at' => 'datetime',
        'conversion_value' => 'decimal:2',
    ];

    // Status constants
    public const STATUS_NEW = 'new';
    public const STATUS_ENGAGED = 'engaged';
    public const STATUS_QUALIFIED = 'qualified';
    public const STATUS_CONVERTED = 'converted';
    public const STATUS_LOST = 'lost';

    // Qualification constants
    public const QUAL_UNKNOWN = 'unknown';
    public const QUAL_COLD = 'cold';
    public const QUAL_WARM = 'warm';
    public const QUAL_HOT = 'hot';

    // Score thresholds
    public const SCORE_THRESHOLD_ENGAGED = 10;
    public const SCORE_THRESHOLD_WARM = 30;
    public const SCORE_THRESHOLD_HOT = 60;
    public const SCORE_THRESHOLD_QUALIFIED = 80;

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(LeadSource::class, 'lead_source_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'referred_by_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Lead::class, 'referred_by_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function convertedBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'converted_booking_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_CONVERTED, self::STATUS_LOST])
            ->where('unsubscribed', false);
    }

    public function scopeSubscribed($query)
    {
        return $query->where('unsubscribed', false);
    }

    public function scopeQualified($query)
    {
        return $query->where('status', self::STATUS_QUALIFIED);
    }

    public function scopeHot($query)
    {
        return $query->where('qualification', self::QUAL_HOT);
    }

    public function scopeWarm($query)
    {
        return $query->where('qualification', self::QUAL_WARM);
    }

    public function scopeInNurtureSequence($query, string $sequence)
    {
        return $query->where('nurture_sequence', $sequence)
            ->where('unsubscribed', false)
            ->where(function ($q) {
                $q->whereNull('nurture_paused_until')
                    ->orWhere('nurture_paused_until', '<=', now());
            });
    }

    public function scopeNeedsReEngagement($query, int $daysSinceActivity = 30)
    {
        return $query->active()
            ->where('last_activity_at', '<', now()->subDays($daysSinceActivity));
    }

    // Methods

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}") ?: $this->email;
    }

    public function recordActivity(string $type, array $properties = [], int $scoreChange = 0): LeadActivity
    {
        $activity = $this->activities()->create([
            'type' => $type,
            'properties' => $properties,
            'score_change' => $scoreChange,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);

        if ($scoreChange !== 0) {
            $this->adjustScore($scoreChange, $type);
        }

        $this->update([
            'last_activity_at' => now(),
        ]);

        // Update status based on activity
        $this->updateStatusFromActivity($type);

        return $activity;
    }

    public function adjustScore(int $points, string $reason = null): void
    {
        $breakdown = $this->score_breakdown ?? [];
        $breakdown[$reason ?? 'manual'] = ($breakdown[$reason ?? 'manual'] ?? 0) + $points;

        $newScore = max(0, $this->score + $points);

        $this->update([
            'score' => $newScore,
            'score_breakdown' => $breakdown,
        ]);

        $this->updateQualificationFromScore();
    }

    public function setScore(int $score, array $breakdown = []): void
    {
        $this->update([
            'score' => max(0, $score),
            'score_breakdown' => $breakdown,
        ]);

        $this->updateQualificationFromScore();
    }

    protected function updateQualificationFromScore(): void
    {
        $qualification = match (true) {
            $this->score >= self::SCORE_THRESHOLD_HOT => self::QUAL_HOT,
            $this->score >= self::SCORE_THRESHOLD_WARM => self::QUAL_WARM,
            $this->score >= self::SCORE_THRESHOLD_ENGAGED => self::QUAL_COLD,
            default => self::QUAL_UNKNOWN,
        };

        if ($this->qualification !== $qualification) {
            $this->update(['qualification' => $qualification]);
        }
    }

    protected function updateStatusFromActivity(string $activityType): void
    {
        // Move from new to engaged on first significant activity
        if ($this->status === self::STATUS_NEW && $this->score >= self::SCORE_THRESHOLD_ENGAGED) {
            $this->update(['status' => self::STATUS_ENGAGED]);
        }

        // Mark as qualified if score is high enough
        if ($this->status === self::STATUS_ENGAGED && $this->score >= self::SCORE_THRESHOLD_QUALIFIED) {
            $this->update(['status' => self::STATUS_QUALIFIED]);
        }
    }

    public function recordPageView(string $url, array $properties = []): LeadActivity
    {
        $this->increment('page_views');

        return $this->recordActivity('page_view', array_merge(['url' => $url], $properties));
    }

    public function recordProductView(int $productId, string $productName): LeadActivity
    {
        $interested = $this->interested_products ?? [];
        if (!in_array($productId, $interested)) {
            $interested[] = $productId;
            $this->update(['interested_products' => $interested]);
        }

        return $this->recordActivity('product_view', [
            'product_id' => $productId,
            'product_name' => $productName,
        ]);
    }

    public function recordEmailOpen(string $emailId): LeadActivity
    {
        $this->increment('email_opens');

        return $this->recordActivity('email_open', ['email_id' => $emailId]);
    }

    public function recordEmailClick(string $emailId, string $url): LeadActivity
    {
        $this->increment('email_clicks');

        return $this->recordActivity('email_click', [
            'email_id' => $emailId,
            'url' => $url,
        ]);
    }

    public function recordFormSubmission(string $formId, array $formData = []): LeadActivity
    {
        $this->increment('form_submissions');

        return $this->recordActivity('form_submit', [
            'form_id' => $formId,
            'form_data' => $formData,
        ]);
    }

    public function markConverted(Booking $booking): void
    {
        $this->update([
            'status' => self::STATUS_CONVERTED,
            'converted_booking_id' => $booking->id,
            'converted_at' => now(),
            'conversion_value' => $booking->total,
        ]);

        $this->recordActivity('converted', [
            'booking_id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'value' => $booking->total,
        ]);
    }

    public function markLost(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_LOST,
        ]);

        $this->recordActivity('marked_lost', ['reason' => $reason]);
    }

    public function startNurtureSequence(string $sequence, int $startStep = 1): void
    {
        $this->update([
            'nurture_sequence' => $sequence,
            'nurture_step' => $startStep,
            'nurture_paused_until' => null,
        ]);

        $this->recordActivity('nurture_started', ['sequence' => $sequence]);
    }

    public function advanceNurtureStep(): void
    {
        $this->increment('nurture_step');
        $this->recordActivity('nurture_step_advanced', [
            'sequence' => $this->nurture_sequence,
            'step' => $this->nurture_step,
        ]);
    }

    public function endNurtureSequence(string $reason = 'completed'): void
    {
        $sequence = $this->nurture_sequence;
        $this->update([
            'nurture_sequence' => null,
            'nurture_step' => 0,
        ]);

        $this->recordActivity('nurture_ended', [
            'sequence' => $sequence,
            'reason' => $reason,
        ]);
    }

    public function pauseNurture(int $days): void
    {
        $this->update([
            'nurture_paused_until' => now()->addDays($days),
        ]);
    }

    public function unsubscribe(): void
    {
        $this->update([
            'unsubscribed' => true,
            'unsubscribed_at' => now(),
            'nurture_sequence' => null,
        ]);

        $this->recordActivity('unsubscribed');
    }

    public function resubscribe(): void
    {
        $this->update([
            'unsubscribed' => false,
            'unsubscribed_at' => null,
        ]);

        $this->recordActivity('resubscribed');
    }

    public function generateReferralCode(): string
    {
        return strtoupper(Str::random(8));
    }

    public function addTag(string $tag): void
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    public function removeTag(string $tag): void
    {
        $tags = $this->tags ?? [];
        $tags = array_filter($tags, fn($t) => $t !== $tag);
        $this->update(['tags' => array_values($tags)]);
    }

    public function hasTag(string $tag): bool
    {
        return in_array($tag, $this->tags ?? []);
    }

    public static function findOrCreateByEmail(int $tenantId, string $email, array $attributes = []): self
    {
        return self::firstOrCreate(
            ['tenant_id' => $tenantId, 'email' => strtolower($email)],
            array_merge([
                'status' => self::STATUS_NEW,
                'qualification' => self::QUAL_UNKNOWN,
                'first_visit_at' => now(),
            ], $attributes)
        );
    }

    public function isInSequence(): bool
    {
        return $this->nurture_sequence !== null;
    }

    public function isSequencePaused(): bool
    {
        return $this->nurture_paused_until !== null && $this->nurture_paused_until->isFuture();
    }

    public function getDaysSinceLastActivity(): ?int
    {
        return $this->last_activity_at?->diffInDays(now());
    }

    public function isStale(int $days = 30): bool
    {
        return $this->getDaysSinceLastActivity() > $days;
    }
}
