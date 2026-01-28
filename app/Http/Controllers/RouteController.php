<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RouteController extends Controller
{

    //default page
    public function signin()
    {
        // If user is already logged in, redirect to dashboard
        if (Auth::check()) {
            return redirect()->route('dashboard.index');
        }
        return Inertia::render('auth/signIn/signin');
    }

    //pages component
    public function starter()
    {
        return Inertia::render('page/starter/index');
    }

    public function pageNotFound()
    {
        return Inertia::render('page/404/index');
    }

    public function serverError()
    {
        return Inertia::render('page/500/index');
    }
}
