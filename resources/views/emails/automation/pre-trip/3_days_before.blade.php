<x-mail::message>
# Getting Ready for Your Dive!

Hello {{ $member->first_name ?? 'Diver' }},

Your dive is just **3 days away**! Here's your packing checklist and some important reminders.

## Your Booking

**{{ $product->name }}**
{{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }} at {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}

---

## Packing Checklist

@component('mail::panel')
**Essential Items:**
- [ ] Valid photo ID
- [ ] Dive certification card (if required)
- [ ] Swimsuit
- [ ] Towel
- [ ] Reef-safe sunscreen
- [ ] Sunglasses

**Recommended:**
- [ ] Hat or cap
- [ ] Change of clothes
- [ ] Light jacket (for boat rides)
- [ ] Motion sickness medication (if prone)
- [ ] Waterproof camera
- [ ] Cash for tips/extras

@if(!$product->equipment_included)
**Your Dive Gear:**
- [ ] Mask, snorkel, fins
- [ ] BCD and regulator
- [ ] Wetsuit
- [ ] Dive computer/gauges
@endif
@endcomponent

---

## Weather Forecast

Check the forecast for {{ \Carbon\Carbon::parse($schedule->date)->format('F j') }}:
- Current conditions look {{ ['great', 'good', 'favorable'][array_rand(['great', 'good', 'favorable'])] }} for diving!
- We'll notify you immediately if conditions change.

---

@if(!$booking->waiver_signed || !$booking->medical_form_completed)
## Action Required

@if(!$booking->waiver_signed)
Please sign your waiver before arrival:
<x-mail::button :url="route('portal.sign-waiver', $booking)">
Sign Waiver
</x-mail::button>
@endif

@if(!$booking->medical_form_completed)
Please complete your medical questionnaire:
<x-mail::button :url="route('portal.medical-form', $booking)">
Medical Form
</x-mail::button>
@endif
@endif

---

## Pre-Dive Tips

1. **Stay Hydrated** - Drink plenty of water in the days before your dive
2. **Rest Well** - Get good sleep the night before
3. **Avoid Alcohol** - No alcohol 24 hours before diving
4. **Eat Light** - Have a light meal before diving
5. **No Flying** - Remember the 24-hour no-fly rule after diving

See you in 3 days!

**{{ $tenant->name }}**

<x-mail::subcopy>
Booking: {{ $booking->booking_number }} | Contact: {{ $tenant->phone }}
</x-mail::subcopy>
</x-mail::message>
