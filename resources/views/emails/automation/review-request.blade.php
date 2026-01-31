<x-mail::message>
@if($isReminder)
# We'd Still Love Your Feedback!

Hi {{ $member->first_name ?? 'there' }},

We noticed you haven't had a chance to share your thoughts about your recent dive experience. Your feedback helps us improve and helps other divers discover great experiences!
@else
# How Was Your Dive?

Hi {{ $member->first_name ?? 'there' }},

Thank you for diving with us! We hope you had an amazing experience. We'd love to hear your thoughts!
@endif

---

## Your Recent Experience

@component('mail::panel')
**{{ $product->name }}**
{{ \Carbon\Carbon::parse($booking->booking_date)->format('F j, Y') }}

Booking #{{ $booking->booking_number }}
@endcomponent

---

## Quick Rating

How would you rate your experience?

<x-mail::button :url="$reviewUrl . '?rating=5'" color="success">
Excellent
</x-mail::button>

<x-mail::button :url="$reviewUrl . '?rating=4'">
Good
</x-mail::button>

<x-mail::button :url="$reviewUrl . '?rating=3'">
Average
</x-mail::button>

<x-mail::button :url="$reviewUrl . '?rating=2'">
Below Average
</x-mail::button>

Or [click here]({{ $reviewUrl }}) to provide detailed feedback.

---

@if(count($externalLinks) > 0)
## Share Your Experience

If you enjoyed your dive, we'd be incredibly grateful if you could share your experience on:

@foreach($externalLinks as $platform => $link)
@if(!$link['posted'])
- [{{ $link['name'] }}]({{ $link['url'] }})
@endif
@endforeach

Your reviews help other divers find great experiences and help us grow!
@endif

---

## What Your Feedback Helps Us Do

- **Improve our services** based on real diver experiences
- **Recognize great instructors** who made your trip special
- **Help other divers** find the perfect dive adventure
- **Identify areas** where we can do better

---

Thank you for choosing {{ $tenant->name }}. We hope to see you underwater again soon!

**The {{ $tenant->name }} Team**

<x-mail::subcopy>
This review request is for booking #{{ $booking->booking_number }}. [Unsubscribe from review requests]({{ route('public.unsubscribe', ['token' => $reviewRequest->token]) }})
</x-mail::subcopy>
</x-mail::message>
