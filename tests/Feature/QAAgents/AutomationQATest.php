<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Automation QA Engineer (4 years experience)
 * Focus: Automated test scenarios, reusable test patterns, data-driven testing
 * Approach: Creates comprehensive automated test suites with parameterized tests
 */
class AutomationQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Data provider for valid registration data
     */
    public static function validRegistrationDataProvider(): array
    {
        return [
            'standard_user' => [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
            ],
            'long_name' => [
                'name' => 'Alexander Bartholomew Christopher Davidson',
                'email' => 'alex@example.com',
                'password' => 'securepass456',
            ],
            'special_chars_email' => [
                'name' => 'Test User',
                'email' => 'test.user+tag@example.com',
                'password' => 'mypassword789',
            ],
            'minimum_valid' => [
                'name' => 'ABC',
                'email' => 'a@b.co',
                'password' => '12345678',
            ],
        ];
    }

    /**
     * @dataProvider validRegistrationDataProvider
     */
    public function test_registration_with_valid_data(string $name, string $email, string $password): void
    {
        $response = $this->post('/register', [
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', ['email' => $email]);
    }

    /**
     * Data provider for invalid email formats
     */
    public static function invalidEmailDataProvider(): array
    {
        return [
            'no_at_symbol' => ['invalidemail.com'],
            'no_domain' => ['invalid@'],
            'no_local' => ['@example.com'],
            'spaces' => ['invalid email@example.com'],
            'double_at' => ['invalid@@example.com'],
        ];
    }

    /**
     * @dataProvider invalidEmailDataProvider
     */
    public function test_registration_fails_with_invalid_email(string $invalidEmail): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => $invalidEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Data provider for protected routes
     */
    public static function protectedRoutesProvider(): array
    {
        return [
            'dashboard' => ['/dashboard', 'GET'],
            'profile' => ['/profile', 'GET'],
            'user_management' => ['/user-management', 'GET'],
            'user_create' => ['/user-management/create', 'GET'],
            'starter_page' => ['/page/starter', 'GET'],
        ];
    }

    /**
     * @dataProvider protectedRoutesProvider
     */
    public function test_protected_routes_redirect_unauthenticated(string $route, string $method): void
    {
        $response = $this->call($method, $route);

        $response->assertRedirect('/login');
    }

    /**
     * @dataProvider protectedRoutesProvider
     */
    public function test_protected_routes_accessible_when_authenticated(string $route, string $method): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->call($method, $route);

        $response->assertStatus(200);
    }

    /**
     * Data provider for user statuses
     */
    public static function userStatusProvider(): array
    {
        return [
            'active_user' => ['Active', true],
            'inactive_user' => ['Inactive', false],
        ];
    }

    /**
     * @dataProvider userStatusProvider
     */
    public function test_user_login_based_on_status(string $status, bool $shouldLogin): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'status' => $status,
        ]);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        if ($shouldLogin) {
            $this->assertAuthenticated();
        } else {
            $this->assertGuest();
        }
    }

    /**
     * Test: Complete registration flow
     */
    public function test_complete_registration_flow(): void
    {
        // Step 1: Access registration page
        $response = $this->get('/register');
        $response->assertStatus(200);

        // Step 2: Submit registration
        $response = $this->post('/register', [
            'name' => 'Flow Test User',
            'email' => 'flowtest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Step 3: Verify redirect to dashboard
        $response->assertRedirect('/dashboard');

        // Step 4: Verify authenticated
        $this->assertAuthenticated();

        // Step 5: Verify database record
        $this->assertDatabaseHas('users', [
            'email' => 'flowtest@example.com',
            'name' => 'Flow Test User',
        ]);
    }

    /**
     * Test: Complete login-logout flow
     */
    public function test_complete_login_logout_flow(): void
    {
        // Setup: Create user
        $user = User::factory()->create([
            'email' => 'flow@example.com',
            'password' => bcrypt('password123'),
            'status' => 'Active',
        ]);

        // Step 1: Access login page
        $response = $this->get('/login');
        $response->assertStatus(200);

        // Step 2: Submit login
        $response = $this->post('/login', [
            'email' => 'flow@example.com',
            'password' => 'password123',
        ]);
        $response->assertRedirect('/dashboard');

        // Step 3: Verify authenticated
        $this->assertAuthenticatedAs($user);

        // Step 4: Access protected resource
        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);

        // Step 5: Logout
        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/');

        // Step 6: Verify logged out
        $this->assertGuest();
    }

    /**
     * Test: Batch user creation
     */
    public function test_batch_user_creation(): void
    {
        $users = User::factory()->count(10)->create(['status' => 'Active']);

        $this->assertCount(10, $users);
        $this->assertEquals(10, User::count());

        foreach ($users as $user) {
            $this->assertDatabaseHas('users', ['id' => $user->id]);
        }
    }

    /**
     * Test: User with role assignment
     */
    public function test_user_role_assignment_flow(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        // Initially no roles
        $this->assertFalse($user->hasRole('Admin'));
        $this->assertFalse($user->hasRole('User'));

        // Assign Admin role
        $user->assignRole('Admin');
        $this->assertTrue($user->hasRole('Admin'));

        // Sync to User role
        $user->syncRoles(['User']);
        $this->assertFalse($user->hasRole('Admin'));
        $this->assertTrue($user->hasRole('User'));
    }
}
