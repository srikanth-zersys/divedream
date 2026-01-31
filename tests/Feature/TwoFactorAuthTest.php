<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }

    public function test_user_can_access_2fa_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('two-factor.show'));

        $response->assertOk();
    }

    public function test_user_can_enable_2fa(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);
        $this->assertNotNull($this->user->two_factor_recovery_codes);
    }

    public function test_user_can_confirm_2fa_with_valid_code(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode([
                'code1-code1-code1',
                'code2-code2-code2',
            ])),
        ]);

        $validCode = $google2fa->getCurrentOtp($secret);

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.confirm'), [
                'code' => $validCode,
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_confirmed_at);
    }

    public function test_user_cannot_confirm_2fa_with_invalid_code(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode([
                'code1-code1-code1',
            ])),
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.confirm'), [
                'code' => '000000',
            ]);

        $response->assertSessionHasErrors('code');

        $this->user->refresh();
        $this->assertNull($this->user->two_factor_confirmed_at);
    }

    public function test_user_with_2fa_is_redirected_to_challenge(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->post(route('login'), [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.challenge'));
        $this->assertGuest();
    }

    public function test_user_can_verify_2fa_during_login(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_confirmed_at' => now(),
        ]);

        // Start login process
        session()->put('2fa_user_id', $this->user->id);
        session()->put('2fa_remember', false);

        $validCode = $google2fa->getCurrentOtp($secret);

        $response = $this->post(route('two-factor.verify'), [
            'code' => $validCode,
        ]);

        $response->assertRedirect(route('dashboard.index'));
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_user_can_use_recovery_code(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $recoveryCodes = [
            'aaaa-bbbb-cccc',
            'dddd-eeee-ffff',
            'gggg-hhhh-iiii',
        ];

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
        ]);

        session()->put('2fa_user_id', $this->user->id);
        session()->put('2fa_remember', false);

        $response = $this->post(route('two-factor.verify'), [
            'code' => 'aaaa-bbbb-cccc',
        ]);

        $response->assertRedirect(route('dashboard.index'));
        $this->assertAuthenticatedAs($this->user);

        // Verify recovery code was consumed
        $this->user->refresh();
        $remainingCodes = json_decode(decrypt($this->user->two_factor_recovery_codes), true);
        $this->assertCount(2, $remainingCodes);
        $this->assertNotContains('aaaa-bbbb-cccc', $remainingCodes);
    }

    public function test_user_can_disable_2fa(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode(['code'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('two-factor.disable'), [
                'password' => 'password',
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertNull($this->user->two_factor_secret);
        $this->assertNull($this->user->two_factor_recovery_codes);
        $this->assertNull($this->user->two_factor_confirmed_at);
    }

    public function test_user_cannot_disable_2fa_with_wrong_password(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode(['code'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('two-factor.disable'), [
                'password' => 'wrong-password',
            ]);

        $response->assertSessionHasErrors('password');

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);
    }

    public function test_user_can_regenerate_recovery_codes(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $originalCodes = ['old-code-1', 'old-code-2'];

        $this->user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($originalCodes)),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.recovery-codes'));

        $response->assertRedirect();

        $this->user->refresh();
        $newCodes = json_decode(decrypt($this->user->two_factor_recovery_codes), true);

        $this->assertNotEquals($originalCodes, $newCodes);
        $this->assertCount(8, $newCodes);
    }
}
