<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\ReferralService;
use Illuminate\Console\Command;

class ProcessReferralRewards extends Command
{
    protected $signature = 'referrals:process-rewards {--tenant= : Process specific tenant}';

    protected $description = 'Process and issue pending referral rewards';

    public function __construct(
        protected ReferralService $referralService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Processing referral rewards...');

        $tenants = $this->option('tenant')
            ? Tenant::where('id', $this->option('tenant'))->get()
            : Tenant::all();

        $totalProcessed = 0;
        $totalRewarded = 0;
        $totalErrors = 0;

        foreach ($tenants as $tenant) {
            $results = $this->referralService->issuePendingRewards($tenant->id);
            $totalProcessed += $results['processed'];
            $totalRewarded += $results['rewarded'];
            $totalErrors += $results['errors'];

            if ($results['rewarded'] > 0) {
                $this->line("  Tenant {$tenant->name}: {$results['rewarded']} rewards issued");
            }
        }

        // Also expire old referrals
        $expired = $this->referralService->expireOldReferrals();

        $this->info("Referral processing complete: {$totalRewarded} rewards issued, {$expired} referrals expired");

        if ($totalErrors > 0) {
            $this->warn("  {$totalErrors} errors occurred - check logs for details");
        }

        return $totalErrors > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
