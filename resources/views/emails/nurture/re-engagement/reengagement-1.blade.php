@component('mail::message')
# We Miss You!

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

It's been a while since we've seen you around, and we wanted to check in!

The underwater world has been buzzing with activity, and we'd love to share it with you.

## What's New at {{ $tenant->name }}

@component('mail::panel')
🐠 **New Dive Sites** – We've added exciting new locations to explore

🎓 **Updated Courses** – Fresh training programs for all levels

📸 **Recent Adventures** – Check out what our divers have been up to

🐢 **Marine Life Sightings** – The conditions have been incredible!
@endcomponent

## Upcoming Availability

We have spaces available for these popular experiences:

@if(isset($upcomingSchedules) && count($upcomingSchedules) > 0)
@foreach($upcomingSchedules as $schedule)
- **{{ $schedule['product_name'] }}** – {{ $schedule['date'] }}
@endforeach
@else
- Discover Scuba Diving experiences
- Guided reef tours
- Night diving adventures
- Certification courses
@endif

@component('mail::button', ['url' => $bookingUrl])
See What's Available
@endcomponent

We hope to see you back in the water soon!

The {{ $tenant->name }} Team

@component('mail::subcopy')
[Unsubscribe]({{ $unsubscribeUrl }}) from these emails
@endcomponent
@endcomponent
