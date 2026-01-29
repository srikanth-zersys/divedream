@component('mail::message')
# Welcome to {{ $tenant->name }}!

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

Thank you for joining our diving community! We're thrilled to have you aboard.

Whether you're a seasoned diver or just starting your underwater journey, we're here to help you create unforgettable diving experiences.

## What We Offer

@component('mail::panel')
- **Guided Dive Trips** - Expert-led adventures to stunning dive sites
- **Certification Courses** - From beginner to advanced training
- **Equipment & Rentals** - Top-quality gear for every dive
- **Marine Conservation** - Dive with purpose and protect our oceans
@endcomponent

## Ready to Dive In?

Browse our upcoming experiences and find your next adventure:

@component('mail::button', ['url' => $bookingUrl])
Explore Dive Experiences
@endcomponent

Have questions? Simply reply to this email – we're always happy to help!

See you underwater,<br>
The {{ $tenant->name }} Team

@component('mail::subcopy')
You're receiving this because you signed up at {{ $tenant->name }}. If you didn't sign up, you can [unsubscribe]({{ $unsubscribeUrl }}).
@endcomponent
@endcomponent
