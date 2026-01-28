<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {

            $user = User::with('roles')->find($request->user()->id);
            $roles = Role::all();
            
            if(!$user){
                throw ValidationException::withMessages([
                    'message' => 'User not found.',
                ]);
            }

            return Inertia::render('page/account-settings/index', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => session('status'),
                'user' => $user,
                'roles' => $roles
            ]);

    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try{

            $request->user()->fill($request->validated());

            if ($request->user()->isDirty('email')) {
                $request->user()->email_verified_at = null;
            }

            $request->user()->save();
            
            if ($request->filled('role')) {
                $request->user()->syncRoles([$request->input('role')]);
            }

            return Redirect::route('profile.edit')->with('success', 'Profile updated successfully');

        } catch (Exception $e) {
            report($e);
            throw ValidationException::withMessages([
                'message' => 'An unexpected error occurred while updating your profile. Please try again.',
            ]);
        }
       
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
