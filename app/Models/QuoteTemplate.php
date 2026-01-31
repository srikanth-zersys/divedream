<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'customer_type',
        'default_title',
        'default_description',
        'default_validity_days',
        'default_terms',
        'default_cancellation_policy',
        'default_discount_percent',
        'default_deposit_required',
        'default_deposit_percent',
        'default_items',
        'is_active',
    ];

    protected $casts = [
        'default_items' => 'array',
        'default_discount_percent' => 'decimal:2',
        'default_deposit_required' => 'boolean',
        'default_deposit_percent' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
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

    public function scopeForCustomerType($query, string $customerType)
    {
        return $query->where('customer_type', $customerType)
            ->orWhereNull('customer_type');
    }

    // Helper methods

    /**
     * Create a new quote from this template
     */
    public function createQuote(array $customerData): Quote
    {
        $quote = Quote::create([
            'tenant_id' => $this->tenant_id,
            'title' => $this->default_title ?? 'Quote',
            'description' => $this->default_description,
            'valid_until' => now()->addDays($this->default_validity_days),
            'terms_and_conditions' => $this->default_terms,
            'cancellation_policy' => $this->default_cancellation_policy,
            'discount_percent' => $this->default_discount_percent,
            'deposit_required' => $this->default_deposit_required,
            'deposit_percent' => $this->default_deposit_percent,
            ...$customerData,
        ]);

        // Add default items if any
        if (!empty($this->default_items)) {
            foreach ($this->default_items as $index => $item) {
                $quote->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'name' => $item['name'],
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_price' => $item['unit_price'],
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return $quote;
    }
}
