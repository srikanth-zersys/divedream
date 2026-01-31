<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .booking-number { background: #fef2f2; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; border: 1px solid #fecaca; }
        .booking-number span { font-size: 12px; color: #991b1b; display: block; }
        .booking-number strong { font-size: 24px; color: #7f1d1d; font-family: monospace; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; width: 140px; flex-shrink: 0; }
        .detail-value { color: #111827; font-weight: 500; }
        .refund-info { background: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 20px; border: 1px solid #bbf7d0; }
        .refund-info h3 { color: #166534; margin: 0 0 10px; font-size: 16px; }
        .refund-info p { color: #15803d; margin: 0; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Booking Cancelled</h1>
                <p>We're sorry to see you go</p>
            </div>

            <div class="content">
                <div class="booking-number">
                    <span>Booking Reference</span>
                    <strong>{{ $booking->booking_number }}</strong>
                </div>

                <p style="margin-bottom: 20px;">Hi {{ $member->first_name }},</p>

                <p>Your booking has been cancelled as requested. Here are the details of the cancelled booking:</p>

                <h2 style="margin: 20px 0 15px; color: #111827;">{{ $product->name }}</h2>

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

                <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">${{ number_format($booking->total_amount, 2) }}</span>
                </div>

                @if($booking->amount_paid > 0)
                <div class="refund-info">
                    <h3>Refund Information</h3>
                    <p>If you paid for this booking, your refund of ${{ number_format($booking->amount_paid, 2) }} will be processed within 5-7 business days. The refund will be credited to your original payment method.</p>
                </div>
                @endif

                <div class="cta">
                    <a href="{{ url('/book') }}" class="btn">
                        Book Another Adventure
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
