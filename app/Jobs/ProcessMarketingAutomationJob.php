<?php

namespace App\Jobs;

use App\Services\MarketingAutomationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMarketingAutomationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public string $type = 'all'
    ) {}

    public function handle(MarketingAutomationService $service): void
    {
        $results = [];

        if (in_array($this->type, ['all', 'messages'])) {
            $results['messages'] = $service->processDueMessages();
        }

        if (in_array($this->type, ['all', 'carts'])) {
            $results['carts'] = $service->processAbandonedCarts();
        }

        if (in_array($this->type, ['all', 'reviews'])) {
            $results['reviews'] = $service->processReviewRequests();
        }

        Log::info('Marketing automation processed', $results);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Marketing automation job failed', [
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
