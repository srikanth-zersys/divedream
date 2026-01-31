<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Change Notification</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .alert { background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
        .alert p { color: #92400e; margin: 0; }
        .changes-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .change-row { display: flex; margin-bottom: 16px; }
        .change-row:last-child { margin-bottom: 0; }
        .change-label { width: 80px; color: #6b7280; font-size: 14px; }
        .change-old { flex: 1; padding: 10px; background: #fef2f2; border-radius: 6px; margin-right: 8px; }
        .change-new { flex: 1; padding: 10px; background: #ecfdf5; border-radius: 6px; }
        .change-old span, .change-new span { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .change-old strong { color: #dc2626; }
        .change-new strong { color: #059669; }
        .booking-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .info-row { display: flex; padding: 8px 0; }
        .info-label { width: 140px; color: #6b7280; }
        .info-value { color: #111827; font-weight: 500; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .help-text { background: #eff6ff; border-radius: 8px; padding: 16px; margin-top: 20px; }
        .help-text p { color: #1e40af; margin: 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Schedule Change</h1>
                <p>Your booking time has been updated</p>
            </div>

            <div class="content">
                <div class="alert">
                    <p><strong>Important:</strong> The schedule for your upcoming booking has been changed. Please review the new date and time below.</p>
                </div>

                <h2 style="margin: 0 0 20px; color: #111827;">{{ $product->name ?? 'Your Booking' }}</h2>

                <div class="changes-box">
                    <div class="change-row">
                        <div class="change-label">Date</div>
                        <div class="change-old">
                            <span>Previous</span>
                            <strong>{{ \Carbon\Carbon::parse($changes['old_date'])->format('l, M j, Y') }}</strong>
                        </div>
                        <div class="change-new">
                            <span>New</span>
                            <strong>{{ \Carbon\Carbon::parse($changes['new_date'])->format('l, M j, Y') }}</strong>
                        </div>
                    </div>

                    <div class="change-row">
                        <div class="change-label">Time</div>
                        <div class="change-old">
                            <span>Previous</span>
                            <strong>{{ \Carbon\Carbon::parse($changes['old_start_time'])->format('g:i A') }}</strong>
                        </div>
                        <div class="change-new">
                            <span>New</span>
                            <strong>{{ \Carbon\Carbon::parse($changes['new_start_time'])->format('g:i A') }}</strong>
                        </div>
                    </div>
                </div>

                <div class="booking-info">
                    <div class="info-row">
                        <span class="info-label">Booking #</span>
                        <span class="info-value">{{ $booking->booking_number }}</span>
                    </div>
                    @if($booking->location)
                    <div class="info-row">
                        <span class="info-label">Location</span>
                        <span class="info-value">{{ $booking->location->name }}</span>
                    </div>
                    @endif
                    <div class="info-row">
                        <span class="info-label">Participants</span>
                        <span class="info-value">{{ $booking->participant_count }} {{ $booking->participant_count === 1 ? 'person' : 'people' }}</span>
                    </div>
                </div>

                <div class="cta">
                    <a href="{{ url('/booking/' . $booking->access_token) }}" class="btn">
                        View Booking Details
                    </a>
                </div>

                <div class="help-text">
                    <p>If this new time doesn't work for you, please contact us to discuss alternative options or request a cancellation.</p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Questions? Contact us at {{ $booking->location?->email ?? $tenant->email }}</p>
            <p>&copy; {{ date('Y') }} {{ $tenant->name }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
