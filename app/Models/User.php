<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'phone',
        'status',
        'avatar',
        'job_title',
        'bio',
        'notification_preferences',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_preferences' => 'array',
            'last_login_at' => 'datetime',
        ];
    }

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function primaryLocation(): ?Location
    {
        return $this->locations()
            ->wherePivot('is_primary', true)
            ->first();
    }

    public function instructor(): HasOne
    {
        return $this->hasOne(Instructor::class);
    }

    public function member(): HasOne
    {
        return $this->hasOne(Member::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->whereHas('locations', fn($q) => $q->where('locations.id', $locationId));
    }

    // Helpers

    public function belongsToTenant(int $tenantId): bool
    {
        return $this->tenant_id === $tenantId;
    }

    public function hasAccessToLocation(int $locationId): bool
    {
        // Super admin or tenant owner has access to all locations
        if ($this->hasRole(['super-admin', 'owner'])) {
            return true;
        }

        return $this->locations()->where('locations.id', $locationId)->exists();
    }

    public function getAccessibleLocationIds(): array
    {
        // Owners/admins can access all tenant locations
        if ($this->hasRole(['owner', 'admin'])) {
            return $this->tenant?->locations()->pluck('id')->toArray() ?? [];
        }

        return $this->locations()->pluck('locations.id')->toArray();
    }

    public function isOwner(): bool
    {
        return $this->hasRole('owner');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['owner', 'admin']);
    }

    public function isStaff(): bool
    {
        return $this->hasRole(['owner', 'admin', 'manager', 'staff']);
    }

    public function isInstructor(): bool
    {
        return $this->instructor()->exists();
    }

    public function recordLogin(): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);
    }

    public function getInitials(): string
    {
        $words = explode(' ', $this->name);
        $initials = '';

        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }

        return $initials;
    }

    public function getAvatarUrl(): ?string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }

        return null;
    }
}
