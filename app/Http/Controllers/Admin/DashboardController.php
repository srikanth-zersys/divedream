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
use Illuminate\Support\Facades\DB;
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

        // Today's schedule with eager loading
        $todaySchedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('date', $today)
            ->with(['product', 'instructor', 'boat', 'diveSite', 'bookings.member'])
            ->orderBy('start_time')
            ->get();

        // Today's stats - combined into single query using selectRaw
        $todayStats = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', $today)
            ->selectRaw('
                COUNT(*) as total_bookings,
                SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as check_ins,
                SUM(CASE WHEN checked_in_at IS NULL AND status IN ("confirmed", "pending") THEN 1 ELSE 0 END) as pending_check_ins,
                SUM(CASE WHEN waiver_completed = 0 THEN 1 ELSE 0 END) as missing_waivers,
                SUM(CASE WHEN medical_form_completed = 0 THEN 1 ELSE 0 END) as missing_medical_forms
            ')
            ->first();

        // Capacity alerts
        $capacityAlerts = $todaySchedules->filter(function ($schedule) {
            $bookedCount = $schedule->bookings->sum('participant_count');
            return $bookedCount >= ($schedule->max_participants * 0.9); // 90% full
        });

        // Week stats - combined into single query
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

        // Month stats - combined into single query
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $monthStats = DB::query()
            ->selectRaw('
                (SELECT COUNT(*) FROM bookings
                 WHERE tenant_id = ?
                 ' . ($location ? 'AND location_id = ?' : '') . '
                 AND booking_date BETWEEN ? AND ?) as bookings,
                (SELECT COALESCE(SUM(amount), 0) FROM payments
                 WHERE tenant_id = ?
                 ' . ($location ? 'AND location_id = ?' : '') . '
                 AND status = "completed"
                 AND created_at BETWEEN ? AND ?) as revenue,
                (SELECT COUNT(*) FROM members
                 WHERE tenant_id = ?
                 AND created_at BETWEEN ? AND ?) as new_members
            ')
            ->addBinding($location
                ? [$tenant->id, $location->id, $monthStart, $monthEnd, $tenant->id, $location->id, $monthStart, $monthEnd, $tenant->id, $monthStart, $monthEnd]
                : [$tenant->id, $monthStart, $monthEnd, $tenant->id, $monthStart, $monthEnd, $tenant->id, $monthStart, $monthEnd]
            )
            ->first();

        // Upcoming bookings needing attention
        $upcomingAttention = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('booking_date', [$today, $today->copy()->addDays(7)])
            ->where(function ($q) {
                $q->where('waiver_completed', false)
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

        // Revenue chart data (last 7 days) - single query with groupBy
        $sevenDaysAgo = Carbon::today()->subDays(6);
        $revenueData = Payment::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $sevenDaysAgo)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
            ->groupBy('date')
            ->pluck('revenue', 'date')
            ->toArray();

        // Bookings chart data (last 7 days) - single query with groupBy
        $bookingsData = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('booking_date', '>=', $sevenDaysAgo)
            ->selectRaw('DATE(booking_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Build chart arrays with all 7 days (fill in zeros for missing days)
        $revenueChart = collect(range(6, 0))->map(function ($daysAgo) use ($revenueData) {
            $date = Carbon::today()->subDays($daysAgo);
            $dateKey = $date->format('Y-m-d');
            return [
                'date' => $date->format('M d'),
                'revenue' => (float) ($revenueData[$dateKey] ?? 0),
            ];
        });

        $bookingsChart = collect(range(6, 0))->map(function ($daysAgo) use ($bookingsData) {
            $date = Carbon::today()->subDays($daysAgo);
            $dateKey = $date->format('Y-m-d');
            return [
                'date' => $date->format('M d'),
                'bookings' => (int) ($bookingsData[$dateKey] ?? 0),
            ];
        });

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'today' => [
                    'bookings' => (int) $todayStats->total_bookings,
                    'checkIns' => (int) $todayStats->check_ins,
                    'pendingCheckIns' => (int) $todayStats->pending_check_ins,
                    'missingWaivers' => (int) $todayStats->missing_waivers,
                    'missingMedicalForms' => (int) $todayStats->missing_medical_forms,
                ],
                'week' => [
                    'bookings' => $weekBookings,
                    'revenue' => $weekRevenue,
                ],
                'month' => [
                    'bookings' => (int) $monthStats->bookings,
                    'revenue' => (float) $monthStats->revenue,
                    'newMembers' => (int) $monthStats->new_members,
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
