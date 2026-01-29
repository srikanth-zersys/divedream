<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action Required: Sign Your Waiver</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 30px; }
        .alert { background: #fffbeb; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #fcd34d; }
        .alert h3 { color: #92400e; margin: 0 0 10px; font-size: 16px; }
        .alert p { color: #a16207; margin: 0; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; width: 140px; flex-shrink: 0; }
        .detail-value { color: #111827; font-weight: 500; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .btn:hover { background: #d97706; }
        .why-list { background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .why-list h3 { color: #111827; margin: 0 0 15px; font-size: 16px; }
        .why-list li { padding: 5px 0; color: #4b5563; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Action Required</h1>
                <p>Please sign your liability waiver</p>
            </div>

            <div class="content">
                <div class="alert">
                    <h3>Waiver Not Signed</h3>
                    <p>Your waiver must be signed before your diving activity. Please complete it as soon as possible to avoid delays on the day of your dive.</p>
                </div>

                <p>Hi {{ $member->first_name }},</p>

                <p>You have an upcoming booking that requires a signed liability waiver. Please take a moment to review and sign the waiver before your activity.</p>

                <h2 style="margin: 20px 0 15px; color: #111827;">{{ $product->name }}</h2>

                <div class="detail-row">
                    <span class="detail-label">Booking #</span>
                    <span class="detail-value">{{ $booking->booking_number }}</span>
                </div>

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

                @if($location)
                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">{{ $location->name }}</span>
                </div>
                @endif

                <div class="cta">
                    <a href="{{ url('/booking/' . $booking->access_token) }}" class="btn">
                        Sign Waiver Now
                    </a>
                </div>

                <div class="why-list">
                    <h3>Why do I need to sign a waiver?</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Diving is an adventure activity with inherent risks</li>
                        <li>The waiver helps you understand the safety requirements</li>
                        <li>It's a legal requirement for participation</li>
                        <li>Signing in advance saves time on the day of your dive</li>
                    </ul>
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
