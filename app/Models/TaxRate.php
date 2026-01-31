<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'code',
        'rate',
        'type',
        'fixed_amount',
        'applies_to',
        'is_compound',
        'priority',
        'included_in_price',
        'show_on_invoice',
        'registration_number',
        'jurisdiction',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'rate' => 'decimal:3',
        'fixed_amount' => 'decimal:2',
        'is_compound' => 'boolean',
        'included_in_price' => 'boolean',
        'show_on_invoice' => 'boolean',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
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

    public function exemptions(): HasMany
    {
        return $this->hasMany(TaxExemption::class);
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

    public function scopeForLocation($query, ?int $locationId)
    {
        return $query->where(function ($q) use ($locationId) {
            $q->whereNull('location_id')
                ->orWhere('location_id', $locationId);
        });
    }

    public function scopeAppliesTo($query, string $type)
    {
        return $query->where(function ($q) use ($type) {
            $q->where('applies_to', 'all')
                ->orWhere('applies_to', $type);
        });
    }

    // Calculation Methods

    /**
     * Calculate tax amount for a given subtotal
     */
    public function calculateTax(float $subtotal, bool $reverseCalculation = false): float
    {
        if ($this->type === 'fixed') {
            return (float) $this->fixed_amount;
        }

        $rate = (float) $this->rate;

        if ($reverseCalculation && $this->included_in_price) {
            // Extract tax from tax-inclusive price
            // Formula: tax = price - (price / (1 + rate/100))
            return round($subtotal - ($subtotal / (1 + $rate / 100)), 2);
        }

        // Standard tax calculation
        return round($subtotal * ($rate / 100), 2);
    }

    /**
     * Get the net amount (excluding tax) from a tax-inclusive price
     */
    public function getNetAmount(float $grossAmount): float
    {
        if (!$this->included_in_price || $this->type === 'fixed') {
            return $grossAmount;
        }

        $rate = (float) $this->rate;
        return round($grossAmount / (1 + $rate / 100), 2);
    }

    /**
     * Get the gross amount (including tax) from a net price
     */
    public function getGrossAmount(float $netAmount): float
    {
        if ($this->type === 'fixed') {
            return $netAmount + (float) $this->fixed_amount;
        }

        $rate = (float) $this->rate;
        return round($netAmount * (1 + $rate / 100), 2);
    }

    /**
     * Check if a product/member is exempt from this tax
     */
    public function isExempt(Model $entity): bool
    {
        return $this->exemptions()
            ->where('exemptable_type', get_class($entity))
            ->where('exemptable_id', $entity->id)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->exists();
    }

    /**
     * Get display label for invoices
     */
    public function getDisplayLabel(): string
    {
        if ($this->type === 'fixed') {
            return $this->name;
        }

        return "{$this->name} ({$this->rate}%)";
    }

    /**
     * Find the best applicable tax rate for a booking
     */
    public static function findApplicable(
        int $tenantId,
        ?int $locationId = null,
        string $productType = 'all'
    ): ?self {
        // Priority: Location-specific > Tenant default
        return static::active()
            ->forTenant($tenantId)
            ->forLocation($locationId)
            ->appliesTo($productType)
            ->orderByRaw('location_id IS NULL ASC') // Location-specific first
            ->orderBy('is_default', 'desc')
            ->orderBy('priority', 'desc')
            ->first();
    }
}
