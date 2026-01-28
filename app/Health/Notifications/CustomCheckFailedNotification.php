<?php

namespace App\Health\Notifications;

use Spatie\Health\Notifications\CheckFailedNotification;
use Spatie\Health\Enums\Status;

class CustomCheckFailedNotification extends CheckFailedNotification
{
    public function via(): array
    {
        $channels = parent::via();

        if (config('health.notifications.teams.enabled')) {
            $channels[] = \App\Notifications\Channels\TeamsChannel::class;
        }

        return $channels;
    }

    public function toTeams($notifiable): array
    {
        $bodyElements = [];

        // Add header
        $bodyElements[] = [
            'type' => 'TextBlock',
            'text' => '⚠️ ' . trans('health::notifications.check_failed_mail_subject', $this->transParameters()),
            'size' => 'Large',
            'weight' => 'Bolder',
            'color' => 'Attention',
        ];

        // Add timestamp
        $bodyElements[] = [
            'type' => 'TextBlock',
            'text' => 'Detected at: ' . now()->format('Y-m-d H:i:s'),
            'size' => 'Small',
            'color' => 'Default',
            'isSubtle' => true,
        ];

        // Add a separator
        $bodyElements[] = [
            'type' => 'TextBlock',
            'text' => ' ',
            'separator' => true,
        ];

        // Add check results
        foreach ($this->results as $result) {
            $statusEmoji = '❌';
            $color = 'Attention';

            if ($result->status->value === 'ok') {
                $statusEmoji = '✅';
                $color = 'Good';
            } elseif ($result->status->value === 'warning') {
                $statusEmoji = '⚠️';
                $color = 'Warning';
            }

            // Add check name
            $bodyElements[] = [
                'type' => 'TextBlock',
                'text' => $statusEmoji . ' **' . $result->check->getLabel() . '**',
                'size' => 'Medium',
                'weight' => 'Bolder',
                'color' => $color,
            ];

            // Add check message
            $bodyElements[] = [
                'type' => 'TextBlock',
                'text' => $result->getNotificationMessage(),
                'wrap' => true,
                'spacing' => 'Small',
            ];

            // Add metadata as facts if available
            if ($result->meta && count($result->meta) > 0) {
                $facts = [];
                foreach ($result->meta as $key => $value) {
                    if (is_scalar($value)) {
                        $facts[] = [
                            'title' => ucfirst(str_replace('_', ' ', $key)) . ':',
                            'value' => (string) $value,
                        ];
                    }
                }

                if (!empty($facts)) {
                    $bodyElements[] = [
                        'type' => 'FactSet',
                        'facts' => $facts,
                        'spacing' => 'Small',
                    ];
                }
            }

            // Add spacing between checks
            $bodyElements[] = [
                'type' => 'TextBlock',
                'text' => ' ',
                'spacing' => 'Medium',
            ];
        }

        // Create Adaptive Card
        $adaptiveCard = [
            '$schema' => 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type' => 'AdaptiveCard',
            'version' => '1.2',
            'body' => $bodyElements,
            'actions' => [
                [
                    'type' => 'Action.OpenUrl',
                    'title' => '🔍 View Health Status',
                    'url' => url('/health'),
                ],
            ],
        ];

        // Return in the format Power Automate expects
        return [
            'type' => 'message',
            'attachments' => [
                [
                    'contentType' => 'application/vnd.microsoft.card.adaptive',
                    'contentUrl' => null,
                    'content' => $adaptiveCard,
                ],
            ],
        ];
    }
}
