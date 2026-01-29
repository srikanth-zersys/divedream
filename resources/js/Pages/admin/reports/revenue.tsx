import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, DollarSign, CreditCard, Banknote, Download } from 'lucide-react';

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  booking: {
    booking_number: string;
    product: {
      name: string;
    };
  };
}

interface PaymentMethod {
  payment_method: string;
  total: number;
  count: number;
}

interface Props {
  payments: {
    data: Payment[];
    links: any;
    current_page: number;
    last_page: number;
  };
  summary: {
    total: number;
    count: number;
    byMethod: PaymentMethod[];
  };
  period: string;
  filters: { period?: string };
}

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
];

const RevenueReport: React.FC<Props> = ({ payments, summary, period, filters }) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/reports/revenue', { period: newPeriod }, { preserveState: true });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
      case 'stripe':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <Head title="Revenue Report" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/reports"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue Report</h1>
              <p className="text-gray-600">Detailed breakdown of all payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.total)}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
                <p className="text-sm text-gray-500">Total Payments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.count > 0 ? summary.total / summary.count : 0)}
                </p>
                <p className="text-sm text-gray-500">Avg Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Payment Method</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.byMethod.map((method) => (
              <div
                key={method.payment_method}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  {getMethodIcon(method.payment_method)}
                  <span className="font-medium capitalize">
                    {method.payment_method || 'Unknown'}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(method.total)}
                </p>
                <p className="text-sm text-gray-500">{method.count} payments</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.data.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/bookings/${payment.booking?.booking_number}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        #{payment.booking?.booking_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.booking?.product?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {getMethodIcon(payment.payment_method)}
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {payments.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {payments.current_page} of {payments.last_page}
              </p>
              <div className="flex gap-2">
                {payments.current_page > 1 && (
                  <Link
                    href={`/admin/reports/revenue?period=${period}&page=${payments.current_page - 1}`}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {payments.current_page < payments.last_page && (
                  <Link
                    href={`/admin/reports/revenue?period=${period}&page=${payments.current_page + 1}`}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RevenueReport;
