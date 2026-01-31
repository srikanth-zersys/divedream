import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Save,
  Clock,
  CalendarCheck,
  AlertTriangle,
  CreditCard,
  UserPlus,
} from 'lucide-react';

interface NotificationSetting {
  enabled: boolean;
  email: boolean;
  sms: boolean;
  timing?: string;
}

interface Props {
  settings: {
    booking_confirmation: NotificationSetting;
    booking_reminder: NotificationSetting & { hours_before: number };
    booking_cancellation: NotificationSetting;
    payment_received: NotificationSetting;
    payment_failed: NotificationSetting;
    waiver_reminder: NotificationSetting;
    new_member: NotificationSetting;
    quote_sent: NotificationSetting;
    quote_accepted: NotificationSetting;
    low_availability: NotificationSetting & { threshold: number };
  };
  smsEnabled: boolean;
}

const NotificationsSettings: React.FC<Props> = ({ settings, smsEnabled }) => {
  const { data, setData, put, processing, errors } = useForm({
    // Booking notifications
    booking_confirmation_enabled: settings.booking_confirmation?.enabled ?? true,
    booking_confirmation_email: settings.booking_confirmation?.email ?? true,
    booking_confirmation_sms: settings.booking_confirmation?.sms ?? false,

    booking_reminder_enabled: settings.booking_reminder?.enabled ?? true,
    booking_reminder_email: settings.booking_reminder?.email ?? true,
    booking_reminder_sms: settings.booking_reminder?.sms ?? false,
    booking_reminder_hours: settings.booking_reminder?.hours_before ?? 24,

    booking_cancellation_enabled: settings.booking_cancellation?.enabled ?? true,
    booking_cancellation_email: settings.booking_cancellation?.email ?? true,
    booking_cancellation_sms: settings.booking_cancellation?.sms ?? false,

    // Payment notifications
    payment_received_enabled: settings.payment_received?.enabled ?? true,
    payment_received_email: settings.payment_received?.email ?? true,

    payment_failed_enabled: settings.payment_failed?.enabled ?? true,
    payment_failed_email: settings.payment_failed?.email ?? true,

    // Waiver notifications
    waiver_reminder_enabled: settings.waiver_reminder?.enabled ?? true,
    waiver_reminder_email: settings.waiver_reminder?.email ?? true,

    // Member notifications
    new_member_enabled: settings.new_member?.enabled ?? true,
    new_member_email: settings.new_member?.email ?? true,

    // Quote notifications
    quote_sent_enabled: settings.quote_sent?.enabled ?? true,
    quote_sent_email: settings.quote_sent?.email ?? true,

    quote_accepted_enabled: settings.quote_accepted?.enabled ?? true,
    quote_accepted_email: settings.quote_accepted?.email ?? true,

    // Operational alerts
    low_availability_enabled: settings.low_availability?.enabled ?? true,
    low_availability_email: settings.low_availability?.email ?? true,
    low_availability_threshold: settings.low_availability?.threshold ?? 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/admin/settings/notifications');
  };

  const NotificationRow = ({
    icon: Icon,
    title,
    description,
    enabledKey,
    emailKey,
    smsKey,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    enabledKey: string;
    emailKey: string;
    smsKey?: string;
    children?: React.ReactNode;
  }) => (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mt-0.5">
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
            {children}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Email Toggle */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(data as any)[emailKey]}
                onChange={(e) => setData(emailKey as any, e.target.checked)}
                disabled={!(data as any)[enabledKey]}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* SMS Toggle (if available) */}
          {smsKey && smsEnabled && (
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data as any)[smsKey]}
                  onChange={(e) => setData(smsKey as any, e.target.checked)}
                  disabled={!(data as any)[enabledKey]}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
              </label>
            </div>
          )}

          {/* Master Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(data as any)[enabledKey]}
              onChange={(e) => setData(enabledKey as any, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head title="Notification Settings" />

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure email and SMS notifications for customers and staff
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Notifications</h2>
              </div>
            </div>
            <div className="p-4">
              <NotificationRow
                icon={CalendarCheck}
                title="Booking Confirmation"
                description="Sent immediately when a booking is confirmed"
                enabledKey="booking_confirmation_enabled"
                emailKey="booking_confirmation_email"
                smsKey="booking_confirmation_sms"
              />

              <NotificationRow
                icon={Clock}
                title="Booking Reminder"
                description="Sent before the scheduled activity"
                enabledKey="booking_reminder_enabled"
                emailKey="booking_reminder_email"
                smsKey="booking_reminder_sms"
              >
                {data.booking_reminder_enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Send</label>
                    <select
                      value={data.booking_reminder_hours}
                      onChange={(e) => setData('booking_reminder_hours', parseInt(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                      <option value={72}>72 hours</option>
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">before</span>
                  </div>
                )}
              </NotificationRow>

              <NotificationRow
                icon={AlertTriangle}
                title="Booking Cancellation"
                description="Sent when a booking is cancelled"
                enabledKey="booking_cancellation_enabled"
                emailKey="booking_cancellation_email"
                smsKey="booking_cancellation_sms"
              />
            </div>
          </div>

          {/* Payment Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Notifications</h2>
              </div>
            </div>
            <div className="p-4">
              <NotificationRow
                icon={CreditCard}
                title="Payment Received"
                description="Sent when payment is successfully processed"
                enabledKey="payment_received_enabled"
                emailKey="payment_received_email"
              />

              <NotificationRow
                icon={AlertTriangle}
                title="Payment Failed"
                description="Sent when a payment attempt fails"
                enabledKey="payment_failed_enabled"
                emailKey="payment_failed_email"
              />
            </div>
          </div>

          {/* Document Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Document & Quote Notifications</h2>
              </div>
            </div>
            <div className="p-4">
              <NotificationRow
                icon={Bell}
                title="Waiver Reminder"
                description="Remind customers to complete their waiver"
                enabledKey="waiver_reminder_enabled"
                emailKey="waiver_reminder_email"
              />

              <NotificationRow
                icon={Mail}
                title="Quote Sent"
                description="Confirmation when a quote is sent"
                enabledKey="quote_sent_enabled"
                emailKey="quote_sent_email"
              />

              <NotificationRow
                icon={CalendarCheck}
                title="Quote Accepted"
                description="Notification when customer accepts a quote"
                enabledKey="quote_accepted_enabled"
                emailKey="quote_accepted_email"
              />
            </div>
          </div>

          {/* Operational Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Alerts</h2>
              </div>
            </div>
            <div className="p-4">
              <NotificationRow
                icon={UserPlus}
                title="New Member Registration"
                description="Alert when a new member signs up"
                enabledKey="new_member_enabled"
                emailKey="new_member_email"
              />

              <NotificationRow
                icon={AlertTriangle}
                title="Low Availability Alert"
                description="Alert when spots are running low"
                enabledKey="low_availability_enabled"
                emailKey="low_availability_email"
              >
                {data.low_availability_enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Alert when fewer than</label>
                    <input
                      type="number"
                      value={data.low_availability_threshold}
                      onChange={(e) => setData('low_availability_threshold', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      min={1}
                      max={20}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">spots remaining</span>
                  </div>
                )}
              </NotificationRow>
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

NotificationsSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default NotificationsSettings;
