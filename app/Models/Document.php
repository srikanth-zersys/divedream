<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'documentable_type',
        'documentable_id',
        'name',
        'type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'requires_signature',
        'is_signed',
        'signed_at',
        'signature_ip',
        'signature_data',
        'expiry_date',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'requires_signature' => 'boolean',
        'is_signed' => 'boolean',
        'signed_at' => 'datetime',
        'expiry_date' => 'date',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploadedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
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

    public function scopeSigned($query)
    {
        return $query->where('is_signed', true);
    }

    public function scopeUnsigned($query)
    {
        return $query->where('requires_signature', true)
            ->where('is_signed', false);
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiry_date')
            ->where('expiry_date', '<', now());
    }

    public function scopeValid($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expiry_date')
              ->orWhere('expiry_date', '>=', now());
        });
    }

    // Helpers

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function needsSignature(): bool
    {
        return $this->requires_signature && !$this->is_signed;
    }

    public function sign(string $signatureData, string $ip = null): void
    {
        $this->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signature_data' => $signatureData,
            'signature_ip' => $ip,
        ]);
    }

    public function getFileSizeForHumans(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getUrl(): string
    {
        return asset('storage/' . $this->file_path);
    }
}
