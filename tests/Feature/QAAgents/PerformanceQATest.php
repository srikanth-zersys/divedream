<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Performance QA Engineer (4 years experience)
 * Focus: Load testing, response times, database query optimization
 * Approach: Tests application performance under various conditions
 */
class PerformanceQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: Homepage response time is acceptable
     */
    public function test_homepage_response_time(): void
    {
        $startTime = microtime(true);

        $response = $this->get('/');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $response->assertStatus(200);
        // Response should be under 500ms
        $this->assertLessThan(500, $responseTime, "Homepage took too long: {$responseTime}ms");
    }

    /**
     * Test: Login page response time
     */
    public function test_login_page_response_time(): void
    {
        $startTime = microtime(true);

        $response = $this->get('/login');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertStatus(200);
        $this->assertLessThan(500, $responseTime, "Login page took too long: {$responseTime}ms");
    }

    /**
     * Test: Dashboard response time for authenticated user
     */
    public function test_dashboard_response_time(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $startTime = microtime(true);

        $response = $this->actingAs($user)->get('/dashboard');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertStatus(200);
        $this->assertLessThan(1000, $responseTime, "Dashboard took too long: {$responseTime}ms");
    }

    /**
     * Test: User list with multiple users
     */
    public function test_user_list_with_many_users(): void
    {
        // Create 50 users
        User::factory()->count(50)->create(['status' => 'Active']);

        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $startTime = microtime(true);

        $response = $this->actingAs($admin)->get('/user-management');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertStatus(200);
        $this->assertLessThan(2000, $responseTime, "User list took too long with 50 users: {$responseTime}ms");
    }

    /**
     * Test: Registration performance
     */
    public function test_registration_performance(): void
    {
        $startTime = microtime(true);

        $response = $this->post('/register', [
            'name' => 'Performance Test User',
            'email' => 'perf@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertRedirect();
        $this->assertLessThan(1000, $responseTime, "Registration took too long: {$responseTime}ms");
    }

    /**
     * Test: Login performance
     */
    public function test_login_performance(): void
    {
        $user = User::factory()->create([
            'email' => 'perf@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Active',
        ]);

        $startTime = microtime(true);

        $response = $this->post('/login', [
            'email' => 'perf@example.com',
            'password' => 'password123',
        ]);

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertRedirect();
        $this->assertLessThan(500, $responseTime, "Login took too long: {$responseTime}ms");
    }

    /**
     * Test: Multiple sequential requests
     */
    public function test_multiple_sequential_requests(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $totalTime = 0;
        $requestCount = 10;

        for ($i = 0; $i < $requestCount; $i++) {
            $startTime = microtime(true);
            $this->actingAs($user)->get('/dashboard');
            $totalTime += (microtime(true) - $startTime);
        }

        $averageTime = ($totalTime / $requestCount) * 1000;

        $this->assertLessThan(500, $averageTime, "Average response time too high: {$averageTime}ms");
    }

    /**
     * Test: Logout performance
     */
    public function test_logout_performance(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        $startTime = microtime(true);

        $response = $this->actingAs($user)->post('/logout');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertRedirect();
        $this->assertLessThan(200, $responseTime, "Logout took too long: {$responseTime}ms");
    }

    /**
     * Test: Profile page performance
     */
    public function test_profile_page_performance(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $startTime = microtime(true);

        $response = $this->actingAs($user)->get('/profile');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertStatus(200);
        $this->assertLessThan(500, $responseTime, "Profile page took too long: {$responseTime}ms");
    }

    /**
     * Test: Database query count for user list
     */
    public function test_user_list_query_efficiency(): void
    {
        User::factory()->count(20)->create(['status' => 'Active']);

        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        \DB::enableQueryLog();

        $this->actingAs($admin)->get('/user-management');

        $queries = \DB::getQueryLog();
        \DB::disableQueryLog();

        // Should not have N+1 query problem (allow reasonable number of queries)
        $this->assertLessThan(30, count($queries), "Too many queries: " . count($queries));
    }
}
