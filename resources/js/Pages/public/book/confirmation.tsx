import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Download,
  Share2,
  User,
  FileText,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { Booking } from '@/types/dive-club';

interface Props {
  booking: Booking;
}

const Confirmation: React.FC<Props> = ({ booking }) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-amber-100 text-amber-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head title="Booking Confirmed" />

      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              We've sent a confirmation email to{' '}
              <span className="font-medium">{booking.member?.email}</span>
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Booking Reference</div>
                  <div className="text-2xl font-bold text-gray-900 font-mono">
                    {booking.booking_number}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                    {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Experience Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {booking.product?.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(booking.booking_date)}
                    </div>
                  </div>
                </div>
                {booking.schedule && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-medium text-gray-900">
                        {formatTime(booking.schedule.start_time)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Participants</div>
                    <div className="font-medium text-gray-900">
                      {booking.participant_count} {booking.participant_count === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </div>
                {booking.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium text-gray-900">
                        {booking.location.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            {booking.participants && booking.participants.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Participants</h3>
                <div className="space-y-2">
                  {booking.participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        {participant.email && (
                          <div className="text-sm text-gray-500">{participant.email}</div>
                        )}
                      </div>
                      {index === 0 && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(booking.subtotal)}</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
                {booking.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatCurrency(booking.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatCurrency(booking.total_amount)}</span>
                </div>
                {booking.amount_paid > 0 && booking.amount_paid < booking.total_amount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="text-green-600">{formatCurrency(booking.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance Due</span>
                      <span className="text-red-600">{formatCurrency(booking.total_amount - booking.amount_paid)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                {booking.payment_status !== 'paid' && (
                  <Link
                    href={`/portal/booking/${booking.id}/pay`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </Link>
                )}
                <Link
                  href={`/portal/booking/${booking.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Manage Booking
                </Link>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-800">1</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900">Check your email</div>
                  <div className="text-sm text-blue-700">
                    We've sent confirmation details to {booking.member?.email}
                  </div>
                </div>
              </div>
              {!booking.waiver_signed && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-800">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Complete your waiver</div>
                    <div className="text-sm text-blue-700">
                      Sign the liability waiver before your dive
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-800">{!booking.waiver_signed ? '3' : '2'}</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900">Arrive on time</div>
                  <div className="text-sm text-blue-700">
                    Please arrive at least 30 minutes before your scheduled time
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center text-gray-600">
            <p className="mb-2">Questions about your booking?</p>
            <div className="flex items-center justify-center gap-4">
              <a href={`mailto:${booking.location?.email}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                <Mail className="w-4 h-4" />
                Email Us
              </a>
              {booking.location?.phone && (
                <a href={`tel:${booking.location.phone}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Confirmation;
