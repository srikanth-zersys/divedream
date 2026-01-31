<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ReviewRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'booking_id',
        'member_id',
        'token',
        'status',
        'sent_at',
        'opened_at',
        'completed_at',
        'reminder_count',
        'rating',
        'feedback',
        'feedback_tags',
        'posted_google',
        'posted_tripadvisor',
        'posted_facebook',
        'google_review_url',
        'requires_followup',
        'followed_up_by',
        'followed_up_at',
        'followup_notes',
        'resolution_status',
    ];

    protected $casts = [
        'feedback_tags' => 'array',
        'posted_google' => 'boolean',
        'posted_tripadvisor' => 'boolean',
        'posted_facebook' => 'boolean',
        'requires_followup' => 'boolean',
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'completed_at' => 'datetime',
        'followed_up_at' => 'datetime',
    ];

    // Feedback tag options
    const POSITIVE_TAGS = [
        'great_instructor' => 'Great Instructor',
        'beautiful_location' => 'Beautiful Location',
        'well_organized' => 'Well Organized',
        'good_equipment' => 'Good Equipment',
        'friendly_staff' => 'Friendly Staff',
        'amazing_experience' => 'Amazing Experience',
        'good_value' => 'Good Value',
        'safe_feeling' => 'Felt Safe',
        'would_recommend' => 'Would Recommend',
    ];

    const NEGATIVE_TAGS = [
        'poor_communication' => 'Poor Communication',
        'equipment_issues' => 'Equipment Issues',
        'late_start' => 'Late Start',
        'rushed_experience' => 'Rushed Experience',
        'overcrowded' => 'Overcrowded',
        'unfriendly_staff' => 'Unfriendly Staff',
        'not_as_described' => 'Not as Described',
        'safety_concerns' => 'Safety Concerns',
        'overpriced' => 'Overpriced',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($review) {
            if (empty($review->token)) {
                $review->token = Str::random(64);
            }
        });
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

    public function followedUpBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'followed_up_by');
    }

    // Scopes

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeNeedsFollowup($query)
    {
        return $query->where('requires_followup', true)
            ->whereNull('followed_up_at');
    }

    public function scopePositive($query)
    {
        return $query->where('rating', '>=', 4);
    }

    public function scopeNegative($query)
    {
        return $query->where('rating', '<=', 3);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Helper Methods

    public function getReviewUrl(): string
    {
        return route('public.review', $this->token);
    }

    public function markSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markOpened(): void
    {
        if (!$this->opened_at) {
            $this->update([
                'status' => 'opened',
                'opened_at' => now(),
            ]);
        }
    }

    public function submitReview(int $rating, ?string $feedback, array $tags = []): void
    {
        $requiresFollowup = $rating <= 3;

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'rating' => $rating,
            'feedback' => $feedback,
            'feedback_tags' => $tags,
            'requires_followup' => $requiresFollowup,
            'resolution_status' => $requiresFollowup ? 'pending' : null,
        ]);

        // Update booking with review status
        $this->booking->update([
            'review_requested' => true,
            'review_requested_at' => $this->sent_at,
        ]);
    }

    public function recordExternalReview(string $platform, ?string $url = null): void
    {
        $field = "posted_{$platform}";
        if (in_array($field, ['posted_google', 'posted_tripadvisor', 'posted_facebook'])) {
            $update = [$field => true];
            if ($platform === 'google' && $url) {
                $update['google_review_url'] = $url;
            }
            $this->update($update);
        }
    }

    public function markFollowedUp(int $userId, string $notes, string $resolution = 'resolved'): void
    {
        $this->update([
            'followed_up_by' => $userId,
            'followed_up_at' => now(),
            'followup_notes' => $notes,
            'resolution_status' => $resolution,
        ]);
    }

    public function isPositive(): bool
    {
        return $this->rating && $this->rating >= 4;
    }

    public function isNegative(): bool
    {
        return $this->rating && $this->rating <= 3;
    }

    public function getSentimentLabel(): string
    {
        if (!$this->rating) {
            return 'pending';
        }

        return match (true) {
            $this->rating >= 5 => 'excellent',
            $this->rating >= 4 => 'good',
            $this->rating >= 3 => 'neutral',
            $this->rating >= 2 => 'poor',
            default => 'terrible',
        };
    }

    /**
     * Get external review links for this tenant
     */
    public function getExternalReviewLinks(): array
    {
        $settings = AutomationSettings::forTenant($this->tenant_id)->first();

        $links = [];

        if ($settings?->google_review_link) {
            $links['google'] = [
                'name' => 'Google',
                'url' => $settings->google_review_link,
                'posted' => $this->posted_google,
            ];
        }

        if ($settings?->tripadvisor_link) {
            $links['tripadvisor'] = [
                'name' => 'TripAdvisor',
                'url' => $settings->tripadvisor_link,
                'posted' => $this->posted_tripadvisor,
            ];
        }

        if ($settings?->facebook_page_link) {
            $links['facebook'] = [
                'name' => 'Facebook',
                'url' => $settings->facebook_page_link,
                'posted' => $this->posted_facebook,
            ];
        }

        return $links;
    }

    /**
     * Create review request for a completed booking
     */
    public static function createForBooking(Booking $booking): self
    {
        return self::create([
            'tenant_id' => $booking->tenant_id,
            'booking_id' => $booking->id,
            'member_id' => $booking->member_id,
            'status' => 'pending',
        ]);
    }
}
