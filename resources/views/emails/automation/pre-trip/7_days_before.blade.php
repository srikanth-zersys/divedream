<x-mail::message>
# Your Dive Adventure is Coming Up!

Hello {{ $member->first_name ?? 'Diver' }},

We're excited that your dive adventure is just **7 days away**! Here's what you need to know to prepare.

## Booking Details

**Booking Number:** {{ $booking->booking_number }}
**Activity:** {{ $product->name }}
**Date:** {{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }}
**Time:** {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}
@if($location)
**Location:** {{ $location->name }}
@endif
**Participants:** {{ $booking->participant_count }}

---

## What You Need to Do Before Your Trip

@if(!$booking->waiver_signed)
### 1. Sign Your Waiver
Please complete the liability waiver before your arrival. This saves time on the day!

<x-mail::button :url="route('portal.sign-waiver', $booking)">
Sign Waiver Now
</x-mail::button>
@else
### 1. Waiver - Completed
@endif

@if(!$booking->medical_form_completed)
### 2. Complete Medical Questionnaire
All divers must complete a medical questionnaire. If you answer "yes" to any questions, you may need a doctor's clearance.

<x-mail::button :url="route('portal.medical-form', $booking)">
Complete Medical Form
</x-mail::button>
@else
### 2. Medical Form - Completed
@endif

### 3. Check the Weather
Keep an eye on the weather forecast. We'll contact you if conditions require any changes to your booking.

### 4. Prepare Your Gear
@if($product->equipment_included)
**Equipment is included** with your booking. Just bring:
- Swimsuit
- Towel
- Sunscreen (reef-safe preferred)
- Change of clothes
@else
Please bring your own dive equipment. If you need to rent any gear, let us know in advance.
@endif

---

## Questions?

If you have any questions or need to make changes to your booking, please don't hesitate to contact us:

**Phone:** {{ $tenant->phone }}
**Email:** {{ $tenant->email }}

We can't wait to dive with you!

Best regards,
**{{ $tenant->name }}**

<x-mail::subcopy>
Booking Reference: {{ $booking->booking_number }} | [View Booking]({{ route('portal.booking', $booking) }})
</x-mail::subcopy>
</x-mail::message>
