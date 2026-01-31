import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  Save,
  Info,
} from 'lucide-react';
import { Tenant } from '@/types/dive-club';

interface Props {
  settings: {
    booking_lead_time_hours: number;
    max_advance_booking_days: number;
    cancellation_policy: string;
    cancellation_hours: number;
    refund_percentage: number;
    require_deposit: boolean;
    deposit_percentage: number;
    deposit_type: 'percentage' | 'fixed';
    deposit_amount: number;
    require_waiver: boolean;
    waiver_reminder_hours: number;
    auto_confirm_bookings: boolean;
    overbooking_allowed: boolean;
    waitlist_enabled: boolean;
    min_participants: number;
    default_participant_limit: number;
  };
}

const BookingSettings: React.FC<Props> = ({ settings }) => {
  const { data, setData, put, processing, errors } = useForm({
    booking_lead_time_hours: settings.booking_lead_time_hours || 24,
    max_advance_booking_days: settings.max_advance_booking_days || 90,
    cancellation_policy: settings.cancellation_policy || 'standard',
    cancellation_hours: settings.cancellation_hours || 48,
    refund_percentage: settings.refund_percentage || 100,
    require_deposit: settings.require_deposit || false,
    deposit_type: settings.deposit_type || 'percentage',
    deposit_percentage: settings.deposit_percentage || 25,
    deposit_amount: settings.deposit_amount || 50,
    require_waiver: settings.require_waiver || true,
    waiver_reminder_hours: settings.waiver_reminder_hours || 24,
    auto_confirm_bookings: settings.auto_confirm_bookings || false,
    overbooking_allowed: settings.overbooking_allowed || false,
    waitlist_enabled: settings.waitlist_enabled || true,
    min_participants: settings.min_participants || 1,
    default_participant_limit: settings.default_participant_limit || 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/admin/settings/booking');
  };

  return (
    <>
      <Head title="Booking Rules" />

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Rules</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure booking policies and requirements
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Timing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Timing</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Lead Time (hours)
                  </label>
                  <input
                    type="number"
                    value={data.booking_lead_time_hours}
                    onChange={(e) => setData('booking_lead_time_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How far in advance customers must book
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={data.max_advance_booking_days}
                    onChange={(e) => setData('max_advance_booking_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How far ahead customers can book
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Participants
                  </label>
                  <input
                    type="number"
                    value={data.min_participants}
                    onChange={(e) => setData('min_participants', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Participant Limit
                  </label>
                  <input
                    type="number"
                    value={data.default_participant_limit}
                    onChange={(e) => setData('default_participant_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cancellation Policy</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cancellation Policy Type
                </label>
                <select
                  value={data.cancellation_policy}
                  onChange={(e) => setData('cancellation_policy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="flexible">Flexible - Full refund up to 24 hours before</option>
                  <option value="standard">Standard - Full refund up to 48 hours before</option>
                  <option value="strict">Strict - 50% refund up to 7 days before</option>
                  <option value="custom">Custom - Define your own policy</option>
                </select>
              </div>

              {data.cancellation_policy === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cancellation Window (hours before)
                    </label>
                    <input
                      type="number"
                      value={data.cancellation_hours}
                      onChange={(e) => setData('cancellation_hours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Refund Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={data.refund_percentage}
                        onChange={(e) => setData('refund_percentage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deposit Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deposit Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="require_deposit"
                  checked={data.require_deposit}
                  onChange={(e) => setData('require_deposit', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="require_deposit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require deposit at booking
                </label>
              </div>

              {data.require_deposit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deposit Type
                    </label>
                    <select
                      value={data.deposit_type}
                      onChange={(e) => setData('deposit_type', e.target.value as 'percentage' | 'fixed')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="percentage">Percentage of total</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {data.deposit_type === 'percentage' ? 'Deposit Percentage' : 'Deposit Amount'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={data.deposit_type === 'percentage' ? data.deposit_percentage : data.deposit_amount}
                        onChange={(e) => {
                          if (data.deposit_type === 'percentage') {
                            setData('deposit_percentage', parseInt(e.target.value));
                          } else {
                            setData('deposit_amount', parseInt(e.target.value));
                          }
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        min="0"
                        max={data.deposit_type === 'percentage' ? 100 : undefined}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {data.deposit_type === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Waiver & Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Waivers & Documents</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="require_waiver"
                  checked={data.require_waiver}
                  onChange={(e) => setData('require_waiver', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="require_waiver" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require waiver signature before dive
                </label>
              </div>

              {data.require_waiver && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Send waiver reminder (hours before)
                  </label>
                  <input
                    type="number"
                    value={data.waiver_reminder_hours}
                    onChange={(e) => setData('waiver_reminder_hours', parseInt(e.target.value))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Auto-confirm bookings</div>
                  <div className="text-sm text-gray-500">Automatically confirm bookings without manual review</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.auto_confirm_bookings}
                    onChange={(e) => setData('auto_confirm_bookings', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Enable waitlist</div>
                  <div className="text-sm text-gray-500">Allow customers to join a waitlist when trips are full</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.waitlist_enabled}
                    onChange={(e) => setData('waitlist_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Allow overbooking</div>
                  <div className="text-sm text-gray-500 text-red-500">Allow staff to book beyond capacity limits</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.overbooking_allowed}
                    onChange={(e) => setData('overbooking_allowed', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
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

BookingSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default BookingSettings;
