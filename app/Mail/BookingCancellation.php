<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCancellation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {
        $this->booking->load(['member', 'product', 'schedule', 'location']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Booking Cancelled - {$this->booking->booking_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.cancellation',
            with: [
                'booking' => $this->booking,
                'member' => $this->booking->member,
                'product' => $this->booking->product,
                'schedule' => $this->booking->schedule,
                'location' => $this->booking->location,
                'tenant' => $this->booking->tenant,
            ],
        );
    }
}
