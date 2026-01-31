import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  CreditCard,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Calendar,
  Users,
  MapPin,
  FileText,
  ExternalLink,
  Loader2,
  Star,
} from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  max_locations: number | null;
  max_users: number | null;
  max_bookings_per_month: number | null;
  features: string[];
  has_api_access: boolean;
  has_white_label: boolean;
  has_priority_support: boolean;
}

interface Subscription {
  id: number;
  status: string;
  billing_cycle: string;
  trial_ends_at: string | null;
  current_period_end: string;
  canceled_at: string | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  pdf_url: string | null;
}

interface Props {
  tenant: {
    id: number;
    name: string;
    stripe_customer_id: string | null;
  };
  subscription: Subscription | null;
  plan: Plan | null;
  plans: Plan[];
  invoices: Invoice[];
  usage: {
    bookings_used: number;
    bookings_limit: number | null;
    locations_used: number;
    locations_limit: number | null;
    users_used: number;
    users_limit: number | null;
  };
  stripeKey: string;
}

const Billing: React.FC<Props> = ({
  tenant,
  subscription,
  plan,
  plans,
  invoices,
  usage,
  stripeKey,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [changingPlan, setChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (limit === null) return 0;
    return Math.min(100, (used / limit) * 100);
  };

  const handleChangePlan = async (planId: number) => {
    setSelectedPlan(planId);
    setChangingPlan(true);

    router.post('/admin/settings/billing/change-plan', {
      plan_id: planId,
      billing_cycle: billingCycle,
    }, {
      onFinish: () => {
        setChangingPlan(false);
        setSelectedPlan(null);
      },
    });
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      router.post('/admin/settings/billing/cancel');
    }
  };

  const handleResumeSubscription = () => {
    router.post('/admin/settings/billing/resume');
  };

  const handleManageBilling = async () => {
    // Redirect to Stripe billing portal
    window.location.href = '/admin/settings/billing/portal';
  };

  return (
    <Layout>
      <Head title="Billing & Subscription" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Billing & Subscription
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your subscription plan and billing information
            </p>
          </div>
          {tenant.stripe_customer_id && (
            <button
              onClick={handleManageBilling}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Payment Methods
            </button>
          )}
        </div>

        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan
              </h2>
              {subscription && plan ? (
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription.status)}`}>
                      {subscription.status === 'trialing' ? 'Trial' : subscription.status}
                    </span>
                    {subscription.canceled_at && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        Cancels {formatDate(subscription.current_period_end)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {formatCurrency(subscription.billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price)}/{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                  </p>
                  {subscription.trial_ends_at && new Date(subscription.trial_ends_at) > new Date() && (
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                      Trial ends {formatDate(subscription.trial_ends_at)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    No Active Plan
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Choose a plan below to get started
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {subscription?.canceled_at ? (
                <button
                  onClick={handleResumeSubscription}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Resume Subscription
                </button>
              ) : subscription ? (
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Cancel Subscription
                </button>
              ) : null}
            </div>
          </div>

          {/* Usage Stats */}
          {plan && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Usage This Month
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bookings */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bookings
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.bookings_used}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {usage.bookings_limit ?? '∞'}
                    </span>
                  </div>
                  {usage.bookings_limit && (
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          getUsagePercentage(usage.bookings_used, usage.bookings_limit) > 90
                            ? 'bg-red-500'
                            : getUsagePercentage(usage.bookings_used, usage.bookings_limit) > 75
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${getUsagePercentage(usage.bookings_used, usage.bookings_limit)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Locations */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Locations
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.locations_used}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {usage.locations_limit ?? '∞'}
                    </span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Team Members
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.users_used}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {usage.users_limit ?? '∞'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Plans
            </h2>
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Yearly
                <span className="ml-1 text-green-600 dark:text-green-400">(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrentPlan = plan?.id === p.id;
              const price = billingCycle === 'yearly' ? p.yearly_price : p.monthly_price;

              return (
                <div
                  key={p.id}
                  className={`relative p-6 rounded-xl border-2 transition-colors ${
                    isCurrentPlan
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {p.slug === 'professional' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {p.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {p.max_bookings_per_month ? `${p.max_bookings_per_month} bookings/month` : 'Unlimited bookings'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {p.max_locations ? `${p.max_locations} location${p.max_locations > 1 ? 's' : ''}` : 'Unlimited locations'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {p.max_users ? `${p.max_users} team members` : 'Unlimited team members'}
                    </li>
                    {p.features?.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChangePlan(p.id)}
                        disabled={changingPlan}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {changingPlan && selectedPlan === p.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Changing...
                          </>
                        ) : plan ? (
                          <>
                            <ArrowUpCircle className="w-4 h-4" />
                            {price > (billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price) ? 'Upgrade' : 'Switch'}
                          </>
                        ) : (
                          'Get Started'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Billing History
          </h2>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Invoice</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : invoice.status === 'open'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {invoice.pdf_url && (
                          <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No invoices yet
              </p>
            </div>
          )}
        </div>

        {/* Payment Methods Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Secure Payment Processing
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All payments are securely processed through Stripe. Your payment information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Billing;
