<x-mail::message>
# Still Thinking About Your Dive?

Hi there,

We noticed you were looking at booking a dive adventure with us but didn't complete your reservation. No worries - your selection is still available!

---

## Your Selected Experience

@component('mail::panel')
@if($product)
**{{ $product->name }}**

@if($product->description)
{{ Str::limit($product->description, 150) }}
@endif

@if($schedule)
**Date:** {{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }}
**Time:** {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}
@endif

**Participants:** {{ $cart->participant_count }}
**Total:** ${{ number_format($cart->cart_value, 2) }}
@else
You had items in your cart worth **${{ number_format($cart->cart_value, 2) }}**
@endif
@endcomponent

---

<x-mail::button :url="$recoveryUrl" color="primary">
Complete Your Booking
</x-mail::button>

---

## Why Book With Us?

- **Expert Instructors** - Certified professionals with years of experience
- **Top-Rated Equipment** - Well-maintained, modern dive gear
- **Small Groups** - Personalized attention and better experiences
- **Flexible Policies** - Easy rescheduling if plans change

---

## Need Help?

If you have any questions about the booking or need assistance, we're here to help!

**Phone:** {{ $tenant->phone }}
**Email:** {{ $tenant->email }}

Looking forward to diving with you!

**{{ $tenant->name }}**

<x-mail::subcopy>
If you didn't try to make a booking with us, please ignore this email.
</x-mail::subcopy>
</x-mail::message>
