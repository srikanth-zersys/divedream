import { Head, Link } from '@inertiajs/react';

interface Props {
    tenant: {
        name: string;
    };
    subscription: {
        plan: string;
        status: string;
        trial_days_remaining: number;
    } | null;
}

export default function Complete({ tenant, subscription }: Props) {
    return (
        <>
            <Head title="Welcome to DiveDream!" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        {/* Success icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Welcome to DiveDream!
                        </h2>

                        <p className="mt-2 text-lg text-gray-600">
                            Your account for <strong>{tenant.name}</strong> has been created.
                        </p>

                        {subscription && (
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800">
                                    You're on the <strong>{subscription.plan}</strong> plan with{' '}
                                    <strong>{subscription.trial_days_remaining} days</strong> remaining in your free trial.
                                </p>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Get started:</h3>

                            <div className="grid gap-4 text-left">
                                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                        1
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Add your products</h4>
                                        <p className="text-sm text-gray-500">Set up your dive trips, courses, and experiences</p>
                                    </div>
                                </div>

                                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                        2
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Create your schedule</h4>
                                        <p className="text-sm text-gray-500">Set up available dates and times for bookings</p>
                                    </div>
                                </div>

                                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                        3
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Start accepting bookings</h4>
                                        <p className="text-sm text-gray-500">Share your booking link with customers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link
                                href={route('admin.dashboard')}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go to Dashboard
                            </Link>
                        </div>

                        <div className="mt-4">
                            <Link
                                href={route('admin.products.create')}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Add your first product →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
