import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'));
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {useRecoveryCode
                            ? 'Enter one of your recovery codes'
                            : 'Enter the code from your authenticator app'}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    {useRecoveryCode ? 'Recovery Code' : 'Authentication Code'}
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => {
                                        if (useRecoveryCode) {
                                            setData('code', e.target.value);
                                        } else {
                                            setData('code', e.target.value.replace(/\D/g, '').slice(0, 6));
                                        }
                                    }}
                                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                        useRecoveryCode ? '' : 'text-center text-2xl tracking-widest'
                                    }`}
                                    placeholder={useRecoveryCode ? 'xxxx-xxxx' : '000000'}
                                    autoComplete="one-time-code"
                                    autoFocus
                                    required
                                />
                                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseRecoveryCode(!useRecoveryCode);
                                    setData('code', '');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                {useRecoveryCode
                                    ? 'Use authenticator code instead'
                                    : 'Use a recovery code instead'}
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                href={route('login')}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                ← Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
