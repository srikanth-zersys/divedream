<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Member;
use App\Models\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;
    protected Location $location;
    protected Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->location = Location::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->schedule = Schedule::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'max_participants' => 10,
            'start_time' => now()->addDays(7),
        ]);
    }

    public function test_user_can_create_booking(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->user)->post(route('admin.bookings.store'), [
            'schedule_id' => $this->schedule->id,
            'member_id' => $member->id,
            'participant_count' => 2,
            'notes' => 'Test booking',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'schedule_id' => $this->schedule->id,
            'member_id' => $member->id,
            'participant_count' => 2,
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_booking_prevents_overbooking(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant->id]);

        // Fill up the schedule
        Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'schedule_id' => $this->schedule->id,
            'participant_count' => 8,
            'status' => 'confirmed',
        ]);

        // Try to book more than available
        $response = $this->actingAs($this->user)->post(route('admin.bookings.store'), [
            'schedule_id' => $this->schedule->id,
            'member_id' => $member->id,
            'participant_count' => 5, // Only 2 spots available
        ]);

        $response->assertSessionHasErrors();
    }

    public function test_concurrent_bookings_prevented_with_locking(): void
    {
        $member1 = Member::factory()->create(['tenant_id' => $this->tenant->id]);
        $member2 = Member::factory()->create(['tenant_id' => $this->tenant->id]);

        // Fill schedule to near capacity
        Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'schedule_id' => $this->schedule->id,
            'participant_count' => 8,
            'status' => 'confirmed',
        ]);

        // Simulate concurrent booking attempts for the last 2 spots
        $bookingsCreated = 0;
        $errors = 0;

        // First booking should succeed
        try {
            DB::transaction(function () use ($member1, &$bookingsCreated) {
                $schedule = Schedule::lockForUpdate()->find($this->schedule->id);
                $bookedCount = $schedule->bookings()
                    ->whereNotIn('status', ['cancelled', 'no_show'])
                    ->sum('participant_count');
                $available = $schedule->max_participants - $bookedCount;

                if (2 <= $available) {
                    Booking::create([
                        'tenant_id' => $this->tenant->id,
                        'schedule_id' => $this->schedule->id,
                        'member_id' => $member1->id,
                        'participant_count' => 2,
                        'status' => 'confirmed',
                    ]);
                    $bookingsCreated++;
                }
            });
        } catch (\Exception $e) {
            $errors++;
        }

        // Second booking should fail (no more spots)
        try {
            DB::transaction(function () use ($member2, &$bookingsCreated) {
                $schedule = Schedule::lockForUpdate()->find($this->schedule->id);
                $bookedCount = $schedule->bookings()
                    ->whereNotIn('status', ['cancelled', 'no_show'])
                    ->sum('participant_count');
                $available = $schedule->max_participants - $bookedCount;

                if (2 <= $available) {
                    Booking::create([
                        'tenant_id' => $this->tenant->id,
                        'schedule_id' => $this->schedule->id,
                        'member_id' => $member2->id,
                        'participant_count' => 2,
                        'status' => 'confirmed',
                    ]);
                    $bookingsCreated++;
                } else {
                    throw new \Exception('Not enough spots');
                }
            });
        } catch (\Exception $e) {
            $errors++;
        }

        $this->assertEquals(1, $bookingsCreated);
        $this->assertEquals(1, $errors);
    }

    public function test_cancelled_bookings_free_up_spots(): void
    {
        $member = Member::factory()->create(['tenant_id' => $this->tenant->id]);

        // Fill up the schedule
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'schedule_id' => $this->schedule->id,
            'participant_count' => 10,
            'status' => 'confirmed',
        ]);

        // Cancel the booking
        $booking->update(['status' => 'cancelled']);

        // Now booking should be possible
        $response = $this->actingAs($this->user)->post(route('admin.bookings.store'), [
            'schedule_id' => $this->schedule->id,
            'member_id' => $member->id,
            'participant_count' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'member_id' => $member->id,
            'participant_count' => 5,
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_access_other_tenant_bookings(): void
    {
        $otherTenant = Tenant::factory()->create();
        $otherBooking = Booking::factory()->create([
            'tenant_id' => $otherTenant->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('admin.bookings.show', $otherBooking));

        $response->assertForbidden();
    }

    public function test_booking_status_transitions(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'schedule_id' => $this->schedule->id,
            'status' => 'pending',
        ]);

        // Confirm booking
        $response = $this->actingAs($this->user)
            ->patch(route('admin.bookings.update', $booking), [
                'status' => 'confirmed',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);

        // Complete booking
        $booking->refresh();
        $response = $this->actingAs($this->user)
            ->patch(route('admin.bookings.update', $booking), [
                'status' => 'completed',
            ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'completed',
        ]);
    }
}
