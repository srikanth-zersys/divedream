<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'equipment';

    protected $fillable = [
        'tenant_id',
        'location_id',
        'equipment_category_id',
        'name',
        'code',
        'serial_number',
        'barcode',
        'brand',
        'model',
        'size',
        'color',
        'manufacture_year',
        'purchase_date',
        'purchase_price',
        'rental_price_per_dive',
        'rental_price_per_day',
        'is_available_for_rental',
        'condition',
        'last_service_date',
        'next_service_due',
        'total_uses',
        'notes',
        'status',
    ];

    protected $casts = [
        'manufacture_year' => 'integer',
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'rental_price_per_dive' => 'decimal:2',
        'rental_price_per_day' => 'decimal:2',
        'is_available_for_rental' => 'boolean',
        'last_service_date' => 'date',
        'next_service_due' => 'date',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EquipmentCategory::class, 'equipment_category_id');
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(EquipmentMaintenanceLog::class);
    }

    public function bookingAssignments(): HasMany
    {
        return $this->hasMany(BookingEquipment::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeForRental($query)
    {
        return $query->where('is_available_for_rental', true);
    }

    public function scopeOfSize($query, string $size)
    {
        return $query->where('size', $size);
    }

    public function scopeInCategory($query, int $categoryId)
    {
        return $query->where('equipment_category_id', $categoryId);
    }

    public function scopeNeedsService($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('next_service_due')
              ->orWhere('next_service_due', '<=', now());
        });
    }

    // Helpers

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isInUse(): bool
    {
        return $this->status === 'in_use';
    }

    public function needsService(): bool
    {
        return $this->next_service_due && $this->next_service_due->isPast();
    }

    public function markAsInUse(): void
    {
        $this->update(['status' => 'in_use']);
    }

    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available']);
    }

    public function markForMaintenance(): void
    {
        $this->update(['status' => 'maintenance']);
    }

    public function retire(): void
    {
        $this->update([
            'status' => 'retired',
            'condition' => 'retired',
        ]);
    }

    public function recordUsage(): void
    {
        $this->increment('total_uses');
    }

    public function logMaintenance(array $data): EquipmentMaintenanceLog
    {
        return $this->maintenanceLogs()->create($data);
    }

    public function getDisplayName(): string
    {
        $parts = [$this->category?->name, $this->brand, $this->model, $this->size];
        return implode(' - ', array_filter($parts)) ?: $this->name;
    }
}
