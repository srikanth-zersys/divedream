<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuoteViewController extends Controller
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    /**
     * Display the public quote page
     */
    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $quote = Quote::where('access_token', $token)
            ->with(['items.product', 'tenant', 'location'])
            ->first();

        if (!$quote) {
            abort(404, 'Quote not found');
        }

        // Record view (only if not already viewed)
        $this->quoteService->recordView($quote, $request->ip());

        // Check if expired
        $isExpired = $quote->isExpired();

        return Inertia::render('public/quotes/view', [
            'quote' => $quote,
            'tenant' => $quote->tenant->only(['name', 'logo', 'phone', 'email', 'website', 'address', 'currency']),
            'isExpired' => $isExpired,
            'canRespond' => in_array($quote->status, ['sent', 'viewed']),
        ]);
    }

    /**
     * Accept the quote
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $quote = Quote::where('access_token', $token)->firstOrFail();

        if (!in_array($quote->status, ['sent', 'viewed'])) {
            return back()->with('error', 'This quote can no longer be accepted.');
        }

        if ($quote->isExpired()) {
            return back()->with('error', 'This quote has expired. Please contact us for an updated quote.');
        }

        $validated = $request->validate([
            'customer_notes' => 'nullable|string|max:1000',
        ]);

        $this->quoteService->acceptQuote($quote, $validated['customer_notes'] ?? null);

        return back()->with('success', 'Thank you! Your quote has been accepted. We will contact you shortly to finalize your booking.');
    }

    /**
     * Reject the quote
     */
    public function reject(Request $request, string $token): RedirectResponse
    {
        $quote = Quote::where('access_token', $token)->firstOrFail();

        if (!in_array($quote->status, ['sent', 'viewed'])) {
            return back()->with('error', 'This quote can no longer be modified.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $this->quoteService->rejectQuote($quote, $validated['reason'] ?? null);

        return back()->with('success', 'Quote declined. Thank you for considering us.');
    }

    /**
     * Request changes to the quote
     */
    public function requestChanges(Request $request, string $token): RedirectResponse
    {
        $quote = Quote::where('access_token', $token)->firstOrFail();

        if (!in_array($quote->status, ['sent', 'viewed'])) {
            return back()->with('error', 'This quote can no longer be modified.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        // Update customer notes with the change request
        $quote->update([
            'customer_notes' => ($quote->customer_notes ? $quote->customer_notes . "\n\n" : '') .
                "Change Request (" . now()->format('M d, Y') . "):\n" . $validated['message'],
        ]);

        // Log the activity
        \App\Models\QuoteActivity::log(
            $quote,
            'change_requested',
            'Customer requested changes to the quote',
            ['message' => $validated['message']],
            null
        );

        // TODO: Send notification to admin

        return back()->with('success', 'Your change request has been submitted. We will update the quote and send you a revised version.');
    }

    /**
     * Download quote as PDF
     */
    public function download(string $token)
    {
        $quote = Quote::where('access_token', $token)
            ->with(['items.product', 'tenant', 'location'])
            ->firstOrFail();

        // TODO: Implement PDF generation
        // For now, redirect back with a message
        return back()->with('info', 'PDF download feature coming soon.');
    }
}
