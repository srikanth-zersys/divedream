import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Home, RefreshCw, AlertTriangle, Mail } from 'lucide-react';

interface Props {
  tenant?: {
    name: string;
    logo_url?: string;
    email?: string;
  };
}

const ServerError: React.FC<Props> = ({ tenant }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Head title="Something Went Wrong" />

      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
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
            {/* Error Icon */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">500</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something Went Wrong
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              We're experiencing some technical difficulties. Our team has been notified and is working to fix the issue.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              This might be a temporary glitch. Please try refreshing the page or come back in a few minutes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">Need immediate assistance?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If this problem persists, please contact our support team. We apologize for any inconvenience.
              </p>
              {tenant?.email && (
                <a
                  href={`mailto:${tenant.email}?subject=Website Error Report`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  {tenant.email}
                </a>
              )}
            </div>

            {/* Error Reference */}
            <p className="mt-8 text-xs text-gray-400">
              Error Reference: {new Date().toISOString().slice(0, 19).replace('T', '-')}
            </p>
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

export default ServerError;
