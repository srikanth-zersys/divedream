<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadScoringRule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeadScoringService
{
    /**
     * Score a lead activity using matching rules
     */
    public function scoreActivity(Lead $lead, LeadActivity $activity): int
    {
        $rules = LeadScoringRule::forTenant($lead->tenant_id)
            ->active()
            ->forEvent($activity->type)
            ->get();

        $totalPoints = 0;

        foreach ($rules as $rule) {
            if ($rule->appliesTo($activity)) {
                $points = $rule->calculatePoints($lead, $activity);
                if ($points !== 0) {
                    $totalPoints += $points;
                }
            }
        }

        if ($totalPoints !== 0) {
            $activity->update(['score_change' => $totalPoints]);
            $lead->adjustScore($totalPoints, $activity->type);
        }

        return $totalPoints;
    }

    /**
     * Recalculate a lead's entire score from activities
     */
    public function recalculateScore(Lead $lead): array
    {
        $breakdown = [];
        $total = 0;

        $activities = $lead->activities()
            ->orderBy('created_at')
            ->get();

        foreach ($activities as $activity) {
            $rules = LeadScoringRule::forTenant($lead->tenant_id)
                ->active()
                ->forEvent($activity->type)
                ->get();

            foreach ($rules as $rule) {
                if ($rule->appliesTo($activity)) {
                    $points = $rule->calculatePointsForRecalc($lead, $activity, $breakdown);
                    if ($points !== 0) {
                        $total += $points;
                        $breakdown[$activity->type] = ($breakdown[$activity->type] ?? 0) + $points;
                    }
                }
            }
        }

        $lead->setScore($total, $breakdown);

        return [
            'total' => $total,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Apply decay to inactive leads
     */
    public function applyDecay(int $tenantId): array
    {
        $results = [
            'processed' => 0,
            'decayed' => 0,
        ];

        // Weekly decay for leads inactive 7+ days
        $weeklyInactive = Lead::forTenant($tenantId)
            ->active()
            ->where('last_activity_at', '<', now()->subDays(7))
            ->where('last_activity_at', '>=', now()->subDays(14))
            ->where('score', '>', 0)
            ->get();

        $weeklyRule = LeadScoringRule::forTenant($tenantId)
            ->active()
            ->where('event_type', 'score_decay')
            ->first();

        if ($weeklyRule) {
            foreach ($weeklyInactive as $lead) {
                $this->applyDecayToLead($lead, $weeklyRule);
                $results['decayed']++;
            }
        }

        // Monthly decay for leads inactive 30+ days
        $monthlyInactive = Lead::forTenant($tenantId)
            ->active()
            ->where('last_activity_at', '<', now()->subDays(30))
            ->where('score', '>', 0)
            ->get();

        $monthlyRule = LeadScoringRule::forTenant($tenantId)
            ->active()
            ->where('event_type', 'score_decay_monthly')
            ->first();

        if ($monthlyRule) {
            foreach ($monthlyInactive as $lead) {
                $this->applyDecayToLead($lead, $monthlyRule);
                $results['decayed']++;
            }
        }

        $results['processed'] = $weeklyInactive->count() + $monthlyInactive->count();

        return $results;
    }

    protected function applyDecayToLead(Lead $lead, LeadScoringRule $rule): void
    {
        // Check if decay was already applied recently
        $recentDecay = $lead->activities()
            ->where('type', $rule->event_type)
            ->where('created_at', '>=', now()->subDays(7))
            ->exists();

        if ($recentDecay) {
            return;
        }

        $lead->recordActivity($rule->event_type, [
            'rule_id' => $rule->id,
            'rule_name' => $rule->name,
        ], $rule->points);
    }

    /**
     * Get scoring breakdown for a lead
     */
    public function getScoringBreakdown(Lead $lead): array
    {
        return [
            'current_score' => $lead->score,
            'qualification' => $lead->qualification,
            'breakdown' => $lead->score_breakdown ?? [],
            'recent_activities' => $lead->activities()
                ->where('score_change', '!=', 0)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn ($a) => [
                    'type' => $a->type,
                    'points' => $a->score_change,
                    'date' => $a->created_at->toDateTimeString(),
                    'description' => $a->description,
                ]),
        ];
    }

    /**
     * Get leads by score tier
     */
    public function getLeadsByTier(int $tenantId): array
    {
        return [
            'hot' => Lead::forTenant($tenantId)->hot()->active()->count(),
            'warm' => Lead::forTenant($tenantId)->warm()->active()->count(),
            'cold' => Lead::forTenant($tenantId)
                ->active()
                ->where('qualification', Lead::QUAL_COLD)
                ->count(),
            'unknown' => Lead::forTenant($tenantId)
                ->active()
                ->where('qualification', Lead::QUAL_UNKNOWN)
                ->count(),
        ];
    }

    /**
     * Get top scoring leads
     */
    public function getTopLeads(int $tenantId, int $limit = 10): Collection
    {
        return Lead::forTenant($tenantId)
            ->active()
            ->orderByDesc('score')
            ->limit($limit)
            ->get();
    }

    /**
     * Identify leads that need attention (high score but not converted)
     */
    public function getLeadsNeedingAttention(int $tenantId): Collection
    {
        return Lead::forTenant($tenantId)
            ->where('status', '!=', Lead::STATUS_CONVERTED)
            ->where('qualification', Lead::QUAL_HOT)
            ->where('last_activity_at', '>=', now()->subDays(7))
            ->orderByDesc('score')
            ->get();
    }

    /**
     * Calculate conversion likelihood based on score and behavior
     */
    public function calculateConversionLikelihood(Lead $lead): float
    {
        $factors = [];

        // Score factor (0-40 points)
        $scoreFactor = min(40, ($lead->score / Lead::SCORE_THRESHOLD_QUALIFIED) * 40);
        $factors['score'] = $scoreFactor;

        // Engagement recency (0-20 points)
        $daysSinceActivity = $lead->getDaysSinceLastActivity() ?? 999;
        $recencyFactor = match (true) {
            $daysSinceActivity <= 1 => 20,
            $daysSinceActivity <= 3 => 15,
            $daysSinceActivity <= 7 => 10,
            $daysSinceActivity <= 14 => 5,
            default => 0,
        };
        $factors['recency'] = $recencyFactor;

        // Email engagement (0-15 points)
        $emailFactor = 0;
        if ($lead->email_opens > 0) {
            $emailFactor += min(5, $lead->email_opens);
        }
        if ($lead->email_clicks > 0) {
            $emailFactor += min(10, $lead->email_clicks * 2);
        }
        $factors['email'] = $emailFactor;

        // Product interest (0-15 points)
        $productViews = count($lead->interested_products ?? []);
        $productFactor = min(15, $productViews * 5);
        $factors['products'] = $productFactor;

        // Profile completeness (0-10 points)
        $profileFactor = 0;
        if ($lead->phone) $profileFactor += 3;
        if ($lead->certification_level) $profileFactor += 4;
        if ($lead->country) $profileFactor += 3;
        $factors['profile'] = $profileFactor;

        $total = array_sum($factors);

        return min(100, $total);
    }

    /**
     * Get analytics for lead scoring effectiveness
     */
    public function getScoringAnalytics(int $tenantId): array
    {
        $leads = Lead::forTenant($tenantId)->get();
        $converted = $leads->where('status', Lead::STATUS_CONVERTED);

        // Average score at conversion
        $avgScoreAtConversion = $converted->avg('score') ?? 0;

        // Conversion rate by qualification
        $qualificationConversion = [];
        foreach ([Lead::QUAL_HOT, Lead::QUAL_WARM, Lead::QUAL_COLD, Lead::QUAL_UNKNOWN] as $qual) {
            $total = $leads->where('qualification', $qual)->count();
            $convertedInQual = $converted->where('qualification', $qual)->count();
            $qualificationConversion[$qual] = [
                'total' => $total,
                'converted' => $convertedInQual,
                'rate' => $total > 0 ? round(($convertedInQual / $total) * 100, 2) : 0,
            ];
        }

        // Time to conversion by score tier
        // Note: This would require more historical data to calculate accurately

        return [
            'total_leads' => $leads->count(),
            'total_converted' => $converted->count(),
            'overall_conversion_rate' => $leads->count() > 0
                ? round(($converted->count() / $leads->count()) * 100, 2)
                : 0,
            'avg_score_at_conversion' => round($avgScoreAtConversion, 1),
            'conversion_by_qualification' => $qualificationConversion,
            'leads_by_tier' => $this->getLeadsByTier($tenantId),
        ];
    }
}
