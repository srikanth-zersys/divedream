import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Search, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  tenant: {
    name: string;
    logo_url?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const BookingLookup: React.FC<Props> = ({ tenant, flash }) => {
  const [submitted, setSubmitted] = useState(false);

  const { data, setData, post, processing, errors2, reset } = useForm({
    email: '',
    booking_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/booking/lookup', {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(false),
    });
  };

  return (
    <>
      <Head title="Find Your Booking" />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {/* Header */}
        <header className="py-6 px-4">
          <div className="max-w-md mx-auto text-center">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-12 mx-auto" />
            ) : (
              <h1 className="text-2xl font-bold text-blue-600">{tenant.name}</h1>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {submitted && flash?.success ? (
              /* Success State */
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a link to <strong>{data.email}</strong> with access to your booking(s).
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  The link will arrive within a few minutes. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    reset();
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Look up another booking
                </button>
              </div>
            ) : (
              /* Lookup Form */
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Find Your Booking
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Enter your email to receive a link to manage your booking
                  </p>
                </div>

                {flash?.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {flash.error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Number
                    </label>
                    <input
                      type="text"
                      id="booking_number"
                      value={data.booking_number}
                      onChange={(e) => setData('booking_number', e.target.value.toUpperCase())}
                      placeholder="e.g., BK-ABC123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Find this in your confirmation email
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={processing || !data.email}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        Send Access Link
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  We'll send you a secure link to view and manage your booking.
                  No password needed.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default BookingLookup;
