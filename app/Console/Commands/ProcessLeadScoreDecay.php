<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\LeadScoringService;
use Illuminate\Console\Command;

class ProcessLeadScoreDecay extends Command
{
    protected $signature = 'leads:decay-scores {--tenant= : Process specific tenant}';

    protected $description = 'Apply score decay to inactive leads';

    public function __construct(
        protected LeadScoringService $scoringService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Processing lead score decay...');

        $tenants = $this->option('tenant')
            ? Tenant::where('id', $this->option('tenant'))->get()
            : Tenant::all();

        $totalProcessed = 0;
        $totalDecayed = 0;

        foreach ($tenants as $tenant) {
            $results = $this->scoringService->applyDecay($tenant->id);
            $totalProcessed += $results['processed'];
            $totalDecayed += $results['decayed'];

            if ($results['decayed'] > 0) {
                $this->line("  Tenant {$tenant->name}: {$results['decayed']} leads decayed");
            }
        }

        $this->info("Score decay complete: {$totalDecayed} leads decayed out of {$totalProcessed} processed");

        return Command::SUCCESS;
    }
}
