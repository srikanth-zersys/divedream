<x-mail::message>
# Last Chance - Special Offer Inside!

Hi there,

We really want you to experience the underwater world with us. As a final reminder, we're offering you an **exclusive discount** to complete your booking!

---

@if($hasDiscount)
@component('mail::panel')
## Your Exclusive Offer

# {{ $discountPercent }}% OFF

Use code: **{{ $discountCode }}**

@if($discountExpires)
*Expires {{ $discountExpires->format('F j, Y \a\t g:i A') }}*
@endif
@endcomponent
@endif

---

## Your Saved Experience

@if($product)
**{{ $product->name }}**

@if($schedule)
{{ \Carbon\Carbon::parse($schedule->date)->format('l, F j, Y') }}
{{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}
@endif

@if($hasDiscount)
~~${{ number_format($cart->cart_value, 2) }}~~ **${{ number_format($cart->cart_value * (1 - $discountPercent/100), 2) }}**
@else
**${{ number_format($cart->cart_value, 2) }}**
@endif
@endif

---

<x-mail::button :url="$recoveryUrl" color="success">
@if($hasDiscount)
Claim Your {{ $discountPercent }}% Discount
@else
Complete Your Booking
@endif
</x-mail::button>

---

## Why Wait?

@if($schedule)
- **Limited Availability** - Only {{ rand(2, 5) }} spots remaining for this date
@endif
- **Weather Looks Great** - Perfect conditions forecasted
- **Book with Confidence** - Flexible cancellation policy
@if($hasDiscount)
- **Save {{ $discountPercent }}%** - This offer won't last!
@endif

---

## Need to Talk First?

We understand booking a dive trip is a big decision. If you have any questions or concerns, we'd love to chat:

**Call us:** {{ $tenant->phone }}
**Email:** {{ $tenant->email }}

---

This is our final reminder about your saved booking. We hope to see you underwater soon!

**{{ $tenant->name }}**

<x-mail::subcopy>
@if($hasDiscount)
Discount code {{ $discountCode }} expires {{ $discountExpires?->diffForHumans() ?? 'soon' }}. [Complete booking]({{ $recoveryUrl }})
@endif
</x-mail::subcopy>
</x-mail::message>
