<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteTemplate;
use App\Services\QuoteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    /**
     * Display a listing of quotes
     */
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant;

        $quotes = Quote::forTenant($tenant->id)
            ->with(['location', 'createdBy'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('quote_number', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%")
                        ->orWhere('contact_email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->customer_type, function ($query, $type) {
                $query->where('customer_type', $type);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $statistics = $this->quoteService->getStatistics($tenant, $request->period ?? 'month');

        return Inertia::render('admin/quotes/index', [
            'quotes' => $quotes,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'status', 'customer_type', 'period']),
        ]);
    }

    /**
     * Show form for creating a new quote
     */
    public function create(Request $request): Response
    {
        $tenant = $request->user()->tenant;

        return Inertia::render('admin/quotes/create', [
            'locations' => Location::forTenant($tenant->id)->active()->get(),
            'products' => Product::forTenant($tenant->id)->active()->get(),
            'templates' => QuoteTemplate::forTenant($tenant->id)->active()->get(),
            'tenant' => $tenant->only(['currency', 'tax_rate', 'free_cancellation_hours']),
        ]);
    }

    /**
     * Store a newly created quote
     */
    public function store(Request $request): RedirectResponse
    {
        $tenant = $request->user()->tenant;

        $validated = $request->validate([
            'location_id' => 'nullable|exists:locations,id',
            'customer_type' => 'required|in:individual,corporate,travel_agent,group,resort,school',
            'company_name' => 'nullable|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'valid_until' => 'required|date|after:today',
            'proposed_dates' => 'nullable|array',
            'expected_participants' => 'nullable|integer|min:1',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'deposit_required' => 'nullable|boolean',
            'deposit_percent' => 'nullable|numeric|min:0|max:100',
            'payment_terms' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'cancellation_policy' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $quote = $this->quoteService->createQuote($tenant, $validated, $request->user()->id);

        return redirect()
            ->route('admin.quotes.show', $quote)
            ->with('success', 'Quote created successfully.');
    }

    /**
     * Display the specified quote
     */
    public function show(Request $request, Quote $quote): Response
    {
        $this->authorize('view', $quote);

        $quote->load(['items.product', 'location', 'createdBy', 'activities.user', 'convertedBooking']);

        return Inertia::render('admin/quotes/show', [
            'quote' => $quote,
            'publicUrl' => route('quotes.public', $quote->access_token),
        ]);
    }

    /**
     * Show form for editing the quote
     */
    public function edit(Request $request, Quote $quote): Response
    {
        $this->authorize('update', $quote);

        $tenant = $request->user()->tenant;

        $quote->load(['items.product']);

        return Inertia::render('admin/quotes/edit', [
            'quote' => $quote,
            'locations' => Location::forTenant($tenant->id)->active()->get(),
            'products' => Product::forTenant($tenant->id)->active()->get(),
            'tenant' => $tenant->only(['currency', 'tax_rate']),
        ]);
    }

    /**
     * Update the specified quote
     */
    public function update(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'location_id' => 'nullable|exists:locations,id',
            'customer_type' => 'required|in:individual,corporate,travel_agent,group,resort,school',
            'company_name' => 'nullable|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'valid_until' => 'required|date|after:today',
            'proposed_dates' => 'nullable|array',
            'expected_participants' => 'nullable|integer|min:1',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'deposit_required' => 'nullable|boolean',
            'deposit_percent' => 'nullable|numeric|min:0|max:100',
            'payment_terms' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'cancellation_policy' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $this->quoteService->updateQuote($quote, $validated);

        return redirect()
            ->route('admin.quotes.show', $quote)
            ->with('success', 'Quote updated successfully.');
    }

    /**
     * Delete the specified quote
     */
    public function destroy(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('delete', $quote);

        $quote->delete();

        return redirect()
            ->route('admin.quotes.index')
            ->with('success', 'Quote deleted successfully.');
    }

    /**
     * Send quote to customer
     */
    public function send(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        if ($this->quoteService->sendQuote($quote)) {
            return back()->with('success', 'Quote sent to ' . $quote->contact_email);
        }

        return back()->with('error', 'Failed to send quote. Please try again.');
    }

    /**
     * Resend quote to customer
     */
    public function resend(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        if ($this->quoteService->resendQuote($quote)) {
            return back()->with('success', 'Quote resent to ' . $quote->contact_email);
        }

        return back()->with('error', 'Failed to resend quote. Please try again.');
    }

    /**
     * Convert quote to booking
     */
    public function convert(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        if ($quote->status !== 'accepted') {
            return back()->with('error', 'Only accepted quotes can be converted to bookings.');
        }

        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'participant_count' => 'required|integer|min:1',
        ]);

        $booking = $this->quoteService->convertToBooking($quote, $validated);

        return redirect()
            ->route('admin.bookings.show', $booking)
            ->with('success', 'Quote converted to booking successfully.');
    }

    /**
     * Duplicate a quote
     */
    public function duplicate(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorize('view', $quote);

        $tenant = $request->user()->tenant;

        $newQuote = $this->quoteService->createQuote($tenant, [
            'location_id' => $quote->location_id,
            'customer_type' => $quote->customer_type,
            'company_name' => $quote->company_name,
            'contact_name' => $quote->contact_name,
            'contact_email' => $quote->contact_email,
            'contact_phone' => $quote->contact_phone,
            'title' => $quote->title . ' (Copy)',
            'description' => $quote->description,
            'valid_until' => now()->addDays(14),
            'proposed_dates' => $quote->proposed_dates,
            'expected_participants' => $quote->expected_participants,
            'discount_percent' => $quote->discount_percent,
            'deposit_required' => $quote->deposit_required,
            'deposit_percent' => $quote->deposit_percent,
            'payment_terms' => $quote->payment_terms,
            'terms_and_conditions' => $quote->terms_and_conditions,
            'cancellation_policy' => $quote->cancellation_policy,
            'notes' => $quote->notes,
            'items' => $quote->items->map(fn($item) => [
                'product_id' => $item->product_id,
                'name' => $item->name,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'discount_percent' => $item->discount_percent,
            ])->toArray(),
        ], $request->user()->id);

        return redirect()
            ->route('admin.quotes.edit', $newQuote)
            ->with('success', 'Quote duplicated successfully.');
    }
}
