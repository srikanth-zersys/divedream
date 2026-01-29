<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaiverReminder extends Mailable
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
            subject: "Action Required: Please Sign Your Waiver",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.waiver-reminder',
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
