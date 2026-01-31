<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Junior QA Tester (1 year experience)
 * Focus: Basic functional testing, happy path scenarios
 * Approach: Straightforward test cases, verifying basic functionality works
 */
class JuniorQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: Homepage loads successfully
     * Expectation: Landing page returns 200 status
     */
    public function test_homepage_loads_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    /**
     * Test: Login page displays correctly
     * Expectation: Login form is accessible
     */
    public function test_login_page_displays(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    /**
     * Test: Registration page displays correctly
     * Expectation: Registration form is accessible
     */
    public function test_registration_page_displays(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    /**
     * Test: User can register with valid data
     * Expectation: New user is created and redirected to dashboard
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    /**
     * Test: User can login with valid credentials
     * Expectation: User is authenticated and redirected to dashboard
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Active',
        ]);

        $response = $this->post('/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test: Dashboard requires authentication
     * Expectation: Unauthenticated users are redirected to login
     */
    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    /**
     * Test: Authenticated user can access dashboard
     * Expectation: Dashboard page loads for logged-in users
     */
    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);
    }

    /**
     * Test: User can logout
     * Expectation: Session is destroyed and user is redirected
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    /**
     * Test: Forgot password page is accessible
     * Expectation: Password reset request form loads
     */
    public function test_forgot_password_page_displays(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
    }

    /**
     * Test: Profile page requires authentication
     * Expectation: Unauthenticated users cannot access profile
     */
    public function test_profile_requires_authentication(): void
    {
        $response = $this->get('/profile');
        $response->assertRedirect('/login');
    }
}
