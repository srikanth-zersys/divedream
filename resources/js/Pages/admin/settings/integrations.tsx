import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Plug,
  CreditCard,
  Mail,
  MessageSquare,
  Calendar,
  BarChart3,
  Check,
  X,
  ExternalLink,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'payment' | 'email' | 'sms' | 'calendar' | 'analytics';
  connected: boolean;
  configurable: boolean;
}

interface Props {
  integrations: {
    stripe: { connected: boolean; account_id?: string };
    mailgun: { connected: boolean };
    twilio: { connected: boolean };
    google_calendar: { connected: boolean };
    google_analytics: { connected: boolean; tracking_id?: string };
  };
}

const IntegrationsSettings: React.FC<Props> = ({ integrations }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const integrationsList: Integration[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept credit card payments securely',
      icon: <CreditCard className="w-6 h-6" />,
      category: 'payment',
      connected: integrations.stripe?.connected || false,
      configurable: true,
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      description: 'Transactional email delivery',
      icon: <Mail className="w-6 h-6" />,
      category: 'email',
      connected: integrations.mailgun?.connected || false,
      configurable: true,
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS notifications and reminders',
      icon: <MessageSquare className="w-6 h-6" />,
      category: 'sms',
      connected: integrations.twilio?.connected || false,
      configurable: true,
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync schedules with Google Calendar',
      icon: <Calendar className="w-6 h-6" />,
      category: 'calendar',
      connected: integrations.google_calendar?.connected || false,
      configurable: true,
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Track website and booking analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      category: 'analytics',
      connected: integrations.google_analytics?.connected || false,
      configurable: true,
    },
  ];

  const categories = [
    { id: 'payment', name: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" /> },
    { id: 'sms', name: 'SMS', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const getStatusBadge = (connected: boolean) => {
    if (connected) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
          <Check className="w-3 h-3" />
          Connected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
        <X className="w-3 h-3" />
        Not Connected
      </span>
    );
  };

  return (
    <>
      <Head title="Integrations" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Connect third-party services to enhance your dive center operations
          </p>
        </div>

        {/* Integration Categories */}
        {categories.map((category) => {
          const categoryIntegrations = integrationsList.filter(
            (i) => i.category === category.id
          );

          if (categoryIntegrations.length === 0) return null;

          return (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {category.icon}
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {categoryIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        integration.connected
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {integration.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(integration.connected)}

                      {integration.configurable && (
                        <button
                          onClick={() => setActiveModal(integration.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Configure
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Coming Soon */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
          <Plug className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            More Integrations Coming Soon
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We're working on adding more integrations including Zapier, Slack, and more.
          </p>
        </div>
      </div>
    </>
  );
};

IntegrationsSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default IntegrationsSettings;
