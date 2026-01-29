<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EquipmentController;
use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\BookingController as PublicBookingController;
use App\Http\Controllers\Public\CartRecoveryController;
use App\Http\Controllers\Public\QuoteViewController;
use App\Http\Controllers\Public\LeadCaptureController;
use App\Http\Controllers\Public\ReferralController;
use App\Http\Controllers\Public\ReviewController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Spatie\Health\Http\Controllers\HealthCheckResultsController;

/*
|--------------------------------------------------------------------------
| Public Routes (B2C Online Booking)
|--------------------------------------------------------------------------
*/

// Health check
Route::get('health', HealthCheckResultsController::class);

// Public booking pages
Route::prefix('book')->name('public.book.')->group(function () {
    Route::get('/', [PublicBookingController::class, 'index'])->name('index');
    Route::get('/products', [PublicBookingController::class, 'products'])->name('products');
    Route::get('/product/{product:slug}', [PublicBookingController::class, 'product'])->name('product');
    Route::get('/schedule/{schedule}', [PublicBookingController::class, 'schedule'])->name('schedule');
    Route::post('/check-availability', [PublicBookingController::class, 'checkAvailability'])->name('check-availability');
    Route::get('/checkout', [PublicBookingController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [PublicBookingController::class, 'processCheckout'])->name('process-checkout');
    Route::get('/confirmation/{booking}', [PublicBookingController::class, 'confirmation'])->name('confirmation');
});

// Public quote viewing (for customers receiving quote emails)
Route::prefix('quote')->name('quotes.')->group(function () {
    Route::get('/{token}', [QuoteViewController::class, 'show'])->name('public');
    Route::post('/{token}/accept', [QuoteViewController::class, 'accept'])->name('accept');
    Route::post('/{token}/reject', [QuoteViewController::class, 'reject'])->name('reject');
    Route::post('/{token}/request-changes', [QuoteViewController::class, 'requestChanges'])->name('request-changes');
    Route::get('/{token}/download', [QuoteViewController::class, 'download'])->name('download');
});

// Review collection (post-trip feedback)
Route::prefix('review')->name('public.review.')->group(function () {
    Route::get('/{token}', [ReviewController::class, 'show'])->name('show');
    Route::post('/{token}', [ReviewController::class, 'submit'])->name('submit');
    Route::get('/{token}/thank-you', [ReviewController::class, 'thankYou'])->name('thank-you');
    Route::post('/{token}/external', [ReviewController::class, 'recordExternal'])->name('external');
    Route::post('/{token}/decline', [ReviewController::class, 'decline'])->name('decline');
});

// Abandoned cart recovery
Route::prefix('cart')->name('public.cart.')->group(function () {
    Route::get('/recover/{token}', [CartRecoveryController::class, 'recover'])->name('recover');
    Route::post('/track', [CartRecoveryController::class, 'track'])->name('track');
    Route::post('/complete', [CartRecoveryController::class, 'complete'])->name('complete');
});

// Unsubscribe from marketing emails
Route::get('/unsubscribe/{token}', [CartRecoveryController::class, 'unsubscribe'])->name('public.unsubscribe');

// Lead capture and tracking
Route::prefix('leads')->name('public.leads.')->group(function () {
    Route::post('/capture', [LeadCaptureController::class, 'capture'])->name('capture');
    Route::post('/track', [LeadCaptureController::class, 'trackActivity'])->name('track');
    Route::post('/email/{type}', [LeadCaptureController::class, 'trackEmail'])->name('email');
    Route::post('/profile', [LeadCaptureController::class, 'updateProfile'])->name('profile');
    Route::get('/status', [LeadCaptureController::class, 'getLeadStatus'])->name('status');
    Route::get('/unsubscribe/{token}', [LeadCaptureController::class, 'unsubscribe'])->name('unsubscribe');
});

// Referral program
Route::prefix('referral')->name('public.referral.')->group(function () {
    Route::get('/program', [ReferralController::class, 'showProgram'])->name('program');
    Route::get('/settings', [ReferralController::class, 'getProgramSettings'])->name('settings');
    Route::post('/link', [ReferralController::class, 'getMyReferralLink'])->name('link');
    Route::post('/stats', [ReferralController::class, 'getMyStats'])->name('stats');
    Route::post('/validate', [ReferralController::class, 'validateCode'])->name('validate');
    Route::post('/share', [ReferralController::class, 'trackShare'])->name('share');
});

// Referral link redirect (short URL)
Route::get('/r/{code}', [ReferralController::class, 'handleClick'])->name('public.referral.click');

// Customer portal
Route::prefix('portal')->name('portal.')->middleware('auth')->group(function () {
    Route::get('/', [PortalController::class, 'dashboard'])->name('index');
    Route::get('/bookings', [PortalController::class, 'bookings'])->name('bookings');
    Route::get('/booking/{booking}', [PortalController::class, 'booking'])->name('booking');
    Route::get('/profile', [PortalController::class, 'profile'])->name('profile');
    Route::put('/profile', [PortalController::class, 'updateProfile'])->name('profile.update');
    Route::post('/booking/{booking}/waiver', [PortalController::class, 'signWaiver'])->name('sign-waiver');
    Route::post('/booking/{booking}/cancel', [PortalController::class, 'cancelBooking'])->name('cancel-booking');
});

// Default route - redirect to login
Route::get('/', [RouteController::class, 'signin']);

/*
|--------------------------------------------------------------------------
| Admin Routes (B2B Backoffice)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:web', 'tenant'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::redirect('/', '/admin/dashboard');

    // Bookings
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [BookingController::class, 'index'])->name('index');
        Route::get('/calendar', [BookingController::class, 'calendar'])->name('calendar');
        Route::get('/create', [BookingController::class, 'create'])->name('create');
        Route::post('/', [BookingController::class, 'store'])->name('store');
        Route::get('/{booking}', [BookingController::class, 'show'])->name('show');
        Route::get('/{booking}/edit', [BookingController::class, 'edit'])->name('edit');
        Route::put('/{booking}', [BookingController::class, 'update'])->name('update');
        Route::post('/{booking}/check-in', [BookingController::class, 'checkIn'])->name('check-in');
        Route::post('/{booking}/check-out', [BookingController::class, 'checkOut'])->name('check-out');
        Route::post('/{booking}/cancel', [BookingController::class, 'cancel'])->name('cancel');
        // Payment recording
        Route::post('/{booking}/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('/{booking}/quick-pay', [PaymentController::class, 'quickPay'])->name('quick-pay');
        Route::post('/{booking}/record-deposit', [PaymentController::class, 'recordDeposit'])->name('record-deposit');
    });

    // Quotes/Proposals
    Route::prefix('quotes')->name('quotes.')->group(function () {
        Route::get('/', [QuoteController::class, 'index'])->name('index');
        Route::get('/create', [QuoteController::class, 'create'])->name('create');
        Route::post('/', [QuoteController::class, 'store'])->name('store');
        Route::get('/{quote}', [QuoteController::class, 'show'])->name('show');
        Route::get('/{quote}/edit', [QuoteController::class, 'edit'])->name('edit');
        Route::put('/{quote}', [QuoteController::class, 'update'])->name('update');
        Route::delete('/{quote}', [QuoteController::class, 'destroy'])->name('destroy');
        Route::post('/{quote}/send', [QuoteController::class, 'send'])->name('send');
        Route::post('/{quote}/resend', [QuoteController::class, 'resend'])->name('resend');
        Route::post('/{quote}/convert', [QuoteController::class, 'convert'])->name('convert');
        Route::post('/{quote}/duplicate', [QuoteController::class, 'duplicate'])->name('duplicate');
    });

    // Schedules
    Route::prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/', [ScheduleController::class, 'index'])->name('index');
        Route::get('/calendar', [ScheduleController::class, 'calendar'])->name('calendar');
        Route::get('/create', [ScheduleController::class, 'create'])->name('create');
        Route::post('/', [ScheduleController::class, 'store'])->name('store');
        Route::get('/{schedule}', [ScheduleController::class, 'show'])->name('show');
        Route::get('/{schedule}/edit', [ScheduleController::class, 'edit'])->name('edit');
        Route::put('/{schedule}', [ScheduleController::class, 'update'])->name('update');
        Route::delete('/{schedule}', [ScheduleController::class, 'destroy'])->name('destroy');
        Route::post('/{schedule}/cancel', [ScheduleController::class, 'cancel'])->name('cancel');
        Route::post('/{schedule}/duplicate', [ScheduleController::class, 'duplicate'])->name('duplicate');
        Route::post('/{schedule}/assign-instructor', [ScheduleController::class, 'assignInstructor'])->name('assign-instructor');
    });

    // Members
    Route::prefix('members')->name('members.')->group(function () {
        Route::get('/', [MemberController::class, 'index'])->name('index');
        Route::get('/create', [MemberController::class, 'create'])->name('create');
        Route::post('/', [MemberController::class, 'store'])->name('store');
        Route::get('/{member}', [MemberController::class, 'show'])->name('show');
        Route::get('/{member}/edit', [MemberController::class, 'edit'])->name('edit');
        Route::put('/{member}', [MemberController::class, 'update'])->name('update');
        Route::delete('/{member}', [MemberController::class, 'destroy'])->name('destroy');
        Route::post('/{member}/certifications', [MemberController::class, 'addCertification'])->name('add-certification');
        Route::delete('/{member}/certifications/{certification}', [MemberController::class, 'removeCertification'])->name('remove-certification');
        Route::post('/{member}/certifications/{certification}/verify', [MemberController::class, 'verifyCertification'])->name('verify-certification');
        Route::post('/merge', [MemberController::class, 'merge'])->name('merge');
    });

    // Instructors
    Route::prefix('instructors')->name('instructors.')->group(function () {
        Route::get('/', [InstructorController::class, 'index'])->name('index');
        Route::get('/create', [InstructorController::class, 'create'])->name('create');
        Route::post('/', [InstructorController::class, 'store'])->name('store');
        Route::get('/{instructor}', [InstructorController::class, 'show'])->name('show');
        Route::get('/{instructor}/edit', [InstructorController::class, 'edit'])->name('edit');
        Route::put('/{instructor}', [InstructorController::class, 'update'])->name('update');
        Route::delete('/{instructor}', [InstructorController::class, 'destroy'])->name('destroy');
        Route::get('/{instructor}/availability', [InstructorController::class, 'availability'])->name('availability');
        Route::post('/{instructor}/availability', [InstructorController::class, 'updateAvailability'])->name('update-availability');
    });

    // Equipment
    Route::prefix('equipment')->name('equipment.')->group(function () {
        Route::get('/', [EquipmentController::class, 'index'])->name('index');
        Route::get('/create', [EquipmentController::class, 'create'])->name('create');
        Route::post('/', [EquipmentController::class, 'store'])->name('store');
        Route::get('/{equipment}', [EquipmentController::class, 'show'])->name('show');
        Route::get('/{equipment}/edit', [EquipmentController::class, 'edit'])->name('edit');
        Route::put('/{equipment}', [EquipmentController::class, 'update'])->name('update');
        Route::delete('/{equipment}', [EquipmentController::class, 'destroy'])->name('destroy');
        Route::post('/{equipment}/maintenance', [EquipmentController::class, 'logMaintenance'])->name('log-maintenance');
    });

    // Products
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::get('/{product}', [ProductController::class, 'show'])->name('show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
    });

    // Locations (for multi-location tenants)
    Route::prefix('locations')->name('locations.')->group(function () {
        Route::get('/', [LocationController::class, 'index'])->name('index');
        Route::get('/create', [LocationController::class, 'create'])->name('create');
        Route::post('/', [LocationController::class, 'store'])->name('store');
        Route::get('/{location}', [LocationController::class, 'show'])->name('show');
        Route::get('/{location}/edit', [LocationController::class, 'edit'])->name('edit');
        Route::put('/{location}', [LocationController::class, 'update'])->name('update');
        Route::delete('/{location}', [LocationController::class, 'destroy'])->name('destroy');
    });

    // Location switcher
    Route::post('/switch-location', [LocationController::class, 'switchLocation'])->name('switch-location');
    Route::get('/select-location', [LocationController::class, 'selectLocation'])->name('location.select');

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportsController::class, 'index'])->name('index');
        Route::get('/revenue', [ReportsController::class, 'revenue'])->name('revenue');
        Route::get('/bookings', [ReportsController::class, 'bookings'])->name('bookings');
        Route::get('/members', [ReportsController::class, 'members'])->name('members');
        Route::get('/instructors', [ReportsController::class, 'instructors'])->name('instructors');
        Route::get('/equipment', [ReportsController::class, 'equipment'])->name('equipment');
    });

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::get('/general', [SettingsController::class, 'general'])->name('general');
        Route::put('/general', [SettingsController::class, 'updateGeneral'])->name('update-general');
        Route::get('/branding', [SettingsController::class, 'branding'])->name('branding');
        Route::put('/branding', [SettingsController::class, 'updateBranding'])->name('update-branding');
        Route::get('/booking', [SettingsController::class, 'booking'])->name('booking');
        Route::put('/booking', [SettingsController::class, 'updateBooking'])->name('update-booking');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('update-notifications');
        Route::get('/integrations', [SettingsController::class, 'integrations'])->name('integrations');
        Route::get('/billing', [SettingsController::class, 'billing'])->name('billing');
        Route::get('/team', [SettingsController::class, 'team'])->name('team');
        Route::post('/team/invite', [SettingsController::class, 'inviteTeamMember'])->name('team.invite');
        Route::delete('/team/{user}', [SettingsController::class, 'removeTeamMember'])->name('team.remove');
    });
});

/*
|--------------------------------------------------------------------------
| Legacy Routes (kept for compatibility)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:web')->group(function () {
    // Pages
    Route::get('/page/starter', [RouteController::class, 'starter'])->name('starter.page');
    Route::get('/page/404', [RouteController::class, 'pageNotFound'])->name('pageNotFound.page');
    Route::get('/page/500', [RouteController::class, 'serverError'])->name('serverError.page');

    // User management (legacy)
    Route::get('/user-management', [UserController::class, 'userManagement'])->name('users.index');
    Route::get('/user-management/create', [UserController::class, 'addUser'])->name('users.create');
    Route::get('/user-management/edit/{id}', [UserController::class, 'EditUser'])->name('users.edit');
    Route::post('/user-management/store', [UserController::class, 'store'])->name('users.store');
    Route::post('/user-management/update', [UserController::class, 'update'])->name('users.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Dashboard (redirect to admin)
    Route::get('/dashboard', function () {
        return redirect()->route('admin.dashboard');
    })->name('dashboard.index');
});

require __DIR__ . '/auth.php';
