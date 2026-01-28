<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'recipient_type',
        'recipient_id',
        'recipient_email',
        'recipient_phone',
        'type',
        'channel',
        'subject',
        'content',
        'status',
        'sent_at',
        'error_message',
        'provider',
        'provider_message_id',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeViaChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeSent($query)
    {
        return $query->whereIn('status', ['sent', 'delivered']);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Helpers

    public function markAsSent(string $providerId = null): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'provider_message_id' => $providerId,
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update(['status' => 'delivered']);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }

    public function markAsBounced(): void
    {
        $this->update(['status' => 'bounced']);
    }

    public static function logEmail(
        int $tenantId,
        string $recipientType,
        int $recipientId,
        string $email,
        string $type,
        string $subject,
        string $content
    ): self {
        return self::create([
            'tenant_id' => $tenantId,
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'recipient_email' => $email,
            'type' => $type,
            'channel' => 'email',
            'subject' => $subject,
            'content' => $content,
            'status' => 'pending',
        ]);
    }

    public static function logSms(
        int $tenantId,
        string $recipientType,
        int $recipientId,
        string $phone,
        string $type,
        string $content
    ): self {
        return self::create([
            'tenant_id' => $tenantId,
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'recipient_phone' => $phone,
            'type' => $type,
            'channel' => 'sms',
            'content' => $content,
            'status' => 'pending',
        ]);
    }
}
