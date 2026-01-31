<?php

namespace App\Mail;

use App\Models\AbandonedCart;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCartReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public AbandonedCart $cart,
        public int $reminderNumber = 1
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            1 => "Still thinking about your dive? Your spot is waiting!",
            2 => "Don't miss out! Complete your booking",
            3 => "Last chance! Special offer inside",
        ];

        return new Envelope(
            subject: $subjects[$this->reminderNumber] ?? $subjects[1],
            replyTo: $this->cart->tenant->email,
        );
    }

    public function content(): Content
    {
        $template = match ($this->reminderNumber) {
            1 => 'emails.automation.abandoned-cart.reminder-1',
            2 => 'emails.automation.abandoned-cart.reminder-2',
            3 => 'emails.automation.abandoned-cart.reminder-3',
            default => 'emails.automation.abandoned-cart.reminder-1',
        };

        return new Content(
            markdown: $template,
            with: [
                'cart' => $this->cart,
                'tenant' => $this->cart->tenant,
                'product' => $this->cart->product,
                'schedule' => $this->cart->schedule,
                'recoveryUrl' => $this->cart->getRecoveryUrl(),
                'hasDiscount' => $this->cart->isDiscountValid(),
                'discountPercent' => $this->cart->discount_percent,
                'discountCode' => $this->cart->discount_code,
                'discountExpires' => $this->cart->discount_expires_at,
                'reminderNumber' => $this->reminderNumber,
            ],
        );
    }
}
