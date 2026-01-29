@component('mail::message')
# A Special Offer Just for You

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

We noticed you haven't dived with us in a while, and we wanted to give you a reason to come back!

@component('mail::panel')
## 🎁 Welcome Back Offer

**{{ $discountPercent ?? 15 }}% OFF** your next booking

Use code: **{{ $discountCode ?? 'COMEBACK15' }}**

*Valid for {{ $offerDays ?? 14 }} days*
@endcomponent

## Why Dive With Us?

@component('mail::table')
| What You Get | |
|:------------ |:--|
| Expert Guides | Certified professionals who know every dive site |
| Small Groups | Personal attention and a better experience |
| Quality Equipment | Well-maintained, modern gear |
| Amazing Sites | The best spots the ocean has to offer |
@endcomponent

@component('mail::button', ['url' => $bookingUrlWithCode ?? $bookingUrl])
Book Now & Save {{ $discountPercent ?? 15 }}%
@endcomponent

This is our way of saying we'd love to have you back. The ocean is waiting!

See you soon,<br>
The {{ $tenant->name }} Team

@component('mail::subcopy')
Offer expires {{ $expiryDate ?? now()->addDays(14)->format('F j, Y') }}. Cannot be combined with other promotions. [Unsubscribe]({{ $unsubscribeUrl }})
@endcomponent
@endcomponent
