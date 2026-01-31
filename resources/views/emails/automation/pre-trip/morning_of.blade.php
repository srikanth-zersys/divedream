<x-mail::message>
# Today's the Day!

Good morning {{ $member->first_name ?? 'Diver' }}!

We're ready for you! Here's your quick reference for today.

---

@component('mail::panel')
## Check-In: {{ \Carbon\Carbon::parse($schedule->start_time)->subMinutes(30)->format('g:i A') }}

**{{ $product->name }}**
@if($location)
**Location:** {{ $location->name }}
@endif
@endcomponent

---

## Quick Check-In QR Code

Show this at check-in for faster processing:

**Booking #{{ $booking->booking_number }}**

<x-mail::button :url="route('portal.booking', $booking)">
View Check-In QR Code
</x-mail::button>

---

## Contact

@if($schedule->instructor)
**Your Instructor:** {{ $schedule->instructor->name }}
@if($schedule->instructor->phone)
{{ $schedule->instructor->phone }}
@endif
@endif

**Shop:** {{ $tenant->phone }}

---

@if($location?->google_maps_url)
<x-mail::button :url="$location->google_maps_url">
Get Directions
</x-mail::button>
@endif

---

Have an amazing dive!

**{{ $tenant->name }}**
</x-mail::message>
