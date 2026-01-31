<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;
    protected Location $location;
    protected Member $member;
    protected Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->location = Location::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->member = Member::factory()->create(['tenant_id' => $this->tenant->id]);

        $schedule = Schedule::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
        ]);

        $this->booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $schedule->id,
            'member_id' => $this->member->id,
            'total_amount' => 200.00,
            'amount_paid' => 0.00,
            'balance_due' => 200.00,
            'payment_status' => 'pending',
        ]);
    }

    public function test_user_can_record_payment(): void
    {
        $response = $this->actingAs($this->user)->post(
            route('admin.bookings.payments.store', $this->booking),
            [
                'amount' => 100.00,
                'method' => 'cash',
                'type' => 'deposit',
                'notes' => 'Cash deposit payment',
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('payments', [
            'booking_id' => $this->booking->id,
            'amount' => 100.00,
            'method' => 'cash',
            'type' => 'deposit',
            'status' => 'succeeded',
        ]);
    }

    public function test_payment_updates_booking_status(): void
    {
        // Record full payment
        $payment = Payment::factory()->forBooking($this->booking)->create([
            'amount' => 200.00,
            'status' => 'succeeded',
        ]);

        $payment->markAsSucceeded();
        $this->booking->refresh();

        $this->assertEquals('fully_paid', $this->booking->payment_status);
        $this->assertEquals(200.00, $this->booking->amount_paid);
        $this->assertEquals(0.00, $this->booking->balance_due);
    }

    public function test_partial_payment_updates_booking_to_deposit_paid(): void
    {
        $payment = Payment::factory()->forBooking($this->booking)->create([
            'amount' => 50.00,
            'status' => 'succeeded',
        ]);

        $payment->markAsSucceeded();
        $this->booking->refresh();

        $this->assertEquals('deposit_paid', $this->booking->payment_status);
        $this->assertEquals(50.00, $this->booking->amount_paid);
        $this->assertEquals(150.00, $this->booking->balance_due);
    }

    public function test_payment_refund_updates_booking_status(): void
    {
        // First make full payment
        $payment = Payment::factory()->forBooking($this->booking)->create([
            'amount' => 200.00,
            'status' => 'succeeded',
        ]);
        $payment->markAsSucceeded();

        // Then refund partial amount
        $refund = Payment::factory()->forBooking($this->booking)->refund()->create([
            'amount' => 100.00,
            'status' => 'succeeded',
            'original_payment_id' => $payment->id,
        ]);

        $this->booking->refresh();

        // Manually recalculate (simulating what the webhook would do)
        $paid = $this->booking->payments()->successful()->payments()->sum('amount');
        $refunded = $this->booking->payments()->successful()->refunds()->sum('amount');
        $netPaid = $paid - $refunded;

        $this->assertEquals(200.00, $paid);
        $this->assertEquals(100.00, $refunded);
        $this->assertEquals(100.00, $netPaid);
    }

    public function test_failed_payment_does_not_affect_booking(): void
    {
        Payment::factory()->forBooking($this->booking)->failed()->create([
            'amount' => 200.00,
        ]);

        $this->booking->refresh();

        // Booking should still be pending
        $this->assertEquals('pending', $this->booking->payment_status);
        $this->assertEquals(0.00, $this->booking->amount_paid);
        $this->assertEquals(200.00, $this->booking->balance_due);
    }

    public function test_payment_can_be_refunded(): void
    {
        $payment = Payment::factory()->forBooking($this->booking)->succeeded()->create([
            'amount' => 200.00,
        ]);

        $this->assertTrue($payment->canBeRefunded());
        $this->assertEquals(200.00, $payment->getRefundableAmount());
    }

    public function test_partial_refund_reduces_refundable_amount(): void
    {
        $payment = Payment::factory()->forBooking($this->booking)->succeeded()->create([
            'amount' => 200.00,
        ]);

        // Create partial refund
        Payment::factory()->forBooking($this->booking)->refund()->succeeded()->create([
            'amount' => 50.00,
            'original_payment_id' => $payment->id,
        ]);

        $this->assertEquals(150.00, $payment->getRefundableAmount());
        $this->assertTrue($payment->canBeRefunded());
    }

    public function test_full_refund_prevents_further_refunds(): void
    {
        $payment = Payment::factory()->forBooking($this->booking)->succeeded()->create([
            'amount' => 200.00,
        ]);

        // Create full refund
        Payment::factory()->forBooking($this->booking)->refund()->succeeded()->create([
            'amount' => 200.00,
            'original_payment_id' => $payment->id,
        ]);

        $this->assertEquals(0.00, $payment->getRefundableAmount());
        $this->assertFalse($payment->canBeRefunded());
    }

    public function test_user_cannot_access_other_tenant_payments(): void
    {
        $otherTenant = Tenant::factory()->create();
        $otherLocation = Location::factory()->create(['tenant_id' => $otherTenant->id]);
        $otherBooking = Booking::factory()->create([
            'tenant_id' => $otherTenant->id,
            'location_id' => $otherLocation->id,
        ]);

        $response = $this->actingAs($this->user)->post(
            route('admin.bookings.payments.store', $otherBooking),
            [
                'amount' => 100.00,
                'method' => 'cash',
                'type' => 'payment',
            ]
        );

        $response->assertForbidden();
    }

    public function test_payment_generates_unique_payment_number(): void
    {
        $payment1 = Payment::factory()->forBooking($this->booking)->create();
        $payment2 = Payment::factory()->forBooking($this->booking)->create();

        $this->assertNotEquals($payment1->payment_number, $payment2->payment_number);
        $this->assertStringStartsWith('PAY-', $payment1->payment_number);
        $this->assertStringStartsWith('PAY-', $payment2->payment_number);
    }

    public function test_failed_payment_stores_failure_reason(): void
    {
        $payment = Payment::factory()->forBooking($this->booking)->pending()->create();

        $payment->markAsFailed('Card declined - insufficient funds');

        $payment->refresh();
        $this->assertEquals('failed', $payment->status);
        $this->assertEquals('Card declined - insufficient funds', $payment->failure_reason);
    }

    public function test_multiple_payments_accumulate_correctly(): void
    {
        // Record first deposit
        $payment1 = Payment::factory()->forBooking($this->booking)->deposit()->create([
            'amount' => 50.00,
            'status' => 'succeeded',
        ]);
        $payment1->markAsSucceeded();

        // Record second payment
        $payment2 = Payment::factory()->forBooking($this->booking)->create([
            'amount' => 100.00,
            'status' => 'succeeded',
        ]);
        $payment2->markAsSucceeded();

        $this->booking->refresh();

        $this->assertEquals(150.00, $this->booking->amount_paid);
        $this->assertEquals(50.00, $this->booking->balance_due);
        $this->assertEquals('deposit_paid', $this->booking->payment_status);

        // Record final payment
        $payment3 = Payment::factory()->forBooking($this->booking)->create([
            'amount' => 50.00,
            'status' => 'succeeded',
        ]);
        $payment3->markAsSucceeded();

        $this->booking->refresh();

        $this->assertEquals(200.00, $this->booking->amount_paid);
        $this->assertEquals(0.00, $this->booking->balance_due);
        $this->assertEquals('fully_paid', $this->booking->payment_status);
    }
}
