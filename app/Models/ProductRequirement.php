<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'requirement_type',
        'name',
        'description',
        'value',
        'is_mandatory',
        'can_override',
        'requires_verification',
        'block_booking',
        'customer_message',
        'verification_instructions',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'value' => 'array',
        'is_mandatory' => 'boolean',
        'can_override' => 'boolean',
        'requires_verification' => 'boolean',
        'block_booking' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Requirement Types
    const TYPE_CERTIFICATION = 'certification';
    const TYPE_AGE_MINIMUM = 'age_minimum';
    const TYPE_AGE_MAXIMUM = 'age_maximum';
    const TYPE_HEALTH = 'health';
    const TYPE_EXPERIENCE = 'experience';
    const TYPE_EQUIPMENT = 'equipment';
    const TYPE_DOCUMENTS = 'documents';
    const TYPE_SKILL = 'skill';
    const TYPE_PHYSICAL = 'physical';

    // Common requirement presets for dive industry
    const PRESET_OPEN_WATER = [
        'type' => self::TYPE_CERTIFICATION,
        'name' => 'Open Water Certification',
        'value' => ['min_level' => 1, 'accepted_codes' => ['PADI-OW', 'SSI-OW', 'NAUI-SD']],
        'customer_message' => 'Open Water Diver certification or equivalent required.',
    ];

    const PRESET_ADVANCED = [
        'type' => self::TYPE_CERTIFICATION,
        'name' => 'Advanced Certification',
        'value' => ['min_level' => 2, 'accepted_codes' => ['PADI-AOW', 'SSI-AA', 'NAUI-ASD']],
        'customer_message' => 'Advanced Open Water certification or equivalent required.',
    ];

    const PRESET_AGE_10 = [
        'type' => self::TYPE_AGE_MINIMUM,
        'name' => 'Minimum Age 10',
        'value' => ['minimum' => 10],
        'customer_message' => 'Participants must be at least 10 years old.',
    ];

    const PRESET_AGE_12 = [
        'type' => self::TYPE_AGE_MINIMUM,
        'name' => 'Minimum Age 12',
        'value' => ['minimum' => 12],
        'customer_message' => 'Participants must be at least 12 years old.',
    ];

    const PRESET_AGE_18 = [
        'type' => self::TYPE_AGE_MINIMUM,
        'name' => 'Minimum Age 18',
        'value' => ['minimum' => 18, 'parental_consent_under' => null],
        'customer_message' => 'Participants must be at least 18 years old.',
    ];

    const PRESET_HEALTH_STANDARD = [
        'type' => self::TYPE_HEALTH,
        'name' => 'Medical Fitness',
        'value' => [
            'requires_medical_form' => true,
            'conditions_requiring_clearance' => [
                'heart_disease', 'lung_disease', 'epilepsy', 'diabetes',
                'high_blood_pressure', 'recent_surgery', 'pregnancy',
            ],
        ],
        'customer_message' => 'Please complete the medical questionnaire. Certain conditions may require doctor clearance.',
    ];

    // Relationships

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('requirement_type', $type);
    }

    // Validation Methods

    /**
     * Check if a member meets this requirement
     *
     * @param Member $member The member to validate
     * @param array $bookingData Additional booking context (e.g., age at time of activity)
     * @return array{passed: bool, message: string, can_override: bool}
     */
    public function validateMember(Member $member, array $bookingData = []): array
    {
        return match ($this->requirement_type) {
            self::TYPE_CERTIFICATION => $this->validateCertification($member),
            self::TYPE_AGE_MINIMUM => $this->validateAgeMinimum($member, $bookingData),
            self::TYPE_AGE_MAXIMUM => $this->validateAgeMaximum($member, $bookingData),
            self::TYPE_HEALTH => $this->validateHealth($member),
            self::TYPE_EXPERIENCE => $this->validateExperience($member),
            self::TYPE_DOCUMENTS => $this->validateDocuments($member),
            default => ['passed' => true, 'message' => '', 'can_override' => false],
        };
    }

    protected function validateCertification(Member $member): array
    {
        $value = $this->value;
        $minLevel = $value['min_level'] ?? 1;
        $acceptedCodes = $value['accepted_codes'] ?? [];

        // Get member's certifications
        $memberCerts = $member->certifications()
            ->where('is_verified', true)
            ->get();

        // Check if any certification meets requirements
        foreach ($memberCerts as $cert) {
            // Check by code
            if (!empty($acceptedCodes) && in_array($cert->certification_code, $acceptedCodes)) {
                return ['passed' => true, 'message' => '', 'can_override' => false];
            }

            // Check by level (if using certification_types)
            if ($cert->certificationLevel && $cert->certificationLevel->level >= $minLevel) {
                return ['passed' => true, 'message' => '', 'can_override' => false];
            }
        }

        return [
            'passed' => false,
            'message' => $this->customer_message ?? "Required certification not found.",
            'can_override' => $this->can_override,
        ];
    }

    protected function validateAgeMinimum(Member $member, array $bookingData): array
    {
        $value = $this->value;
        $minimumAge = $value['minimum'] ?? 0;
        $parentalConsentAge = $value['parental_consent_under'] ?? null;

        // Calculate age at time of activity
        $activityDate = isset($bookingData['activity_date'])
            ? \Carbon\Carbon::parse($bookingData['activity_date'])
            : now();

        $age = $member->date_of_birth
            ? \Carbon\Carbon::parse($member->date_of_birth)->age
            : null;

        if ($age === null) {
            return [
                'passed' => false,
                'message' => 'Date of birth required to verify age requirement.',
                'can_override' => $this->can_override,
                'requires_dob' => true,
            ];
        }

        if ($age < $minimumAge) {
            return [
                'passed' => false,
                'message' => $this->customer_message ?? "Minimum age requirement: {$minimumAge} years.",
                'can_override' => $this->can_override,
            ];
        }

        // Check if parental consent is needed
        $needsParentalConsent = $parentalConsentAge && $age < $parentalConsentAge;

        return [
            'passed' => true,
            'message' => $needsParentalConsent ? 'Parental consent required.' : '',
            'can_override' => false,
            'requires_parental_consent' => $needsParentalConsent,
        ];
    }

    protected function validateAgeMaximum(Member $member, array $bookingData): array
    {
        $value = $this->value;
        $maximumAge = $value['maximum'] ?? 999;

        $age = $member->date_of_birth
            ? \Carbon\Carbon::parse($member->date_of_birth)->age
            : null;

        if ($age === null) {
            return [
                'passed' => false,
                'message' => 'Date of birth required to verify age requirement.',
                'can_override' => $this->can_override,
            ];
        }

        if ($age > $maximumAge) {
            return [
                'passed' => false,
                'message' => $this->customer_message ?? "Maximum age requirement: {$maximumAge} years.",
                'can_override' => $this->can_override,
            ];
        }

        return ['passed' => true, 'message' => '', 'can_override' => false];
    }

    protected function validateHealth(Member $member): array
    {
        $value = $this->value;

        // Check if medical form is required
        if ($value['requires_medical_form'] ?? false) {
            // This would typically check if member has completed medical questionnaire
            // For now, return a soft pass with message
            return [
                'passed' => true,
                'message' => 'Medical questionnaire required before activity.',
                'can_override' => false,
                'requires_medical_form' => true,
            ];
        }

        return ['passed' => true, 'message' => '', 'can_override' => false];
    }

    protected function validateExperience(Member $member): array
    {
        $value = $this->value;
        $minDives = $value['minimum_dives'] ?? 0;

        $totalDives = $member->logged_dives ?? 0;

        if ($totalDives < $minDives) {
            return [
                'passed' => false,
                'message' => $this->customer_message ?? "Minimum {$minDives} logged dives required.",
                'can_override' => $this->can_override,
            ];
        }

        return ['passed' => true, 'message' => '', 'can_override' => false];
    }

    protected function validateDocuments(Member $member): array
    {
        $value = $this->value;
        $requiredDocs = $value['required'] ?? [];

        $missingDocs = [];

        foreach ($requiredDocs as $doc) {
            // Check if member has the required document
            // This would integrate with a document storage system
            if ($doc === 'id' && !$member->id_verified) {
                $missingDocs[] = 'Valid ID';
            }
            if ($doc === 'medical_clearance' && !$member->medical_clearance_date) {
                $missingDocs[] = 'Medical clearance';
            }
        }

        if (!empty($missingDocs)) {
            return [
                'passed' => false,
                'message' => 'Required documents: ' . implode(', ', $missingDocs),
                'can_override' => $this->can_override,
                'missing_documents' => $missingDocs,
            ];
        }

        return ['passed' => true, 'message' => '', 'can_override' => false];
    }

    /**
     * Get all requirements for a product
     */
    public static function getForProduct(int $productId): array
    {
        $requirements = static::where('product_id', $productId)
            ->active()
            ->orderBy('sort_order')
            ->get();

        return [
            'mandatory' => $requirements->where('is_mandatory', true)->values(),
            'optional' => $requirements->where('is_mandatory', false)->values(),
            'blocking' => $requirements->where('block_booking', true)->values(),
        ];
    }

    /**
     * Create requirement from preset
     */
    public static function createFromPreset(int $productId, array $preset): self
    {
        return static::create([
            'product_id' => $productId,
            'requirement_type' => $preset['type'],
            'name' => $preset['name'],
            'value' => $preset['value'],
            'customer_message' => $preset['customer_message'] ?? null,
            'is_mandatory' => true,
            'block_booking' => true,
            'is_active' => true,
        ]);
    }
}
