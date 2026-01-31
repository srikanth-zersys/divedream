<?php

namespace App\Mail;

use App\Models\ReviewRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewRequestEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ReviewRequest $reviewRequest,
        public bool $isReminder = false
    ) {}

    public function envelope(): Envelope
    {
        $booking = $this->reviewRequest->booking;
        $subject = $this->isReminder
            ? "We'd still love your feedback! - {$booking->product?->name}"
            : "How was your dive? - {$booking->product?->name}";

        return new Envelope(
            subject: $subject,
            replyTo: $booking->tenant->email,
        );
    }

    public function content(): Content
    {
        $booking = $this->reviewRequest->booking;
        $externalLinks = $this->reviewRequest->getExternalReviewLinks();

        return new Content(
            markdown: 'emails.automation.review-request',
            with: [
                'reviewRequest' => $this->reviewRequest,
                'booking' => $booking,
                'tenant' => $booking->tenant,
                'product' => $booking->product,
                'member' => $booking->member,
                'reviewUrl' => $this->reviewRequest->getReviewUrl(),
                'externalLinks' => $externalLinks,
                'isReminder' => $this->isReminder,
            ],
        );
    }
}
