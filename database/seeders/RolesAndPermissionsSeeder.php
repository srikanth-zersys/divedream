<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Bookings
            'booking.view',
            'booking.create',
            'booking.update',
            'booking.delete',
            'booking.cancel',
            'booking.checkin',
            'booking.payment',
            'booking.manage',

            // Members
            'member.view',
            'member.create',
            'member.update',
            'member.delete',
            'member.verify_cert',
            'member.manage',

            // Instructors
            'instructor.view',
            'instructor.create',
            'instructor.update',
            'instructor.delete',
            'instructor.availability',
            'instructor.manage',

            // Equipment
            'equipment.view',
            'equipment.create',
            'equipment.update',
            'equipment.delete',
            'equipment.maintenance',
            'equipment.manage',

            // Schedule
            'schedule.view',
            'schedule.create',
            'schedule.update',
            'schedule.delete',
            'schedule.assign',
            'schedule.cancel',
            'schedule.manage',

            // Products
            'product.view',
            'product.create',
            'product.update',
            'product.delete',
            'product.manage',

            // Locations
            'location.view',
            'location.create',
            'location.update',
            'location.delete',
            'location.settings',
            'location.staff',
            'location.manage',

            // Reports
            'report.view',
            'report.export',
            'report.financial',
            'report.manage',

            // Settings
            'settings.view',
            'settings.update',
            'settings.billing',
            'settings.manage',

            // Users
            'user.view',
            'user.create',
            'user.update',
            'user.delete',
            'user.manage',

            // Payments
            'payment.view',
            'payment.process',
            'payment.refund',
            'payment.manage',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions

        // Super Admin - can do everything across all tenants
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Owner - full access within their tenant
        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->syncPermissions(Permission::all());

        // Admin - manage everything except billing
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions([
            'dashboard.view',
            'booking.manage',
            'member.manage',
            'instructor.manage',
            'equipment.manage',
            'schedule.manage',
            'product.manage',
            'location.view', 'location.update', 'location.settings', 'location.staff',
            'report.manage',
            'settings.view', 'settings.update',
            'user.manage',
            'payment.manage',
        ]);

        // Manager - manage daily operations
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->syncPermissions([
            'dashboard.view',
            'booking.view', 'booking.create', 'booking.update', 'booking.checkin', 'booking.cancel',
            'member.view', 'member.create', 'member.update', 'member.verify_cert',
            'instructor.view', 'instructor.availability',
            'equipment.view', 'equipment.update', 'equipment.maintenance',
            'schedule.view', 'schedule.create', 'schedule.update', 'schedule.assign', 'schedule.cancel',
            'product.view',
            'location.view',
            'report.view', 'report.export',
            'payment.view', 'payment.process',
        ]);

        // Staff - handle bookings and check-ins
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions([
            'dashboard.view',
            'booking.view', 'booking.create', 'booking.update', 'booking.checkin',
            'member.view', 'member.create', 'member.update',
            'instructor.view',
            'equipment.view', 'equipment.update',
            'schedule.view',
            'product.view',
            'location.view',
            'payment.view', 'payment.process',
        ]);

        // Instructor - view schedules and own profile
        $instructor = Role::firstOrCreate(['name' => 'instructor', 'guard_name' => 'web']);
        $instructor->syncPermissions([
            'dashboard.view',
            'booking.view',
            'member.view',
            'instructor.view',
            'schedule.view',
            'location.view',
        ]);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
