<?php

namespace App\Console\Commands;

use App\Services\MarketingAutomationService;
use Illuminate\Console\Command;

class ProcessMarketingAutomation extends Command
{
    protected $signature = 'automation:process
                            {--type=all : Type to process (all, messages, carts, reviews)}';

    protected $description = 'Process marketing automation tasks (pre-trip messages, abandoned carts, review requests)';

    public function __construct(
        protected MarketingAutomationService $automationService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $type = $this->option('type');

        $this->info('Processing marketing automation...');

        $results = [];

        // Process pre-trip and other scheduled messages
        if (in_array($type, ['all', 'messages'])) {
            $this->info('Processing scheduled messages...');
            $messageResults = $this->automationService->processDueMessages();
            $results['messages'] = $messageResults;
            $this->line("  Messages: {$messageResults['processed']} sent, {$messageResults['failed']} failed");
        }

        // Process abandoned cart reminders
        if (in_array($type, ['all', 'carts'])) {
            $this->info('Processing abandoned carts...');
            $cartResults = $this->automationService->processAbandonedCarts();
            $results['carts'] = $cartResults;
            $this->line("  Carts: {$cartResults['processed']} reminders sent, {$cartResults['failed']} failed");
        }

        // Process review requests
        if (in_array($type, ['all', 'reviews'])) {
            $this->info('Processing review requests...');
            $reviewResults = $this->automationService->processReviewRequests();
            $results['reviews'] = $reviewResults;
            $this->line("  Reviews: {$reviewResults['sent']} sent, {$reviewResults['failed']} failed");
        }

        $this->info('Marketing automation processing complete.');

        return self::SUCCESS;
    }
}
