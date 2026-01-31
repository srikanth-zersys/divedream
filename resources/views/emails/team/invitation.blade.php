<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Team Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                You're Invited!
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
                                Hi {{ $user->name }},
                            </p>

                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
                                You've been invited to join <strong>{{ $tenant->name }}</strong> as a <strong>{{ ucfirst($role) }}</strong>.
                            </p>

                            <p style="color: #374151; font-size: 16px; margin: 0 0 30px;">
                                Click the button below to set up your password and access your account:
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $invitationUrl }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Account Details -->
                            <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px; font-weight: 600;">
                                    Your Account Details:
                                </p>
                                <p style="color: #374151; font-size: 14px; margin: 0;">
                                    <strong>Email:</strong> {{ $user->email }}<br>
                                    <strong>Role:</strong> {{ ucfirst($role) }}
                                </p>
                            </div>

                            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0;">
                                This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                                &copy; {{ date('Y') }} {{ $tenant->name }}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Help text -->
                <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="{{ $invitationUrl }}" style="color: #2563eb; word-break: break-all;">{{ $invitationUrl }}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
