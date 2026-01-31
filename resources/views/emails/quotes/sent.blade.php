<x-mail::message>
# Your Quote is Ready

Hello {{ $quote->contact_name }},

Thank you for your interest in {{ $tenant->name }}! We're pleased to provide you with a customized quote for your upcoming adventure.

## Quote Details

**Quote Number:** {{ $quote->quote_number }}
**Title:** {{ $quote->title }}
@if($quote->description)
**Description:** {{ $quote->description }}
@endif

## Pricing Summary

@foreach($quote->items as $item)
- {{ $item->name }} ({{ $item->quantity }} x {{ number_format($item->unit_price, 2) }}) = **{{ number_format($item->total_price, 2) }} {{ $tenant->currency }}**
@endforeach

---

**Subtotal:** {{ number_format($quote->subtotal, 2) }} {{ $tenant->currency }}
@if($quote->discount_amount > 0)
**Discount ({{ $quote->discount_percent }}%):** -{{ number_format($quote->discount_amount, 2) }} {{ $tenant->currency }}
@endif
@if($quote->tax_amount > 0)
**Tax ({{ $quote->tax_rate }}%):** {{ number_format($quote->tax_amount, 2) }} {{ $tenant->currency }}
@endif
**Total:** **{{ number_format($quote->total_amount, 2) }} {{ $tenant->currency }}**

@if($quote->deposit_required && $quote->deposit_amount > 0)
**Deposit Required:** {{ number_format($quote->deposit_amount, 2) }} {{ $tenant->currency }} ({{ $quote->deposit_percent }}%)
@endif

---

**Valid Until:** {{ $quote->valid_until->format('F j, Y') }}

<x-mail::button :url="$viewUrl">
View Full Quote & Respond
</x-mail::button>

## What's Next?

1. Click the button above to view your complete quote
2. Review all details and terms
3. Accept the quote to confirm your booking, or request changes if needed

@if($quote->cancellation_policy)
## Cancellation Policy

{!! nl2br(e($quote->cancellation_policy)) !!}
@endif

---

If you have any questions or would like to discuss this quote, please don't hesitate to contact us:

@if($tenant->phone)
**Phone:** {{ $tenant->phone }}
@endif
**Email:** {{ $tenant->email }}
@if($tenant->website)
**Website:** {{ $tenant->website }}
@endif

We look forward to welcoming you!

Best regards,
**{{ $tenant->name }}**

<x-mail::subcopy>
This quote was prepared specifically for you. If you didn't request this quote, please ignore this email.
</x-mail::subcopy>
</x-mail::message>
