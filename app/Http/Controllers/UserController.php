<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{

    public function userManagement(Request $request)
    {
        $roles = Role::orderBy('name')->get(['id', 'name']);
        $users_query = User::with('roles')
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role'), function ($query, $roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('name', $roleName);
                });
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc');
        $totalUserCount = $users_query->count();
        $perPage = $request->input('perPage', $totalUserCount);
        $users = $perPage === 'all' ? $users_query->get() : $users_query->paginate((int) $perPage)->withQueryString();
        return Inertia::render('page/user-management/index', [
            'users'   => $users,
            'roles'   => $roles,
            'filters' => $request->only(['search', 'role', 'status', 'perPage']),
        ]);
    }

    public function addUser()
    {
        $roles = Role::orderBy('name')->get(['id', 'name']);
        return Inertia::render('page/user-management/add-user', [
            'roles' => $roles
        ]);
    }

    public function EditUser($id)
    {
        $user = User::with('roles')->find($id);
        if(!$user){
            return back()->withErrors([
                'message' => 'User not found.',
            ]);
        }
        $roles = Role::orderBy('name')->get(['id', 'name']);
        return Inertia::render('page/user-management/edit-user', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'phone' => 'required|numeric|digits:10|unique:users,phone',
            'password' => 'required|string|min:6|confirmed|max:255',
            'role' => 'required|exists:roles,name',
        ]);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        try {
            $user = User::create([
                'name'     => $request->input('name'),
                'email'    => $request->input('email'),
                'phone'    => $request->input('phone'),
                'password' => Hash::make($request->input('password')),
            ]);
            $user->assignRole($request->input('role'));
       return redirect()->route('users.create')->with('success', 'User created successfully!');
        } catch (Exception $e){
            report($e);
            return back()->withErrors([
                'message' => 'An unexpected error occurred during registration. Please try again.',
            ])->withInput();
        }
    }

    public function update(Request $request){
        $id = $request->input('id');
        $validator = Validator::make($request->all(), [
           'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'phone' => [
                'required',
                'numeric',
                'digits:10',
                Rule::unique('users')->ignore($id),
            ],
            'password' => 'nullable|string|min:6|confirmed|max:255',
            'role' => 'required|exists:roles,name',
            'status' => 'required|string|in:Active,Inactive'
        ]);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        try {
            $user = User::findOrFail($id);
            if(!$user){
                return back()->withErrors([
                    'message' => 'User not found.',
                ])->withInput();
            }
            $user->name = $request->input('name');
            $user->email = $request->input('email');
            $user->phone = $request->input('phone');
            $user->status = $request->input('status');
            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }
            $user->save();
            $user->syncRoles($request->input('role'));
           return redirect()->route('users.edit', $user->id)->with('success', 'User updated successfully!');
        } catch (Exception $e){
            report($e);
            return back()->withErrors([
                'message' => 'An unexpected error occurred during registration. Please try again.',
            ])->withInput();
        }
    }

}
