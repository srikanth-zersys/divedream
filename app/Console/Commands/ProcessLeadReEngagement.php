<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\NurtureSequence;
use App\Models\Tenant;
use Illuminate\Console\Command;

class ProcessLeadReEngagement extends Command
{
    protected $signature = 'leads:re-engagement
                            {--tenant= : Process specific tenant}
                            {--days=30 : Days of inactivity before re-engagement}';

    protected $description = 'Start re-engagement sequences for stale leads';

    public function handle(): int
    {
        $this->info('Processing lead re-engagement...');

        $days = (int) $this->option('days');

        $tenants = $this->option('tenant')
            ? Tenant::where('id', $this->option('tenant'))->get()
            : Tenant::all();

        $totalEnrolled = 0;

        foreach ($tenants as $tenant) {
            // Check if re-engagement sequence exists and is active
            $sequence = NurtureSequence::forTenant($tenant->id)
                ->active()
                ->where('slug', 're-engagement')
                ->first();

            if (!$sequence) {
                continue;
            }

            // Find stale leads not in any sequence
            $staleLeads = Lead::forTenant($tenant->id)
                ->needsReEngagement($days)
                ->whereNull('nurture_sequence')
                ->where('status', '!=', Lead::STATUS_CONVERTED)
                ->where('status', '!=', Lead::STATUS_LOST)
                ->get();

            foreach ($staleLeads as $lead) {
                // Don't re-engage if they were recently in a sequence
                $recentSequenceEnd = $lead->activities()
                    ->where('type', 'nurture_ended')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->exists();

                if ($recentSequenceEnd) {
                    continue;
                }

                // Start re-engagement sequence
                $lead->startNurtureSequence('re-engagement');
                $totalEnrolled++;

                $this->line("  Enrolled lead {$lead->id} ({$lead->email})");
            }
        }

        $this->info("Re-engagement complete: {$totalEnrolled} leads enrolled");

        return Command::SUCCESS;
    }
}
