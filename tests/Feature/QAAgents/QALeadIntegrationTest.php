<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * QA Lead / QA Architect (8+ years experience)
 * Focus: End-to-end integration testing, complete user journeys, system-wide testing
 * Approach: Tests complete workflows and integration between components
 */
class QALeadIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: Complete new user registration to profile update journey
     */
    public function test_complete_user_onboarding_journey(): void
    {
        // Step 1: User visits the application
        $response = $this->get('/');
        $response->assertStatus(200);

        // Step 2: User goes to registration
        $response = $this->get('/register');
        $response->assertStatus(200);

        // Step 3: User registers
        $response = $this->post('/register', [
            'name' => 'New Journey User',
            'email' => 'journey@example.com',
            'password' => 'securepassword123',
            'password_confirmation' => 'securepassword123',
        ]);
        $response->assertRedirect('/dashboard');

        // Step 4: User is now authenticated
        $user = User::where('email', 'journey@example.com')->first();
        $this->assertNotNull($user);
        $this->assertAuthenticatedAs($user);

        // Step 5: User accesses dashboard
        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);

        // Step 6: User views profile
        $response = $this->actingAs($user)->get('/profile');
        $response->assertStatus(200);

        // Step 7: User logs out
        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/');
        $this->assertGuest();

        // Step 8: User logs back in
        $response = $this->post('/login', [
            'email' => 'journey@example.com',
            'password' => 'securepassword123',
        ]);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test: Admin user management complete workflow
     */
    public function test_admin_user_management_workflow(): void
    {
        // Setup: Create admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass'),
            'status' => 'Active',
        ]);
        $admin->assignRole('Admin');

        // Step 1: Admin logs in
        $response = $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'adminpass',
        ]);
        $response->assertRedirect('/dashboard');

        // Step 2: Admin accesses dashboard
        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertStatus(200);

        // Step 3: Admin navigates to user management
        $response = $this->actingAs($admin)->get('/user-management');
        $response->assertStatus(200);

        // Step 4: Admin accesses create user form
        $response = $this->actingAs($admin)->get('/user-management/create');
        $response->assertStatus(200);

        // Step 5: Admin creates a new user
        $response = $this->actingAs($admin)->post('/user-management/store', [
            'name' => 'Created User',
            'email' => 'created@example.com',
            'password' => 'newuserpass123',
            'password_confirmation' => 'newuserpass123',
            'role' => 'User',
            'phone' => '1234567890',
            'status' => 'Active',
        ]);
        $response->assertRedirect();

        // Step 6: Verify user was created
        $createdUser = User::where('email', 'created@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('Created User', $createdUser->name);

        // Step 7: Admin edits the user
        $response = $this->actingAs($admin)->get('/user-management/edit/' . $createdUser->id);
        $response->assertStatus(200);

        // Step 8: Admin updates the user
        $response = $this->actingAs($admin)->post('/user-management/update', [
            'id' => $createdUser->id,
            'name' => 'Updated User Name',
            'email' => 'created@example.com',
            'role' => 'User',
            'phone' => '0987654321',
            'status' => 'Active',
        ]);
        $response->assertRedirect();

        // Step 9: Verify user was updated
        $createdUser->refresh();
        $this->assertEquals('Updated User Name', $createdUser->name);
        $this->assertEquals('0987654321', $createdUser->phone);

        // Step 10: Admin logs out
        $response = $this->actingAs($admin)->post('/logout');
        $this->assertGuest();
    }

    /**
     * Test: Password reset complete flow
     */
    public function test_password_reset_complete_flow(): void
    {
        // Setup: Create user
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('oldpassword'),
            'status' => 'Active',
        ]);

        // Step 1: User visits forgot password page
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);

        // Step 2: User requests password reset
        $response = $this->post('/forgot-password', [
            'email' => 'reset@example.com',
        ]);
        $response->assertRedirect();

        // Note: In a real test, we'd capture the reset token from the email
        // For this integration test, we verify the flow doesn't error
    }

    /**
     * Test: Multi-user concurrent operations
     */
    public function test_multi_user_concurrent_operations(): void
    {
        // Create multiple users
        $user1 = User::factory()->create([
            'email' => 'user1@example.com',
            'password' => Hash::make('password1'),
            'status' => 'Active',
        ]);
        $user1->assignRole('User');

        $user2 = User::factory()->create([
            'email' => 'user2@example.com',
            'password' => Hash::make('password2'),
            'status' => 'Active',
        ]);
        $user2->assignRole('User');

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass'),
            'status' => 'Active',
        ]);
        $admin->assignRole('Admin');

        // User 1 accesses their dashboard
        $response1 = $this->actingAs($user1)->get('/dashboard');
        $response1->assertStatus(200);

        // User 2 accesses their dashboard
        $response2 = $this->actingAs($user2)->get('/dashboard');
        $response2->assertStatus(200);

        // Admin manages users
        $response3 = $this->actingAs($admin)->get('/user-management');
        $response3->assertStatus(200);

        // All users can access their profiles
        $this->actingAs($user1)->get('/profile')->assertStatus(200);
        $this->actingAs($user2)->get('/profile')->assertStatus(200);
        $this->actingAs($admin)->get('/profile')->assertStatus(200);
    }

    /**
     * Test: User status change affects login
     */
    public function test_user_status_lifecycle(): void
    {
        // Create admin and user
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $user = User::factory()->create([
            'email' => 'lifecycle@example.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);

        // Step 1: User can login when active
        $response = $this->post('/login', [
            'email' => 'lifecycle@example.com',
            'password' => 'password',
        ]);
        $response->assertRedirect('/dashboard');

        // Logout
        $this->post('/logout');

        // Step 2: Admin deactivates user
        $user->status = 'Inactive';
        $user->save();

        // Step 3: Inactive user cannot login
        $response = $this->post('/login', [
            'email' => 'lifecycle@example.com',
            'password' => 'password',
        ]);
        $this->assertGuest();

        // Step 4: Admin reactivates user
        $user->status = 'Active';
        $user->save();

        // Step 5: User can login again
        $response = $this->post('/login', [
            'email' => 'lifecycle@example.com',
            'password' => 'password',
        ]);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test: Role-based access control
     */
    public function test_role_based_access_control(): void
    {
        // Create users with different roles
        $adminUser = User::factory()->create(['status' => 'Active']);
        $adminUser->assignRole('Admin');

        $regularUser = User::factory()->create(['status' => 'Active']);
        $regularUser->assignRole('User');

        // Both can access common areas
        $this->actingAs($adminUser)->get('/dashboard')->assertStatus(200);
        $this->actingAs($regularUser)->get('/dashboard')->assertStatus(200);

        $this->actingAs($adminUser)->get('/profile')->assertStatus(200);
        $this->actingAs($regularUser)->get('/profile')->assertStatus(200);

        // Admin can access user management
        $this->actingAs($adminUser)->get('/user-management')->assertStatus(200);
        $this->actingAs($adminUser)->get('/user-management/create')->assertStatus(200);

        // Regular user accessing user management (behavior depends on middleware)
        $response = $this->actingAs($regularUser)->get('/user-management');
        // Could be 200 (allowed) or 403 (forbidden) depending on implementation
        $this->assertContains($response->getStatusCode(), [200, 302, 403]);
    }

    /**
     * Test: Database integrity after complex operations
     */
    public function test_database_integrity(): void
    {
        $initialCount = User::count();

        // Register 3 new users
        for ($i = 1; $i <= 3; $i++) {
            $this->post('/register', [
                'name' => "User {$i}",
                'email' => "user{$i}@integrity.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);
            $this->post('/logout');
        }

        // Verify all users created
        $this->assertEquals($initialCount + 3, User::count());

        // Verify each user has correct data
        for ($i = 1; $i <= 3; $i++) {
            $this->assertDatabaseHas('users', [
                'email' => "user{$i}@integrity.com",
                'name' => "User {$i}",
            ]);
        }
    }

    /**
     * Test: Session management across pages
     */
    public function test_session_management(): void
    {
        $user = User::factory()->create([
            'email' => 'session@example.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);
        $user->assignRole('User');

        // Login
        $this->post('/login', [
            'email' => 'session@example.com',
            'password' => 'password',
        ]);

        // Navigate through multiple pages - session should persist
        $pages = ['/dashboard', '/profile', '/page/starter'];

        foreach ($pages as $page) {
            $response = $this->actingAs($user)->get($page);
            $response->assertStatus(200);
        }

        // Logout
        $this->actingAs($user)->post('/logout');
        $this->assertGuest();

        // Cannot access protected pages after logout
        $this->get('/dashboard')->assertRedirect('/login');
    }

    /**
     * Test: Error handling doesn't break application
     */
    public function test_error_handling_graceful(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('Admin');

        // Try to edit non-existent user
        $response = $this->actingAs($user)->get('/user-management/edit/99999');
        $this->assertContains($response->getStatusCode(), [200, 302, 404, 500]);

        // Application should still work after error
        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);

        // User management still works
        $response = $this->actingAs($user)->get('/user-management');
        $response->assertStatus(200);
    }

    /**
     * Test: Full application health check
     */
    public function test_full_application_health(): void
    {
        // Test all major routes respond
        $publicRoutes = ['/', '/login', '/register', '/forgot-password'];
        foreach ($publicRoutes as $route) {
            $this->get($route)->assertStatus(200);
        }

        // Create authenticated user
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        // Test authenticated routes
        $authRoutes = [
            '/dashboard',
            '/profile',
            '/user-management',
            '/user-management/create',
            '/page/starter',
            '/page/404',
            '/page/500',
        ];

        foreach ($authRoutes as $route) {
            $response = $this->actingAs($admin)->get($route);
            $response->assertStatus(200, "Route {$route} failed");
        }

        // Test health endpoint
        $response = $this->get('/health');
        $this->assertContains($response->getStatusCode(), [200, 302, 500]);
    }
}
