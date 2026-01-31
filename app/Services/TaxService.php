<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Member;
use App\Models\Product;
use App\Models\TaxRate;
use App\Models\Tenant;

class TaxService
{
    /**
     * Calculate taxes for a booking
     *
     * Industry Best Practice:
     * - Apply tax on discounted amount, not original price
     * - Handle tax-inclusive vs exclusive pricing
     * - Support multiple tax rates (compound taxes)
     * - Check for exemptions (B2B, certain products)
     */
    public function calculateBookingTax(
        Tenant $tenant,
        float $subtotal,
        ?int $locationId = null,
        ?Product $product = null,
        ?Member $member = null
    ): array {
        // Find applicable tax rate
        $taxRate = TaxRate::findApplicable(
            $tenant->id,
            $locationId,
            $product?->type ?? 'all'
        );

        if (!$taxRate) {
            // Fallback to tenant's default tax rate
            return $this->calculateFallbackTax($tenant, $subtotal);
        }

        // Check for exemptions
        if ($product && $taxRate->isExempt($product)) {
            return $this->noTaxResult('Product is tax exempt');
        }

        if ($member && $taxRate->isExempt($member)) {
            return $this->noTaxResult('Customer is tax exempt');
        }

        // Check product-level tax exemption
        if ($product && $product->tax_exempt) {
            return $this->noTaxResult('Product is marked as tax exempt');
        }

        // Calculate tax
        return $this->calculateTaxAmount($taxRate, $subtotal, $tenant->prices_include_tax);
    }

    /**
     * Calculate tax amount with proper handling of inclusive/exclusive pricing
     */
    protected function calculateTaxAmount(TaxRate $taxRate, float $amount, bool $pricesIncludeTax): array
    {
        $taxIncluded = $taxRate->included_in_price || $pricesIncludeTax;

        if ($taxIncluded) {
            // Price includes tax - extract it
            $taxAmount = $taxRate->calculateTax($amount, true);
            $netAmount = round($amount - $taxAmount, 2);

            return [
                'tax_rate_id' => $taxRate->id,
                'tax_rate_name' => $taxRate->name,
                'tax_rate_percent' => (float) $taxRate->rate,
                'tax_amount' => $taxAmount,
                'net_amount' => $netAmount,
                'gross_amount' => $amount,
                'tax_included' => true,
                'tax_exempt' => false,
                'display_label' => $taxRate->getDisplayLabel(),
            ];
        }

        // Price excludes tax - add it
        $taxAmount = $taxRate->calculateTax($amount, false);
        $grossAmount = round($amount + $taxAmount, 2);

        return [
            'tax_rate_id' => $taxRate->id,
            'tax_rate_name' => $taxRate->name,
            'tax_rate_percent' => (float) $taxRate->rate,
            'tax_amount' => $taxAmount,
            'net_amount' => $amount,
            'gross_amount' => $grossAmount,
            'tax_included' => false,
            'tax_exempt' => false,
            'display_label' => $taxRate->getDisplayLabel(),
        ];
    }

    /**
     * Fallback to tenant's simple tax rate if no TaxRate records exist
     */
    protected function calculateFallbackTax(Tenant $tenant, float $subtotal): array
    {
        $taxRate = (float) ($tenant->tax_rate ?? 0);

        if ($taxRate <= 0) {
            return $this->noTaxResult('No tax rate configured');
        }

        if ($tenant->prices_include_tax) {
            $taxAmount = round($subtotal - ($subtotal / (1 + $taxRate / 100)), 2);
            $netAmount = round($subtotal - $taxAmount, 2);

            return [
                'tax_rate_id' => null,
                'tax_rate_name' => 'Tax',
                'tax_rate_percent' => $taxRate,
                'tax_amount' => $taxAmount,
                'net_amount' => $netAmount,
                'gross_amount' => $subtotal,
                'tax_included' => true,
                'tax_exempt' => false,
                'display_label' => "Tax ({$taxRate}%)",
            ];
        }

        $taxAmount = round($subtotal * ($taxRate / 100), 2);

        return [
            'tax_rate_id' => null,
            'tax_rate_name' => 'Tax',
            'tax_rate_percent' => $taxRate,
            'tax_amount' => $taxAmount,
            'net_amount' => $subtotal,
            'gross_amount' => round($subtotal + $taxAmount, 2),
            'tax_included' => false,
            'tax_exempt' => false,
            'display_label' => "Tax ({$taxRate}%)",
        ];
    }

    /**
     * Return structure for no-tax scenarios
     */
    protected function noTaxResult(string $reason): array
    {
        return [
            'tax_rate_id' => null,
            'tax_rate_name' => null,
            'tax_rate_percent' => 0,
            'tax_amount' => 0,
            'net_amount' => null, // Same as input
            'gross_amount' => null, // Same as input
            'tax_included' => false,
            'tax_exempt' => true,
            'exemption_reason' => $reason,
            'display_label' => null,
        ];
    }

    /**
     * Recalculate and update booking tax
     */
    public function recalculateBookingTax(Booking $booking): void
    {
        $tenant = $booking->tenant;
        $product = $booking->product;
        $member = $booking->member;

        // Calculate on discounted subtotal
        $taxableAmount = $booking->subtotal - ($booking->discount_amount ?? 0);

        $taxInfo = $this->calculateBookingTax(
            $tenant,
            $taxableAmount,
            $booking->location_id,
            $product,
            $member
        );

        $booking->update([
            'tax_rate_id' => $taxInfo['tax_rate_id'],
            'tax_amount' => $taxInfo['tax_amount'],
            'tax_exempt' => $taxInfo['tax_exempt'],
            'tax_exemption_reason' => $taxInfo['exemption_reason'] ?? null,
            'total_amount' => $taxableAmount + $taxInfo['tax_amount'],
        ]);
    }

    /**
     * Get tax breakdown for display (invoice, checkout, etc.)
     */
    public function getTaxBreakdown(Booking $booking): array
    {
        if ($booking->tax_exempt) {
            return [
                'subtotal' => $booking->subtotal,
                'discount' => $booking->discount_amount ?? 0,
                'taxable_amount' => $booking->subtotal - ($booking->discount_amount ?? 0),
                'taxes' => [],
                'total_tax' => 0,
                'total' => $booking->total_amount,
                'note' => $booking->tax_exemption_reason,
            ];
        }

        $taxRate = $booking->taxRate;

        return [
            'subtotal' => $booking->subtotal,
            'discount' => $booking->discount_amount ?? 0,
            'taxable_amount' => $booking->subtotal - ($booking->discount_amount ?? 0),
            'taxes' => $taxRate ? [[
                'name' => $taxRate->name,
                'rate' => $taxRate->rate,
                'amount' => $booking->tax_amount,
                'included' => $taxRate->included_in_price,
                'registration' => $taxRate->registration_number,
            ]] : [],
            'total_tax' => $booking->tax_amount,
            'total' => $booking->total_amount,
        ];
    }

    /**
     * Validate tax configuration for a tenant
     */
    public function validateTenantTaxConfig(Tenant $tenant): array
    {
        $issues = [];
        $warnings = [];

        // Check if any tax rate is configured
        $taxRates = TaxRate::forTenant($tenant->id)->active()->get();

        if ($taxRates->isEmpty() && !$tenant->tax_rate) {
            $warnings[] = 'No tax rate configured. All bookings will have 0% tax.';
        }

        // Check for multiple default rates
        $defaults = $taxRates->where('is_default', true);
        if ($defaults->count() > 1) {
            $issues[] = 'Multiple default tax rates found. Only one should be default.';
        }

        // Check for tax registration
        if ($taxRates->isNotEmpty() && !$tenant->tax_registration_number) {
            $warnings[] = 'Tax rates configured but no tax registration number set.';
        }

        return [
            'valid' => empty($issues),
            'issues' => $issues,
            'warnings' => $warnings,
            'tax_rates_count' => $taxRates->count(),
            'has_default' => $defaults->isNotEmpty(),
        ];
    }
}
