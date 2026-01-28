<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Product;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request)
    {
        $locationId = $this->tenantService->getCurrentLocation()?->id;
        $period = $request->input('period', '30d');

        [$startDate, $endDate] = $this->getPeriodDates($period);
        [$prevStartDate, $prevEndDate] = $this->getPreviousPeriodDates($period);

        // Current period stats
        $currentRevenue = Payment::where('location_id', $locationId)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $previousRevenue = Payment::where('location_id', $locationId)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->sum('amount');

        $revenueChange = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : 0;

        $currentBookings = Booking::where('location_id', $locationId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $previousBookings = Booking::where('location_id', $locationId)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();

        $bookingsChange = $previousBookings > 0
            ? round((($currentBookings - $previousBookings) / $previousBookings) * 100, 1)
            : 0;

        $totalCustomers = Member::where('location_id', $locationId)->count();
        $newCustomers = Member::where('location_id', $locationId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $avgBookingValue = $currentBookings > 0
            ? round($currentRevenue / $currentBookings, 2)
            : 0;

        // Revenue by month (last 6 months)
        $revenueByMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthRevenue = Payment::where('location_id', $locationId)
                ->where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('amount');

            $monthBookings = Booking::where('location_id', $locationId)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $revenueByMonth[] = [
                'month' => $date->format('M'),
                'revenue' => $monthRevenue,
                'bookings' => $monthBookings,
            ];
        }

        // Top products
        $topProducts = Product::where('location_id', $locationId)
            ->withCount(['bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withSum(['bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }], 'total_amount')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'bookings' => $p->bookings_count ?? 0,
                'revenue' => $p->bookings_sum_total_amount ?? 0,
            ]);

        // Bookings by status
        $bookingsByStatus = Booking::where('location_id', $locationId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn($b) => [
                'status' => $b->status,
                'count' => $b->count,
            ]);

        // Recent activity
        $recentActivity = collect();

        // Add recent bookings
        $recentBookings = Booking::where('location_id', $locationId)
            ->with('member')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'type' => 'booking',
                'description' => "New booking #{$b->booking_number} by {$b->member?->first_name}",
                'time' => $b->created_at->diffForHumans(),
            ]);

        $recentActivity = $recentActivity->merge($recentBookings);

        // Add recent payments
        $recentPayments = Payment::where('location_id', $locationId)
            ->where('status', 'completed')
            ->with('booking.member')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'type' => 'payment',
                'description' => "Payment of $" . number_format($p->amount, 2) . " received",
                'time' => $p->created_at->diffForHumans(),
            ]);

        $recentActivity = $recentActivity->merge($recentPayments)
            ->sortByDesc('time')
            ->take(10)
            ->values();

        return Inertia::render('admin/reports/index', [
            'period' => $period,
            'stats' => [
                'revenue' => [
                    'total' => $currentRevenue,
                    'change' => abs($revenueChange),
                    'trend' => $revenueChange >= 0 ? 'up' : 'down',
                ],
                'bookings' => [
                    'total' => $currentBookings,
                    'change' => abs($bookingsChange),
                    'trend' => $bookingsChange >= 0 ? 'up' : 'down',
                ],
                'customers' => [
                    'total' => $totalCustomers,
                    'newThisPeriod' => $newCustomers,
                ],
                'avgBookingValue' => $avgBookingValue,
            ],
            'revenueByMonth' => $revenueByMonth,
            'topProducts' => $topProducts,
            'bookingsByStatus' => $bookingsByStatus,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function revenue(Request $request)
    {
        $locationId = $this->tenantService->getCurrentLocation()?->id;
        $period = $request->input('period', '30d');

        [$startDate, $endDate] = $this->getPeriodDates($period);

        $payments = Payment::where('location_id', $locationId)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with('booking.product')
            ->orderByDesc('created_at')
            ->paginate(20);

        $summary = [
            'total' => Payment::where('location_id', $locationId)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'count' => Payment::where('location_id', $locationId)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'byMethod' => Payment::where('location_id', $locationId)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('payment_method, sum(amount) as total, count(*) as count')
                ->groupBy('payment_method')
                ->get(),
        ];

        return Inertia::render('admin/reports/revenue', [
            'payments' => $payments,
            'summary' => $summary,
            'period' => $period,
            'filters' => $request->only(['period']),
        ]);
    }

    protected function getPeriodDates(string $period): array
    {
        $endDate = Carbon::now();

        switch ($period) {
            case '7d':
                $startDate = Carbon::now()->subDays(7);
                break;
            case '30d':
                $startDate = Carbon::now()->subDays(30);
                break;
            case '90d':
                $startDate = Carbon::now()->subDays(90);
                break;
            case '12m':
                $startDate = Carbon::now()->subMonths(12);
                break;
            case 'ytd':
                $startDate = Carbon::now()->startOfYear();
                break;
            default:
                $startDate = Carbon::now()->subDays(30);
        }

        return [$startDate, $endDate];
    }

    protected function getPreviousPeriodDates(string $period): array
    {
        [$currentStart, $currentEnd] = $this->getPeriodDates($period);
        $duration = $currentStart->diffInDays($currentEnd);

        $prevEnd = $currentStart->copy()->subDay();
        $prevStart = $prevEnd->copy()->subDays($duration);

        return [$prevStart, $prevEnd];
    }
}
