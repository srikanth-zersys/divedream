<?php

namespace App\Health\Notifications;

use Illuminate\Notifications\Notifiable;

class CustomNotifiable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array|string
     */
    public function routeNotificationForMail($notification): array|string
    {
        return config('health.notifications.mail.to');
    }

    /**
     * Route notifications for the Teams channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string|null
     */
    public function routeNotificationForTeams($notification): ?string
    {
        if (config('health.notifications.teams.enabled')) {
            return config('health.notifications.teams.webhook_url');
        }

        return null;
    }
}
