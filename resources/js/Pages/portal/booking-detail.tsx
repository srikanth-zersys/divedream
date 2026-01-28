import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  XCircle,
  Waves,
} from 'lucide-react';
import { Booking } from '@/types/dive-club';

interface Props {
  booking: Booking;
}

const BookingDetail: React.FC<Props> = ({ booking }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle className="w-5 h-5" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-5 h-5" /> },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <CheckCircle className="w-5 h-5" /> },
    };
    return configs[status] || configs.pending;
  };

  const isUpcoming = new Date(booking.booking_date) >= new Date();
  const canCancel = isUpcoming && ['confirmed', 'pending'].includes(booking.status);

  const handleCancelBooking = () => {
    router.post(`/portal/booking/${booking.id}/cancel`, { reason: cancelReason });
    setShowCancelModal(false);
  };

  const handleSignWaiver = () => {
    router.post(`/portal/booking/${booking.id}/waiver`, {
      signature: 'electronic_signature',
      agreed_to_terms: true,
    });
    setShowWaiverModal(false);
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <>
      <Head title={`Booking #${booking.booking_number}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/portal/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to My Bookings
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.booking_number}</h1>
                <p className="text-gray-500">{booking.product?.name}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.icon}
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Alerts */}
          {isUpcoming && !booking.waiver_signed && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Waiver Required</h3>
                <p className="text-sm text-amber-700 mt-1">
                  You must sign the liability waiver before your dive.
                </p>
                <button
                  onClick={() => setShowWaiverModal(true)}
                  className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
                >
                  Sign Waiver Now
                </button>
              </div>
            </div>
          )}

          {isUpcoming && booking.payment_status !== 'paid' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Payment Due</h3>
                <p className="text-sm text-red-700 mt-1">
                  Balance due: {formatCurrency(booking.total_amount - booking.amount_paid)}
                </p>
                <Link
                  href={`/portal/booking/${booking.id}/pay`}
                  className="mt-2 inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Pay Now
                </Link>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">{formatDate(booking.booking_date)}</div>
                </div>
              </div>

              {booking.schedule && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium text-gray-900">{formatTime(booking.schedule.start_time)}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Participants</div>
                  <div className="font-medium text-gray-900">
                    {booking.participant_count} {booking.participant_count === 1 ? 'person' : 'people'}
                  </div>
                </div>
              </div>

              {booking.location && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium text-gray-900">{booking.location.name}</div>
                    {booking.location.address_line_1 && (
                      <div className="text-sm text-gray-500">{booking.location.address_line_1}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          {booking.participants && booking.participants.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {booking.participants.map((participant, index) => (
                  <div key={participant.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{participant.name}</div>
                      {participant.email && (
                        <div className="text-sm text-gray-500">{participant.email}</div>
                      )}
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
            </div>
            <div className="p-6 space-y-3">
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
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(booking.total_amount)}</span>
              </div>
              {booking.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-green-600">{formatCurrency(booking.amount_paid)}</span>
                  </div>
                  {booking.amount_paid < booking.total_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance Due</span>
                      <span className="text-red-600">{formatCurrency(booking.total_amount - booking.amount_paid)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          {canCancel && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Booking</h2>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Cancel Booking
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Please review our cancellation policy before canceling.
              </p>
            </div>
          )}

          {/* Contact */}
          {booking.location && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              <div className="flex items-center gap-4">
                {booking.location.email && (
                  <a
                    href={`mailto:${booking.location.email}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    Email Us
                  </a>
                )}
                {booking.location.phone && (
                  <a
                    href={`tel:${booking.location.phone}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {booking.location.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiver Modal */}
      {showWaiverModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowWaiverModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liability Waiver</h3>
              <div className="prose prose-sm max-h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                <p>By signing this waiver, I acknowledge that I understand and accept the inherent risks associated with scuba diving...</p>
                <p>I certify that I am in good physical health and have disclosed any medical conditions...</p>
                <p>I agree to follow all safety instructions and dive within my certification limits...</p>
              </div>
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" className="rounded" required />
                <span className="text-sm text-gray-700">I have read and agree to the terms above</span>
              </label>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignWaiver}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign Waiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetail;
