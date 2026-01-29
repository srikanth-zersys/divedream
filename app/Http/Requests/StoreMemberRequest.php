<?php

namespace App\Http\Requests;

use App\Services\TenantService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantService = app(TenantService::class);
        $tenantId = $tenantService->getCurrentTenantId();

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('members', 'email')->where('tenant_id', $tenantId),
            ],
            'phone' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'medical_conditions' => 'nullable|string|max:1000',
            'allergies' => 'nullable|string|max:500',
            'total_dives' => 'nullable|integer|min:0',
            'last_dive_date' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'marketing_consent' => 'boolean',
            'certifications' => 'nullable|array',
            'certifications.*.certification_type_id' => 'required|exists:certification_types,id',
            'certifications.*.certification_number' => 'nullable|string|max:100',
            'certifications.*.certification_date' => 'nullable|date',
            'certifications.*.expiry_date' => 'nullable|date|after:certifications.*.certification_date',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'A member with this email already exists in your organization.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
        ];
    }
}
