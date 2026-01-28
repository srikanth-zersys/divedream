<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Schedule;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();
        $today = Carbon::today();

        // Today's schedule
        $todaySchedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('date', $today)
            ->with(['product', 'instructor', 'boat', 'diveSite', 'bookings.member'])
            ->orderBy('start_time')
            ->get();

        // Today's stats
        $todayBookings = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->count();

        $todayCheckIns = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->whereNotNull('checked_in_at')
            ->count();

        $pendingCheckIns = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->whereNull('checked_in_at')
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        // Missing documents
        $missingWaivers = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->where('waiver_signed', false)
            ->count();

        $missingMedicalForms = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->where('medical_form_completed', false)
            ->count();

        // Capacity alerts
        $capacityAlerts = $todaySchedules->filter(function ($schedule) {
            $bookedCount = $schedule->bookings->sum('participant_count');
            return $bookedCount >= ($schedule->max_participants * 0.9); // 90% full
        });

        // Week stats
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $weekBookings = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('booking_date', [$weekStart, $weekEnd])
            ->count();

        $weekRevenue = Payment::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->where('status', 'completed')
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->sum('amount');

        // Month stats
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $monthBookings = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('booking_date', [$monthStart, $monthEnd])
            ->count();

        $monthRevenue = Payment::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->where('status', 'completed')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('amount');

        // New members this month
        $newMembers = Member::forTenant($tenant->id)
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->count();

        // Upcoming bookings needing attention
        $upcomingAttention = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('booking_date', [$today, $today->copy()->addDays(7)])
            ->where(function ($q) {
                $q->where('waiver_signed', false)
                    ->orWhere('medical_form_completed', false)
                    ->orWhere('status', 'pending');
            })
            ->with(['member', 'product', 'schedule'])
            ->orderBy('booking_date')
            ->limit(10)
            ->get();

        // Recent activity
        $recentBookings = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->with(['member', 'product'])
            ->latest()
            ->limit(5)
            ->get();

        // Revenue chart data (last 7 days)
        $revenueChart = collect(range(6, 0))->map(function ($daysAgo) use ($tenant, $location) {
            $date = Carbon::today()->subDays($daysAgo);
            $revenue = Payment::forTenant($tenant->id)
                ->when($location, fn($q) => $q->forLocation($location->id))
                ->where('status', 'completed')
                ->whereDate('created_at', $date)
                ->sum('amount');

            return [
                'date' => $date->format('M d'),
                'revenue' => (float) $revenue,
            ];
        });

        // Bookings chart data (last 7 days)
        $bookingsChart = collect(range(6, 0))->map(function ($daysAgo) use ($tenant, $location) {
            $date = Carbon::today()->subDays($daysAgo);
            $count = Booking::forTenant($tenant->id)
                ->when($location, fn($q) => $q->forLocation($location->id))
                ->whereDate('booking_date', $date)
                ->count();

            return [
                'date' => $date->format('M d'),
                'bookings' => $count,
            ];
        });

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'today' => [
                    'bookings' => $todayBookings,
                    'checkIns' => $todayCheckIns,
                    'pendingCheckIns' => $pendingCheckIns,
                    'missingWaivers' => $missingWaivers,
                    'missingMedicalForms' => $missingMedicalForms,
                ],
                'week' => [
                    'bookings' => $weekBookings,
                    'revenue' => $weekRevenue,
                ],
                'month' => [
                    'bookings' => $monthBookings,
                    'revenue' => $monthRevenue,
                    'newMembers' => $newMembers,
                ],
            ],
            'todaySchedules' => $todaySchedules,
            'capacityAlerts' => $capacityAlerts->values(),
            'upcomingAttention' => $upcomingAttention,
            'recentBookings' => $recentBookings,
            'charts' => [
                'revenue' => $revenueChart,
                'bookings' => $bookingsChart,
            ],
        ]);
    }
}
