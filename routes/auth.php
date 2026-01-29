<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TenantRegistrationController;
use App\Http\Controllers\Auth\TwoFactorAuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Multi-step tenant registration
    Route::get('register', [TenantRegistrationController::class, 'showStep1'])
        ->name('register');
    Route::get('register/step-1', [TenantRegistrationController::class, 'showStep1'])
        ->name('register.step1');
    Route::post('register/step-1', [TenantRegistrationController::class, 'processStep1'])
        ->name('register.step1.process');

    Route::get('register/step-2', [TenantRegistrationController::class, 'showStep2'])
        ->name('register.step2');
    Route::post('register/step-2', [TenantRegistrationController::class, 'processStep2'])
        ->name('register.step2.process');

    Route::get('register/step-3', [TenantRegistrationController::class, 'showStep3'])
        ->name('register.step3');
    Route::post('register/step-3', [TenantRegistrationController::class, 'processStep3'])
        ->name('register.step3.process');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Two-factor authentication challenge (during login)
    Route::get('two-factor-challenge', [TwoFactorAuthController::class, 'challenge'])
        ->name('two-factor.challenge');
    Route::post('two-factor-challenge', [TwoFactorAuthController::class, 'verify'])
        ->name('two-factor.verify');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    // Registration complete / onboarding
    Route::get('register/complete', [TenantRegistrationController::class, 'complete'])
        ->name('register.complete');

    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    // Two-factor authentication management
    Route::get('two-factor', [TwoFactorAuthController::class, 'show'])
        ->name('two-factor.show');
    Route::get('two-factor/enable', [TwoFactorAuthController::class, 'enable'])
        ->name('two-factor.enable');
    Route::post('two-factor/confirm', [TwoFactorAuthController::class, 'confirm'])
        ->name('two-factor.confirm');
    Route::delete('two-factor', [TwoFactorAuthController::class, 'disable'])
        ->name('two-factor.disable');
    Route::post('two-factor/recovery-codes', [TwoFactorAuthController::class, 'regenerateRecoveryCodes'])
        ->name('two-factor.recovery-codes.regenerate');
    Route::get('two-factor/recovery-codes', [TwoFactorAuthController::class, 'getRecoveryCodes'])
        ->name('two-factor.recovery-codes');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
