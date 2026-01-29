<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Symfony\Component\HttpFoundation\Response as BaseResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/signIn/signin', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): BaseResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // Check if 2FA is enabled
        if ($user->two_factor_confirmed_at) {
            // Log out and store user ID in session for 2FA verification
            Auth::logout();

            $request->session()->put('2fa_user_id', $user->id);
            $request->session()->put('2fa_remember', $request->boolean('remember'));

            return Inertia::location(route('two-factor.challenge'));
        }

        $request->session()->regenerate();

        return Inertia::location(route('dashboard.index'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): BaseResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return Inertia::location('/');
    }
}
