@component('mail::message')
# Your Special Welcome Offer

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

We've been so glad to have you as part of our community! To thank you for joining us, here's a special welcome offer:

@component('mail::panel')
## 🎉 {{ $discountPercent ?? 10 }}% OFF Your First Booking

Use code: **{{ $discountCode ?? 'WELCOME10' }}**

*Valid for {{ $offerDays ?? 7 }} days only*
@endcomponent

## Book Your Adventure

This is the perfect time to:

✓ Try scuba diving for the first time<br>
✓ Explore stunning dive sites with expert guides<br>
✓ Continue your diving education<br>
✓ Create memories that last a lifetime

@component('mail::button', ['url' => $bookingUrlWithCode ?? $bookingUrl])
Book Now & Save {{ $discountPercent ?? 10 }}%
@endcomponent

## How to Use Your Discount

1. Browse our experiences and find your perfect dive
2. Select your date and participants
3. Enter code **{{ $discountCode ?? 'WELCOME10' }}** at checkout
4. Enjoy your savings!

@component('mail::panel')
**Offer expires:** {{ $expiryDate ?? now()->addDays(7)->format('F j, Y') }}

*Cannot be combined with other offers. Minimum booking value may apply.*
@endcomponent

Don't let this offer slip away – book your diving adventure today!

See you soon,<br>
The {{ $tenant->name }} Team

P.S. Have questions before booking? Just reply to this email – we're here to help!

@component('mail::subcopy')
[Unsubscribe]({{ $unsubscribeUrl }}) from these emails
@endcomponent
@endcomponent
