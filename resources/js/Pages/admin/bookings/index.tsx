import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Calendar,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Download,
  UserCheck,
} from 'lucide-react';
import { Booking, Product, Pagination, BookingFilters } from '@/types/dive-club';
import Dropdown from '@/components/CustomComponents/Dropdown/Dropdown';

interface Props {
  bookings: Pagination<Booking>;
  products: Pick<Product, 'id' | 'name' | 'type'>[];
  filters: BookingFilters;
}

const BookingsIndex: React.FC<Props> = ({ bookings, products, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/bookings', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/bookings', { ...filters, [key]: value }, { preserveState: true });
  };

  const clearFilters = () => {
    router.get('/admin/bookings');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      checked_in: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[status] || styles.pending;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[status] || styles.unpaid;
  };

  const hasActiveFilters = filters.status || filters.product_id || filters.date_from || filters.date_to || filters.payment_status;

  return (
    <>
      <Head title="Bookings" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bookings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage all your dive bookings and reservations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Calendar View
            </Link>
            <Link
              href="/admin/bookings/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Link>
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
                  placeholder="Search by booking number, member name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

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
                  {[filters.status, filters.product_id, filters.date_from, filters.payment_status].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                {/* Product */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <select
                    value={filters.product_id || ''}
                    onChange={(e) => handleFilter('product_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Products</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilter('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilter('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment
                  </label>
                  <select
                    value={filters.payment_status || ''}
                    onChange={(e) => handleFilter('payment_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
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

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No bookings found
                      </p>
                      <Link
                        href="/admin/bookings/create"
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create your first booking
                      </Link>
                    </td>
                  </tr>
                ) : (
                  bookings.data.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {booking.booking_number}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {booking.source}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {booking.member ? (
                          <Link
                            href={`/admin/members/${booking.member.id}`}
                            className="text-gray-900 dark:text-white hover:text-blue-600"
                          >
                            {booking.member.first_name} {booking.member.last_name}
                          </Link>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Walk-in
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white">
                          {booking.product?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900 dark:text-white">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        {booking.schedule && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.schedule.start_time}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 dark:text-white">
                          {booking.participant_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(booking.total_amount)}
                        </div>
                        {booking.amount_paid > 0 && booking.amount_paid < booking.total_amount && (
                          <div className="text-xs text-green-600">
                            {formatCurrency(booking.amount_paid)} paid
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        {!booking.waiver_signed && (
                          <span className="ml-1 inline-flex items-center" title="Waiver not signed">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(booking.payment_status)}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/bookings/${booking.id}/edit`}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => router.post(`/admin/bookings/${booking.id}/check-in`)}
                              className="p-1 text-green-500 hover:text-green-600"
                              title="Check In"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {bookings.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {bookings.from} to {bookings.to} of {bookings.total} results
              </div>
              <div className="flex items-center gap-2">
                {bookings.links.map((link, index) => {
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

BookingsIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default BookingsIndex;
