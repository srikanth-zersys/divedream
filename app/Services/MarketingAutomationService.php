<?php

namespace App\Services;

use App\Mail\AbandonedCartReminder;
use App\Mail\PreTripReminder;
use App\Mail\ReviewRequestEmail;
use App\Models\AbandonedCart;
use App\Models\AutomationMessage;
use App\Models\AutomationSettings;
use App\Models\Booking;
use App\Models\ReviewRequest;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MarketingAutomationService
{
    /**
     * Process all due automation messages
     */
    public function processDueMessages(): array
    {
        $processed = 0;
        $failed = 0;

        $messages = AutomationMessage::due()
            ->with(['booking.member', 'booking.product', 'booking.schedule', 'booking.tenant'])
            ->limit(100)
            ->get();

        foreach ($messages as $message) {
            try {
                $this->sendMessage($message);
                $processed++;
            } catch (\Exception $e) {
                Log::error('Automation message failed', [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ]);
                $message->markFailed($e->getMessage());
                $failed++;
            }
        }

        return ['processed' => $processed, 'failed' => $failed];
    }

    /**
     * Send a single automation message
     */
    protected function sendMessage(AutomationMessage $message): void
    {
        $booking = $message->booking;

        // Check if booking is still valid
        if (in_array($booking->status, ['cancelled', 'no_show'])) {
            $message->markSkipped();
            return;
        }

        // Check quiet hours
        $settings = AutomationSettings::getForTenant($message->tenant_id);
        if ($settings->isQuietHours()) {
            $message->update([
                'scheduled_for' => $settings->getNextSendTime(),
            ]);
            return;
        }

        // Send based on sequence type
        match ($message->sequence) {
            AutomationMessage::SEQUENCE_PRE_TRIP => $this->sendPreTripMessage($message),
            AutomationMessage::SEQUENCE_REVIEW_REQUEST => $this->sendReviewRequest($message),
            default => $message->markSkipped(),
        };
    }

    /**
     * Send pre-trip reminder email
     */
    protected function sendPreTripMessage(AutomationMessage $message): void
    {
        $booking = $message->booking;
        $email = $booking->member?->email ?? $booking->email;

        if (!$email) {
            $message->markFailed('No email address');
            return;
        }

        Mail::to($email)->send(new PreTripReminder(
            $booking,
            $message->message_type,
            $message
        ));

        $message->markSent();
    }

    /**
     * Schedule pre-trip sequence for a new booking
     */
    public function schedulePreTripSequence(Booking $booking): array
    {
        $settings = AutomationSettings::getForTenant($booking->tenant_id);

        if (!$settings->pre_trip_enabled) {
            return [];
        }

        return AutomationMessage::schedulePreTripSequence($booking);
    }

    /**
     * Cancel automation for a booking (e.g., when cancelled)
     */
    public function cancelBookingAutomation(Booking $booking): int
    {
        return AutomationMessage::cancelForBooking($booking);
    }

    // =========================================
    // ABANDONED CART RECOVERY
    // =========================================

    /**
     * Track an abandoned cart
     */
    public function trackAbandonedCart(int $tenantId, array $cartData, string $step): AbandonedCart
    {
        // Check if cart already exists for this session/email
        $existing = AbandonedCart::where('tenant_id', $tenantId)
            ->where(function ($q) use ($cartData) {
                if (!empty($cartData['email'])) {
                    $q->where('email', $cartData['email']);
                }
                if (!empty($cartData['session_id'])) {
                    $q->orWhere('session_id', $cartData['session_id']);
                }
            })
            ->where('status', 'abandoned')
            ->where('created_at', '>=', now()->subHours(24))
            ->first();

        if ($existing) {
            $existing->update([
                'cart_data' => $cartData,
                'cart_value' => $cartData['total'] ?? $existing->cart_value,
                'last_step' => $step,
                'product_id' => $cartData['product_id'] ?? $existing->product_id,
                'schedule_id' => $cartData['schedule_id'] ?? $existing->schedule_id,
            ]);
            return $existing;
        }

        return AbandonedCart::createFromSession($tenantId, $cartData, $step);
    }

    /**
     * Mark cart as recovered when booking is completed
     */
    public function markCartRecovered(string $email, Booking $booking): void
    {
        AbandonedCart::where('email', $email)
            ->where('tenant_id', $booking->tenant_id)
            ->whereIn('status', ['abandoned', 'reminded'])
            ->get()
            ->each(fn($cart) => $cart->markRecovered($booking));
    }

    /**
     * Process abandoned cart reminders
     */
    public function processAbandonedCarts(): array
    {
        $processed = 0;
        $failed = 0;

        // Get all tenants with abandoned cart automation enabled
        $settings = AutomationSettings::where('abandoned_cart_enabled', true)->get();

        foreach ($settings as $tenantSettings) {
            $schedule = $tenantSettings->getAbandonedCartSchedule();

            // Process each reminder level
            foreach ($schedule as $reminderNum => $hoursAfter) {
                $carts = AbandonedCart::forTenant($tenantSettings->tenant_id)
                    ->recoverable()
                    ->where('reminder_count', $reminderNum - 1)
                    ->where('abandoned_at', '<=', now()->subHours($hoursAfter))
                    ->limit(50)
                    ->get();

                foreach ($carts as $cart) {
                    try {
                        $this->sendAbandonedCartReminder($cart, $reminderNum, $tenantSettings);
                        $processed++;
                    } catch (\Exception $e) {
                        Log::error('Abandoned cart reminder failed', [
                            'cart_id' => $cart->id,
                            'error' => $e->getMessage(),
                        ]);
                        $failed++;
                    }
                }
            }

            // Expire old carts (older than 7 days)
            AbandonedCart::forTenant($tenantSettings->tenant_id)
                ->whereIn('status', ['abandoned', 'reminded'])
                ->where('abandoned_at', '<', now()->subDays(7))
                ->update(['status' => 'expired']);
        }

        return ['processed' => $processed, 'failed' => $failed];
    }

    /**
     * Send abandoned cart reminder email
     */
    protected function sendAbandonedCartReminder(
        AbandonedCart $cart,
        int $reminderNumber,
        AutomationSettings $settings
    ): void {
        // Check quiet hours
        if ($settings->isQuietHours()) {
            return;
        }

        // Apply discount on final reminder
        if ($settings->shouldOfferDiscount($reminderNumber) && !$cart->discount_offered) {
            $cart->applyDiscount($settings->discount_percent);
        }

        // Send email
        Mail::to($cart->email)->send(new AbandonedCartReminder($cart, $reminderNumber));

        $cart->markReminded();
    }

    // =========================================
    // REVIEW REQUESTS
    // =========================================

    /**
     * Create review request for completed booking
     */
    public function createReviewRequest(Booking $booking): ?ReviewRequest
    {
        $settings = AutomationSettings::getForTenant($booking->tenant_id);

        if (!$settings->review_request_enabled) {
            return null;
        }

        // Don't create duplicate requests
        if ($booking->review_requested || ReviewRequest::where('booking_id', $booking->id)->exists()) {
            return null;
        }

        return ReviewRequest::createForBooking($booking);
    }

    /**
     * Process review requests for recently completed bookings
     */
    public function processReviewRequests(): array
    {
        $sent = 0;
        $failed = 0;

        // Get settings for all tenants with review requests enabled
        $settings = AutomationSettings::where('review_request_enabled', true)->get();

        foreach ($settings as $tenantSettings) {
            // Find completed bookings that need review requests
            $bookings = Booking::where('tenant_id', $tenantSettings->tenant_id)
                ->where('status', 'completed')
                ->where('review_requested', false)
                ->where('updated_at', '<=', now()->subHours($tenantSettings->review_request_hours))
                ->where('updated_at', '>=', now()->subDays(7)) // Only within last 7 days
                ->limit(50)
                ->get();

            foreach ($bookings as $booking) {
                try {
                    $reviewRequest = $this->createReviewRequest($booking);
                    if ($reviewRequest) {
                        $this->sendReviewRequestEmail($reviewRequest, $tenantSettings);
                        $sent++;
                    }
                } catch (\Exception $e) {
                    Log::error('Review request failed', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                    $failed++;
                }
            }

            // Send reminders for unopened review requests
            $this->sendReviewReminders($tenantSettings);
        }

        return ['sent' => $sent, 'failed' => $failed];
    }

    /**
     * Send review request email
     */
    protected function sendReviewRequestEmail(ReviewRequest $request, AutomationSettings $settings): void
    {
        if ($settings->isQuietHours()) {
            return;
        }

        $booking = $request->booking;
        $email = $booking->member?->email ?? $booking->email;

        if (!$email) {
            return;
        }

        Mail::to($email)->send(new ReviewRequestEmail($request));

        $request->markSent();

        $booking->update([
            'review_requested' => true,
            'review_requested_at' => now(),
        ]);
    }

    /**
     * Send reminders for review requests that haven't been completed
     */
    protected function sendReviewReminders(AutomationSettings $settings): void
    {
        $requests = ReviewRequest::forTenant($settings->tenant_id)
            ->where('status', 'sent')
            ->where('reminder_count', 0)
            ->where('sent_at', '<=', now()->subDays($settings->review_reminder_days))
            ->limit(20)
            ->get();

        foreach ($requests as $request) {
            try {
                $email = $request->booking->member?->email ?? $request->booking->email;
                if ($email) {
                    Mail::to($email)->send(new ReviewRequestEmail($request, isReminder: true));
                    $request->update(['reminder_count' => 1]);
                }
            } catch (\Exception $e) {
                Log::error('Review reminder failed', ['request_id' => $request->id]);
            }
        }
    }

    /**
     * Handle negative review - create followup task
     */
    public function handleNegativeReview(ReviewRequest $request): void
    {
        if ($request->rating <= 3) {
            $request->update([
                'requires_followup' => true,
                'resolution_status' => 'pending',
            ]);

            // TODO: Send notification to admin/manager
            // TODO: Create task in task management system
        }
    }

    // =========================================
    // STATISTICS
    // =========================================

    /**
     * Get automation statistics for a tenant
     */
    public function getStatistics(Tenant $tenant, string $period = 'month'): array
    {
        $startDate = match ($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        // Abandoned cart stats
        $abandonedCarts = AbandonedCart::forTenant($tenant->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $recovered = $abandonedCarts->where('status', 'recovered');
        $cartRecoveryRate = $abandonedCarts->count() > 0
            ? round(($recovered->count() / $abandonedCarts->count()) * 100, 1)
            : 0;

        // Review stats
        $reviews = ReviewRequest::forTenant($tenant->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $completedReviews = $reviews->where('status', 'completed');
        $avgRating = $completedReviews->avg('rating');
        $reviewResponseRate = $reviews->whereIn('status', ['sent', 'opened', 'completed'])->count() > 0
            ? round(($completedReviews->count() / $reviews->whereIn('status', ['sent', 'opened', 'completed'])->count()) * 100, 1)
            : 0;

        // Pre-trip message stats
        $messages = AutomationMessage::forTenant($tenant->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $sentMessages = $messages->where('status', 'sent');
        $openedMessages = $sentMessages->whereNotNull('opened_at');
        $openRate = $sentMessages->count() > 0
            ? round(($openedMessages->count() / $sentMessages->count()) * 100, 1)
            : 0;

        return [
            'period' => $period,
            'abandoned_carts' => [
                'total' => $abandonedCarts->count(),
                'recovered' => $recovered->count(),
                'recovery_rate' => $cartRecoveryRate,
                'recovered_value' => $recovered->sum('cart_value'),
            ],
            'reviews' => [
                'sent' => $reviews->whereIn('status', ['sent', 'opened', 'completed'])->count(),
                'completed' => $completedReviews->count(),
                'response_rate' => $reviewResponseRate,
                'average_rating' => $avgRating ? round($avgRating, 1) : null,
                'positive' => $completedReviews->where('rating', '>=', 4)->count(),
                'negative' => $completedReviews->where('rating', '<=', 3)->count(),
            ],
            'messages' => [
                'sent' => $sentMessages->count(),
                'opened' => $openedMessages->count(),
                'open_rate' => $openRate,
                'clicked' => $sentMessages->whereNotNull('clicked_at')->count(),
            ],
        ];
    }
}
