<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\NurtureSequence;
use App\Models\NurtureSequenceStep;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessLeadNurturing extends Command
{
    protected $signature = 'leads:process-nurturing {--tenant= : Process specific tenant}';

    protected $description = 'Process lead nurturing sequences and send scheduled emails';

    public function handle(): int
    {
        $this->info('Processing lead nurturing sequences...');

        $tenants = $this->option('tenant')
            ? Tenant::where('id', $this->option('tenant'))->get()
            : Tenant::all();

        $totalSent = 0;
        $totalAdvanced = 0;
        $totalCompleted = 0;

        foreach ($tenants as $tenant) {
            $results = $this->processNurturingForTenant($tenant);
            $totalSent += $results['sent'];
            $totalAdvanced += $results['advanced'];
            $totalCompleted += $results['completed'];
        }

        $this->info("Nurturing complete: {$totalSent} emails sent, {$totalAdvanced} steps advanced, {$totalCompleted} sequences completed");

        return Command::SUCCESS;
    }

    protected function processNurturingForTenant(Tenant $tenant): array
    {
        $results = [
            'sent' => 0,
            'advanced' => 0,
            'completed' => 0,
        ];

        // Get all active sequences for this tenant
        $sequences = NurtureSequence::forTenant($tenant->id)->active()->get();

        foreach ($sequences as $sequence) {
            // Get leads in this sequence
            $leads = Lead::where('nurture_sequence', $sequence->slug)
                ->where('tenant_id', $tenant->id)
                ->subscribed()
                ->where(function ($q) {
                    $q->whereNull('nurture_paused_until')
                        ->orWhere('nurture_paused_until', '<=', now());
                })
                ->get();

            foreach ($leads as $lead) {
                $stepResults = $this->processLeadStep($lead, $sequence, $tenant);
                $results['sent'] += $stepResults['sent'];
                $results['advanced'] += $stepResults['advanced'];
                $results['completed'] += $stepResults['completed'];
            }
        }

        return $results;
    }

    protected function processLeadStep(Lead $lead, NurtureSequence $sequence, Tenant $tenant): array
    {
        $results = ['sent' => 0, 'advanced' => 0, 'completed' => 0];

        // Get current step
        $currentStep = $sequence->getStep($lead->nurture_step);

        if (!$currentStep) {
            // No more steps, end sequence
            $lead->endNurtureSequence('completed');
            $results['completed']++;
            return $results;
        }

        // Check if step should be sent now
        if (!$currentStep->shouldSendNow($lead)) {
            return $results;
        }

        // Check conditions
        if (!$currentStep->leadMeetsConditions($lead)) {
            // Skip to next step or branch
            $this->advanceToNextStep($lead, $currentStep, $sequence);
            $results['advanced']++;
            return $results;
        }

        // Check if goal was already completed
        if ($currentStep->end_on_goal && $currentStep->leadCompletedGoal($lead)) {
            $lead->endNurtureSequence('goal_completed');
            $results['completed']++;
            return $results;
        }

        // Send the email
        if ($currentStep->type === NurtureSequenceStep::TYPE_EMAIL) {
            try {
                $this->sendNurtureEmail($lead, $currentStep, $tenant);
                $results['sent']++;
            } catch (\Exception $e) {
                Log::error('Failed to send nurture email', [
                    'lead_id' => $lead->id,
                    'step_id' => $currentStep->id,
                    'error' => $e->getMessage(),
                ]);
                return $results;
            }
        }

        // Advance to next step
        $this->advanceToNextStep($lead, $currentStep, $sequence);
        $results['advanced']++;

        return $results;
    }

    protected function advanceToNextStep(Lead $lead, NurtureSequenceStep $currentStep, NurtureSequence $sequence): void
    {
        $nextStep = $currentStep->getNextStep();

        if ($nextStep) {
            $lead->update(['nurture_step' => $nextStep->step_number]);
            $lead->recordActivity('nurture_step_advanced', [
                'sequence' => $sequence->slug,
                'from_step' => $currentStep->step_number,
                'to_step' => $nextStep->step_number,
            ]);
        } else {
            // No more steps
            $lead->endNurtureSequence('completed');
        }
    }

    protected function sendNurtureEmail(Lead $lead, NurtureSequenceStep $step, Tenant $tenant): void
    {
        $sequence = $step->sequence;

        // Prepare email data
        $data = [
            'lead' => $lead,
            'tenant' => $tenant,
            'step' => $step,
            'sequence' => $sequence,
            'bookingUrl' => route('public.book.index'),
            'unsubscribeUrl' => route('public.leads.unsubscribe', base64_encode($lead->id)),
        ];

        // Add any special variables based on sequence type
        if ($sequence->slug === 'welcome') {
            $data['discountCode'] = 'WELCOME10';
            $data['discountPercent'] = 10;
            $data['offerDays'] = 7;
        } elseif ($sequence->slug === 're-engagement') {
            $data['discountCode'] = 'COMEBACK15';
            $data['discountPercent'] = 15;
            $data['offerDays'] = 14;
        }

        // Send the email
        Mail::send(
            $step->getEmailTemplatePath(),
            $data,
            function ($message) use ($lead, $step, $tenant) {
                $message->to($lead->email, $lead->full_name)
                    ->subject($this->parseSubject($step->email_subject, $lead, $tenant))
                    ->from(config('mail.from.address'), $tenant->name);
            }
        );

        // Record the send
        $lead->recordActivity('nurture_email_sent', [
            'sequence' => $step->sequence->slug,
            'step' => $step->step_number,
            'step_name' => $step->name,
            'email_id' => "{$step->sequence->slug}-{$step->step_number}-{$lead->id}",
        ]);

        Log::info('Nurture email sent', [
            'lead_id' => $lead->id,
            'sequence' => $step->sequence->slug,
            'step' => $step->step_number,
        ]);
    }

    protected function parseSubject(string $subject, Lead $lead, Tenant $tenant): string
    {
        return str_replace([
            '{first_name}',
            '{tenant_name}',
        ], [
            $lead->first_name ?? 'there',
            $tenant->name,
        ], $subject);
    }
}
