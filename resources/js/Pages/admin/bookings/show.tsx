import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Phone,
  Mail,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer,
  MoreVertical,
  UserCheck,
  UserX,
  DollarSign,
  MessageSquare,
  Award,
} from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  status: string;
  payment_status: string;
  booking_date: string;
  booking_time: string;
  participant_count: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  currency: string;
  special_requests: string | null;
  internal_notes: string | null;
  source: string;
  waiver_completed: boolean;
  waiver_completed_at: string | null;
  medical_form_completed: boolean;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  member: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    certifications?: Array<{
      id: number;
      name: string;
      agency: string;
      verified: boolean;
    }>;
  };
  product: {
    id: number;
    name: string;
    type: string;
  };
  schedule: {
    id: number;
    date: string;
    start_time: string;
    end_time: string | null;
    instructor?: {
      id: number;
      first_name: string;
      last_name: string;
    };
    boat?: {
      name: string;
    };
    dive_site?: {
      name: string;
    };
  } | null;
  location: {
    id: number;
    name: string;
    address: string;
  };
  participants: Array<{
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    certification_level: string | null;
    is_primary: boolean;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
  }>;
}

interface Props {
  booking: Booking;
}

const BookingShow: React.FC<Props> = ({ booking }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(booking.balance_due.toString());
  const [paymentMethod, setPaymentMethod] = useState('card');

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: <Clock className="w-4 h-4" /> },
      confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
      checked_in: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', icon: <UserCheck className="w-4 h-4" /> },
      completed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: <XCircle className="w-4 h-4" /> },
      no_show: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', icon: <UserX className="w-4 h-4" /> },
    };
    return styles[status] || styles.pending;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return styles[status] || styles.unpaid;
  };

  const handleCheckIn = () => {
    router.post(`/admin/bookings/${booking.id}/check-in`, {}, {
      preserveScroll: true,
    });
  };

  const handleCheckOut = () => {
    router.post(`/admin/bookings/${booking.id}/check-out`, {}, {
      preserveScroll: true,
    });
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      router.post(`/admin/bookings/${booking.id}/cancel`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/admin/bookings/${booking.id}/payments`, {
      amount: parseFloat(paymentAmount),
      payment_method: paymentMethod,
    }, {
      preserveScroll: true,
      onSuccess: () => setShowPaymentModal(false),
    });
  };

  const statusStyle = getStatusBadge(booking.status);

  return (
    <Layout>
      <Head title={`Booking ${booking.booking_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/bookings"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {booking.booking_number}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.icon}
                  {booking.status.replace('_', ' ')}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentBadge(booking.payment_status)}`}>
                  {booking.payment_status}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Booked on {new Date(booking.created_at).toLocaleDateString()} via {booking.source}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === 'confirmed' && (
              <button
                onClick={handleCheckIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserCheck className="w-4 h-4" />
                Check In
              </button>
            )}
            {booking.status === 'checked_in' && (
              <button
                onClick={handleCheckOut}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Check Out
              </button>
            )}
            <Link
              href={`/admin/bookings/${booking.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            {['pending', 'confirmed'].includes(booking.status) && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {booking.product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDate(booking.booking_date)}
                    </p>
                    {booking.schedule && (
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatTime(booking.schedule.start_time)}
                        {booking.schedule.end_time && ` - ${formatTime(booking.schedule.end_time)}`}
                      </p>
                    )}
                  </div>
                </div>

                {booking.schedule?.instructor && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.schedule.instructor.first_name} {booking.schedule.instructor.last_name}
                      </p>
                    </div>
                  </div>
                )}

                {booking.schedule?.dive_site && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dive Site</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.schedule.dive_site.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.participant_count} {booking.participant_count === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Participants
              </h2>
              <div className="space-y-3">
                {booking.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg ${participant.is_primary ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {participant.name}
                          </span>
                          {participant.is_primary && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        {participant.email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{participant.email}</p>
                        )}
                      </div>
                      {participant.certification_level && (
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Award className="w-4 h-4" />
                          {participant.certification_level}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Requirements
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${booking.waiver_completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <div className="flex items-center gap-3">
                    {booking.waiver_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Liability Waiver</p>
                      <p className={`text-sm ${booking.waiver_completed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {booking.waiver_completed ? 'Signed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${booking.medical_form_completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <div className="flex items-center gap-3">
                    {booking.medical_form_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Medical Form</p>
                      <p className={`text-sm ${booking.medical_form_completed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {booking.medical_form_completed ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(booking.special_requests || booking.internal_notes) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notes
                </h2>
                {booking.special_requests && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Special Requests</p>
                    <p className="text-gray-900 dark:text-white">{booking.special_requests}</p>
                  </div>
                )}
                {booking.internal_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Internal Notes</p>
                    <p className="text-gray-900 dark:text-white">{booking.internal_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Customer
              </h2>
              <div className="space-y-4">
                <div>
                  <Link
                    href={`/admin/members/${booking.member.id}`}
                    className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {booking.member.first_name} {booking.member.last_name}
                  </Link>
                </div>
                {booking.member.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${booking.member.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {booking.member.email}
                    </a>
                  </div>
                )}
                {booking.member.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${booking.member.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {booking.member.phone}
                    </a>
                  </div>
                )}
                {booking.member.certifications && booking.member.certifications.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Certifications</p>
                    <div className="space-y-1">
                      {booking.member.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-center gap-2 text-sm">
                          <Award className={`w-4 h-4 ${cert.verified ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className="text-gray-700 dark:text-gray-300">{cert.name}</span>
                          <span className="text-gray-500 dark:text-gray-400">({cert.agency})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(booking.subtotal)}</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
                {booking.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>{formatCurrency(booking.tax_amount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Paid</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(booking.amount_paid)}</span>
                </div>
                {booking.balance_due > 0 && (
                  <div className="flex justify-between font-medium text-red-600 dark:text-red-400">
                    <span>Balance Due</span>
                    <span>{formatCurrency(booking.balance_due)}</span>
                  </div>
                )}
              </div>

              {booking.balance_due > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4" />
                  Record Payment
                </button>
              )}
            </div>

            {/* Payment History */}
            {booking.payments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment History
                </h2>
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.payment_method} - {new Date(payment.paid_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Location
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.location.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{booking.location.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Record Payment
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BookingShow;
