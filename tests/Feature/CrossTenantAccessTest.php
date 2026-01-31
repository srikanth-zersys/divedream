<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\Instructor;
use App\Models\Location;
use App\Models\Member;
use App\Models\Product;
use App\Models\Quote;
use App\Models\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossTenantAccessTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant1;
    protected Tenant $tenant2;
    protected User $user1;
    protected User $user2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant1 = Tenant::factory()->create(['name' => 'Dive Shop 1']);
        $this->tenant2 = Tenant::factory()->create(['name' => 'Dive Shop 2']);

        $this->user1 = User::factory()->create(['tenant_id' => $this->tenant1->id]);
        $this->user2 = User::factory()->create(['tenant_id' => $this->tenant2->id]);
    }

    public function test_user_cannot_view_other_tenant_members(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.members.show', $member));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_bookings(): void
    {
        $booking = Booking::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.bookings.show', $booking));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_schedules(): void
    {
        $schedule = Schedule::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.schedules.show', $schedule));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_locations(): void
    {
        $location = Location::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.locations.show', $location));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_instructors(): void
    {
        $instructor = Instructor::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.instructors.show', $instructor));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_equipment(): void
    {
        $equipment = Equipment::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.equipment.show', $equipment));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_products(): void
    {
        $product = Product::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.products.show', $product));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_other_tenant_quotes(): void
    {
        $quote = Quote::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->get(route('admin.quotes.show', $quote));

        $response->assertForbidden();
    }

    public function test_user_cannot_edit_other_tenant_member(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->patch(route('admin.members.update', $member), [
                'first_name' => 'Hacked',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('members', [
            'id' => $member->id,
            'first_name' => 'Hacked',
        ]);
    }

    public function test_user_cannot_delete_other_tenant_booking(): void
    {
        $booking = Booking::factory()->create(['tenant_id' => $this->tenant2->id]);

        $response = $this->actingAs($this->user1)
            ->delete(route('admin.bookings.destroy', $booking));

        $response->assertForbidden();
        $this->assertDatabaseHas('bookings', ['id' => $booking->id]);
    }

    public function test_user_can_access_own_tenant_data(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant1->id]);
        $booking = Booking::factory()->create(['tenant_id' => $this->tenant1->id]);
        $location = Location::factory()->create(['tenant_id' => $this->tenant1->id]);

        $this->actingAs($this->user1)
            ->get(route('admin.members.show', $member))
            ->assertOk();

        $this->actingAs($this->user1)
            ->get(route('admin.bookings.show', $booking))
            ->assertOk();

        $this->actingAs($this->user1)
            ->get(route('admin.locations.show', $location))
            ->assertOk();
    }

    public function test_tenant_scope_filters_list_queries(): void
    {
        // Create data for both tenants
        Member::factory()->count(3)->create(['tenant_id' => $this->tenant1->id]);
        Member::factory()->count(5)->create(['tenant_id' => $this->tenant2->id]);

        // User 1 should only see tenant 1's members
        $response = $this->actingAs($this->user1)
            ->get(route('admin.members.index'));

        $response->assertOk();
        // The response should contain 3 members, not 8
        $this->assertCount(3, $response->original->getData()['members'] ?? []);
    }

    public function test_api_endpoints_respect_tenant_isolation(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant2->id]);

        // Try to access via API if available
        $response = $this->actingAs($this->user1)
            ->getJson("/api/members/{$member->id}");

        // Should either be 403 or 404 (not found due to tenant scope)
        $this->assertTrue(in_array($response->status(), [403, 404]));
    }

    public function test_cannot_create_resource_for_other_tenant(): void
    {
        $location = Location::factory()->create(['tenant_id' => $this->tenant1->id]);

        // Try to create a schedule with a location from another tenant
        $response = $this->actingAs($this->user2)
            ->post(route('admin.schedules.store'), [
                'location_id' => $location->id,
                'start_time' => now()->addDays(7),
                'max_participants' => 10,
            ]);

        // Should fail validation or authorization
        $this->assertTrue(in_array($response->status(), [403, 422]));
    }
}
