<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Quote;
use App\Models\QuoteActivity;
use App\Models\QuoteTemplate;
use App\Models\Tenant;
use App\Mail\QuoteSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class QuoteService
{
    /**
     * Create a new quote
     */
    public function createQuote(Tenant $tenant, array $data, ?int $userId = null): Quote
    {
        return DB::transaction(function () use ($tenant, $data, $userId) {
            $quote = Quote::create([
                'tenant_id' => $tenant->id,
                'location_id' => $data['location_id'] ?? null,
                'created_by' => $userId ?? auth()->id(),
                'customer_type' => $data['customer_type'] ?? 'individual',
                'company_name' => $data['company_name'] ?? null,
                'contact_name' => $data['contact_name'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'valid_until' => $data['valid_until'] ?? now()->addDays(14),
                'proposed_dates' => $data['proposed_dates'] ?? null,
                'expected_participants' => $data['expected_participants'] ?? 1,
                'discount_percent' => $data['discount_percent'] ?? 0,
                'tax_rate' => $tenant->tax_rate ?? 0,
                'deposit_required' => $data['deposit_required'] ?? false,
                'deposit_percent' => $data['deposit_percent'] ?? 0,
                'payment_terms' => $data['payment_terms'] ?? null,
                'terms_and_conditions' => $data['terms_and_conditions'] ?? $tenant->default_terms,
                'cancellation_policy' => $data['cancellation_policy'] ?? $this->getDefaultCancellationPolicy($tenant),
                'notes' => $data['notes'] ?? null,
                'customer_notes' => $data['customer_notes'] ?? null,
                'currency' => $tenant->currency ?? 'USD',
            ]);

            // Add items if provided
            if (!empty($data['items'])) {
                foreach ($data['items'] as $index => $item) {
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

            // Log activity
            QuoteActivity::log($quote, QuoteActivity::TYPE_CREATED);

            return $quote;
        });
    }

    /**
     * Create quote from template
     */
    public function createFromTemplate(QuoteTemplate $template, array $customerData): Quote
    {
        $quote = $template->createQuote($customerData);
        QuoteActivity::log($quote, QuoteActivity::TYPE_CREATED, 'Quote created from template: ' . $template->name);
        return $quote;
    }

    /**
     * Update a quote
     */
    public function updateQuote(Quote $quote, array $data): Quote
    {
        return DB::transaction(function () use ($quote, $data) {
            $oldData = $quote->toArray();

            $quote->update($data);

            // Handle items update if provided
            if (isset($data['items'])) {
                // Remove existing items
                $quote->items()->delete();

                // Add new items
                foreach ($data['items'] as $index => $item) {
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

            // Log activity
            QuoteActivity::log($quote, QuoteActivity::TYPE_UPDATED, null, [
                'changes' => $this->getChangedFields($oldData, $quote->toArray()),
            ]);

            return $quote->fresh(['items']);
        });
    }

    /**
     * Send quote to customer
     */
    public function sendQuote(Quote $quote): bool
    {
        try {
            // Send email
            Mail::to($quote->contact_email)->send(new QuoteSent($quote));

            // Update quote status
            $quote->markAsSent();

            // Log activity
            QuoteActivity::log($quote, QuoteActivity::TYPE_SENT, 'Quote sent to ' . $quote->contact_email);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send quote', [
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Resend quote to customer
     */
    public function resendQuote(Quote $quote): bool
    {
        try {
            Mail::to($quote->contact_email)->send(new QuoteSent($quote));

            QuoteActivity::log($quote, QuoteActivity::TYPE_RESENT, 'Quote resent to ' . $quote->contact_email);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to resend quote', [
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Record customer viewing the quote (called from public link)
     */
    public function recordView(Quote $quote, ?string $ipAddress = null): void
    {
        if (!$quote->viewed_at) {
            $quote->markAsViewed();
        }

        QuoteActivity::log($quote, QuoteActivity::TYPE_VIEWED, 'Customer viewed the quote', [
            'ip_address' => $ipAddress ?? request()->ip(),
        ], null);
    }

    /**
     * Accept quote
     */
    public function acceptQuote(Quote $quote, ?string $customerNotes = null): void
    {
        $quote->markAsAccepted();

        if ($customerNotes) {
            $quote->update(['customer_notes' => $customerNotes]);
        }

        QuoteActivity::log($quote, QuoteActivity::TYPE_ACCEPTED, 'Customer accepted the quote', [
            'customer_notes' => $customerNotes,
        ], null);
    }

    /**
     * Reject quote
     */
    public function rejectQuote(Quote $quote, ?string $reason = null): void
    {
        $quote->markAsRejected($reason);

        QuoteActivity::log($quote, QuoteActivity::TYPE_REJECTED, 'Customer rejected the quote', [
            'reason' => $reason,
        ], null);
    }

    /**
     * Convert quote to booking
     */
    public function convertToBooking(Quote $quote, array $bookingData = []): Booking
    {
        return DB::transaction(function () use ($quote, $bookingData) {
            $booking = $quote->convertToBooking($bookingData);

            QuoteActivity::log($quote, QuoteActivity::TYPE_CONVERTED, 'Quote converted to booking #' . $booking->booking_number, [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
            ]);

            return $booking;
        });
    }

    /**
     * Mark expired quotes
     */
    public function processExpiredQuotes(): int
    {
        $expiredQuotes = Quote::whereIn('status', ['draft', 'sent', 'viewed'])
            ->where('valid_until', '<', now())
            ->get();

        foreach ($expiredQuotes as $quote) {
            $quote->update(['status' => 'expired']);
            QuoteActivity::log($quote, QuoteActivity::TYPE_EXPIRED);
        }

        return $expiredQuotes->count();
    }

    /**
     * Add item to quote
     */
    public function addItem(Quote $quote, array $itemData): void
    {
        $item = $quote->items()->create([
            'product_id' => $itemData['product_id'] ?? null,
            'name' => $itemData['name'],
            'description' => $itemData['description'] ?? null,
            'quantity' => $itemData['quantity'] ?? 1,
            'unit_price' => $itemData['unit_price'],
            'discount_percent' => $itemData['discount_percent'] ?? 0,
            'sort_order' => $quote->items()->count(),
        ]);

        QuoteActivity::log($quote, QuoteActivity::TYPE_ITEM_ADDED, 'Added item: ' . $item->name, [
            'item_id' => $item->id,
            'item_name' => $item->name,
        ]);
    }

    /**
     * Remove item from quote
     */
    public function removeItem(Quote $quote, int $itemId): void
    {
        $item = $quote->items()->findOrFail($itemId);
        $itemName = $item->name;
        $item->delete();

        QuoteActivity::log($quote, QuoteActivity::TYPE_ITEM_REMOVED, 'Removed item: ' . $itemName, [
            'item_id' => $itemId,
            'item_name' => $itemName,
        ]);
    }

    /**
     * Get default cancellation policy for tenant
     */
    protected function getDefaultCancellationPolicy(Tenant $tenant): string
    {
        $hours = $tenant->free_cancellation_hours ?? 48;
        $lateFee = $tenant->late_cancellation_fee_percent ?? 50;

        return "Cancellation Policy:\n" .
            "• Free cancellation up to {$hours} hours before the activity\n" .
            "• Cancellations within {$hours} hours: {$lateFee}% fee applies\n" .
            "• No-shows: No refund";
    }

    /**
     * Get changed fields between old and new data
     */
    protected function getChangedFields(array $old, array $new): array
    {
        $changes = [];
        $trackFields = ['title', 'description', 'valid_until', 'discount_percent', 'total_amount', 'status'];

        foreach ($trackFields as $field) {
            if (isset($old[$field]) && isset($new[$field]) && $old[$field] != $new[$field]) {
                $changes[$field] = [
                    'old' => $old[$field],
                    'new' => $new[$field],
                ];
            }
        }

        return $changes;
    }

    /**
     * Get quote statistics for tenant
     */
    public function getStatistics(Tenant $tenant, ?string $period = 'month'): array
    {
        $startDate = match ($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $quotes = Quote::forTenant($tenant->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $sent = $quotes->whereIn('status', ['sent', 'viewed', 'accepted', 'rejected', 'converted']);
        $converted = $quotes->where('status', 'converted');

        return [
            'total_quotes' => $quotes->count(),
            'draft_quotes' => $quotes->where('status', 'draft')->count(),
            'sent_quotes' => $sent->count(),
            'converted_quotes' => $converted->count(),
            'conversion_rate' => $sent->count() > 0
                ? round(($converted->count() / $sent->count()) * 100, 1)
                : 0,
            'total_value' => $quotes->sum('total_amount'),
            'converted_value' => $converted->sum('total_amount'),
            'average_quote_value' => $quotes->count() > 0
                ? round($quotes->avg('total_amount'), 2)
                : 0,
            'period' => $period,
        ];
    }
}
