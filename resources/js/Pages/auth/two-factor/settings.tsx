import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Layout from '@/layout/Layout';

interface Props {
    enabled: boolean;
    confirmed: boolean;
}

export default function TwoFactorSettings({ enabled, confirmed }: Props) {
    const { data, setData, delete: destroy, processing, errors } = useForm({
        password: '',
    });

    const handleDisable: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('two-factor.disable'));
    };

    return (
        <Layout>
            <Head title="Two-Factor Authentication" />

            <div className="max-w-2xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Two-Factor Authentication</h1>

                <div className="bg-white shadow rounded-lg p-6">
                    {enabled ? (
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">2FA is enabled</h2>
                                    <p className="text-sm text-gray-500">Your account is protected with two-factor authentication.</p>
                                </div>
                            </div>

                            <hr className="my-6" />

                            <form onSubmit={handleDisable}>
                                <h3 className="text-md font-medium text-gray-900 mb-2">Disable 2FA</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Enter your password to disable two-factor authentication. This will make your account less secure.
                                </p>
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                        required
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">2FA is not enabled</h2>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Two-factor authentication adds an additional layer of security to your account by requiring a code from your authenticator app in addition to your password.
                            </p>

                            <Link
                                href={route('two-factor.enable')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Enable Two-Factor Authentication
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
