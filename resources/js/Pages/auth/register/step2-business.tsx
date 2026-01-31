import { useForm, Head, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const businessTypes = [
    { value: 'dive_shop', label: 'Dive Shop' },
    { value: 'dive_center', label: 'Dive Center' },
    { value: 'dive_resort', label: 'Dive Resort' },
    { value: 'dive_school', label: 'Dive School / Training Facility' },
    { value: 'other', label: 'Other' },
];

const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'THB', label: 'THB - Thai Baht' },
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
    { value: 'MXN', label: 'MXN - Mexican Peso' },
];

const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris / Central Europe' },
    { value: 'Asia/Bangkok', label: 'Bangkok / Indochina' },
    { value: 'Asia/Singapore', label: 'Singapore / Malaysia' },
    { value: 'Asia/Jakarta', label: 'Jakarta / Indonesia' },
    { value: 'Asia/Manila', label: 'Manila / Philippines' },
    { value: 'Australia/Sydney', label: 'Sydney / Australia' },
    { value: 'Pacific/Honolulu', label: 'Hawaii' },
];

export default function Step2Business() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        business_type: 'dive_center',
        country: '',
        city: '',
        timezone: 'America/New_York',
        currency: 'USD',
        website: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.step2.process'));
    };

    return (
        <>
            <Head title="Business Details - Step 2" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Tell us about your business
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Step 2 of 3 - Business Details
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">✓</div>
                        <div className="w-16 h-1 bg-blue-600"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">2</div>
                        <div className="w-16 h-1 bg-gray-300"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">3</div>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                                    Business name
                                </label>
                                <input
                                    id="business_name"
                                    type="text"
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="e.g., Blue Water Dive Center"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                                    Business type
                                </label>
                                <select
                                    id="business_type"
                                    value={data.business_type}
                                    onChange={(e) => setData('business_type', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    {businessTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="e.g., Thailand"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="e.g., Phuket"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                        Timezone
                                    </label>
                                    <select
                                        id="timezone"
                                        value={data.timezone}
                                        onChange={(e) => setData('timezone', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {timezones.map((tz) => (
                                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                        Currency
                                    </label>
                                    <select
                                        id="currency"
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {currencies.map((curr) => (
                                            <option key={curr.value} value={curr.value}>{curr.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                    Website <span className="text-gray-400">(optional)</span>
                                </label>
                                <input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://www.yourdiveshop.com"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('register.step1')}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Back
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Please wait...' : 'Continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
