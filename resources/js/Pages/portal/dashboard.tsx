import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  User,
  Award,
  ChevronRight,
  Waves,
} from 'lucide-react';
import { Booking, Member } from '@/types/dive-club';

interface Props {
  member: Member;
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  pendingActions: {
    waivers: number;
    payments: number;
  };
}

const PortalDashboard: React.FC<Props> = ({ member, upcomingBookings, pastBookings, pendingActions }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || styles.pending;
  };

  return (
    <>
      <Head title="My Dashboard" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Waves className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {member.first_name}!</h1>
                  <p className="text-gray-500">Manage your bookings and dive experiences</p>
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
          {/* Pending Actions */}
          {(pendingActions.waivers > 0 || pendingActions.payments > 0) && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800">Action Required</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    {pendingActions.waivers > 0 && (
                      <p>You have {pendingActions.waivers} waiver(s) to sign</p>
                    )}
                    {pendingActions.payments > 0 && (
                      <p>You have {pendingActions.payments} pending payment(s)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Bookings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
                  <Link href="/portal/bookings" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {upcomingBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No upcoming bookings</p>
                    <Link href="/book" className="mt-4 inline-block text-blue-600 hover:underline">
                      Book your next dive
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 text-center">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <div className="text-xs text-blue-600 font-medium">
                                  {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                                <div className="text-xl font-bold text-blue-700">
                                  {new Date(booking.booking_date).getDate()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.product?.name}</h3>
                              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
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
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                  {booking.status}
                                </span>
                                {!booking.waiver_signed && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Waiver Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/portal/booking/${booking.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Dives</h2>
                    <Link href="/portal/bookings?filter=past" className="text-sm text-blue-600 hover:underline">
                      View History
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pastBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="font-medium text-gray-900">{booking.product?.name}</div>
                              <div className="text-sm text-gray-500">{formatDate(booking.booking_date)}</div>
                            </div>
                          </div>
                          <Link
                            href={`/portal/booking/${booking.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-2">
                  <Link
                    href="/portal/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">My Profile</div>
                      <div className="text-sm text-gray-500">Update your information</div>
                    </div>
                  </Link>
                  <Link
                    href="/portal/certifications"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Certifications</div>
                      <div className="text-sm text-gray-500">View and upload certifications</div>
                    </div>
                  </Link>
                  <Link
                    href="/portal/waivers"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Waivers</div>
                      <div className="text-sm text-gray-500">Sign required documents</div>
                    </div>
                  </Link>
                  <Link
                    href="/portal/payments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Payments</div>
                      <div className="text-sm text-gray-500">View payment history</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Member Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Member Info</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{member.email}</div>
                  </div>
                  {member.phone && (
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{member.phone}</div>
                    </div>
                  )}
                  {member.certifications && member.certifications.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Certifications</div>
                      <div className="flex flex-wrap gap-1">
                        {member.certifications.map((cert) => (
                          <span
                            key={cert.id}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {cert.certification_type?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Total Dives with Us</div>
                    <div className="text-2xl font-bold text-gray-900">{member.total_dives || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PortalDashboard;
