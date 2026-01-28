import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Settings,
  Building2,
  Palette,
  Calendar,
  Bell,
  CreditCard,
  Shield,
  Users,
  Mail,
  Globe,
  ChevronRight,
} from 'lucide-react';

interface SettingCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const SettingsIndex: React.FC = () => {
  const settingsCards: SettingCard[] = [
    {
      title: 'General',
      description: 'Business info, contact details, timezone, and currency settings',
      href: '/admin/settings/general',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Branding',
      description: 'Logo, colors, and customize your public booking pages',
      href: '/admin/settings/branding',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      title: 'Booking Rules',
      description: 'Cancellation policies, deposit requirements, and booking limits',
      href: '/admin/settings/booking',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      title: 'Notifications',
      description: 'Email templates, reminder schedules, and notification preferences',
      href: '/admin/settings/notifications',
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      title: 'Payments',
      description: 'Payment gateways, tax rates, and invoice settings',
      href: '/admin/settings/payments',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Team & Permissions',
      description: 'Manage staff accounts and access permissions',
      href: '/admin/settings/team',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      title: 'Waivers & Documents',
      description: 'Configure liability waivers and required documents',
      href: '/admin/settings/waivers',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      title: 'Email Settings',
      description: 'SMTP configuration and email sender settings',
      href: '/admin/settings/email',
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    },
    {
      title: 'Website & SEO',
      description: 'Public website settings, meta tags, and social links',
      href: '/admin/settings/website',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    },
  ];

  return (
    <>
      <Head title="Settings" />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your dive center settings and preferences
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {card.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

SettingsIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default SettingsIndex;
