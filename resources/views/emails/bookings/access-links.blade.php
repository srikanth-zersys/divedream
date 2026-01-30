<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your Booking Access Links</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
                            @if($tenant->logo_url)
                                <img src="{{ $tenant->logo_url }}" alt="{{ $tenant->name }}" style="max-height: 50px; margin-bottom: 16px;">
                            @else
                                <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 600;">
                                    {{ $tenant->name }}
                                </h1>
                            @endif
                            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                                Your Booking Access Links
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                                Here are your upcoming bookings with {{ $tenant->name }}. Click any booking to view details, sign waivers, or manage your reservation.
                            </p>

                            <!-- Bookings List -->
                            @foreach($bookings as $booking)
                                <div style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                    <div style="background-color: #f9fafb; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <strong style="color: #111827; font-size: 16px;">
                                                        {{ $booking->product?->name ?? 'Dive Activity' }}
                                                    </strong>
                                                    <br>
                                                    <span style="color: #6b7280; font-size: 14px;">
                                                        Booking #{{ $booking->booking_number }}
                                                    </span>
                                                </td>
                                                <td align="right">
                                                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
                                                        @if($booking->status === 'confirmed')
                                                            background-color: #dcfce7; color: #166534;
                                                        @elseif($booking->status === 'pending')
                                                            background-color: #fef3c7; color: #92400e;
                                                        @else
                                                            background-color: #f3f4f6; color: #374151;
                                                        @endif
                                                    ">
                                                        {{ ucfirst($booking->status) }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="padding: 16px 20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">
                                                    <strong>Date:</strong>
                                                    {{ $booking->schedule?->date?->format('l, F j, Y') ?? $booking->booking_date?->format('l, F j, Y') }}
                                                </td>
                                            </tr>
                                            @if($booking->schedule?->start_time)
                                                <tr>
                                                    <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">
                                                        <strong>Time:</strong>
                                                        {{ \Carbon\Carbon::parse($booking->schedule->start_time)->format('g:i A') }}
                                                    </td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding-bottom: 16px;">
                                                    <strong>Participants:</strong>
                                                    {{ $booking->participant_count }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <a href="{{ url('/booking/' . $booking->access_token) }}"
                                                       style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px;">
                                                        View &amp; Manage Booking
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            @endforeach

                            <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                These links are unique to you and don't expire. Keep this email for easy access to your booking.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                                Questions? Contact us at
                                @if($tenant->email)
                                    <a href="mailto:{{ $tenant->email }}" style="color: #2563eb;">{{ $tenant->email }}</a>
                                @endif
                                @if($tenant->phone)
                                    or call {{ $tenant->phone }}
                                @endif
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0; text-align: center;">
                                &copy; {{ date('Y') }} {{ $tenant->name }}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
