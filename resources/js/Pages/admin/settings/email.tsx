import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Mail,
  Server,
  Lock,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Props {
  settings: {
    mail_driver: string;
    mail_host: string;
    mail_port: number;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
    mail_reply_to: string;
  };
  connectionStatus: 'connected' | 'failed' | 'unknown';
  lastTestAt?: string;
}

const EmailSettings: React.FC<Props> = ({ settings, connectionStatus, lastTestAt }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data, setData, put, processing, errors } = useForm({
    mail_driver: settings.mail_driver || 'smtp',
    mail_host: settings.mail_host || '',
    mail_port: settings.mail_port || 587,
    mail_username: settings.mail_username || '',
    mail_password: settings.mail_password || '',
    mail_encryption: settings.mail_encryption || 'tls',
    mail_from_address: settings.mail_from_address || '',
    mail_from_name: settings.mail_from_name || '',
    mail_reply_to: settings.mail_reply_to || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/admin/settings/email');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/admin/settings/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setTesting(false);
    }
  };

  const mailProviders = [
    { value: 'smtp', label: 'SMTP' },
    { value: 'mailgun', label: 'Mailgun' },
    { value: 'ses', label: 'Amazon SES' },
    { value: 'postmark', label: 'Postmark' },
    { value: 'sendgrid', label: 'SendGrid' },
  ];

  const commonPorts = [
    { value: 25, label: '25 (SMTP)' },
    { value: 465, label: '465 (SSL)' },
    { value: 587, label: '587 (TLS)' },
    { value: 2525, label: '2525 (Alternative)' },
  ];

  return (
    <>
      <Head title="Email Settings" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure your email server for sending notifications
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`p-4 rounded-xl border ${
          connectionStatus === 'connected'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : connectionStatus === 'failed'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-3">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : connectionStatus === 'failed' ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {connectionStatus === 'connected'
                  ? 'Email Connected'
                  : connectionStatus === 'failed'
                  ? 'Connection Failed'
                  : 'Connection Not Tested'}
              </div>
              {lastTestAt && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last tested: {new Date(lastTestAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-xl border ${
            testResult.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Provider */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Provider</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mail Driver
                  </label>
                  <select
                    value={data.mail_driver}
                    onChange={(e) => setData('mail_driver', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {mailProviders.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Configuration */}
          {data.mail_driver === 'smtp' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SMTP Configuration</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      value={data.mail_host}
                      onChange={(e) => setData('mail_host', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      placeholder="smtp.example.com"
                      required
                    />
                    {errors.mail_host && <p className="mt-1 text-sm text-red-600">{errors.mail_host}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Port *
                    </label>
                    <select
                      value={data.mail_port}
                      onChange={(e) => setData('mail_port', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      {commonPorts.map((port) => (
                        <option key={port.value} value={port.value}>
                          {port.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={data.mail_username}
                      onChange={(e) => setData('mail_username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={data.mail_password}
                        onChange={(e) => setData('mail_password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Encryption
                  </label>
                  <div className="flex gap-4">
                    {['tls', 'ssl', 'none'].map((enc) => (
                      <label key={enc} className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={data.mail_encryption === enc}
                          onChange={() => setData('mail_encryption', enc)}
                          className="text-blue-600"
                        />
                        <span className="capitalize">{enc === 'none' ? 'None' : enc.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sender Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sender Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Name *
                  </label>
                  <input
                    type="text"
                    value={data.mail_from_name}
                    onChange={(e) => setData('mail_from_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Your Dive Shop"
                    required
                  />
                  {errors.mail_from_name && <p className="mt-1 text-sm text-red-600">{errors.mail_from_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Email *
                  </label>
                  <input
                    type="email"
                    value={data.mail_from_address}
                    onChange={(e) => setData('mail_from_address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="noreply@yourdiveshop.com"
                    required
                  />
                  {errors.mail_from_address && <p className="mt-1 text-sm text-red-600">{errors.mail_from_address}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={data.mail_reply_to}
                  onChange={(e) => setData('mail_reply_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="support@yourdiveshop.com"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave blank to use the From Email address
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !data.mail_host}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {testing ? 'Testing...' : 'Send Test Email'}
            </button>

            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

EmailSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default EmailSettings;
