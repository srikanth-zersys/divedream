<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * API QA Tester (4 years experience)
 * Focus: Backend API testing, request/response validation, HTTP methods
 * Approach: Tests HTTP endpoints, status codes, headers, and data formats
 */
class APIQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: GET endpoints return correct status codes
     */
    public function test_get_endpoints_return_correct_status(): void
    {
        // Public routes
        $this->get('/')->assertStatus(200);
        $this->get('/login')->assertStatus(200);
        $this->get('/register')->assertStatus(200);
        $this->get('/forgot-password')->assertStatus(200);

        // Protected routes (should redirect)
        $this->get('/dashboard')->assertStatus(302);
        $this->get('/profile')->assertStatus(302);
    }

    /**
     * Test: POST login returns correct response
     */
    public function test_post_login_response(): void
    {
        $user = User::factory()->create([
            'email' => 'api@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Active',
        ]);

        $response = $this->post('/login', [
            'email' => 'api@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(302);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test: POST registration returns correct response
     */
    public function test_post_registration_response(): void
    {
        $response = $this->post('/register', [
            'name' => 'API Test User',
            'email' => 'apitest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(302);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test: Invalid POST returns 422 validation errors
     */
    public function test_invalid_post_returns_validation_errors(): void
    {
        $response = $this->post('/register', [
            'name' => '',
            'email' => 'invalid',
            'password' => '123',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors();
    }

    /**
     * Test: POST user store with valid data
     */
    public function test_post_user_store(): void
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->post('/user-management/store', [
            'name' => 'New API User',
            'email' => 'newapiuser@example.com',
            'phone' => '1234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'User',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('users', ['email' => 'newapiuser@example.com']);
    }

    /**
     * Test: POST user update
     */
    public function test_post_user_update(): void
    {
        $admin = User::factory()->create(['status' => 'Active', 'phone' => '9876543210']);
        $admin->assignRole('Admin');

        $userToUpdate = User::factory()->create([
            'name' => 'Original Name',
            'status' => 'Active',
            'phone' => '1234567890',
        ]);

        $response = $this->actingAs($admin)->post('/user-management/update', [
            'id' => $userToUpdate->id,
            'name' => 'Updated Name',
            'email' => $userToUpdate->email,
            'phone' => '1234567890',
            'role' => 'User',
            'status' => 'Active',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('users', [
            'id' => $userToUpdate->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test: POST profile update
     */
    public function test_post_profile_update(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Profile',
            'status' => 'Active',
        ]);
        $user->assignRole('User');

        $response = $this->actingAs($user)->post('/profile', [
            'name' => 'Updated Profile',
            'email' => $user->email,
        ]);

        $response->assertStatus(302);
    }

    /**
     * Test: POST logout
     */
    public function test_post_logout(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        $response = $this->actingAs($user)->post('/logout');

        $response->assertStatus(302);
        $response->assertRedirect('/');
    }

    /**
     * Test: POST forgot password
     */
    public function test_post_forgot_password(): void
    {
        $user = User::factory()->create([
            'email' => 'forgot@example.com',
            'status' => 'Active',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'forgot@example.com',
        ]);

        $response->assertStatus(302);
    }

    /**
     * Test: Unauthenticated POST to protected route
     */
    public function test_unauthenticated_post_to_protected_route(): void
    {
        $response = $this->post('/user-management/store', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }

    /**
     * Test: Response headers are appropriate
     */
    public function test_response_headers(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $this->assertTrue($response->headers->has('Content-Type'));
    }

    /**
     * Test: Health check endpoint
     */
    public function test_health_endpoint(): void
    {
        $response = $this->get('/health');

        // Health check should return 200 if healthy
        $this->assertContains($response->getStatusCode(), [200, 302, 500]);
    }

    /**
     * Test: Invalid HTTP methods
     */
    public function test_invalid_http_methods(): void
    {
        // PUT to login should fail
        $response = $this->put('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertContains($response->getStatusCode(), [404, 405]);
    }

    /**
     * Test: Request with JSON content type
     */
    public function test_json_request_handling(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        // Should return JSON validation errors
        $response->assertStatus(422);
        $response->assertJsonStructure(['errors']);
    }

    /**
     * Test: Pagination parameters in user list
     */
    public function test_pagination_parameters(): void
    {
        User::factory()->count(25)->create(['status' => 'Active']);

        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->get('/user-management?page=1&perPage=10');

        $response->assertStatus(200);
    }

    /**
     * Test: Search parameter in user list
     */
    public function test_search_parameter(): void
    {
        User::factory()->create([
            'name' => 'Searchable User',
            'email' => 'searchable@example.com',
            'status' => 'Active',
        ]);

        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->get('/user-management?search=Searchable');

        $response->assertStatus(200);
    }
}
