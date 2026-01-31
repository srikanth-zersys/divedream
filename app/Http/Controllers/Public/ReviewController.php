<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ReviewRequest;
use App\Services\MarketingAutomationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(
        protected MarketingAutomationService $automationService
    ) {}

    /**
     * Show the review form
     */
    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $reviewRequest = ReviewRequest::where('token', $token)
            ->with(['booking.product', 'booking.schedule', 'tenant'])
            ->first();

        if (!$reviewRequest) {
            abort(404, 'Review request not found');
        }

        // Mark as opened
        $reviewRequest->markOpened();

        // Check if already completed
        if ($reviewRequest->status === 'completed') {
            return Inertia::render('public/reviews/thank-you', [
                'reviewRequest' => $reviewRequest,
                'tenant' => $reviewRequest->tenant,
                'alreadyCompleted' => true,
            ]);
        }

        // Pre-select rating if provided in URL
        $preSelectedRating = $request->query('rating');

        return Inertia::render('public/reviews/form', [
            'reviewRequest' => $reviewRequest,
            'booking' => $reviewRequest->booking,
            'tenant' => $reviewRequest->tenant,
            'product' => $reviewRequest->booking->product,
            'preSelectedRating' => $preSelectedRating ? (int) $preSelectedRating : null,
            'positiveTags' => ReviewRequest::POSITIVE_TAGS,
            'negativeTags' => ReviewRequest::NEGATIVE_TAGS,
            'externalLinks' => $reviewRequest->getExternalReviewLinks(),
        ]);
    }

    /**
     * Submit the review
     */
    public function submit(Request $request, string $token): RedirectResponse
    {
        $reviewRequest = ReviewRequest::where('token', $token)->firstOrFail();

        if ($reviewRequest->status === 'completed') {
            return back()->with('error', 'This review has already been submitted.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $reviewRequest->submitReview(
            $validated['rating'],
            $validated['feedback'] ?? null,
            $validated['tags'] ?? []
        );

        // Handle negative reviews
        if ($validated['rating'] <= 3) {
            $this->automationService->handleNegativeReview($reviewRequest);
        }

        return redirect()->route('public.review.thank-you', $token);
    }

    /**
     * Thank you page after review submission
     */
    public function thankYou(string $token): Response
    {
        $reviewRequest = ReviewRequest::where('token', $token)
            ->with('tenant')
            ->firstOrFail();

        return Inertia::render('public/reviews/thank-you', [
            'reviewRequest' => $reviewRequest,
            'tenant' => $reviewRequest->tenant,
            'isPositive' => $reviewRequest->isPositive(),
            'externalLinks' => $reviewRequest->getExternalReviewLinks(),
        ]);
    }

    /**
     * Record external review posting
     */
    public function recordExternal(Request $request, string $token): RedirectResponse
    {
        $reviewRequest = ReviewRequest::where('token', $token)->firstOrFail();

        $validated = $request->validate([
            'platform' => 'required|in:google,tripadvisor,facebook',
            'url' => 'nullable|url',
        ]);

        $reviewRequest->recordExternalReview($validated['platform'], $validated['url'] ?? null);

        return back()->with('success', 'Thank you for sharing your review!');
    }

    /**
     * Decline to leave a review
     */
    public function decline(string $token): RedirectResponse
    {
        $reviewRequest = ReviewRequest::where('token', $token)->firstOrFail();

        $reviewRequest->update(['status' => 'declined']);

        return redirect()->route('public.book.index')
            ->with('info', 'No problem! Thanks for diving with us.');
    }
}
