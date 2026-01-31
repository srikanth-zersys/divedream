<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'channel',
        'cost_per_lead',
        'is_active',
        'tracking_params',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tracking_params' => 'array',
        'cost_per_lead' => 'decimal:2',
    ];

    // Source types
    public const TYPE_PAID = 'paid';
    public const TYPE_ORGANIC = 'organic';
    public const TYPE_REFERRAL = 'referral';
    public const TYPE_DIRECT = 'direct';
    public const TYPE_PARTNER = 'partner';

    // Channels
    public const CHANNEL_SEARCH = 'search';
    public const CHANNEL_SOCIAL = 'social';
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_DISPLAY = 'display';
    public const CHANNEL_VIDEO = 'video';
    public const CHANNEL_AFFILIATE = 'affiliate';

    // Default sources
    public const DEFAULT_SOURCES = [
        ['name' => 'Google Ads', 'type' => self::TYPE_PAID, 'channel' => self::CHANNEL_SEARCH, 'tracking_params' => ['utm_source' => 'google', 'utm_medium' => 'cpc']],
        ['name' => 'Google Organic', 'type' => self::TYPE_ORGANIC, 'channel' => self::CHANNEL_SEARCH, 'tracking_params' => ['utm_source' => 'google', 'utm_medium' => 'organic']],
        ['name' => 'Facebook Ads', 'type' => self::TYPE_PAID, 'channel' => self::CHANNEL_SOCIAL, 'tracking_params' => ['utm_source' => 'facebook', 'utm_medium' => 'cpc']],
        ['name' => 'Facebook Organic', 'type' => self::TYPE_ORGANIC, 'channel' => self::CHANNEL_SOCIAL, 'tracking_params' => ['utm_source' => 'facebook', 'utm_medium' => 'social']],
        ['name' => 'Instagram', 'type' => self::TYPE_ORGANIC, 'channel' => self::CHANNEL_SOCIAL, 'tracking_params' => ['utm_source' => 'instagram']],
        ['name' => 'TikTok', 'type' => self::TYPE_ORGANIC, 'channel' => self::CHANNEL_SOCIAL, 'tracking_params' => ['utm_source' => 'tiktok']],
        ['name' => 'Email Campaign', 'type' => self::TYPE_ORGANIC, 'channel' => self::CHANNEL_EMAIL, 'tracking_params' => ['utm_medium' => 'email']],
        ['name' => 'Referral', 'type' => self::TYPE_REFERRAL, 'channel' => null, 'tracking_params' => ['utm_source' => 'referral']],
        ['name' => 'Direct', 'type' => self::TYPE_DIRECT, 'channel' => null, 'tracking_params' => []],
        ['name' => 'TripAdvisor', 'type' => self::TYPE_PARTNER, 'channel' => null, 'tracking_params' => ['utm_source' => 'tripadvisor']],
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Match UTM parameters to find the appropriate source
     */
    public static function matchFromUtm(int $tenantId, array $utm): ?self
    {
        $sources = self::forTenant($tenantId)->active()->get();

        foreach ($sources as $source) {
            if ($source->matchesUtm($utm)) {
                return $source;
            }
        }

        // Return direct source as fallback
        return $sources->firstWhere('type', self::TYPE_DIRECT);
    }

    /**
     * Check if this source matches the given UTM parameters
     */
    public function matchesUtm(array $utm): bool
    {
        $tracking = $this->tracking_params ?? [];

        if (empty($tracking)) {
            return false;
        }

        foreach ($tracking as $key => $value) {
            if (!isset($utm[$key]) || strtolower($utm[$key]) !== strtolower($value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get lead count for this source
     */
    public function getLeadCount(): int
    {
        return $this->leads()->count();
    }

    /**
     * Get conversion rate for this source
     */
    public function getConversionRate(): float
    {
        $total = $this->leads()->count();
        if ($total === 0) {
            return 0;
        }

        $converted = $this->leads()->where('status', Lead::STATUS_CONVERTED)->count();
        return round(($converted / $total) * 100, 2);
    }

    /**
     * Get total revenue from this source
     */
    public function getTotalRevenue(): float
    {
        return $this->leads()
            ->where('status', Lead::STATUS_CONVERTED)
            ->sum('conversion_value');
    }

    /**
     * Calculate ROI if cost per lead is set
     */
    public function getROI(): ?float
    {
        if (!$this->cost_per_lead) {
            return null;
        }

        $totalCost = $this->leads()->count() * $this->cost_per_lead;
        $revenue = $this->getTotalRevenue();

        if ($totalCost === 0) {
            return null;
        }

        return round((($revenue - $totalCost) / $totalCost) * 100, 2);
    }

    /**
     * Create default sources for a tenant
     */
    public static function createDefaultsForTenant(int $tenantId): void
    {
        foreach (self::DEFAULT_SOURCES as $source) {
            self::create(array_merge($source, ['tenant_id' => $tenantId]));
        }
    }
}
