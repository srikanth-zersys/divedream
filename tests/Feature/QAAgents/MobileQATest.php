<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Mobile QA Tester (3 years experience)
 * Focus: Responsive design, mobile user agents, touch interactions
 * Approach: Tests application behavior with mobile user agents and screen sizes
 */
class MobileQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Mobile user agent strings for testing
     */
    protected function getMobileUserAgents(): array
    {
        return [
            'iPhone' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Android' => 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
            'iPad' => 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Samsung' => 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        ];
    }

    /**
     * Test: Homepage loads on mobile devices
     */
    public function test_homepage_loads_on_mobile(): void
    {
        foreach ($this->getMobileUserAgents() as $device => $userAgent) {
            $response = $this->withHeaders([
                'User-Agent' => $userAgent,
            ])->get('/');

            $response->assertStatus(200, "Homepage failed to load on {$device}");
        }
    }

    /**
     * Test: Login page loads on mobile devices
     */
    public function test_login_page_loads_on_mobile(): void
    {
        foreach ($this->getMobileUserAgents() as $device => $userAgent) {
            $response = $this->withHeaders([
                'User-Agent' => $userAgent,
            ])->get('/login');

            $response->assertStatus(200, "Login page failed to load on {$device}");
        }
    }

    /**
     * Test: Registration works on mobile devices
     */
    public function test_registration_works_on_mobile(): void
    {
        $userAgent = $this->getMobileUserAgents()['iPhone'];

        $response = $this->withHeaders([
            'User-Agent' => $userAgent,
        ])->post('/register', [
            'name' => 'Mobile User',
            'email' => 'mobile@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'mobile@example.com']);
    }

    /**
     * Test: Login works on mobile devices
     */
    public function test_login_works_on_mobile(): void
    {
        $user = User::factory()->create([
            'email' => 'mobilelogin@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Active',
        ]);

        $userAgent = $this->getMobileUserAgents()['Android'];

        $response = $this->withHeaders([
            'User-Agent' => $userAgent,
        ])->post('/login', [
            'email' => 'mobilelogin@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test: Dashboard loads on mobile
     */
    public function test_dashboard_loads_on_mobile(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        foreach ($this->getMobileUserAgents() as $device => $userAgent) {
            $response = $this->actingAs($user)->withHeaders([
                'User-Agent' => $userAgent,
            ])->get('/dashboard');

            $response->assertStatus(200, "Dashboard failed to load on {$device}");
        }
    }

    /**
     * Test: Profile page loads on mobile
     */
    public function test_profile_loads_on_mobile(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $userAgent = $this->getMobileUserAgents()['iPad'];

        $response = $this->actingAs($user)->withHeaders([
            'User-Agent' => $userAgent,
        ])->get('/profile');

        $response->assertStatus(200);
    }

    /**
     * Test: User management loads on mobile
     */
    public function test_user_management_loads_on_mobile(): void
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        User::factory()->count(10)->create(['status' => 'Active']);

        $userAgent = $this->getMobileUserAgents()['Samsung'];

        $response = $this->actingAs($admin)->withHeaders([
            'User-Agent' => $userAgent,
        ])->get('/user-management');

        $response->assertStatus(200);
    }

    /**
     * Test: Logout works on mobile
     */
    public function test_logout_works_on_mobile(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        $userAgent = $this->getMobileUserAgents()['iPhone'];

        $response = $this->actingAs($user)->withHeaders([
            'User-Agent' => $userAgent,
        ])->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    /**
     * Test: Form validation on mobile
     */
    public function test_form_validation_on_mobile(): void
    {
        $userAgent = $this->getMobileUserAgents()['Android'];

        $response = $this->withHeaders([
            'User-Agent' => $userAgent,
        ])->post('/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['email', 'password']);
    }

    /**
     * Test: Forgot password on mobile
     */
    public function test_forgot_password_on_mobile(): void
    {
        $userAgent = $this->getMobileUserAgents()['iPhone'];

        $response = $this->withHeaders([
            'User-Agent' => $userAgent,
        ])->get('/forgot-password');

        $response->assertStatus(200);
    }

    /**
     * Test: Response time on mobile is acceptable
     */
    public function test_mobile_response_time(): void
    {
        $userAgent = $this->getMobileUserAgents()['iPhone'];

        $startTime = microtime(true);

        $response = $this->withHeaders([
            'User-Agent' => $userAgent,
        ])->get('/login');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000;

        $response->assertStatus(200);
        $this->assertLessThan(1000, $responseTime, "Mobile response too slow: {$responseTime}ms");
    }

    /**
     * Test: All main pages accessible on all mobile devices
     */
    public function test_all_pages_on_all_devices(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('Admin');

        // Guest middleware redirects authenticated users, so test separately
        $publicPages = ['/login', '/register', '/forgot-password'];
        $protectedPages = ['/dashboard', '/profile', '/user-management'];

        // Test public pages as guest (first iteration only to save time)
        $userAgent = array_values($this->getMobileUserAgents())[0];
        foreach ($publicPages as $page) {
            $response = $this->withHeaders([
                'User-Agent' => $userAgent,
            ])->get($page);

            $response->assertStatus(200, "{$page} failed on mobile");
        }

        // Test protected pages on all devices
        foreach ($this->getMobileUserAgents() as $device => $userAgent) {
            foreach ($protectedPages as $page) {
                $response = $this->actingAs($user)->withHeaders([
                    'User-Agent' => $userAgent,
                ])->get($page);

                $response->assertStatus(200, "{$page} failed on {$device} (authenticated)");
            }
        }
    }
}
