<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadScoringRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'category',
        'event_type',
        'points',
        'max_points_per_day',
        'conditions',
        'one_time',
        'is_active',
    ];

    protected $casts = [
        'conditions' => 'array',
        'one_time' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Categories
    public const CATEGORY_ENGAGEMENT = 'engagement';
    public const CATEGORY_PROFILE = 'profile';
    public const CATEGORY_BEHAVIOR = 'behavior';
    public const CATEGORY_DECAY = 'decay';

    // Default scoring rules
    public const DEFAULT_RULES = [
        // Engagement
        ['name' => 'Page View', 'category' => self::CATEGORY_ENGAGEMENT, 'event_type' => 'page_view', 'points' => 1, 'max_points_per_day' => 10],
        ['name' => 'Product View', 'category' => self::CATEGORY_ENGAGEMENT, 'event_type' => 'product_view', 'points' => 5, 'max_points_per_day' => 25],
        ['name' => 'Email Open', 'category' => self::CATEGORY_ENGAGEMENT, 'event_type' => 'email_open', 'points' => 2, 'max_points_per_day' => 10],
        ['name' => 'Email Click', 'category' => self::CATEGORY_ENGAGEMENT, 'event_type' => 'email_click', 'points' => 5, 'max_points_per_day' => 20],
        ['name' => 'Form Submission', 'category' => self::CATEGORY_ENGAGEMENT, 'event_type' => 'form_submit', 'points' => 10, 'max_points_per_day' => 30],

        // Behavior (high intent)
        ['name' => 'Pricing Page View', 'category' => self::CATEGORY_BEHAVIOR, 'event_type' => 'page_view', 'points' => 10, 'conditions' => ['url_contains' => 'pricing']],
        ['name' => 'Schedule Page View', 'category' => self::CATEGORY_BEHAVIOR, 'event_type' => 'page_view', 'points' => 10, 'conditions' => ['url_contains' => 'schedule']],
        ['name' => 'Cart Add', 'category' => self::CATEGORY_BEHAVIOR, 'event_type' => 'cart_add', 'points' => 15],
        ['name' => 'Checkout Start', 'category' => self::CATEGORY_BEHAVIOR, 'event_type' => 'checkout_start', 'points' => 25],

        // Profile completeness
        ['name' => 'Provided Phone', 'category' => self::CATEGORY_PROFILE, 'event_type' => 'profile_phone', 'points' => 5, 'one_time' => true],
        ['name' => 'Provided Certification', 'category' => self::CATEGORY_PROFILE, 'event_type' => 'profile_certification', 'points' => 10, 'one_time' => true],
        ['name' => 'Provided Location', 'category' => self::CATEGORY_PROFILE, 'event_type' => 'profile_location', 'points' => 5, 'one_time' => true],

        // Decay (applied periodically)
        ['name' => 'Weekly Inactivity Decay', 'category' => self::CATEGORY_DECAY, 'event_type' => 'score_decay', 'points' => -5],
        ['name' => 'Monthly Inactivity Decay', 'category' => self::CATEGORY_DECAY, 'event_type' => 'score_decay_monthly', 'points' => -15],
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEvent($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    public function scopeForCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Check if this rule applies to a given activity
     */
    public function appliesTo(LeadActivity $activity): bool
    {
        if ($this->event_type !== $activity->type) {
            return false;
        }

        // Check conditions
        if ($this->conditions && !empty($this->conditions)) {
            return $this->evaluateConditions($activity);
        }

        return true;
    }

    protected function evaluateConditions(LeadActivity $activity): bool
    {
        $properties = $activity->properties ?? [];

        foreach ($this->conditions as $key => $value) {
            switch ($key) {
                case 'url_contains':
                    $url = $properties['url'] ?? '';
                    if (!str_contains(strtolower($url), strtolower($value))) {
                        return false;
                    }
                    break;

                case 'url_matches':
                    $url = $properties['url'] ?? '';
                    if (!preg_match($value, $url)) {
                        return false;
                    }
                    break;

                case 'property_equals':
                    [$prop, $expected] = explode(':', $value);
                    if (($properties[$prop] ?? null) != $expected) {
                        return false;
                    }
                    break;

                case 'product_id':
                    if (($properties['product_id'] ?? null) != $value) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    /**
     * Calculate points for a lead activity
     */
    public function calculatePoints(Lead $lead, LeadActivity $activity): int
    {
        // Check one-time rule
        if ($this->one_time) {
            $alreadyApplied = $lead->activities()
                ->where('type', $this->event_type)
                ->where('score_change', '>', 0)
                ->exists();

            if ($alreadyApplied) {
                return 0;
            }
        }

        // Check daily max
        if ($this->max_points_per_day) {
            $todayPoints = $lead->activities()
                ->where('type', $this->event_type)
                ->whereDate('created_at', today())
                ->sum('score_change');

            $remaining = $this->max_points_per_day - $todayPoints;
            if ($remaining <= 0) {
                return 0;
            }

            return min($this->points, $remaining);
        }

        return $this->points;
    }

    /**
     * Create default rules for a tenant
     */
    public static function createDefaultsForTenant(int $tenantId): void
    {
        foreach (self::DEFAULT_RULES as $rule) {
            self::create(array_merge($rule, [
                'tenant_id' => $tenantId,
                'is_active' => true,
            ]));
        }
    }
}
