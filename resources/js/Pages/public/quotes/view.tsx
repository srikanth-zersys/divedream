import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageCircle,
  Download,
  Calendar,
} from 'lucide-react';

interface QuoteItem {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
}

interface Quote {
  id: number;
  quote_number: string;
  status: string;
  contact_name: string;
  title: string;
  description: string | null;
  valid_until: string;
  proposed_dates: string[] | null;
  expected_participants: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  deposit_required: boolean;
  deposit_percent: number;
  deposit_amount: number;
  payment_terms: string | null;
  terms_and_conditions: string | null;
  cancellation_policy: string | null;
  customer_notes: string | null;
  items: QuoteItem[];
  access_token: string;
}

interface Tenant {
  name: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  currency: string;
}

interface Props {
  quote: Quote;
  tenant: Tenant;
  isExpired: boolean;
  canRespond: boolean;
}

const PublicQuoteView: React.FC<Props> = ({ quote, tenant, isExpired, canRespond }) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changeMessage, setChangeMessage] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || tenant.currency || 'USD',
    }).format(amount);
  };

  const handleAccept = () => {
    router.post(`/quote/${quote.access_token}/accept`, {
      customer_notes: customerNotes,
    });
    setShowAcceptModal(false);
  };

  const handleReject = () => {
    router.post(`/quote/${quote.access_token}/reject`, {
      reason: rejectionReason,
    });
    setShowRejectModal(false);
  };

  const handleRequestChanges = () => {
    router.post(`/quote/${quote.access_token}/request-changes`, {
      message: changeMessage,
    });
    setShowChangeModal(false);
  };

  const getStatusMessage = () => {
    switch (quote.status) {
      case 'accepted':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          title: 'Quote Accepted',
          message: 'Thank you! We will contact you shortly to finalize your booking.',
          color: 'bg-green-50 border-green-200 text-green-800',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          title: 'Quote Declined',
          message: 'This quote has been declined. Contact us if you have any questions.',
          color: 'bg-red-50 border-red-200 text-red-800',
        };
      case 'expired':
        return {
          icon: <Clock className="w-6 h-6 text-orange-500" />,
          title: 'Quote Expired',
          message: 'This quote has expired. Please contact us for an updated quote.',
          color: 'bg-orange-50 border-orange-200 text-orange-800',
        };
      case 'converted':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          title: 'Booking Confirmed',
          message: 'This quote has been converted to a booking. Check your email for details.',
          color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <>
      <Head title={`Quote from ${tenant.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {tenant.logo ? (
                  <img src={tenant.logo} alt={tenant.name} className="h-12 w-auto" />
                ) : (
                  <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
                  <p className="text-sm text-gray-500">Quote {quote.quote_number}</p>
                </div>
              </div>
              {!isExpired && canRespond && (
                <button
                  onClick={() => window.location.href = `/quote/${quote.access_token}/download`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Status Banner */}
          {statusMessage && (
            <div className={`mb-6 p-4 rounded-xl border ${statusMessage.color} flex items-start gap-3`}>
              {statusMessage.icon}
              <div>
                <h3 className="font-semibold">{statusMessage.title}</h3>
                <p className="text-sm mt-1">{statusMessage.message}</p>
              </div>
            </div>
          )}

          {/* Expiration Warning */}
          {isExpired && quote.status !== 'expired' && quote.status !== 'converted' && quote.status !== 'accepted' && (
            <div className="mb-6 p-4 rounded-xl border bg-orange-50 border-orange-200 text-orange-800 flex items-start gap-3">
              <Clock className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold">Quote Expired</h3>
                <p className="text-sm mt-1">This quote has expired. Please contact us for an updated quote.</p>
              </div>
            </div>
          )}

          {/* Quote Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Quote Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Quote For</p>
                  <p className="text-lg font-semibold text-gray-900">{quote.contact_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(quote.valid_until).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900">{quote.title}</h2>
                {quote.description && (
                  <p className="mt-2 text-gray-600">{quote.description}</p>
                )}
              </div>

              {quote.proposed_dates && quote.proposed_dates.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Proposed Dates: {quote.proposed_dates.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                        {item.discount_percent > 0 && (
                          <div className="text-sm text-green-600">{item.discount_percent}% discount applied</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({quote.discount_percent}%)</span>
                    <span>-{formatCurrency(quote.discount_amount)}</span>
                  </div>
                )}
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({quote.tax_rate}%)</span>
                    <span>{formatCurrency(quote.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total_amount)}</span>
                </div>
                {quote.deposit_required && quote.deposit_amount > 0 && (
                  <div className="flex justify-between text-blue-600 pt-2">
                    <span>Deposit Required ({quote.deposit_percent}%)</span>
                    <span>{formatCurrency(quote.deposit_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            {(quote.payment_terms || quote.terms_and_conditions || quote.cancellation_policy) && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4">
                {quote.payment_terms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Payment Terms</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.payment_terms}</p>
                  </div>
                )}
                {quote.terms_and_conditions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Terms & Conditions</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.terms_and_conditions}</p>
                  </div>
                )}
                {quote.cancellation_policy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Cancellation Policy</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.cancellation_policy}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {canRespond && !isExpired && (
              <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowAcceptModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept Quote
                  </button>
                  <button
                    onClick={() => setShowChangeModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Request Changes
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Questions? Contact Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                  <Mail className="w-5 h-5" />
                  {tenant.email}
                </a>
              )}
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                  <Phone className="w-5 h-5" />
                  {tenant.phone}
                </a>
              )}
              {tenant.website && (
                <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                  <Globe className="w-5 h-5" />
                  {tenant.website}
                </a>
              )}
              {tenant.address && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  {tenant.address}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>Quote #{quote.quote_number} from {tenant.name}</p>
          </div>
        </footer>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accept Quote</h3>
            <p className="text-gray-600 mb-4">
              By accepting this quote, you agree to the terms and conditions. We will contact you to finalize the booking.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special requests or notes..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Decline Quote</h3>
            <p className="text-gray-600 mb-4">
              We're sorry to hear that. Could you let us know why so we can improve?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Price too high, found a better option, etc..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Decline Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Changes</h3>
            <p className="text-gray-600 mb-4">
              Let us know what changes you'd like and we'll send you an updated quote.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What would you like to change?
              </label>
              <textarea
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Different dates, add/remove items, different group size, etc..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowChangeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!changeMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicQuoteView;
