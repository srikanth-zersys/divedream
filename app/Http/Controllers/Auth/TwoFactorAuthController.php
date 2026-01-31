<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Show 2FA settings page
     */
    public function show(): Response
    {
        $user = Auth::user();

        return Inertia::render('auth/two-factor/settings', [
            'enabled' => $user->two_factor_confirmed_at !== null,
            'confirmed' => $user->two_factor_confirmed_at !== null,
        ]);
    }

    /**
     * Enable 2FA - generate secret and show QR code
     */
    public function enable(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Generate new secret
        $secret = $this->google2fa->generateSecretKey();

        // Store (unconfirmed) in session first
        session(['2fa_secret' => $secret]);

        // Generate QR code
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $qrCodeSvg = $this->generateQrCode($qrCodeUrl);

        // Generate recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();
        session(['2fa_recovery_codes' => $recoveryCodes]);

        return Inertia::render('auth/two-factor/enable', [
            'qrCode' => $qrCodeSvg,
            'secret' => $secret,
            'recoveryCodes' => $recoveryCodes,
        ]);
    }

    /**
     * Confirm 2FA setup with verification code
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $secret = session('2fa_secret');
        $recoveryCodes = session('2fa_recovery_codes');

        if (!$secret) {
            return redirect()->route('two-factor.show')
                ->with('error', 'Please restart the 2FA setup process.');
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid verification code. Please try again.']);
        }

        // Save to user
        $user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
        ]);

        // Clear session
        session()->forget(['2fa_secret', '2fa_recovery_codes']);

        return redirect()->route('two-factor.show')
            ->with('success', 'Two-factor authentication has been enabled.');
    }

    /**
     * Disable 2FA
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return redirect()->route('two-factor.show')
            ->with('success', 'Two-factor authentication has been disabled.');
    }

    /**
     * Show 2FA challenge during login
     */
    public function challenge(): Response
    {
        return Inertia::render('auth/two-factor/challenge');
    }

    /**
     * Verify 2FA code during login
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $userId = session('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login')
                ->with('error', 'Session expired. Please login again.');
        }

        $user = \App\Models\User::find($userId);
        if (!$user || !$user->two_factor_secret) {
            return redirect()->route('login')
                ->with('error', 'Invalid session. Please login again.');
        }

        $code = $request->code;

        // Check if it's a recovery code
        if (strlen($code) > 6) {
            $valid = $this->validateRecoveryCode($user, $code);
        } else {
            $secret = decrypt($user->two_factor_secret);
            $valid = $this->google2fa->verifyKey($secret, $code);
        }

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid verification code.']);
        }

        // Clear 2FA session
        session()->forget('2fa_user_id');

        // Log in the user
        Auth::login($user, session('2fa_remember', false));
        session()->forget('2fa_remember');

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Regenerate recovery codes
     */
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        if (!$user->two_factor_confirmed_at) {
            return response()->json(['error' => '2FA is not enabled'], 400);
        }

        $recoveryCodes = $this->generateRecoveryCodes();

        $user->update([
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
        ]);

        return response()->json([
            'recoveryCodes' => $recoveryCodes,
        ]);
    }

    /**
     * Get current recovery codes
     */
    public function getRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        if (!$user->two_factor_recovery_codes) {
            return response()->json(['recoveryCodes' => []]);
        }

        $codes = json_decode(decrypt($user->two_factor_recovery_codes), true);

        return response()->json([
            'recoveryCodes' => $codes,
        ]);
    }

    /**
     * Generate recovery codes
     */
    protected function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = Str::random(4) . '-' . Str::random(4);
        }
        return $codes;
    }

    /**
     * Validate a recovery code
     */
    protected function validateRecoveryCode($user, string $code): bool
    {
        if (!$user->two_factor_recovery_codes) {
            return false;
        }

        $codes = json_decode(decrypt($user->two_factor_recovery_codes), true);

        if (!in_array($code, $codes)) {
            return false;
        }

        // Remove used code
        $codes = array_values(array_filter($codes, fn($c) => $c !== $code));
        $user->update([
            'two_factor_recovery_codes' => encrypt(json_encode($codes)),
        ]);

        return true;
    }

    /**
     * Generate QR code SVG
     */
    protected function generateQrCode(string $url): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        return $writer->writeString($url);
    }
}
