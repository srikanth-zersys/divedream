<?php

namespace App\Mail;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class TeamInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public string $invitationUrl;
    public string $tempPassword;

    public function __construct(
        public User $user,
        public Tenant $tenant,
        public string $role,
        string $tempPassword
    ) {
        $this->tempPassword = $tempPassword;
        // Generate a password reset URL so user can set their own password
        $this->invitationUrl = URL::temporarySignedRoute(
            'password.reset',
            now()->addDays(7),
            [
                'token' => app('auth.password.broker')->createToken($user),
                'email' => $user->email,
            ]
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to join {$this->tenant->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.team.invitation',
            with: [
                'user' => $this->user,
                'tenant' => $this->tenant,
                'role' => $this->role,
                'invitationUrl' => $this->invitationUrl,
                'tempPassword' => $this->tempPassword,
            ],
        );
    }
}
