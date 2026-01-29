<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .highlight-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; }
        .highlight-box .date { font-size: 32px; font-weight: 700; color: #92400e; }
        .highlight-box .time { font-size: 18px; color: #b45309; margin-top: 5px; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; width: 140px; flex-shrink: 0; }
        .detail-value { color: #111827; font-weight: 500; }
        .checklist { background: #fef3c7; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .checklist h3 { color: #92400e; margin: 0 0 15px; font-size: 16px; }
        .checklist li { padding: 5px 0; color: #92400e; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>{{ $daysUntil === 1 ? 'Your Dive is Tomorrow!' : "Your Dive is in {$daysUntil} Days!" }}</h1>
                <p>Get ready for an amazing experience!</p>
            </div>

            <div class="content">
                <div class="highlight-box">
                    <div class="date">{{ $booking->booking_date->format('l, F j') }}</div>
                    @if($schedule)
                    <div class="time">{{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }}</div>
                    @endif
                </div>

                <h2 style="margin: 0 0 20px; color: #111827;">{{ $product->name }}</h2>

                <div class="detail-row">
                    <span class="detail-label">Booking #</span>
                    <span class="detail-value">{{ $booking->booking_number }}</span>
                </div>

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

                <div class="checklist">
                    <h3>Don't forget:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        @if($product->minimum_certification)
                        <li>Your {{ $product->minimum_certification }} certification card</li>
                        @endif
                        <li>Swimsuit and towel</li>
                        <li>Sunscreen (reef-safe preferred)</li>
                        <li>Any personal medications</li>
                        <li>A light snack and water</li>
                    </ul>
                </div>

                @if(!$booking->waiver_completed)
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-top: 20px;">
                    <h3 style="color: #dc2626; margin: 0 0 10px;">Action Required</h3>
                    <p style="color: #b91c1c; margin: 0;">You haven't signed your waiver yet. Please complete it before arriving.</p>
                </div>
                @endif

                <div class="cta">
                    <a href="{{ url('/portal/booking/' . $booking->id) }}" class="btn">
                        View Booking Details
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Need to make changes? Contact us at {{ $location?->email ?? $tenant->email }}</p>
            <p>&copy; {{ date('Y') }} {{ $tenant->name }}</p>
        </div>
    </div>
</body>
</html>
