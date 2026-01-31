import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import mainlogo from '../../../../images/main-logo.png';
import whiteLogo from '../../../../images/logo-white.png';

interface Props {
  status?: string;
}

export default function VerifyEmail({ status }: Props) {
  const { post, processing } = useForm({});

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <>
      <Head title="Verify Email" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/">
              <img src={mainlogo} alt="Logo" className="h-12 dark:hidden" />
              <img src={whiteLogo} alt="Logo" className="h-12 hidden dark:inline-block" />
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Thanks for signing up! Before getting started, could you verify your email address by
            clicking on the link we just emailed to you?
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Email icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Status message */}
            {status === 'verification-link-sent' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    A new verification link has been sent to your email address.
                  </p>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              If you didn't receive the email, click the button below to request another one.
            </p>

            <form onSubmit={submit}>
              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Log Out
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
