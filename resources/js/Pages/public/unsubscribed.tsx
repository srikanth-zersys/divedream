import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { MailX, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  email: string;
  tenant: {
    name: string;
    logo_url?: string;
  };
  resubscribeUrl?: string;
}

const Unsubscribed: React.FC<Props> = ({ email, tenant, resubscribeUrl }) => {
  return (
    <>
      <Head title="Unsubscribed" />

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-12" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">{tenant.name}</span>
            )}
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You've been unsubscribed
            </h1>
            <p className="text-gray-600 mb-6">
              <span className="font-medium text-gray-900">{email}</span> has been removed from our mailing list.
            </p>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <MailX className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">What this means:</p>
                  <ul className="space-y-1">
                    <li>You won't receive marketing emails from us</li>
                    <li>You'll still receive booking confirmations</li>
                    <li>You'll still receive important account updates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {resubscribeUrl && (
                <a
                  href={resubscribeUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Changed your mind? Resubscribe
                </a>
              )}
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Homepage
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Unsubscribed;
