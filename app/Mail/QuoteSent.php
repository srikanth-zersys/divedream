<?php

namespace App\Mail;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteSent extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Quote $quote
    ) {}

    public function envelope(): Envelope
    {
        $tenantName = $this->quote->tenant->name;

        return new Envelope(
            subject: "Your Quote from {$tenantName} - {$this->quote->title}",
            replyTo: $this->quote->tenant->email,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quotes.sent',
            with: [
                'quote' => $this->quote,
                'tenant' => $this->quote->tenant,
                'viewUrl' => route('quotes.public', $this->quote->access_token),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
