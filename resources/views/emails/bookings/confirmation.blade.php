<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .booking-number { background: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; }
        .booking-number span { font-size: 12px; color: #6b7280; display: block; }
        .booking-number strong { font-size: 24px; color: #111827; font-family: monospace; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; width: 140px; flex-shrink: 0; }
        .detail-value { color: #111827; font-weight: 500; }
        .pricing { background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .pricing-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .pricing-total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px; font-weight: 600; font-size: 18px; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .checklist { background: #eff6ff; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .checklist h3 { color: #1e40af; margin: 0 0 15px; font-size: 16px; }
        .checklist li { padding: 5px 0; color: #1e40af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Booking Confirmed!</h1>
                <p>Thank you for booking with {{ $tenant->name }}</p>
            </div>

            <div class="content">
                <div class="booking-number">
                    <span>Booking Reference</span>
                    <strong>{{ $booking->booking_number }}</strong>
                </div>

                <h2 style="margin: 0 0 20px; color: #111827;">{{ $product->name }}</h2>

                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">{{ $booking->booking_date->format('l, F j, Y') }}</span>
                </div>

                @if($schedule)
                <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}</span>
                </div>
                @endif

                <div class="detail-row">
                    <span class="detail-label">Participants</span>
                    <span class="detail-value">{{ $booking->participant_count }} {{ $booking->participant_count === 1 ? 'person' : 'people' }}</span>
                </div>

                @if($location)
                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">
                        {{ $location->name }}<br>
                        <small style="color: #6b7280;">{{ $location->address_line_1 }}, {{ $location->city }}</small>
                    </span>
                </div>
                @endif

                <div class="pricing">
                    <div class="pricing-row">
                        <span>Subtotal</span>
                        <span>${{ number_format($booking->subtotal, 2) }}</span>
                    </div>
                    @if($booking->discount_amount > 0)
                    <div class="pricing-row" style="color: #059669;">
                        <span>Discount</span>
                        <span>-${{ number_format($booking->discount_amount, 2) }}</span>
                    </div>
                    @endif
                    @if($booking->tax_amount > 0)
                    <div class="pricing-row">
                        <span>Tax</span>
                        <span>${{ number_format($booking->tax_amount, 2) }}</span>
                    </div>
                    @endif
                    <div class="pricing-row pricing-total">
                        <span>Total</span>
                        <span>${{ number_format($booking->total_amount, 2) }}</span>
                    </div>
                    @if($booking->amount_paid > 0)
                    <div class="pricing-row" style="color: #059669;">
                        <span>Paid</span>
                        <span>${{ number_format($booking->amount_paid, 2) }}</span>
                    </div>
                    @endif
                    @if($booking->total_amount - $booking->amount_paid > 0)
                    <div class="pricing-row" style="color: #dc2626;">
                        <span>Balance Due</span>
                        <span>${{ number_format($booking->total_amount - $booking->amount_paid, 2) }}</span>
                    </div>
                    @endif
                </div>

                <div class="checklist">
                    <h3>Before Your Dive:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        @if(!$booking->waiver_completed)
                        <li>Sign the liability waiver</li>
                        @endif
                        @if($product->requires_medical_clearance)
                        <li>Complete the medical questionnaire</li>
                        @endif
                        @if($product->minimum_certification)
                        <li>Bring your {{ $product->minimum_certification }} certification card</li>
                        @endif
                        <li>Arrive at least 30 minutes before your scheduled time</li>
                    </ul>
                </div>

                <div class="cta">
                    <a href="{{ url('/booking/' . $booking->access_token) }}" class="btn">
                        Manage Your Booking
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Questions? Contact us at {{ $location?->email ?? $tenant->email }}</p>
            <p>&copy; {{ date('Y') }} {{ $tenant->name }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
