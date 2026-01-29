<x-mail::message>
# Don't Miss Out on Your Dive Adventure!

Hi there,

Your diving experience is still waiting for you! We wanted to make sure you didn't forget about your upcoming adventure.

@if($schedule)
@component('mail::panel')
**Spots are filling up!**

Only a few spots left for **{{ \Carbon\Carbon::parse($schedule->date)->format('F j, Y') }}**
@endcomponent
@endif

---

## Your Saved Booking

@if($product)
**{{ $product->name }}**

@if($schedule)
{{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }} at {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}
@endif

**{{ $cart->participant_count }} {{ $cart->participant_count === 1 ? 'Participant' : 'Participants' }}**
**Total: ${{ number_format($cart->cart_value, 2) }}**
@endif

---

<x-mail::button :url="$recoveryUrl" color="primary">
Complete Your Booking Now
</x-mail::button>

---

## What Other Divers Say

> "Amazing experience! The instructors were professional and the dive sites were breathtaking."
> — Recent Customer

> "Best dive shop in the area. Highly recommend!"
> — Verified Diver

---

## Flexible Booking Policy

- **Free cancellation** up to 48 hours before your dive
- **Easy rescheduling** if your plans change
- **Full support** from our experienced team

---

Questions? Reply to this email or call us at **{{ $tenant->phone }}**

**{{ $tenant->name }}**

<x-mail::subcopy>
This is a reminder about your incomplete booking. [Unsubscribe]({{ route('public.unsubscribe', ['token' => $cart->recovery_token]) }})
</x-mail::subcopy>
</x-mail::message>
