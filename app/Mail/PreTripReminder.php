<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\AutomationMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PreTripReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $messageType,
        public ?AutomationMessage $automationMessage = null
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            '7_days_before' => "Your dive adventure is coming up! - {$this->booking->booking_number}",
            '3_days_before' => "Getting ready for your dive - {$this->booking->booking_number}",
            '1_day_before' => "See you tomorrow! - {$this->booking->booking_number}",
            'morning_of' => "Today's the day! - {$this->booking->booking_number}",
        ];

        return new Envelope(
            subject: $subjects[$this->messageType] ?? "Reminder for your upcoming dive",
            replyTo: $this->booking->tenant->email,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: "emails.automation.pre-trip.{$this->messageType}",
            with: [
                'booking' => $this->booking,
                'tenant' => $this->booking->tenant,
                'schedule' => $this->booking->schedule,
                'product' => $this->booking->product,
                'member' => $this->booking->member,
                'location' => $this->booking->location ?? $this->booking->schedule?->location,
                'messageType' => $this->messageType,
                'trackingPixel' => $this->automationMessage
                    ? route('tracking.pixel', ['id' => $this->automationMessage->id])
                    : null,
            ],
        );
    }
}
