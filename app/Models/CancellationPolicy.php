<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CancellationPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'product_id',
        'name',
        'description',
        'type',
        'refund_tiers',
        'no_show_fee_percent',
        'allow_reschedule',
        'reschedule_fee_percent',
        'weather_cancellation_allowed',
        'weather_refund_percent',
        'weather_policy_text',
        'customer_facing_text',
        'internal_notes',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'refund_tiers' => 'array',
        'no_show_fee_percent' => 'decimal:2',
        'allow_reschedule' => 'boolean',
        'weather_cancellation_allowed' => 'boolean',
        'weather_refund_percent' => 'decimal:2',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    // Industry-standard policy templates
    const POLICY_FLEXIBLE = [
        ['hours_before' => 24, 'refund_percent' => 100],
        ['hours_before' => 0, 'refund_percent' => 50],
    ];

    const POLICY_MODERATE = [
        ['hours_before' => 72, 'refund_percent' => 100],
        ['hours_before' => 24, 'refund_percent' => 50],
        ['hours_before' => 0, 'refund_percent' => 0],
    ];

    const POLICY_STRICT = [
        ['hours_before' => 168, 'refund_percent' => 100], // 7 days
        ['hours_before' => 72, 'refund_percent' => 50],
        ['hours_before' => 24, 'refund_percent' => 25],
        ['hours_before' => 0, 'refund_percent' => 0],
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Refund Calculation

    /**
     * Calculate refund amount based on cancellation timing
     *
     * @param float $totalAmount The total booking amount
     * @param Carbon $activityDate When the activity is scheduled
     * @param Carbon|null $cancellationDate When the cancellation is requested (default: now)
     * @param bool $isWeatherCancellation Whether this is due to weather
     * @return array{refund_amount: float, refund_percent: int, fee_amount: float, tier_applied: string}
     */
    public function calculateRefund(
        float $totalAmount,
        Carbon $activityDate,
        ?Carbon $cancellationDate = null,
        bool $isWeatherCancellation = false
    ): array {
        $cancellationDate = $cancellationDate ?? now();

        // Weather cancellation - special handling
        if ($isWeatherCancellation && $this->weather_cancellation_allowed) {
            $refundPercent = (float) $this->weather_refund_percent;
            $refundAmount = round($totalAmount * ($refundPercent / 100), 2);

            return [
                'refund_amount' => $refundAmount,
                'refund_percent' => (int) $refundPercent,
                'fee_amount' => round($totalAmount - $refundAmount, 2),
                'tier_applied' => 'weather_cancellation',
                'reason' => 'Weather cancellation policy applied',
            ];
        }

        // Calculate hours until activity
        $hoursUntilActivity = $cancellationDate->diffInHours($activityDate, false);

        // If activity is in the past, no refund
        if ($hoursUntilActivity < 0) {
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'fee_amount' => $totalAmount,
                'tier_applied' => 'past_activity',
                'reason' => 'Activity date has passed',
            ];
        }

        // Find applicable tier
        $tiers = $this->refund_tiers ?? [];
        usort($tiers, fn($a, $b) => $b['hours_before'] <=> $a['hours_before']);

        $refundPercent = 0;
        $tierApplied = 'no_tier_matched';

        foreach ($tiers as $tier) {
            if ($hoursUntilActivity >= $tier['hours_before']) {
                $refundPercent = $tier['refund_percent'];
                $tierApplied = "{$tier['hours_before']}h_before";
                break;
            }
        }

        $refundAmount = round($totalAmount * ($refundPercent / 100), 2);

        return [
            'refund_amount' => $refundAmount,
            'refund_percent' => (int) $refundPercent,
            'fee_amount' => round($totalAmount - $refundAmount, 2),
            'tier_applied' => $tierApplied,
            'hours_until_activity' => $hoursUntilActivity,
            'reason' => $this->getRefundReason($refundPercent, $hoursUntilActivity),
        ];
    }

    /**
     * Calculate no-show fee
     */
    public function calculateNoShowFee(float $totalAmount): array
    {
        $feePercent = (float) $this->no_show_fee_percent;
        $feeAmount = round($totalAmount * ($feePercent / 100), 2);

        return [
            'fee_amount' => $feeAmount,
            'fee_percent' => (int) $feePercent,
            'refund_amount' => round($totalAmount - $feeAmount, 2),
        ];
    }

    /**
     * Calculate reschedule fee
     */
    public function calculateRescheduleFee(float $totalAmount): array
    {
        if (!$this->allow_reschedule) {
            return [
                'allowed' => false,
                'fee_amount' => 0,
                'fee_percent' => 0,
            ];
        }

        $feePercent = $this->reschedule_fee_percent;
        $feeAmount = round($totalAmount * ($feePercent / 100), 2);

        return [
            'allowed' => true,
            'fee_amount' => $feeAmount,
            'fee_percent' => $feePercent,
        ];
    }

    /**
     * Get human-readable refund reason
     */
    protected function getRefundReason(int $refundPercent, int $hoursUntilActivity): string
    {
        if ($refundPercent === 100) {
            return "Full refund - Cancelled more than {$hoursUntilActivity} hours before activity";
        }

        if ($refundPercent === 0) {
            return "No refund - Cancelled with less than {$hoursUntilActivity} hours notice";
        }

        return "{$refundPercent}% refund - Cancelled {$hoursUntilActivity} hours before activity";
    }

    /**
     * Get customer-facing policy summary
     */
    public function getPolicySummary(): string
    {
        if ($this->customer_facing_text) {
            return $this->customer_facing_text;
        }

        $tiers = $this->refund_tiers ?? [];
        usort($tiers, fn($a, $b) => $b['hours_before'] <=> $a['hours_before']);

        $lines = ["Cancellation Policy ({$this->name}):"];

        foreach ($tiers as $tier) {
            $hours = $tier['hours_before'];
            $percent = $tier['refund_percent'];

            if ($hours >= 24) {
                $days = floor($hours / 24);
                $timeText = $days === 1 ? '1 day' : "{$days} days";
            } else {
                $timeText = "{$hours} hours";
            }

            if ($percent === 100) {
                $lines[] = "- Free cancellation up to {$timeText} before";
            } elseif ($percent === 0) {
                $lines[] = "- No refund within {$timeText} of activity";
            } else {
                $lines[] = "- {$percent}% refund within {$timeText} of activity";
            }
        }

        $lines[] = "- No-show: {$this->no_show_fee_percent}% fee";

        if ($this->allow_reschedule) {
            $lines[] = "- Rescheduling allowed" . ($this->reschedule_fee_percent > 0 ? " ({$this->reschedule_fee_percent}% fee)" : " (free)");
        }

        if ($this->weather_cancellation_allowed) {
            $lines[] = "- Weather cancellation: {$this->weather_refund_percent}% refund";
        }

        return implode("\n", $lines);
    }

    /**
     * Find the best applicable policy for a booking
     */
    public static function findApplicable(
        int $tenantId,
        ?int $locationId = null,
        ?int $productId = null
    ): ?self {
        // Priority: Product > Location > Tenant default
        return static::active()
            ->forTenant($tenantId)
            ->where(function ($query) use ($locationId, $productId) {
                $query->where('product_id', $productId)
                    ->orWhere('location_id', $locationId)
                    ->orWhere(function ($q) {
                        $q->whereNull('product_id')->whereNull('location_id');
                    });
            })
            ->orderByRaw('product_id IS NULL ASC')
            ->orderByRaw('location_id IS NULL ASC')
            ->orderBy('is_default', 'desc')
            ->first();
    }

    /**
     * Create a policy from a template type
     */
    public static function createFromTemplate(
        int $tenantId,
        string $type,
        string $name = null
    ): self {
        $tiers = match ($type) {
            'flexible' => self::POLICY_FLEXIBLE,
            'moderate' => self::POLICY_MODERATE,
            'strict' => self::POLICY_STRICT,
            default => self::POLICY_MODERATE,
        };

        return new self([
            'tenant_id' => $tenantId,
            'name' => $name ?? ucfirst($type) . ' Policy',
            'type' => $type,
            'refund_tiers' => $tiers,
            'no_show_fee_percent' => 100,
            'allow_reschedule' => true,
            'reschedule_fee_percent' => $type === 'flexible' ? 0 : ($type === 'moderate' ? 10 : 25),
            'weather_cancellation_allowed' => true,
            'weather_refund_percent' => 100,
            'is_active' => true,
        ]);
    }
}
