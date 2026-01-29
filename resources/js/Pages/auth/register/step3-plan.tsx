import { useForm, Head, Link } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    yearly_savings: number;
    yearly_savings_percent: number;
    features: string[];
    max_locations: number | null;
    max_users: number | null;
    max_bookings_per_month: number | null;
    has_api_access: boolean;
    has_priority_support: boolean;
}

interface Props {
    plans: Plan[];
}

export default function Step3Plan({ plans }: Props) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const { data, setData, post, processing, errors } = useForm({
        plan_id: plans[1]?.id || plans[0]?.id, // Default to Professional or first plan
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
        start_trial: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.step3.process'));
    };

    const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
        setBillingCycle(cycle);
        setData('billing_cycle', cycle);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <Head title="Choose Your Plan - Step 3" />

            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Choose your plan
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Step 3 of 3 - Start with a 14-day free trial
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">✓</div>
                        <div className="w-16 h-1 bg-green-600"></div>
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">✓</div>
                        <div className="w-16 h-1 bg-blue-600"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">3</div>
                    </div>

                    {/* Billing toggle */}
                    <div className="mt-8 flex justify-center">
                        <div className="relative bg-gray-100 p-1 rounded-lg inline-flex">
                            <button
                                type="button"
                                onClick={() => handleBillingCycleChange('monthly')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    billingCycle === 'monthly'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-500'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBillingCycleChange('yearly')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    billingCycle === 'yearly'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-500'
                                }`}
                            >
                                Yearly
                                <span className="ml-1 text-green-600 text-xs">Save up to 20%</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        {/* Plans grid */}
                        <div className="mt-8 grid gap-6 lg:grid-cols-3">
                            {plans.map((plan) => {
                                const isSelected = data.plan_id === plan.id;
                                const price = billingCycle === 'yearly' ? plan.yearly_price / 12 : plan.monthly_price;

                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => setData('plan_id', plan.id)}
                                        className={`relative bg-white rounded-lg shadow-sm cursor-pointer transition-all ${
                                            isSelected
                                                ? 'ring-2 ring-blue-600 shadow-lg'
                                                : 'hover:shadow-md border border-gray-200'
                                        }`}
                                    >
                                        {plan.slug === 'professional' && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <span className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                                            <div className="mt-4">
                                                <span className="text-4xl font-extrabold text-gray-900">
                                                    {formatPrice(price)}
                                                </span>
                                                <span className="text-gray-500">/month</span>
                                                {billingCycle === 'yearly' && plan.yearly_savings > 0 && (
                                                    <p className="mt-1 text-sm text-green-600">
                                                        Save {formatPrice(plan.yearly_savings)}/year
                                                    </p>
                                                )}
                                            </div>

                                            <ul className="mt-6 space-y-3">
                                                {plan.features?.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="ml-2 text-sm text-gray-600">{feature}</span>
                                                    </li>
                                                ))}
                                                <li className="flex items-start">
                                                    <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {plan.max_locations === null ? 'Unlimited locations' : `Up to ${plan.max_locations} location${plan.max_locations > 1 ? 's' : ''}`}
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {plan.max_users === null ? 'Unlimited users' : `Up to ${plan.max_users} users`}
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {plan.max_bookings_per_month === null ? 'Unlimited bookings' : `${plan.max_bookings_per_month} bookings/month`}
                                                    </span>
                                                </li>
                                            </ul>

                                            <div className="mt-6">
                                                <div
                                                    className={`w-full py-2 px-4 border rounded-md text-center text-sm font-medium ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-700 border-gray-300'
                                                    }`}
                                                >
                                                    {isSelected ? 'Selected' : 'Select Plan'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Trial notice */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <p className="text-blue-800">
                                <strong>14-day free trial</strong> - No credit card required. Cancel anytime.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-center space-x-4">
                            <Link
                                href={route('register.step2')}
                                className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {processing ? 'Creating your account...' : 'Start Free Trial'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
