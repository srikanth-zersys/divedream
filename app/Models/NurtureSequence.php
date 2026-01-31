<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NurtureSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'trigger',
        'description',
        'is_active',
        'target_segments',
        'exclude_segments',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'target_segments' => 'array',
        'exclude_segments' => 'array',
    ];

    // Trigger types
    public const TRIGGER_SIGNUP = 'signup';
    public const TRIGGER_ABANDONED_BROWSE = 'abandoned_browse';
    public const TRIGGER_POST_BOOKING = 'post_booking';
    public const TRIGGER_BIRTHDAY = 'birthday';
    public const TRIGGER_RE_ENGAGEMENT = 're_engagement';
    public const TRIGGER_CERTIFICATION = 'certification';

    // Default welcome sequence
    public const WELCOME_SEQUENCE = [
        'name' => 'Welcome Series',
        'slug' => 'welcome',
        'trigger' => self::TRIGGER_SIGNUP,
        'description' => 'Welcome new subscribers and introduce them to diving opportunities',
        'steps' => [
            [
                'step_number' => 1,
                'name' => 'Welcome Email',
                'type' => 'email',
                'delay_days' => 0,
                'delay_hours' => 0,
                'email_template' => 'welcome-1',
                'email_subject' => 'Welcome to {tenant_name}! Your diving adventure starts here',
            ],
            [
                'step_number' => 2,
                'name' => 'Popular Experiences',
                'type' => 'email',
                'delay_days' => 2,
                'delay_hours' => 0,
                'email_template' => 'welcome-2',
                'email_subject' => 'Our most-loved diving experiences',
            ],
            [
                'step_number' => 3,
                'name' => 'First-Timer Tips',
                'type' => 'email',
                'delay_days' => 5,
                'delay_hours' => 0,
                'email_template' => 'welcome-3',
                'email_subject' => 'New to diving? Here\'s what you need to know',
            ],
            [
                'step_number' => 4,
                'name' => 'Special Offer',
                'type' => 'email',
                'delay_days' => 7,
                'delay_hours' => 0,
                'email_template' => 'welcome-4',
                'email_subject' => 'Your special welcome offer expires soon!',
                'goal_action' => 'booking',
                'end_on_goal' => true,
            ],
        ],
    ];

    // Re-engagement sequence
    public const REENGAGEMENT_SEQUENCE = [
        'name' => 'Re-engagement Series',
        'slug' => 're-engagement',
        'trigger' => self::TRIGGER_RE_ENGAGEMENT,
        'description' => 'Win back inactive leads who haven\'t engaged in 30+ days',
        'steps' => [
            [
                'step_number' => 1,
                'name' => 'We Miss You',
                'type' => 'email',
                'delay_days' => 0,
                'delay_hours' => 0,
                'email_template' => 'reengagement-1',
                'email_subject' => 'We miss you! Here\'s what\'s new',
            ],
            [
                'step_number' => 2,
                'name' => 'Special Comeback Offer',
                'type' => 'email',
                'delay_days' => 3,
                'delay_hours' => 0,
                'email_template' => 'reengagement-2',
                'email_subject' => 'A special offer just for you',
                'goal_action' => 'page_view',
                'end_on_goal' => true,
            ],
            [
                'step_number' => 3,
                'name' => 'Final Check-in',
                'type' => 'email',
                'delay_days' => 7,
                'delay_hours' => 0,
                'email_template' => 'reengagement-3',
                'email_subject' => 'Should we keep in touch?',
            ],
        ],
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(NurtureSequenceStep::class)->orderBy('step_number');
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTrigger($query, string $trigger)
    {
        return $query->where('trigger', $trigger);
    }

    /**
     * Get leads currently in this sequence
     */
    public function getActiveLeads()
    {
        return Lead::where('nurture_sequence', $this->slug)
            ->where('unsubscribed', false)
            ->where(function ($q) {
                $q->whereNull('nurture_paused_until')
                    ->orWhere('nurture_paused_until', '<=', now());
            })
            ->get();
    }

    /**
     * Get the step for a given step number
     */
    public function getStep(int $stepNumber): ?NurtureSequenceStep
    {
        return $this->steps()->where('step_number', $stepNumber)->first();
    }

    /**
     * Check if a lead should be enrolled in this sequence
     */
    public function shouldEnrollLead(Lead $lead): bool
    {
        // Check if already in a sequence
        if ($lead->isInSequence()) {
            return false;
        }

        // Check target segments
        if ($this->target_segments && !empty($this->target_segments)) {
            $match = false;
            foreach ($this->target_segments as $segment) {
                if ($this->leadMatchesSegment($lead, $segment)) {
                    $match = true;
                    break;
                }
            }
            if (!$match) {
                return false;
            }
        }

        // Check exclude segments
        if ($this->exclude_segments && !empty($this->exclude_segments)) {
            foreach ($this->exclude_segments as $segment) {
                if ($this->leadMatchesSegment($lead, $segment)) {
                    return false;
                }
            }
        }

        return true;
    }

    protected function leadMatchesSegment(Lead $lead, string $segment): bool
    {
        return match ($segment) {
            'hot' => $lead->qualification === Lead::QUAL_HOT,
            'warm' => $lead->qualification === Lead::QUAL_WARM,
            'cold' => $lead->qualification === Lead::QUAL_COLD,
            'new' => $lead->status === Lead::STATUS_NEW,
            'engaged' => $lead->status === Lead::STATUS_ENGAGED,
            'qualified' => $lead->status === Lead::STATUS_QUALIFIED,
            'converted' => $lead->status === Lead::STATUS_CONVERTED,
            'has_referral' => $lead->referred_by_id !== null,
            'certified' => $lead->certification_level !== null,
            'experienced' => ($lead->experience_dives ?? 0) > 10,
            default => false,
        };
    }

    /**
     * Create default sequences for a tenant
     */
    public static function createDefaultsForTenant(int $tenantId): void
    {
        foreach ([self::WELCOME_SEQUENCE, self::REENGAGEMENT_SEQUENCE] as $config) {
            $sequence = self::create([
                'tenant_id' => $tenantId,
                'name' => $config['name'],
                'slug' => $config['slug'],
                'trigger' => $config['trigger'],
                'description' => $config['description'],
                'is_active' => true,
            ]);

            foreach ($config['steps'] as $stepConfig) {
                $sequence->steps()->create($stepConfig);
            }
        }
    }
}
