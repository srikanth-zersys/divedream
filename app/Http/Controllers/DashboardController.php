<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request){
        try {
            return Inertia::render('dashboard/index');
        } catch (Exception $e) {
            report($e);
            return Redirect::back()->with('error', 'An unexpected error occurred while loading the dashboard.');
        }
    }
}
