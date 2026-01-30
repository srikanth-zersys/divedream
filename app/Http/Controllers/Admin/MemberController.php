<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CertificationType;
use App\Models\Member;
use App\Models\MemberCertification;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $query = Member::forTenant($tenant->id)
            ->with(['certifications.certificationType']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Certification filter
        if ($request->filled('certification')) {
            $query->whereHas('certifications', function ($q) use ($request) {
                $q->where('certification_type_id', $request->certification);
            });
        }

        // Sort with whitelist validation to prevent SQL injection
        $allowedSortFields = ['created_at', 'first_name', 'last_name', 'email', 'total_dives'];
        $sortField = in_array($request->get('sort'), $allowedSortFields) ? $request->get('sort') : 'created_at';
        $sortDirection = $request->get('direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortField, $sortDirection);

        $members = $query->paginate(20)->withQueryString();

        // Certification types for filter
        $certificationTypes = CertificationType::active()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'agency']);

        return Inertia::render('admin/members/index', [
            'members' => $members,
            'certificationTypes' => $certificationTypes,
            'filters' => $request->only(['search', 'status', 'certification', 'sort', 'direction']),
        ]);
    }

    public function create(): Response
    {
        $certificationTypes = CertificationType::active()
            ->orderBy('agency')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('admin/members/create', [
            'certificationTypes' => $certificationTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
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
            // Certifications
            'certifications' => 'nullable|array',
            'certifications.*.certification_type_id' => 'required|exists:certification_types,id',
            'certifications.*.certification_number' => 'nullable|string|max:100',
            'certifications.*.certification_date' => 'nullable|date',
            'certifications.*.expiry_date' => 'nullable|date|after:certifications.*.certification_date',
        ]);

        // Check for duplicate email
        $existingMember = Member::forTenant($tenant->id)
            ->where('email', $validated['email'])
            ->first();

        if ($existingMember) {
            return back()
                ->withInput()
                ->withErrors(['email' => 'A member with this email already exists.']);
        }

        $member = Member::create(array_merge(
            $validated,
            [
                'tenant_id' => $tenant->id,
                'status' => 'active',
                'source' => 'admin',
            ]
        ));

        // Add certifications
        if (isset($validated['certifications'])) {
            foreach ($validated['certifications'] as $cert) {
                MemberCertification::create([
                    'member_id' => $member->id,
                    'certification_type_id' => $cert['certification_type_id'],
                    'certification_number' => $cert['certification_number'] ?? null,
                    'certification_date' => $cert['certification_date'] ?? null,
                    'expiry_date' => $cert['expiry_date'] ?? null,
                    'is_verified' => false,
                ]);
            }
        }

        return redirect()
            ->route('admin.members.show', $member)
            ->with('success', 'Member created successfully.');
    }

    public function show(Member $member): Response
    {
        $this->authorize('view', $member);

        $tenant = $this->tenantService->getCurrentTenant();

        $member->load([
            'certifications.certificationType',
            'documents',
        ]);

        // Get booking history
        $bookings = Booking::forTenant($tenant->id)
            ->where('member_id', $member->id)
            ->with(['product', 'schedule', 'location'])
            ->orderBy('booking_date', 'desc')
            ->paginate(10);

        // Stats
        $stats = [
            'totalBookings' => Booking::forTenant($tenant->id)->where('member_id', $member->id)->count(),
            'completedDives' => Booking::forTenant($tenant->id)
                ->where('member_id', $member->id)
                ->where('status', 'completed')
                ->sum('participant_count'),
            'totalSpent' => Booking::forTenant($tenant->id)
                ->where('member_id', $member->id)
                ->where('status', 'completed')
                ->sum('total_amount'),
            'lastVisit' => Booking::forTenant($tenant->id)
                ->where('member_id', $member->id)
                ->where('status', 'completed')
                ->latest('booking_date')
                ->value('booking_date'),
        ];

        return Inertia::render('admin/members/show', [
            'member' => $member,
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    public function edit(Member $member): Response
    {
        $this->authorize('update', $member);

        $member->load(['certifications']);

        $certificationTypes = CertificationType::active()
            ->orderBy('agency')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('admin/members/edit', [
            'member' => $member,
            'certificationTypes' => $certificationTypes,
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $this->authorize('update', $member);

        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
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
            'status' => 'required|in:active,inactive,blacklisted',
        ]);

        // Check for duplicate email (excluding current member)
        $existingMember = Member::forTenant($tenant->id)
            ->where('email', $validated['email'])
            ->where('id', '!=', $member->id)
            ->first();

        if ($existingMember) {
            return back()
                ->withInput()
                ->withErrors(['email' => 'A member with this email already exists.']);
        }

        $member->update($validated);

        return redirect()
            ->route('admin.members.show', $member)
            ->with('success', 'Member updated successfully.');
    }

    public function destroy(Member $member): RedirectResponse
    {
        $this->authorize('delete', $member);

        // Check if member has any bookings
        if ($member->bookings()->exists()) {
            return back()->with('error', 'Cannot delete member with existing bookings. Consider deactivating instead.');
        }

        $member->delete();

        return redirect()
            ->route('admin.members.index')
            ->with('success', 'Member deleted successfully.');
    }

    public function addCertification(Request $request, Member $member): RedirectResponse
    {
        $this->authorize('update', $member);

        $validated = $request->validate([
            'certification_type_id' => 'required|exists:certification_types,id',
            'certification_number' => 'nullable|string|max:100',
            'certification_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:certification_date',
        ]);

        // Check if certification already exists
        $exists = $member->certifications()
            ->where('certification_type_id', $validated['certification_type_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'This certification already exists for this member.');
        }

        MemberCertification::create([
            'member_id' => $member->id,
            'certification_type_id' => $validated['certification_type_id'],
            'certification_number' => $validated['certification_number'],
            'certification_date' => $validated['certification_date'],
            'expiry_date' => $validated['expiry_date'],
            'is_verified' => false,
        ]);

        return back()->with('success', 'Certification added successfully.');
    }

    public function removeCertification(Member $member, MemberCertification $certification): RedirectResponse
    {
        $this->authorize('update', $member);

        if ($certification->member_id !== $member->id) {
            abort(403);
        }

        $certification->delete();

        return back()->with('success', 'Certification removed successfully.');
    }

    public function verifyCertification(Member $member, MemberCertification $certification): RedirectResponse
    {
        $this->authorize('update', $member);

        if ($certification->member_id !== $member->id) {
            abort(403);
        }

        $certification->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        return back()->with('success', 'Certification verified successfully.');
    }

    public function merge(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'primary_id' => 'required|exists:members,id',
            'secondary_id' => 'required|exists:members,id|different:primary_id',
        ]);

        $primary = Member::findOrFail($validated['primary_id']);
        $secondary = Member::findOrFail($validated['secondary_id']);

        $this->authorize('update', $primary);
        $this->authorize('delete', $secondary);

        // Transfer bookings
        Booking::where('member_id', $secondary->id)
            ->update(['member_id' => $primary->id]);

        // Transfer certifications (if not duplicate)
        foreach ($secondary->certifications as $cert) {
            $exists = $primary->certifications()
                ->where('certification_type_id', $cert->certification_type_id)
                ->exists();

            if (!$exists) {
                $cert->update(['member_id' => $primary->id]);
            }
        }

        // Merge notes
        if ($secondary->notes) {
            $primary->notes = trim($primary->notes . "\n\n--- Merged from duplicate ---\n" . $secondary->notes);
            $primary->save();
        }

        // Update dive count
        $primary->total_dives = max($primary->total_dives, $secondary->total_dives);
        $primary->save();

        // Delete secondary
        $secondary->delete();

        return redirect()
            ->route('admin.members.show', $primary)
            ->with('success', 'Members merged successfully.');
    }
}
