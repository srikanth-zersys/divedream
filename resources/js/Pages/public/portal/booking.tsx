import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  product_name: string;
  product_description: string;
  product_type: string;
  booking_date: string;
  booking_time: string;
  end_time: string | null;
  location_name: string;
  location_address: string;
  location_phone: string | null;
  location_map_url: string | null;
  status: string;
  payment_status: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  currency: string;
  waiver_completed: boolean;
  medical_form_completed: boolean;
  special_requests: string | null;
  instructor_name: string | null;
  participants: Array<{
    id: number;
    name: string;
    email: string | null;
    is_primary: boolean;
    certification_level: string | null;
  }>;
  access_token: string;
}

interface Props {
  booking: Booking;
  tenant: {
    name: string;
    logo_url?: string;
    phone?: string;
    email?: string;
  };
}

const PortalBooking: React.FC<Props> = ({ booking, tenant }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: booking.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isPastBooking = new Date(booking.booking_date) < new Date();

  return (
    <>
      <Head title={`Booking ${booking.booking_number}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/portal"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} alt={tenant.name} className="h-8" />
                ) : (
                  <span className="text-xl font-bold text-blue-600">{tenant.name}</span>
                )}
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Booking Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{booking.product_name}</h1>
                  <p className="text-gray-500 mt-1">Booking #{booking.booking_number}</p>
                  {booking.product_description && (
                    <p className="text-gray-600 mt-2">{booking.product_description}</p>
                  )}
                </div>
                {!isPastBooking && booking.status === 'confirmed' && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    Download Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Alerts */}
            {!booking.waiver_completed && !isPastBooking && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Action Required</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Please complete your liability waiver before your activity.
                  </p>
                  <Link
                    href={`/booking/${booking.access_token}/waiver`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
                  >
                    Sign Waiver
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {booking.balance_due > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Balance Due</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have an outstanding balance of {formatCurrency(booking.balance_due)}.
                  </p>
                  <Link
                    href={`/booking/${booking.access_token}/pay`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-800 hover:text-red-900 mt-2"
                  >
                    Complete Payment
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Date & Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(booking.booking_date)}</p>
                        <p className="text-gray-600">
                          {formatTime(booking.booking_time)}
                          {booking.end_time && ` - ${formatTime(booking.end_time)}`}
                        </p>
                      </div>
                    </div>
                    {booking.instructor_name && (
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Your Instructor</p>
                          <p className="font-medium text-gray-900">{booking.instructor_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Location</h2>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{booking.location_name}</p>
                      <p className="text-gray-600 mt-1">{booking.location_address}</p>
                      {booking.location_phone && (
                        <a
                          href={`tel:${booking.location_phone}`}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          <Phone className="w-4 h-4" />
                          {booking.location_phone}
                        </a>
                      )}
                      {booking.location_map_url && (
                        <a
                          href={booking.location_map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2 ml-4"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    Participants
                  </h2>
                  <div className="space-y-3">
                    {booking.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className={`p-4 rounded-lg ${
                          participant.is_primary
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{participant.name}</span>
                              {participant.is_primary && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                            {participant.email && (
                              <p className="text-sm text-gray-500 mt-1">{participant.email}</p>
                            )}
                          </div>
                          {participant.certification_level && (
                            <span className="text-sm text-gray-600">
                              {participant.certification_level}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                {booking.special_requests && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h2>
                    <p className="text-gray-600">{booking.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Requirements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {booking.waiver_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                      <div className="flex-1">
                        <span className={booking.waiver_completed ? 'text-green-700' : 'text-amber-700'}>
                          {booking.waiver_completed ? 'Waiver signed' : 'Waiver pending'}
                        </span>
                      </div>
                      {!booking.waiver_completed && (
                        <Link
                          href={`/booking/${booking.access_token}/waiver`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Sign
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {booking.medical_form_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                      <span className={booking.medical_form_completed ? 'text-green-700' : 'text-amber-700'}>
                        {booking.medical_form_completed ? 'Medical form complete' : 'Medical form pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid</span>
                      <span className="text-green-600">
                        {formatCurrency(booking.amount_paid)}
                      </span>
                    </div>
                    {booking.balance_due > 0 && (
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <span className="font-medium text-red-600">Balance Due</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(booking.balance_due)}
                        </span>
                      </div>
                    )}
                  </div>
                  {booking.balance_due > 0 && (
                    <Link
                      href={`/booking/${booking.access_token}/pay`}
                      className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </Link>
                  )}
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
                  <div className="space-y-3">
                    {tenant.phone && (
                      <a
                        href={`tel:${tenant.phone}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                      >
                        <Phone className="w-5 h-5" />
                        {tenant.phone}
                      </a>
                    )}
                    {tenant.email && (
                      <a
                        href={`mailto:${tenant.email}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                      >
                        <Mail className="w-5 h-5" />
                        {tenant.email}
                      </a>
                    )}
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

export default PortalBooking;
