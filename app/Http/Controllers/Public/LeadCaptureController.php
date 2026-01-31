<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\NurtureSequence;
use App\Models\Referral;
use App\Services\LeadScoringService;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LeadCaptureController extends Controller
{
    public function __construct(
        protected LeadScoringService $scoringService,
        protected ReferralService $referralService
    ) {}

    /**
     * Capture a new lead (newsletter signup, popup form, etc.)
     */
    public function capture(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'email' => 'required|email|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'certification_level' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:50',
            'referral_code' => 'nullable|string|max:20',
            // UTM tracking
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
            'utm_content' => 'nullable|string|max:100',
            'utm_term' => 'nullable|string|max:100',
            'referrer_url' => 'nullable|url|max:500',
            'landing_page' => 'nullable|string|max:500',
            // Custom fields
            'custom_fields' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        $tenantId = $validated['tenant_id'];

        // Check for existing lead
        $existingLead = Lead::where('tenant_id', $tenantId)
            ->where('email', strtolower($validated['email']))
            ->first();

        if ($existingLead) {
            // Update existing lead with new info
            $existingLead->update(array_filter([
                'first_name' => $validated['first_name'] ?? $existingLead->first_name,
                'last_name' => $validated['last_name'] ?? $existingLead->last_name,
                'phone' => $validated['phone'] ?? $existingLead->phone,
                'certification_level' => $validated['certification_level'] ?? $existingLead->certification_level,
            ]));

            $existingLead->recordActivity('form_submit', [
                'form' => 'lead_capture',
                'source' => $validated['source'] ?? 'website',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Welcome back!',
                'lead_id' => $existingLead->id,
                'is_new' => false,
            ]);
        }

        // Match lead source from UTM
        $utm = [
            'utm_source' => $validated['utm_source'] ?? null,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
        ];
        $leadSource = LeadSource::matchFromUtm($tenantId, array_filter($utm));

        // Create new lead
        $lead = Lead::create([
            'tenant_id' => $tenantId,
            'lead_source_id' => $leadSource?->id,
            'email' => strtolower($validated['email']),
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'certification_level' => $validated['certification_level'] ?? null,
            'utm_source' => $validated['utm_source'] ?? null,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
            'utm_content' => $validated['utm_content'] ?? null,
            'utm_term' => $validated['utm_term'] ?? null,
            'referrer_url' => $validated['referrer_url'] ?? null,
            'landing_page' => $validated['landing_page'] ?? $request->header('Referer'),
            'first_visit_at' => now(),
            'last_activity_at' => now(),
            'custom_fields' => $validated['custom_fields'] ?? null,
            'tags' => $validated['tags'] ?? null,
        ]);

        // Process referral code if provided
        if (!empty($validated['referral_code'])) {
            $this->referralService->processReferredSignup($lead, $validated['referral_code']);
        }

        // Record the capture activity
        $lead->recordActivity('form_submit', [
            'form' => 'lead_capture',
            'source' => $validated['source'] ?? 'website',
        ]);

        // Enroll in welcome nurture sequence
        $welcomeSequence = NurtureSequence::forTenant($tenantId)
            ->active()
            ->where('slug', 'welcome')
            ->first();

        if ($welcomeSequence && $welcomeSequence->shouldEnrollLead($lead)) {
            $lead->startNurtureSequence('welcome');
        }

        Log::info('New lead captured', [
            'lead_id' => $lead->id,
            'tenant_id' => $tenantId,
            'source' => $leadSource?->name ?? 'unknown',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for signing up!',
            'lead_id' => $lead->id,
            'is_new' => true,
        ]);
    }

    /**
     * Track lead activity (page views, product views, etc.)
     */
    public function trackActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'lead_id' => 'nullable|exists:leads,id',
            'email' => 'nullable|email',
            'session_id' => 'nullable|string|max:100',
            'type' => 'required|string|max:50',
            'properties' => 'nullable|array',
        ]);

        // Find lead by ID, email, or session
        $lead = null;

        if (!empty($validated['lead_id'])) {
            $lead = Lead::find($validated['lead_id']);
        } elseif (!empty($validated['email'])) {
            $lead = Lead::where('tenant_id', $validated['tenant_id'])
                ->where('email', strtolower($validated['email']))
                ->first();
        }

        if (!$lead) {
            // Track anonymously - can be linked later
            return response()->json([
                'success' => true,
                'tracked' => false,
                'message' => 'Anonymous session',
            ]);
        }

        // Record the activity
        $activity = $lead->recordActivity(
            $validated['type'],
            $validated['properties'] ?? []
        );

        // Apply scoring rules
        $points = $this->scoringService->scoreActivity($lead, $activity);

        return response()->json([
            'success' => true,
            'tracked' => true,
            'activity_id' => $activity->id,
            'points_earned' => $points,
            'total_score' => $lead->fresh()->score,
        ]);
    }

    /**
     * Track email events (opens, clicks)
     */
    public function trackEmail(Request $request, string $type): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'email_id' => 'required|string|max:100',
            'url' => 'nullable|url|max:500',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);

        if ($type === 'open') {
            $activity = $lead->recordEmailOpen($validated['email_id']);
        } elseif ($type === 'click') {
            $activity = $lead->recordEmailClick(
                $validated['email_id'],
                $validated['url'] ?? ''
            );
        } else {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        // Apply scoring
        $this->scoringService->scoreActivity($lead, $activity);

        return response()->json(['success' => true]);
    }

    /**
     * Update lead profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'certification_level' => 'nullable|string|max:50',
            'experience_dives' => 'nullable|integer|min:0',
            'custom_fields' => 'nullable|array',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);
        $leadId = $validated['lead_id'];
        unset($validated['lead_id']);

        // Track which fields were updated for scoring
        $updatedFields = [];
        foreach ($validated as $key => $value) {
            if ($value !== null && $lead->$key !== $value) {
                $updatedFields[] = $key;
            }
        }

        $lead->update(array_filter($validated, fn($v) => $v !== null));

        // Score profile updates
        foreach ($updatedFields as $field) {
            if (in_array($field, ['phone', 'certification_level', 'country'])) {
                $activity = $lead->recordActivity("profile_{$field}", [
                    'field' => $field,
                    'value' => $validated[$field],
                ]);
                $this->scoringService->scoreActivity($lead, $activity);
            }
        }

        return response()->json([
            'success' => true,
            'lead' => $lead->fresh(),
        ]);
    }

    /**
     * Unsubscribe a lead
     */
    public function unsubscribe(Request $request, string $token): JsonResponse
    {
        // CRITICAL: Validate and sanitize the token before decoding
        // Only allow valid base64 characters to prevent injection
        if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $token)) {
            return response()->json(['error' => 'Invalid token format'], 400);
        }

        $decoded = base64_decode($token, true);

        // Verify decoding succeeded and result is numeric (valid lead ID)
        if ($decoded === false || !ctype_digit($decoded)) {
            return response()->json(['error' => 'Invalid token'], 400);
        }

        $leadId = (int) $decoded;

        // Additional check: ensure ID is within reasonable bounds
        if ($leadId <= 0 || $leadId > PHP_INT_MAX) {
            return response()->json(['error' => 'Invalid token'], 400);
        }

        $lead = Lead::find($leadId);

        if (!$lead) {
            return response()->json(['error' => 'Invalid token'], 404);
        }

        $lead->unsubscribe();

        return response()->json([
            'success' => true,
            'message' => 'You have been unsubscribed.',
        ]);
    }

    /**
     * Get lead score and status (for showing personalized content)
     */
    public function getLeadStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'email' => 'nullable|email',
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $lead = null;

        if (!empty($validated['lead_id'])) {
            $lead = Lead::find($validated['lead_id']);
        } elseif (!empty($validated['email'])) {
            $lead = Lead::where('tenant_id', $validated['tenant_id'])
                ->where('email', strtolower($validated['email']))
                ->first();
        }

        if (!$lead) {
            return response()->json([
                'found' => false,
            ]);
        }

        return response()->json([
            'found' => true,
            'lead_id' => $lead->id,
            'status' => $lead->status,
            'qualification' => $lead->qualification,
            'score' => $lead->score,
            'first_name' => $lead->first_name,
            'is_returning' => $lead->page_views > 1,
            'interested_products' => $lead->interested_products,
            'conversion_likelihood' => $this->scoringService->calculateConversionLikelihood($lead),
        ]);
    }
}
