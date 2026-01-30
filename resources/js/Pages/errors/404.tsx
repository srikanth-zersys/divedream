import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

interface Props {
  tenant?: {
    name: string;
    logo_url?: string;
  };
}

const NotFound: React.FC<Props> = ({ tenant }) => {
  return (
    <>
      <Head title="Page Not Found" />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={tenant?.name} className="h-8" />
            ) : (
              <span className="text-xl font-bold text-blue-600">{tenant?.name || 'DiveDream'}</span>
            )}
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Animated Illustration */}
            <div className="relative mb-8">
              <div className="text-[180px] font-bold text-blue-100 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Diver Icon */}
                  <svg
                    className="w-32 h-32 text-blue-600 animate-bounce"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="5" r="3" />
                    <path d="M12 8v4m-4 4l4-4 4 4" />
                    <path d="M8 16v4m8-4v4" />
                    <path d="M5 12h14" strokeDasharray="2 2" />
                  </svg>
                  {/* Bubbles */}
                  <div className="absolute -top-4 right-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  </div>
                  <div className="absolute -top-8 right-4">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping delay-100" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lost in the Deep Blue
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for seems to have drifted away.
              Don't worry, let's get you back to the surface!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>

            {/* Help Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Search className="w-4 h-4" />
                  Browse Experiences
                </Link>
                <Link
                  href="/booking/lookup"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                >
                  <HelpCircle className="w-4 h-4" />
                  Find Your Booking
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {tenant?.name || 'DiveDream'}. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default NotFound;
