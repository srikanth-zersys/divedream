<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public int $daysUntil = 1
    ) {
        $this->booking->load(['member', 'product', 'schedule', 'location', 'participants']);
    }

    public function envelope(): Envelope
    {
        $subject = $this->daysUntil === 1
            ? "Reminder: Your dive is tomorrow!"
            : "Reminder: Your dive is in {$this->daysUntil} days";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.reminder',
            with: [
                'booking' => $this->booking,
                'member' => $this->booking->member,
                'product' => $this->booking->product,
                'schedule' => $this->booking->schedule,
                'location' => $this->booking->location,
                'tenant' => $this->booking->tenant,
                'daysUntil' => $this->daysUntil,
            ],
        );
    }
}
