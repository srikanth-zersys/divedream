<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentMaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'performed_by',
        'type',
        'performed_at',
        'next_due_date',
        'description',
        'cost',
        'service_provider',
        'parts_replaced',
        'attachments',
    ];

    protected $casts = [
        'performed_at' => 'date',
        'next_due_date' => 'date',
        'cost' => 'decimal:2',
        'parts_replaced' => 'array',
        'attachments' => 'array',
    ];

    // Relationships

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function performedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
