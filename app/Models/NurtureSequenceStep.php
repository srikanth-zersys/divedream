<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NurtureSequenceStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'nurture_sequence_id',
        'step_number',
        'name',
        'type',
        'delay_days',
        'delay_hours',
        'send_time',
        'send_days',
        'email_template',
        'email_subject',
        'email_preview',
        'conditions',
        'branch_to_step',
        'goal_action',
        'end_on_goal',
        'is_active',
    ];

    protected $casts = [
        'send_days' => 'array',
        'conditions' => 'array',
        'end_on_goal' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Step types
    public const TYPE_EMAIL = 'email';
    public const TYPE_SMS = 'sms';
    public const TYPE_WAIT = 'wait';
    public const TYPE_CONDITION = 'condition';

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(NurtureSequence::class, 'nurture_sequence_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the total delay in hours
     */
    public function getTotalDelayHours(): int
    {
        return ($this->delay_days * 24) + $this->delay_hours;
    }

    /**
     * Calculate when this step should be sent for a lead
     */
    public function getSendTimeForLead(Lead $lead): \Carbon\Carbon
    {
        // Find when the lead started the sequence or completed the previous step
        $lastActivity = $lead->activities()
            ->whereIn('type', ['nurture_started', 'nurture_step_advanced'])
            ->latest()
            ->first();

        $baseTime = $lastActivity ? $lastActivity->created_at : $lead->created_at;
        $sendTime = $baseTime->copy()->addDays($this->delay_days)->addHours($this->delay_hours);

        // Adjust for preferred send time
        if ($this->send_time) {
            [$hour, $minute] = explode(':', $this->send_time);
            $sendTime->setTime((int) $hour, (int) $minute);

            // If we've passed this time today, move to next valid day
            if ($sendTime->isPast()) {
                $sendTime->addDay();
            }
        }

        // Adjust for send days
        if ($this->send_days && !empty($this->send_days)) {
            while (!in_array($sendTime->dayOfWeek, $this->send_days)) {
                $sendTime->addDay();
            }
        }

        return $sendTime;
    }

    /**
     * Check if this step should be sent now
     */
    public function shouldSendNow(Lead $lead): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $sendTime = $this->getSendTimeForLead($lead);
        return $sendTime->isPast() || $sendTime->isToday();
    }

    /**
     * Check if the lead meets the conditions for this step
     */
    public function leadMeetsConditions(Lead $lead): bool
    {
        if (!$this->conditions || empty($this->conditions)) {
            return true;
        }

        foreach ($this->conditions as $condition) {
            if (!$this->evaluateCondition($lead, $condition)) {
                return false;
            }
        }

        return true;
    }

    protected function evaluateCondition(Lead $lead, array $condition): bool
    {
        $type = $condition['type'] ?? null;
        $operator = $condition['operator'] ?? 'equals';
        $value = $condition['value'] ?? null;

        $actualValue = match ($type) {
            'score' => $lead->score,
            'qualification' => $lead->qualification,
            'status' => $lead->status,
            'email_opens' => $lead->email_opens,
            'email_clicks' => $lead->email_clicks,
            'page_views' => $lead->page_views,
            'opened_previous' => $lead->activities()
                ->where('type', 'email_open')
                ->where('properties->step', $this->step_number - 1)
                ->exists(),
            'clicked_previous' => $lead->activities()
                ->where('type', 'email_click')
                ->where('properties->step', $this->step_number - 1)
                ->exists(),
            default => null,
        };

        if ($actualValue === null) {
            return true;
        }

        return match ($operator) {
            'equals' => $actualValue == $value,
            'not_equals' => $actualValue != $value,
            'greater_than' => $actualValue > $value,
            'less_than' => $actualValue < $value,
            'contains' => str_contains((string) $actualValue, (string) $value),
            'is_true' => (bool) $actualValue === true,
            'is_false' => (bool) $actualValue === false,
            default => true,
        };
    }

    /**
     * Check if the lead has completed the goal for this step
     */
    public function leadCompletedGoal(Lead $lead): bool
    {
        if (!$this->goal_action) {
            return false;
        }

        // Check if the lead has performed the goal action since starting this step
        return $lead->activities()
            ->where('type', $this->goal_action)
            ->where('created_at', '>=', $this->getSendTimeForLead($lead))
            ->exists();
    }

    /**
     * Get the next step in the sequence
     */
    public function getNextStep(): ?self
    {
        // If there's a branch condition, check it
        if ($this->branch_to_step) {
            return $this->sequence->getStep($this->branch_to_step);
        }

        return $this->sequence->steps()
            ->where('step_number', '>', $this->step_number)
            ->orderBy('step_number')
            ->first();
    }

    /**
     * Get the email template path
     */
    public function getEmailTemplatePath(): string
    {
        return "emails.nurture.{$this->sequence->slug}.{$this->email_template}";
    }
}
