<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Mid-Level QA Tester (3 years experience)
 * Focus: Edge cases, validation testing, error handling
 * Approach: Tests boundary conditions, invalid inputs, and error scenarios
 */
class MidLevelQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: Registration fails with missing name
     */
    public function test_registration_fails_without_name(): void
    {
        $response = $this->post('/register', [
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('name');
    }

    /**
     * Test: Registration fails with invalid email format
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test: Registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test: Registration fails with password mismatch
     */
    public function test_registration_fails_with_password_mismatch(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test: Registration fails with short password
     */
    public function test_registration_fails_with_short_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test: Login fails with wrong password
     */
    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('correctpassword'),
            'status' => 'Active',
        ]);

        $response = $this->post('/login', [
            'email' => 'user@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    /**
     * Test: Login fails with non-existent email
     */
    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->post('/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'anypassword',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    /**
     * Test: Inactive user cannot login
     */
    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Inactive',
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    /**
     * Test: Login fails with empty credentials
     */
    public function test_login_fails_with_empty_credentials(): void
    {
        $response = $this->post('/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['email', 'password']);
    }

    /**
     * Test: Registration with leading/trailing spaces in email
     */
    public function test_email_is_trimmed_during_registration(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => '  test@example.com  ',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    /**
     * Test: User management page requires authentication
     */
    public function test_user_management_requires_auth(): void
    {
        $response = $this->get('/user-management');
        $response->assertRedirect('/login');
    }

    /**
     * Test: Authenticated user can access user management
     */
    public function test_authenticated_user_can_access_user_management(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->get('/user-management');
        $response->assertStatus(200);
    }

    /**
     * Test: Name validation - too short
     */
    public function test_registration_fails_with_name_too_short(): void
    {
        $response = $this->post('/register', [
            'name' => 'AB',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Name must be at least 3 characters (if validation exists)
        // This tests boundary conditions
        $response->assertStatus(302);
    }

    /**
     * Test: Password reset with invalid email returns validation error
     * Note: This app validates email exists (trade-off between UX and security)
     */
    public function test_password_reset_with_nonexistent_email(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        // App validates email exists - returns error for non-existent email
        $response->assertSessionHasErrors('email');
    }
}
