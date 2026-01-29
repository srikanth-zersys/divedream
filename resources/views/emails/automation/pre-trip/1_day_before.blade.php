<x-mail::message>
# See You Tomorrow!

Hello {{ $member->first_name ?? 'Diver' }},

Your dive adventure is **tomorrow**! Here's everything you need to know.

---

## Tomorrow's Schedule

@component('mail::panel')
**{{ $product->name }}**

**Date:** {{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }}
**Check-in Time:** {{ \Carbon\Carbon::parse($schedule->start_time)->subMinutes(30)->format('g:i A') }}
**Activity Start:** {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}
@if($schedule->end_time)
**Expected End:** {{ \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') }}
@endif

**Participants:** {{ $booking->participant_count }} {{ $booking->participant_count === 1 ? 'person' : 'people' }}
@endcomponent

---

## Meeting Point

@if($location)
**{{ $location->name }}**
{{ $location->address }}

@if($location->google_maps_url)
<x-mail::button :url="$location->google_maps_url">
Get Directions
</x-mail::button>
@endif

@if($location->parking_info)
**Parking:** {{ $location->parking_info }}
@endif
@else
We'll send you the exact meeting point details shortly.
@endif

---

## Your Instructor

@if($schedule->instructor)
You'll be diving with **{{ $schedule->instructor->name }}**
@if($schedule->instructor->bio)
{{ Str::limit($schedule->instructor->bio, 150) }}
@endif
@else
Your instructor will be confirmed tomorrow morning.
@endif

---

## Final Checklist

- [ ] Set your alarm! Check-in is at {{ \Carbon\Carbon::parse($schedule->start_time)->subMinutes(30)->format('g:i A') }}
- [ ] Pack your bag tonight
- [ ] Charge your camera
- [ ] Get a good night's sleep
- [ ] Eat a light breakfast tomorrow

---

## Emergency Contact

If you need to reach us tomorrow:

**Phone:** {{ $tenant->phone }}
@if($schedule->instructor?->phone)
**Instructor:** {{ $schedule->instructor->phone }}
@endif

---

## Weather Update

@php
$weatherEmoji = ['sunny' => '', 'cloudy' => '', 'rainy' => ''][array_rand(['sunny', 'cloudy', 'rainy'])];
@endphp

Tomorrow's forecast looks good for diving! We'll contact you if anything changes.

---

We're looking forward to diving with you tomorrow!

**{{ $tenant->name }}**

<x-mail::subcopy>
Booking: {{ $booking->booking_number }} | Need to cancel? Contact us ASAP.
</x-mail::subcopy>
</x-mail::message>
