<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Member;
use App\Models\Product;
use App\Models\ProductRequirement;
use App\Models\Schedule;
use App\Models\Tenant;
use Carbon\Carbon;

class BookingRulesService
{
    /**
     * Validate all booking rules before creating a booking
     *
     * Industry Best Practice for Dive Shops:
     * - Verify certification requirements
     * - Check age restrictions
     * - Validate health requirements
     * - Enforce booking cutoff times
     * - Check capacity limits
     */
    public function validateBooking(
        Tenant $tenant,
        Product $product,
        Schedule $schedule,
        Member $member,
        array $bookingData = []
    ): array {
        $errors = [];
        $warnings = [];
        $requirements = [];
        $canBook = true;

        // 1. Validate timing rules
        $timingValidation = $this->validateBookingTiming($tenant, $schedule, $bookingData);
        if (!$timingValidation['valid']) {
            $errors = array_merge($errors, $timingValidation['errors']);
            $canBook = false;
        }
        $warnings = array_merge($warnings, $timingValidation['warnings'] ?? []);

        // 2. Validate capacity
        $capacityValidation = $this->validateCapacity($schedule, $bookingData['participant_count'] ?? 1);
        if (!$capacityValidation['valid']) {
            $errors = array_merge($errors, $capacityValidation['errors']);
            $canBook = false;
        }
        if ($capacityValidation['waitlist_available'] ?? false) {
            $warnings[] = 'Activity is fully booked. You may join the waitlist.';
        }

        // 3. Validate product requirements
        $requirementsValidation = $this->validateProductRequirements($product, $member, $bookingData);
        $requirements = $requirementsValidation['requirements'];

        foreach ($requirementsValidation['failed'] as $failed) {
            if ($failed['block_booking']) {
                $errors[] = $failed['message'];
                $canBook = false;
            } else {
                $warnings[] = $failed['message'];
            }
        }

        // 4. Check for special conditions (weather warnings, etc.)
        $specialConditions = $this->checkSpecialConditions($schedule);
        $warnings = array_merge($warnings, $specialConditions);

        return [
            'can_book' => $canBook,
            'errors' => $errors,
            'warnings' => $warnings,
            'requirements' => $requirements,
            'requires_manual_review' => $this->requiresManualReview($tenant, $product, $member, $errors, $warnings),
            'validation_timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Validate booking timing rules
     */
    public function validateBookingTiming(Tenant $tenant, Schedule $schedule, array $bookingData = []): array
    {
        $errors = [];
        $warnings = [];
        $now = Carbon::now();
        $activityDateTime = Carbon::parse($schedule->date . ' ' . $schedule->start_time);

        // Get booking rules (could be from tenant, location, or product)
        $cutoffHours = $tenant->booking_cutoff_hours ?? 24;
        $maxAdvanceDays = $tenant->max_advance_booking_days ?? 90;

        // Check if booking is too close to activity
        $hoursUntil = $now->diffInHours($activityDateTime, false);

        if ($hoursUntil < 0) {
            $errors[] = 'Cannot book activities in the past.';
        } elseif ($hoursUntil < $cutoffHours) {
            $errors[] = "Bookings must be made at least {$cutoffHours} hours in advance. " .
                "This activity starts in {$hoursUntil} hours.";
        }

        // Check if booking is too far in advance
        $daysUntil = $now->diffInDays($activityDateTime, false);
        if ($daysUntil > $maxAdvanceDays) {
            $errors[] = "Bookings cannot be made more than {$maxAdvanceDays} days in advance.";
        }

        // Check same-day cutoff time
        if ($activityDateTime->isToday()) {
            $sameDayCutoff = $tenant->same_day_cutoff_time ?? '18:00';
            if ($now->format('H:i') > $sameDayCutoff) {
                $errors[] = "Same-day bookings must be made before {$sameDayCutoff}.";
            }
        }

        // Warn about short notice
        if ($hoursUntil > 0 && $hoursUntil < 48 && empty($errors)) {
            $warnings[] = 'Short notice booking - confirmation may take longer.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'hours_until_activity' => max(0, $hoursUntil),
        ];
    }

    /**
     * Validate capacity constraints
     */
    public function validateCapacity(Schedule $schedule, int $participantCount): array
    {
        $errors = [];
        $currentBookings = $schedule->bookings()
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->sum('participant_count');

        $maxCapacity = $schedule->max_participants ?? $schedule->product->max_participants ?? 999;
        $availableSpots = $maxCapacity - $currentBookings;

        // Check if overbooking is allowed
        $allowOverbooking = $schedule->product->tenant->allow_overbooking ?? false;
        $overbookingLimit = $schedule->product->tenant->overbooking_limit_percent ?? 0;

        if ($participantCount > $availableSpots) {
            if ($allowOverbooking && $overbookingLimit > 0) {
                $overbookingCapacity = (int) ($maxCapacity * $overbookingLimit / 100);
                $totalWithOverbooking = $availableSpots + $overbookingCapacity;

                if ($participantCount <= $totalWithOverbooking) {
                    return [
                        'valid' => true,
                        'errors' => [],
                        'available_spots' => $availableSpots,
                        'overbooking_used' => true,
                        'waitlist_available' => false,
                    ];
                }
            }

            // Check waitlist option
            $waitlistEnabled = $schedule->product->tenant->waitlist_enabled ?? true;

            $errors[] = $availableSpots > 0
                ? "Only {$availableSpots} spots available. You requested {$participantCount}."
                : "This activity is fully booked.";

            return [
                'valid' => false,
                'errors' => $errors,
                'available_spots' => $availableSpots,
                'waitlist_available' => $waitlistEnabled,
            ];
        }

        // Check minimum participants
        $minParticipants = $schedule->min_participants ?? $schedule->product->min_participants ?? 1;
        if ($participantCount < $minParticipants) {
            $errors[] = "Minimum {$minParticipants} participants required.";
            return [
                'valid' => false,
                'errors' => $errors,
                'available_spots' => $availableSpots,
            ];
        }

        return [
            'valid' => true,
            'errors' => [],
            'available_spots' => $availableSpots,
            'spots_after_booking' => $availableSpots - $participantCount,
        ];
    }

    /**
     * Validate product-specific requirements (certification, age, health)
     */
    public function validateProductRequirements(Product $product, Member $member, array $bookingData = []): array
    {
        $requirements = ProductRequirement::where('product_id', $product->id)
            ->active()
            ->orderBy('sort_order')
            ->get();

        $passed = [];
        $failed = [];
        $pending = [];

        foreach ($requirements as $requirement) {
            $result = $requirement->validateMember($member, $bookingData);

            $requirementInfo = [
                'id' => $requirement->id,
                'name' => $requirement->name,
                'type' => $requirement->requirement_type,
                'is_mandatory' => $requirement->is_mandatory,
                'message' => $result['message'],
                'can_override' => $result['can_override'] ?? false,
                'block_booking' => $requirement->block_booking && $requirement->is_mandatory,
            ];

            if ($result['passed']) {
                // Check for pending items (like medical forms to complete)
                if (!empty($result['requires_medical_form']) || !empty($result['requires_parental_consent'])) {
                    $pending[] = $requirementInfo;
                } else {
                    $passed[] = $requirementInfo;
                }
            } else {
                $failed[] = $requirementInfo;
            }
        }

        return [
            'requirements' => [
                'passed' => $passed,
                'failed' => $failed,
                'pending' => $pending,
            ],
            'passed' => $passed,
            'failed' => $failed,
            'pending' => $pending,
            'all_mandatory_met' => collect($failed)
                ->where('is_mandatory', true)
                ->where('block_booking', true)
                ->isEmpty(),
        ];
    }

    /**
     * Check for special conditions or warnings
     */
    public function checkSpecialConditions(Schedule $schedule): array
    {
        $warnings = [];

        // Check if schedule has any notes/warnings
        if ($schedule->notes && str_contains(strtolower($schedule->notes), 'weather')) {
            $warnings[] = 'Weather conditions may affect this activity. Check forecast before departure.';
        }

        // Check schedule status
        if ($schedule->status === 'weather_dependent') {
            $warnings[] = 'This activity is weather-dependent and may be rescheduled.';
        }

        // Check if instructor is assigned
        if (!$schedule->instructor_id) {
            $warnings[] = 'Instructor to be confirmed.';
        }

        return $warnings;
    }

    /**
     * Determine if booking requires manual review
     */
    protected function requiresManualReview(
        Tenant $tenant,
        Product $product,
        Member $member,
        array $errors,
        array $warnings
    ): bool {
        // New members might need review
        if ($member->created_at > now()->subDays(1)) {
            return true;
        }

        // High-value products might need review
        if ($product->base_price > 500) {
            return true;
        }

        // If there are overridable errors
        if (!empty($errors)) {
            return true;
        }

        return false;
    }

    /**
     * Get requirements summary for a product (for display)
     */
    public function getProductRequirementsSummary(Product $product): array
    {
        $requirements = ProductRequirement::where('product_id', $product->id)
            ->active()
            ->orderBy('sort_order')
            ->get();

        $summary = [
            'certification' => null,
            'minimum_age' => null,
            'maximum_age' => null,
            'health_requirements' => false,
            'experience_required' => null,
            'documents_required' => [],
            'other' => [],
        ];

        foreach ($requirements as $req) {
            switch ($req->requirement_type) {
                case ProductRequirement::TYPE_CERTIFICATION:
                    $summary['certification'] = [
                        'name' => $req->name,
                        'message' => $req->customer_message,
                    ];
                    break;

                case ProductRequirement::TYPE_AGE_MINIMUM:
                    $summary['minimum_age'] = $req->value['minimum'] ?? null;
                    break;

                case ProductRequirement::TYPE_AGE_MAXIMUM:
                    $summary['maximum_age'] = $req->value['maximum'] ?? null;
                    break;

                case ProductRequirement::TYPE_HEALTH:
                    $summary['health_requirements'] = true;
                    break;

                case ProductRequirement::TYPE_EXPERIENCE:
                    $summary['experience_required'] = $req->value['minimum_dives'] ?? null;
                    break;

                case ProductRequirement::TYPE_DOCUMENTS:
                    $summary['documents_required'] = $req->value['required'] ?? [];
                    break;

                default:
                    $summary['other'][] = [
                        'name' => $req->name,
                        'message' => $req->customer_message,
                    ];
            }
        }

        return $summary;
    }

    /**
     * Check if member meets all requirements for a product
     */
    public function memberMeetsRequirements(Product $product, Member $member): bool
    {
        $validation = $this->validateProductRequirements($product, $member);
        return $validation['all_mandatory_met'];
    }
}
