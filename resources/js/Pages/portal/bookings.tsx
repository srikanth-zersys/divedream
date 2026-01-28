import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Waves,
} from 'lucide-react';
import { Booking, Pagination } from '@/types/dive-club';

interface Props {
  bookings: Pagination<Booking>;
  filters: {
    search?: string;
    status?: string;
    period?: string;
  };
}

const PortalBookings: React.FC<Props> = ({ bookings, filters }) => {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/portal/bookings', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/portal/bookings', { ...filters, [key]: value }, { preserveState: true });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      confirmed: {
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Confirmed',
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Pending',
      },
      cancelled: {
        bg: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Cancelled',
      },
      completed: {
        bg: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed',
      },
    };
    return configs[status] || configs.pending;
  };

  return (
    <>
      <Head title="My Bookings" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/portal" className="flex items-center gap-2">
                  <Waves className="w-8 h-8 text-blue-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                  <p className="text-gray-500">View and manage your dive bookings</p>
                </div>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book New Dive
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </form>
              <div className="flex items-center gap-2">
                <select
                  value={filters.period || ''}
                  onChange={(e) => handleFilter('period', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Time</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="this_month">This Month</option>
                  <option value="this_year">This Year</option>
                </select>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilter('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {bookings.data.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500 mb-4">
                {filters.status || filters.period
                  ? "No bookings match your filters"
                  : "You haven't made any bookings yet"}
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Your First Dive
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.data.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const isUpcoming = new Date(booking.booking_date) >= new Date();

                return (
                  <Link
                    key={booking.id}
                    href={`/portal/booking/${booking.id}`}
                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className={`rounded-lg p-2 ${isUpcoming ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <div className={`text-xs font-medium ${isUpcoming ? 'text-blue-600' : 'text-gray-600'}`}>
                            {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className={`text-2xl font-bold ${isUpcoming ? 'text-blue-700' : 'text-gray-700'}`}>
                            {new Date(booking.booking_date).getDate()}
                          </div>
                          <div className={`text-xs ${isUpcoming ? 'text-blue-600' : 'text-gray-600'}`}>
                            {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {booking.product?.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Booking #{booking.booking_number}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {booking.schedule && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(booking.schedule.start_time)}
                            </span>
                          )}
                          {booking.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.location.name}
                            </span>
                          )}
                          <span className="font-medium text-gray-900">
                            {booking.participant_count} {booking.participant_count === 1 ? 'participant' : 'participants'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(booking.total_amount)}
                          </span>
                        </div>

                        {/* Action Required Tags */}
                        {isUpcoming && (
                          <div className="mt-3 flex items-center gap-2">
                            {!booking.waiver_signed && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Waiver Required
                              </span>
                            )}
                            {booking.payment_status !== 'paid' && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Payment Due
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {bookings.last_page > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {bookings.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.url || '#'}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : link.url
                      ? 'hover:bg-gray-100'
                      : 'text-gray-300'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default PortalBookings;
