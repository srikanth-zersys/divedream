<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScheduleChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public array $changes
    ) {
        $this->booking->load(['product', 'schedule', 'location', 'tenant']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Schedule Change: {$this->booking->product?->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.schedule-changed',
            with: [
                'booking' => $this->booking,
                'changes' => $this->changes,
                'product' => $this->booking->product,
                'tenant' => $this->booking->tenant,
            ],
        );
    }
}
