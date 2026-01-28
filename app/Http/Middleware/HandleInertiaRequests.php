<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                // Conditionally share user data only if logged in
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name, // Ensure you have a 'name' column/attribute
                    'email' => $request->user()->email,
                    'role' => $request->user()->getRoleNames()->first(),
                    // Add any other user fields you need in the frontend
                ] : null,
            ],
            'ziggy' => [
                'url' => $request->url(),
                'location' => $request->url(),
            ],
            // Add other shared data like flash messages if needed
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                // 'error_dealers' => $request->session()->get('error_dealers'),
            ],
        ]);
    }
}
