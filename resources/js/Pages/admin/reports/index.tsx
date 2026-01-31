import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface Props {
  period: string;
  stats: {
    revenue: {
      total: number;
      change: number;
      trend: 'up' | 'down';
    };
    bookings: {
      total: number;
      change: number;
      trend: 'up' | 'down';
    };
    customers: {
      total: number;
      newThisPeriod: number;
    };
    avgBookingValue: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
    bookings: number;
  }[];
  topProducts: {
    id: number;
    name: string;
    bookings: number;
    revenue: number;
  }[];
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    time: string;
  }[];
}

const ReportsIndex: React.FC<Props> = ({
  period,
  stats,
  revenueByMonth,
  topProducts,
  bookingsByStatus,
  recentActivity,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-500',
      pending: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const totalBookings = bookingsByStatus.reduce((acc, b) => acc + b.count, 0);

  return (
    <>
      <Head title="Reports & Analytics" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your dive center's performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className={`inline-flex items-center gap-1 text-sm font-medium ${stats.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenue.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.revenue.change)}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.revenue.total)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`inline-flex items-center gap-1 text-sm font-medium ${stats.bookings.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.bookings.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.bookings.change)}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.bookings.total)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                +{stats.customers.newThisPeriod} new
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.customers.total)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Customers</div>
            </div>
          </div>

          {/* Avg Booking Value */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.avgBookingValue)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Booking Value</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
            </div>
            <div className="p-6">
              {/* Simple Bar Chart Representation */}
              <div className="space-y-4">
                {revenueByMonth.map((item) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-500 dark:text-gray-400">{item.month}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-lg"
                          style={{ width: `${(item.revenue / Math.max(...revenueByMonth.map(r => r.revenue))) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bookings by Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {bookingsByStatus.map((item) => (
                  <div key={item.status} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {item.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.count} ({Math.round((item.count / totalBookings) * 100)}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStatusColor(item.status)} rounded-full`}
                          style={{ width: `${(item.count / totalBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
              <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.map((product, index) => (
                <div key={product.id} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.bookings} bookings
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 dark:text-white">{activity.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Reports</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
            <Link href="/admin/reports/revenue" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Revenue Report</div>
                  <div className="text-sm text-gray-500">Detailed revenue breakdown</div>
                </div>
              </div>
            </Link>
            <Link href="/admin/reports/bookings" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Bookings Report</div>
                  <div className="text-sm text-gray-500">Booking trends & analysis</div>
                </div>
              </div>
            </Link>
            <Link href="/admin/reports/members" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Members Report</div>
                  <div className="text-sm text-gray-500">Customer insights</div>
                </div>
              </div>
            </Link>
            <Link href="/admin/reports/equipment" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Equipment Report</div>
                  <div className="text-sm text-gray-500">Utilization & maintenance</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

ReportsIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ReportsIndex;
