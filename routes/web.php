<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\UserController;
use Spatie\Health\Http\Controllers\HealthCheckResultsController;

// Route::get('/', [RouteController::class, 'index']);
Route::get('health', HealthCheckResultsController::class);

//default route
Route::get('/', [RouteController::class, 'signin']);

Route::middleware('auth:web')->group(function () {

    //pages management
    Route::get('/page/starter', [RouteController::class, 'starter'])->name('starter.page');
    Route::get('/page/404', [RouteController::class, 'pageNotFound'])->name('pageNotFound.page');
    Route::get('/page/500', [RouteController::class, 'serverError'])->name('serverError.page');

    //user management (Admin only)
    Route::middleware('role:Admin')->group(function () {
        Route::get('/user-management', [UserController::class, 'userManagement'])->name('users.index');
        Route::get('/user-management/create', [UserController::class, 'addUser'])->name('users.create');
        Route::get('/user-management/edit/{id}', [UserController::class, 'EditUser'])->name('users.edit');
        Route::post('/user-management/store', [UserController::class, 'store'])->name('users.store');
        Route::post('/user-management/update', [UserController::class, 'update'])->name('users.update');
    });

    //auth user profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    //dashboard ( Not Required kept for later if so )
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/auth.php';
