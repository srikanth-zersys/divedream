import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Search, Mail, Hash, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  tenant: {
    name: string;
    logo_url?: string;
  };
}

const BookingLookup: React.FC<Props> = ({ tenant }) => {
  const [lookupType, setLookupType] = useState<'email' | 'booking_number'>('email');

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    booking_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/portal/lookup');
  };

  return (
    <>
      <Head title="Find Your Booking" />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-center">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10" />
          ) : (
            <h1 className="text-2xl font-bold text-blue-600">{tenant.name}</h1>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Find Your Booking
              </h2>
              <p className="text-gray-600 mt-2">
                Enter your email or booking number to view your reservation
              </p>
            </div>

            {/* Lookup Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setLookupType('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  lookupType === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLookupType('booking_number')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  lookupType === 'booking_number'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Hash className="w-4 h-4" />
                Booking #
              </button>
            </div>

            {/* Lookup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {lookupType === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Enter the email used for booking"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Number
                  </label>
                  <input
                    type="text"
                    value={data.booking_number}
                    onChange={(e) => setData('booking_number', e.target.value.toUpperCase())}
                    placeholder="e.g., BK-ABC123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    required
                  />
                  {errors.booking_number && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.booking_number}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Booking
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              A magic link will be sent to your email for secure access
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default BookingLookup;
