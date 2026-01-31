import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Send,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRightCircle,
} from 'lucide-react';

interface Quote {
  id: number;
  quote_number: string;
  status: string;
  customer_type: string;
  company_name: string | null;
  contact_name: string;
  contact_email: string;
  title: string;
  total_amount: number;
  currency: string;
  valid_until: string;
  sent_at: string | null;
  viewed_at: string | null;
  created_at: string;
  location?: { name: string };
  created_by?: { name: string };
}

interface Statistics {
  total_quotes: number;
  draft_quotes: number;
  sent_quotes: number;
  converted_quotes: number;
  conversion_rate: number;
  total_value: number;
  converted_value: number;
  average_quote_value: number;
  period: string;
}

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  quotes: Pagination<Quote>;
  statistics: Statistics;
  filters: {
    search?: string;
    status?: string;
    customer_type?: string;
    period?: string;
  };
}

const QuotesIndex: React.FC<Props> = ({ quotes, statistics, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/quotes', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/quotes', { ...filters, [key]: value }, { preserveState: true });
  };

  const clearFilters = () => {
    router.get('/admin/quotes');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return styles[status] || styles.draft;
  };

  const getCustomerTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      individual: 'bg-gray-100 text-gray-700',
      corporate: 'bg-blue-100 text-blue-700',
      travel_agent: 'bg-purple-100 text-purple-700',
      group: 'bg-amber-100 text-amber-700',
      resort: 'bg-cyan-100 text-cyan-700',
      school: 'bg-green-100 text-green-700',
    };
    return styles[type] || styles.individual;
  };

  const hasActiveFilters = filters.status || filters.customer_type;

  return (
    <>
      <Head title="Quotes & Proposals" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quotes & Proposals
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create and manage quotes for B2B clients and group bookings
            </p>
          </div>
          <Link
            href="/admin/quotes/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Quote
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_quotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.conversion_rate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Converted Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.converted_value)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Quote Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.average_quote_value)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by quote number, contact, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Period Filter */}
            <select
              value={filters.period || 'month'}
              onChange={(e) => handleFilter('period', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">
                  {[filters.status, filters.customer_type].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>

                {/* Customer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={filters.customer_type || ''}
                    onChange={(e) => handleFilter('customer_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="corporate">Corporate</option>
                    <option value="travel_agent">Travel Agent</option>
                    <option value="group">Group</option>
                    <option value="resort">Resort</option>
                    <option value="school">School</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quotes Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quote
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {quotes.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No quotes found
                      </p>
                      <Link
                        href="/admin/quotes/create"
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create your first quote
                      </Link>
                    </td>
                  </tr>
                ) : (
                  quotes.data.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {quote.quote_number}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {quote.title}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white">
                          {quote.contact_name}
                        </div>
                        {quote.company_name && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quote.company_name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeBadge(quote.customer_type)}`}>
                          {quote.customer_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quote.total_amount, quote.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900 dark:text-white">
                          {new Date(quote.valid_until).toLocaleDateString()}
                        </div>
                        {new Date(quote.valid_until) < new Date() && quote.status !== 'expired' && quote.status !== 'converted' && (
                          <div className="text-xs text-red-500">Expired</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                        {quote.viewed_at && quote.status === 'sent' && (
                          <Eye className="w-4 h-4 text-purple-500 inline ml-1" title="Viewed by customer" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {quote.status === 'draft' && (
                            <>
                              <Link
                                href={`/admin/quotes/${quote.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => router.post(`/admin/quotes/${quote.id}/send`)}
                                className="p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Send to Customer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {quote.status === 'accepted' && (
                            <button
                              onClick={() => router.get(`/admin/quotes/${quote.id}`, { convert: true })}
                              className="p-1.5 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                              title="Convert to Booking"
                            >
                              <ArrowRightCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => router.post(`/admin/quotes/${quote.id}/duplicate`)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {quotes.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {quotes.from} to {quotes.to} of {quotes.total} results
              </div>
              <div className="flex items-center gap-2">
                {quotes.links.map((link, index) => {
                  if (link.label.includes('Previous')) {
                    return (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        className={`p-2 rounded-lg ${
                          link.url
                            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                        preserveState
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Link>
                    );
                  }
                  if (link.label.includes('Next')) {
                    return (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        className={`p-2 rounded-lg ${
                          link.url
                            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                        preserveState
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      preserveState
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

QuotesIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default QuotesIndex;
