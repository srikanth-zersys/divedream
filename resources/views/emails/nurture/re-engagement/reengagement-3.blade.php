@component('mail::message')
# Should We Keep in Touch?

Hi{{ $lead->first_name ? ' ' . $lead->first_name : '' }},

We've been sending you updates about diving adventures and special offers, but we haven't heard from you in a while.

We want to make sure we're only sending emails you want to receive.

## Quick Question

**Would you like to stay on our mailing list?**

@component('mail::button', ['url' => $staySubscribedUrl ?? $bookingUrl])
Yes, Keep Me Updated!
@endcomponent

If you'd rather not hear from us, no hard feelings! You can unsubscribe using the link below.

## If You Do Stay...

Here's what you'll get:

✓ First access to new dive experiences<br>
✓ Exclusive subscriber-only discounts<br>
✓ Diving tips and destination guides<br>
✓ Marine life updates and sightings<br>
✓ Special seasonal offers

## Before You Go...

If you've been thinking about booking but haven't found the right time, we're here to help! Just reply to this email and let us know:

- What type of diving interests you most?
- Are there dates that work better for you?
- Any questions we can answer?

We'd love to hear from you and help plan your perfect dive experience.

Wishing you blue skies and calm seas,<br>
The {{ $tenant->name }} Team

@component('mail::subcopy')
If we don't hear from you, we'll assume you'd prefer fewer emails and adjust our communications accordingly. [Unsubscribe]({{ $unsubscribeUrl }}) to stop all emails.
@endcomponent
@endcomponent
