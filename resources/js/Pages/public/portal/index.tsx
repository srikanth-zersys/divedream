import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  product_name: string;
  booking_date: string;
  booking_time: string;
  location_name: string;
  status: string;
  payment_status: string;
  waiver_completed: boolean;
  access_token: string;
}

interface Props {
  bookings: Booking[];
  member: {
    first_name: string;
    last_name: string;
    email: string;
  };
  tenant: {
    name: string;
    logo_url?: string;
  };
}

const PortalIndex: React.FC<Props> = ({ bookings, member, tenant }) => {
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.booking_date) < new Date() || b.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <Link
      href={`/booking/${booking.access_token}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.product_name}</h3>
          <p className="text-sm text-gray-500">#{booking.booking_number}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(booking.booking_date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {booking.booking_time}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {booking.location_name}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs">
          {booking.waiver_completed ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          <span className={booking.waiver_completed ? 'text-green-600' : 'text-amber-600'}>
            {booking.waiver_completed ? 'Waiver signed' : 'Waiver needed'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{booking.payment_status}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
      </div>
    </Link>
  );

  return (
    <>
      <Head title="My Bookings" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8" />
              ) : (
                <span className="text-xl font-bold text-blue-600">{tenant.name}</span>
              )}
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {member.first_name}!
              </h1>
              <p className="text-gray-600">{member.email}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Upcoming Bookings */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Bookings
            </h2>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-500 mb-4">Ready for your next adventure?</p>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Browse Activities
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Past Bookings
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default PortalIndex;
