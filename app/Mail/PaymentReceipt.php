<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment
    ) {
        $this->payment->load(['booking.product', 'booking.member', 'booking.tenant']);
    }

    public function envelope(): Envelope
    {
        $booking = $this->payment->booking;
        return new Envelope(
            subject: "Payment Receipt - {$booking->booking_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payments.receipt',
            with: [
                'payment' => $this->payment,
                'booking' => $this->payment->booking,
                'member' => $this->payment->booking->member,
                'product' => $this->payment->booking->product,
                'tenant' => $this->payment->booking->tenant,
            ],
        );
    }
}
