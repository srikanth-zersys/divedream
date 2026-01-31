<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingEquipment extends Model
{
    use HasFactory;

    protected $table = 'booking_equipment';

    protected $fillable = [
        'booking_id',
        'booking_participant_id',
        'equipment_id',
        'checked_out_at',
        'returned_at',
        'condition_on_return',
        'notes',
    ];

    protected $casts = [
        'checked_out_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    // Relationships

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(BookingParticipant::class, 'booking_participant_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    // Helpers

    public function checkOut(): void
    {
        $this->update(['checked_out_at' => now()]);
        $this->equipment->markAsInUse();
    }

    public function checkIn(string $condition = 'good', string $notes = null): void
    {
        $this->update([
            'returned_at' => now(),
            'condition_on_return' => $condition,
            'notes' => $notes,
        ]);

        $this->equipment->markAsAvailable();
        $this->equipment->recordUsage();
    }

    public function isCheckedOut(): bool
    {
        return $this->checked_out_at !== null && $this->returned_at === null;
    }

    public function isReturned(): bool
    {
        return $this->returned_at !== null;
    }
}
