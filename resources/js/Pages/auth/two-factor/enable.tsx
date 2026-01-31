import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import Layout from '@/layout/Layout';

interface Props {
    qrCode: string;
    secret: string;
    recoveryCodes: string[];
}

export default function EnableTwoFactor({ qrCode, secret, recoveryCodes }: Props) {
    const [showSecret, setShowSecret] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.confirm'));
    };

    return (
        <Layout>
            <Head title="Enable Two-Factor Authentication" />

            <div className="max-w-2xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Set Up Two-Factor Authentication</h1>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Step 1: Scan QR Code</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                        </p>

                        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                            <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                {showSecret ? 'Hide' : 'Show'} manual entry code
                            </button>
                            {showSecret && (
                                <div className="mt-2 p-3 bg-gray-100 rounded font-mono text-sm break-all">
                                    {secret}
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="my-6" />

                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Step 2: Save Recovery Codes</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Store these recovery codes in a secure place. You can use them to access your account if you lose your authenticator device.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            {showRecoveryCodes ? 'Hide' : 'Show'} Recovery Codes
                        </button>

                        {showRecoveryCodes && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                    {recoveryCodes.map((code, index) => (
                                        <code key={index} className="font-mono text-sm bg-white p-2 rounded border">
                                            {code}
                                        </code>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    Each code can only be used once. Generate new codes if you run out.
                                </p>
                            </div>
                        )}
                    </div>

                    <hr className="my-6" />

                    <form onSubmit={submit}>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Step 3: Verify</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter the 6-digit code from your authenticator app to complete setup.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-center text-xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                autoComplete="one-time-code"
                                required
                            />
                            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 6}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Verifying...' : 'Enable 2FA'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
