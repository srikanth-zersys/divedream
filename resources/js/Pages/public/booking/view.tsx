import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileSignature,
  Phone,
  Mail,
  DollarSign,
  XCircle,
  MessageSquare,
  Download,
} from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: string;
  booking_date: string;
  booking_time?: string;
  participant_count: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  currency: string;
  waiver_completed: boolean;
  waiver_completed_at?: string;
  customer_notes?: string;
  confirmed_at?: string;
  product?: {
    name: string;
    description?: string;
    duration_minutes?: number;
    image_url?: string;
  };
  schedule?: {
    date: string;
    start_time: string;
    end_time?: string;
    notes?: string;
  };
  location?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  instructor?: {
    name: string;
  };
  participants: Array<{
    id: number;
    first_name: string;
    last_name: string;
    waiver_signed: boolean;
    waiver_signed_at?: string;
  }>;
  payments: Array<{
    amount: number;
    type: string;
    method: string;
    paid_at: string;
  }>;
}

interface Tenant {
  name: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface Props {
  booking: Booking;
  tenant: Tenant;
  canCancel: boolean;
  canSignWaiver: boolean;
  needsPayment: boolean;
  flash?: { success?: string; error?: string; info?: string };
}

const BookingView: React.FC<Props> = ({
  booking,
  tenant,
  canCancel,
  canSignWaiver,
  needsPayment,
  flash,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const cancelForm = useForm({ reason: '' });
  const waiverForm = useForm({ signature: '', agreed: false, participant_id: '' });
  const noteForm = useForm({ note: '' });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: booking.currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
      no_show: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
    };
    return styles[status] || styles.pending;
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    cancelForm.post(window.location.pathname + '/cancel', {
      onSuccess: () => setShowCancelModal(false),
    });
  };

  const handleSignWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    waiverForm.post(window.location.pathname + '/waiver', {
      onSuccess: () => setShowWaiverModal(false),
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    noteForm.post(window.location.pathname + '/note', {
      onSuccess: () => {
        setShowNoteModal(false);
        noteForm.reset();
      },
    });
  };

  const statusBadge = getStatusBadge(booking.status);

  return (
    <>
      <Head title={`Booking ${booking.booking_number}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} alt={tenant.name} className="h-10" />
                ) : (
                  <div className="font-bold text-xl text-gray-900">{tenant.name}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Booking Reference</div>
                <div className="font-mono font-bold text-gray-900">{booking.booking_number}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{flash.success}</span>
            </div>
          </div>
        )}
        {flash?.error && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{flash.error}</span>
            </div>
          </div>
        )}
        {flash?.info && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700">{flash.info}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.icon}
                    {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                  </span>
                </div>

                {/* Waiver Status */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileSignature className={`w-5 h-5 ${booking.waiver_completed ? 'text-green-600' : 'text-amber-500'}`} />
                    <span className="text-gray-700">Liability Waiver</span>
                  </div>
                  {booking.waiver_completed ? (
                    <span className="text-sm text-green-600 font-medium">Signed</span>
                  ) : canSignWaiver ? (
                    <button
                      onClick={() => setShowWaiverModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign Now
                    </button>
                  ) : (
                    <span className="text-sm text-amber-600 font-medium">Required</span>
                  )}
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-5 h-5 ${booking.payment_status === 'fully_paid' ? 'text-green-600' : 'text-amber-500'}`} />
                    <span className="text-gray-700">Payment</span>
                  </div>
                  <span className={`text-sm font-medium ${booking.payment_status === 'fully_paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {booking.payment_status === 'fully_paid'
                      ? 'Paid in Full'
                      : booking.payment_status === 'deposit_paid'
                      ? 'Deposit Paid'
                      : booking.payment_status === 'partially_paid'
                      ? 'Partially Paid'
                      : 'Payment Required'}
                  </span>
                </div>
              </div>

              {/* Activity Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Details</h2>

                {booking.product && (
                  <div className="flex gap-4">
                    {booking.product.image_url && (
                      <img
                        src={booking.product.image_url}
                        alt={booking.product.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.product.name}</h3>
                      {booking.product.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{booking.product.description}</p>
                      )}
                      {booking.product.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4" />
                          {Math.floor(booking.product.duration_minutes / 60)}h {booking.product.duration_minutes % 60}m
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(booking.schedule?.date || booking.booking_date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-medium text-gray-900">
                        {formatTime(booking.schedule?.start_time || booking.booking_time || '09:00')}
                        {booking.schedule?.end_time && ` - ${formatTime(booking.schedule.end_time)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Participants</div>
                      <div className="font-medium text-gray-900">{booking.participant_count} people</div>
                    </div>
                  </div>
                  {booking.instructor && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Instructor</div>
                        <div className="font-medium text-gray-900">{booking.instructor.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {booking.location && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium text-gray-900">{booking.location.name}</div>
                        {booking.location.address && (
                          <div className="text-sm text-gray-600 mt-1">{booking.location.address}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {booking.schedule?.notes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Important Information</div>
                    <div className="text-sm text-blue-700 mt-1">{booking.schedule.notes}</div>
                  </div>
                )}
              </div>

              {/* Participants */}
              {booking.participants.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
                  <div className="divide-y divide-gray-100">
                    {booking.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {participant.first_name} {participant.last_name}
                          </span>
                        </div>
                        {participant.waiver_signed ? (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Waiver Signed
                          </span>
                        ) : (
                          <span className="text-sm text-amber-600">Waiver Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(booking.subtotal)}</span>
                  </div>
                  {booking.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(booking.discount_amount)}</span>
                    </div>
                  )}
                  {booking.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>{formatCurrency(booking.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-900 pt-3 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(booking.total_amount)}</span>
                  </div>
                  {booking.amount_paid > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Paid</span>
                      <span>-{formatCurrency(booking.amount_paid)}</span>
                    </div>
                  )}
                  {booking.balance_due > 0 && (
                    <div className="flex justify-between font-semibold text-amber-600 pt-3 border-t">
                      <span>Balance Due</span>
                      <span>{formatCurrency(booking.balance_due)}</span>
                    </div>
                  )}
                </div>

                {needsPayment && (
                  <button
                    onClick={() => router.post(window.location.pathname + '/pay')}
                    className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Pay Balance
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {canSignWaiver && (
                    <button
                      onClick={() => setShowWaiverModal(true)}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FileSignature className="w-5 h-5" />
                      Sign Waiver
                    </button>
                  )}
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Add Note
                  </button>
                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
                <div className="space-y-3">
                  {tenant.phone && (
                    <a
                      href={`tel:${tenant.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <Phone className="w-5 h-5 text-gray-400" />
                      {tenant.phone}
                    </a>
                  )}
                  {tenant.email && (
                    <a
                      href={`mailto:${tenant.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <Mail className="w-5 h-5 text-gray-400" />
                      {tenant.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <form onSubmit={handleCancel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <textarea
                    value={cancelForm.data.reason}
                    onChange={(e) => cancelForm.setData('reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Let us know why you're cancelling..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="submit"
                    disabled={cancelForm.processing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelForm.processing ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Waiver Modal */}
        {showWaiverModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Liability Waiver</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto text-sm text-gray-600">
                <p className="mb-2">
                  By signing this waiver, I acknowledge that I understand the risks involved in scuba
                  diving and related activities. I agree to follow all safety instructions provided
                  by the dive center and its staff.
                </p>
                <p className="mb-2">
                  I confirm that I am in good health and have no medical conditions that would prevent
                  me from safely participating in diving activities.
                </p>
                <p>
                  I release the dive center, its employees, and agents from any liability for injury
                  or damage that may occur during my participation.
                </p>
              </div>
              <form onSubmit={handleSignWaiver}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type your full name as signature *
                  </label>
                  <input
                    type="text"
                    value={waiverForm.data.signature}
                    onChange={(e) => waiverForm.setData('signature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cursive text-lg"
                    placeholder="Your Full Name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={waiverForm.data.agreed}
                      onChange={(e) => waiverForm.setData('agreed', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      I have read and agree to the liability waiver above. I understand the risks
                      involved and accept full responsibility for my participation.
                    </span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWaiverModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={waiverForm.processing || !waiverForm.data.agreed || !waiverForm.data.signature}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {waiverForm.processing ? 'Signing...' : 'Sign Waiver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Note</h3>
              <form onSubmit={handleAddNote}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your message
                  </label>
                  <textarea
                    value={noteForm.data.note}
                    onChange={(e) => noteForm.setData('note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="Special requests, dietary requirements, questions..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={noteForm.processing || !noteForm.data.note}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {noteForm.processing ? 'Sending...' : 'Send Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingView;
