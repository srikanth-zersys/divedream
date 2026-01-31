@component('mail::message')
# New to Diving? Here's What You Need to Know

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

Whether you're considering your first dive or just completed your certification, here are some tips to make your diving experience amazing!

## First-Time Diver Tips

@component('mail::panel')
### Before Your Dive
- **Get a Good Night's Sleep** – You'll want to be well-rested
- **Stay Hydrated** – Drink plenty of water, avoid alcohol the night before
- **Eat Light** – A small meal 2-3 hours before diving is ideal
- **Bring Sun Protection** – Reef-safe sunscreen, hat, and sunglasses
@endcomponent

@component('mail::panel')
### During Your Dive
- **Breathe Slowly & Deeply** – The #1 rule of diving
- **Equalize Early & Often** – Don't wait until your ears hurt
- **Stay Relaxed** – Your instructor is there to help you
- **Don't Touch Marine Life** – Look, photograph, but don't touch
@endcomponent

@component('mail::panel')
### What to Bring
- Swimsuit and towel
- Change of clothes
- Camera (underwater if you have one!)
- Sense of adventure!
@endcomponent

## No Certification? No Problem!

Our **Discover Scuba Diving** experience is perfect for beginners. No prior experience needed – just a sense of adventure!

@component('mail::button', ['url' => $beginnerUrl ?? $bookingUrl])
Try Discover Scuba Diving
@endcomponent

## Already Certified?

If you have your certification (or are working on it), check out our full range of guided dives and advanced courses.

@component('mail::button', ['url' => $bookingUrl, 'color' => 'success'])
View All Dive Experiences
@endcomponent

Got questions about what to expect? Reply to this email – we love helping new divers!

Dive safe,<br>
The {{ $tenant->name }} Team

@component('mail::subcopy')
[Unsubscribe]({{ $unsubscribeUrl }}) from these emails
@endcomponent
@endcomponent
