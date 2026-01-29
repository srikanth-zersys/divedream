import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Percent,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Banknote,
  Wallet,
} from 'lucide-react';

interface Props {
  settings: {
    stripe_connected: boolean;
    stripe_account_id?: string;
    accept_cash: boolean;
    accept_card: boolean;
    accept_bank_transfer: boolean;
    deposit_enabled: boolean;
    deposit_type: 'percentage' | 'fixed';
    deposit_amount: number;
    deposit_percentage: number;
    auto_capture: boolean;
    refund_policy_days: number;
    tax_enabled: boolean;
    tax_rate: number;
    tax_inclusive: boolean;
  };
  currencies: { code: string; name: string; symbol: string }[];
  currentCurrency: string;
}

const PaymentsSettings: React.FC<Props> = ({ settings, currencies, currentCurrency }) => {
  const { data, setData, put, processing, errors } = useForm({
    accept_cash: settings.accept_cash ?? true,
    accept_card: settings.accept_card ?? true,
    accept_bank_transfer: settings.accept_bank_transfer ?? false,
    deposit_enabled: settings.deposit_enabled ?? false,
    deposit_type: settings.deposit_type ?? 'percentage',
    deposit_amount: settings.deposit_amount ?? 50,
    deposit_percentage: settings.deposit_percentage ?? 25,
    auto_capture: settings.auto_capture ?? true,
    refund_policy_days: settings.refund_policy_days ?? 7,
    tax_enabled: settings.tax_enabled ?? false,
    tax_rate: settings.tax_rate ?? 0,
    tax_inclusive: settings.tax_inclusive ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/admin/settings/payments');
  };

  const currencySymbol = currencies.find(c => c.code === currentCurrency)?.symbol || '$';

  return (
    <>
      <Head title="Payment Settings" />

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure payment methods, deposits, and tax settings
            </p>
          </div>
        </div>

        {/* Stripe Connection Status */}
        <div className={`p-4 rounded-xl border ${settings.stripe_connected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.stripe_connected ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {settings.stripe_connected ? 'Stripe Connected' : 'Stripe Not Connected'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.stripe_connected
                    ? `Account ID: ${settings.stripe_account_id}`
                    : 'Connect your Stripe account to accept online payments'}
                </div>
              </div>
            </div>
            <Link
              href="/admin/settings/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
              {settings.stripe_connected ? 'Manage' : 'Connect'}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Credit/Debit Cards</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, Amex via Stripe</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.accept_card}
                    onChange={(e) => setData('accept_card', e.target.checked)}
                    disabled={!settings.stripe_connected}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Banknote className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Cash</div>
                    <div className="text-sm text-gray-500">Accept cash payments in person</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.accept_cash}
                    onChange={(e) => setData('accept_cash', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Accept direct bank transfers</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.accept_bank_transfer}
                    onChange={(e) => setData('accept_bank_transfer', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Deposit Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deposit Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Require Deposit</div>
                  <div className="text-sm text-gray-500">Collect partial payment at booking time</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.deposit_enabled}
                    onChange={(e) => setData('deposit_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {data.deposit_enabled && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deposit Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={data.deposit_type === 'percentage'}
                          onChange={() => setData('deposit_type', 'percentage')}
                          className="text-blue-600"
                        />
                        <span>Percentage</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={data.deposit_type === 'fixed'}
                          onChange={() => setData('deposit_type', 'fixed')}
                          className="text-blue-600"
                        />
                        <span>Fixed Amount</span>
                      </label>
                    </div>
                  </div>

                  {data.deposit_type === 'percentage' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deposit Percentage
                      </label>
                      <div className="relative w-32">
                        <input
                          type="number"
                          value={data.deposit_percentage}
                          onChange={(e) => setData('deposit_percentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          min="1"
                          max="100"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deposit Amount
                      </label>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <input
                          type="number"
                          value={data.deposit_amount}
                          onChange={(e) => setData('deposit_amount', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Percent className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Enable Tax</div>
                  <div className="text-sm text-gray-500">Add tax to bookings</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.tax_enabled}
                    onChange={(e) => setData('tax_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {data.tax_enabled && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tax Rate
                    </label>
                    <div className="relative w-32">
                      <input
                        type="number"
                        value={data.tax_rate}
                        onChange={(e) => setData('tax_rate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="tax_inclusive"
                      checked={data.tax_inclusive}
                      onChange={(e) => setData('tax_inclusive', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <label htmlFor="tax_inclusive" className="text-sm text-gray-700 dark:text-gray-300">
                      Prices include tax (tax-inclusive pricing)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refund Policy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Refund Policy</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full refund if cancelled within
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={data.refund_policy_days}
                    onChange={(e) => setData('refund_policy_days', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="0"
                  />
                  <span className="text-gray-600 dark:text-gray-400">days before the booking</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Set to 0 for no automatic refunds. You can always issue manual refunds.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
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

PaymentsSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default PaymentsSettings;
