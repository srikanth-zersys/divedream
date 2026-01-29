<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Member;
use App\Services\RefundService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected RefundService $refundService
    ) {}

    public function dashboard(Request $request)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $upcomingBookings = Booking::where('member_id', $member->id)
            ->where('booking_date', '>=', now()->toDateString())
            ->whereIn('status', ['confirmed', 'pending'])
            ->with(['product', 'schedule', 'location'])
            ->orderBy('booking_date')
            ->limit(5)
            ->get();

        $pastBookings = Booking::where('member_id', $member->id)
            ->where('booking_date', '<', now()->toDateString())
            ->orWhere(function ($query) use ($member) {
                $query->where('member_id', $member->id)
                    ->where('status', 'completed');
            })
            ->with(['product'])
            ->orderByDesc('booking_date')
            ->limit(5)
            ->get();

        $pendingWaivers = Booking::where('member_id', $member->id)
            ->where('booking_date', '>=', now()->toDateString())
            ->where('waiver_completed', false)
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        $pendingPayments = Booking::where('member_id', $member->id)
            ->where('booking_date', '>=', now()->toDateString())
            ->where('payment_status', '!=', 'paid')
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        return Inertia::render('portal/dashboard', [
            'member' => $member->load('certifications.certificationType'),
            'upcomingBookings' => $upcomingBookings,
            'pastBookings' => $pastBookings,
            'pendingActions' => [
                'waivers' => $pendingWaivers,
                'payments' => $pendingPayments,
            ],
        ]);
    }

    public function bookings(Request $request)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $query = Booking::where('member_id', $member->id)
            ->with(['product', 'schedule', 'location']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('period')) {
            switch ($request->period) {
                case 'upcoming':
                    $query->where('booking_date', '>=', now()->toDateString());
                    break;
                case 'past':
                    $query->where('booking_date', '<', now()->toDateString());
                    break;
                case 'this_month':
                    $query->whereMonth('booking_date', now()->month)
                        ->whereYear('booking_date', now()->year);
                    break;
                case 'this_year':
                    $query->whereYear('booking_date', now()->year);
                    break;
            }
        }

        $bookings = $query->orderByDesc('booking_date')->paginate(10);

        return Inertia::render('portal/bookings', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'period']),
        ]);
    }

    public function booking(Request $request, int $id)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $booking = Booking::where('member_id', $member->id)
            ->with([
                'product',
                'schedule.instructor.user',
                'schedule.diveSite',
                'location',
                'participants',
                'payments',
            ])
            ->findOrFail($id);

        // Get required waiver templates for this booking
        $waivers = [];
        if (!$booking->waiver_completed && $booking->location_id) {
            $waivers = \App\Models\WaiverTemplate::getRequiredForBooking(
                $booking->tenant_id,
                $booking->location_id,
                'en' // Could be dynamic based on member preferences
            );
        }

        return Inertia::render('portal/booking-detail', [
            'booking' => $booking,
            'waivers' => $waivers,
        ]);
    }

    public function profile(Request $request)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        return Inertia::render('portal/profile', [
            'member' => $member->load('certifications.certificationType'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
        ]);

        $member->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function signWaiver(Request $request, int $bookingId)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $booking = Booking::where('member_id', $member->id)->findOrFail($bookingId);

        $validated = $request->validate([
            'signature' => 'required|string',
            'agreed_to_terms' => 'required|accepted',
        ]);

        $booking->update([
            'waiver_completed' => true,
            'waiver_completed_at' => now(),
            'internal_notes' => $booking->internal_notes . "\nWaiver signed electronically at " . now()->toDateTimeString(),
        ]);

        return redirect()->back()->with('success', 'Waiver signed successfully.');
    }

    public function cancelBooking(Request $request, int $bookingId)
    {
        $member = $this->getCurrentMember($request);

        if (!$member) {
            return redirect('/login');
        }

        $booking = Booking::where('member_id', $member->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->findOrFail($bookingId);

        // Check cancellation policy
        $hoursUntil = now()->diffInHours($booking->booking_date, false);
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings['booking'] ?? [];
        $cancellationHours = $settings['cancellation_hours'] ?? 48;

        if ($hoursUntil < $cancellationHours) {
            return redirect()->back()->with('error', 'Cancellation window has passed.');
        }

        // Process cancellation with automatic refund calculation
        $reason = $request->input('reason', 'Customer requested cancellation');
        $result = $this->refundService->processCancellation(
            $booking,
            $reason,
            $member->id
        );

        // Build response message with refund info
        $message = 'Booking cancelled successfully.';
        if ($result['refund_info']['refund_amount'] > 0) {
            $refundAmount = number_format($result['refund_info']['refund_amount'], 2);
            $message .= " A refund of \${$refundAmount} will be processed to your original payment method.";
        } elseif ($result['refund_info']['refund_percent'] === 0 && $booking->amount_paid > 0) {
            $message .= ' Per our cancellation policy, no refund is available for this cancellation.';
        }

        return redirect()->back()->with('success', $message);
    }

    protected function getCurrentMember(Request $request): ?Member
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        return Member::where('email', $user->email)
            ->where('tenant_id', $this->tenantService->getCurrentTenant()?->id)
            ->first();
    }
}
