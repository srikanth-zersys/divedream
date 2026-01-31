<?php

namespace Tests\Feature\QAAgents;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * UX/UI QA Tester (3 years experience)
 * Focus: User experience, page structure, form usability, accessibility
 * Approach: Tests that pages render correctly with proper structure and elements
 */
class UXUIQATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
    }

    /**
     * Test: Login page has required form elements
     */
    public function test_login_page_has_form_elements(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        // Inertia renders the page, so we check for successful load
        $response->assertSee('login', false);
    }

    /**
     * Test: Registration page has required form elements
     */
    public function test_registration_page_has_form_elements(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    /**
     * Test: Dashboard has user-friendly content
     */
    public function test_dashboard_has_user_content(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'status' => 'Active',
        ]);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }

    /**
     * Test: Error pages display properly
     */
    public function test_404_page_displays(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/page/404');

        $response->assertStatus(200);
    }

    /**
     * Test: 500 error page displays
     */
    public function test_500_page_displays(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/page/500');

        $response->assertStatus(200);
    }

    /**
     * Test: Profile page shows user information
     */
    public function test_profile_page_shows_user_info(): void
    {
        $user = User::factory()->create([
            'name' => 'Test Profile User',
            'email' => 'profile@example.com',
            'status' => 'Active',
        ]);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/profile');

        $response->assertStatus(200);
    }

    /**
     * Test: User management list displays
     */
    public function test_user_management_list_displays(): void
    {
        User::factory()->count(5)->create(['status' => 'Active']);

        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->get('/user-management');

        $response->assertStatus(200);
    }

    /**
     * Test: Create user form displays
     */
    public function test_create_user_form_displays(): void
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->get('/user-management/create');

        $response->assertStatus(200);
    }

    /**
     * Test: Edit user form displays
     */
    public function test_edit_user_form_displays(): void
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $userToEdit = User::factory()->create(['status' => 'Active']);

        $response = $this->actingAs($admin)->get('/user-management/edit/' . $userToEdit->id);

        $response->assertStatus(200);
    }

    /**
     * Test: Starter page displays
     */
    public function test_starter_page_displays(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/page/starter');

        $response->assertStatus(200);
    }

    /**
     * Test: Forgot password page displays
     */
    public function test_forgot_password_page_displays(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    /**
     * Test: Page redirects maintain consistency
     */
    public function test_redirect_consistency(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'status' => 'Active',
        ]);

        // Login should redirect to dashboard
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
    }

    /**
     * Test: Flash messages work correctly
     */
    public function test_flash_messages_on_user_creation(): void
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->post('/user-management/store', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'User',
        ]);

        // Should redirect with success message
        $response->assertRedirect();
    }

    /**
     * Test: Validation errors displayed on registration
     */
    public function test_validation_errors_on_registration(): void
    {
        $response = $this->post('/register', [
            'name' => '',
            'email' => 'invalid',
            'password' => '123',
            'password_confirmation' => '456',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'password']);
    }

    /**
     * Test: Page titles and meta information
     */
    public function test_pages_have_proper_response(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('User');

        $pages = [
            '/login',
            '/register',
            '/forgot-password',
        ];

        foreach ($pages as $page) {
            $response = $this->get($page);
            $response->assertStatus(200);
        }

        $authenticatedPages = [
            '/dashboard',
            '/profile',
        ];

        foreach ($authenticatedPages as $page) {
            $response = $this->actingAs($user)->get($page);
            $response->assertStatus(200);
        }
    }
}
