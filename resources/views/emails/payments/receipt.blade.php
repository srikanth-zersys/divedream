<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .receipt-badge { background: #ecfdf5; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; border: 1px solid #a7f3d0; }
        .receipt-badge span { font-size: 12px; color: #065f46; display: block; }
        .receipt-badge strong { font-size: 28px; color: #047857; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; }
        .detail-value { color: #111827; font-weight: 500; }
        .pricing { background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .pricing-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .pricing-total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px; font-weight: 600; font-size: 18px; }
        .booking-info { background: #eff6ff; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .booking-info h3 { color: #1e40af; margin: 0 0 15px; font-size: 16px; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Payment Receipt</h1>
                <p>Thank you for your payment</p>
            </div>

            <div class="content">
                <div class="receipt-badge">
                    <span>Amount Paid</span>
                    <strong>${{ number_format($payment->amount, 2) }}</strong>
                </div>

                <p style="margin-bottom: 20px;">Hi {{ $member->first_name }},</p>

                <p>We've received your payment. Here are the details:</p>

                <div class="detail-row">
                    <span class="detail-label">Transaction Date</span>
                    <span class="detail-value">{{ $payment->paid_at->format('F j, Y, g:i A') }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">{{ ucfirst($payment->payment_method) }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Booking Reference</span>
                    <span class="detail-value">{{ $booking->booking_number }}</span>
                </div>

                @if($payment->stripe_payment_intent_id)
                <div class="detail-row">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value" style="font-family: monospace; font-size: 12px;">{{ $payment->stripe_payment_intent_id }}</span>
                </div>
                @endif

                <div class="booking-info">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Activity</span>
                        <span class="detail-value">{{ $product->name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">{{ $booking->booking_date->format('l, F j, Y') }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Participants</span>
                        <span class="detail-value">{{ $booking->participant_count }}</span>
                    </div>
                </div>

                <div class="pricing">
                    <div class="pricing-row">
                        <span>Booking Total</span>
                        <span>${{ number_format($booking->total_amount, 2) }}</span>
                    </div>
                    <div class="pricing-row" style="color: #059669;">
                        <span>Total Paid</span>
                        <span>${{ number_format($booking->amount_paid, 2) }}</span>
                    </div>
                    @if($booking->balance_due > 0)
                    <div class="pricing-row pricing-total" style="color: #dc2626;">
                        <span>Balance Due</span>
                        <span>${{ number_format($booking->balance_due, 2) }}</span>
                    </div>
                    @else
                    <div class="pricing-row pricing-total" style="color: #059669;">
                        <span>Paid in Full</span>
                        <span>$0.00</span>
                    </div>
                    @endif
                </div>

                <div class="cta">
                    <a href="{{ url('/booking/' . $booking->access_token) }}" class="btn">
                        View Your Booking
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>This receipt is for your records.</p>
            <p>&copy; {{ date('Y') }} {{ $tenant->name }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
