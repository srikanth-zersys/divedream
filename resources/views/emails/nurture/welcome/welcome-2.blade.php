@component('mail::message')
# Our Most-Loved Diving Experiences

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

We wanted to share some of our divers' favorite experiences – the ones they keep coming back for!

## Diver Favorites

@if(isset($popularProducts) && count($popularProducts) > 0)
@foreach($popularProducts as $product)
### {{ $product['name'] }}

{{ $product['description'] ?? 'An incredible diving experience awaiting you.' }}

@if(isset($product['price']))
**From ${{ number_format($product['price'], 2) }}**
@endif

---

@endforeach
@else
@component('mail::panel')
**Discover Dive**: Perfect for beginners – experience the magic of breathing underwater for the first time.

**Reef Explorer**: Guided tours of our most vibrant coral reefs, teeming with marine life.

**Advanced Adventures**: Wreck dives, night dives, and deep dives for certified divers seeking thrills.
@endcomponent
@endif

## What Our Divers Say

@component('mail::panel')
*"Absolutely incredible experience! The guides were professional and made me feel safe throughout. Can't wait to come back!"*
— Recent Guest
@endcomponent

@component('mail::button', ['url' => $bookingUrl])
Browse All Experiences
@endcomponent

Questions about which dive is right for you? Just reply to this email – we're here to help you choose!

Happy diving,<br>
The {{ $tenant->name }} Team

@component('mail::subcopy')
[Unsubscribe]({{ $unsubscribeUrl }}) from these emails
@endcomponent
@endcomponent
