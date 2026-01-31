import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Edit,
  Send,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRightCircle,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';

interface QuoteItem {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
  product?: { name: string };
}

interface QuoteActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  user?: { name: string };
}

interface Quote {
  id: number;
  quote_number: string;
  status: string;
  customer_type: string;
  company_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
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
  notes: string | null;
  customer_notes: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  converted_at: string | null;
  created_at: string;
  items: QuoteItem[];
  activities: QuoteActivity[];
  location?: { name: string };
  created_by?: { name: string };
  converted_booking?: { id: number; booking_number: string };
}

interface Props {
  quote: Quote;
  publicUrl: string;
}

const QuoteShow: React.FC<Props> = ({ quote, publicUrl }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      draft: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400', icon: <FileText className="w-4 h-4" /> },
      sent: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', icon: <Send className="w-4 h-4" /> },
      viewed: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', icon: <Eye className="w-4 h-4" /> },
      accepted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: <XCircle className="w-4 h-4" /> },
      expired: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', icon: <Clock className="w-4 h-4" /> },
      converted: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-400', icon: <ArrowRightCircle className="w-4 h-4" /> },
    };
    return styles[status] || styles.draft;
  };

  const statusStyle = getStatusBadge(quote.status);

  const handleDelete = () => {
    router.delete(`/admin/quotes/${quote.id}`, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      created: <FileText className="w-4 h-4" />,
      updated: <Edit className="w-4 h-4" />,
      sent: <Send className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      expired: <Clock className="w-4 h-4" />,
      converted: <ArrowRightCircle className="w-4 h-4" />,
      resent: <RefreshCw className="w-4 h-4" />,
      comment: <MessageCircle className="w-4 h-4" />,
    };
    return icons[type] || <Clock className="w-4 h-4" />;
  };

  return (
    <>
      <Head title={`Quote ${quote.quote_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/quotes"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quote.quote_number}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.icon}
                  {quote.status}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {quote.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quote.status === 'draft' && (
              <>
                <Link
                  href={`/admin/quotes/${quote.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => router.post(`/admin/quotes/${quote.id}/send`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  Send Quote
                </button>
              </>
            )}
            {(quote.status === 'sent' || quote.status === 'viewed') && (
              <button
                onClick={() => router.post(`/admin/quotes/${quote.id}/resend`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4" />
                Resend
              </button>
            )}
            {quote.status === 'accepted' && !quote.converted_booking && (
              <button
                onClick={() => router.get(`/admin/quotes/${quote.id}`, { convert: true })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ArrowRightCircle className="w-4 h-4" />
                Convert to Booking
              </button>
            )}
            <button
              onClick={() => router.post(`/admin/quotes/${quote.id}/duplicate`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            {quote.status === 'draft' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quote.contact_name}</p>
                  </div>
                </div>
                {quote.company_name && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                      <p className="font-medium text-gray-900 dark:text-white">{quote.company_name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${quote.contact_email}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {quote.contact_email}
                    </a>
                  </div>
                </div>
                {quote.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <a href={`tel:${quote.contact_phone}`} className="font-medium text-gray-900 dark:text-white">
                        {quote.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quote Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Discount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {quote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Subtotal</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(quote.subtotal)}</td>
                    </tr>
                    {quote.discount_amount > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-green-600">Discount ({quote.discount_percent}%)</td>
                        <td className="px-4 py-2 text-right font-medium text-green-600">-{formatCurrency(quote.discount_amount)}</td>
                      </tr>
                    )}
                    {quote.tax_amount > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Tax ({quote.tax_rate}%)</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(quote.tax_amount)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td colSpan={4} className="px-4 py-3 text-right text-lg font-semibold text-gray-900 dark:text-white">Total</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(quote.total_amount)}</td>
                    </tr>
                    {quote.deposit_required && quote.deposit_amount > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Deposit Required ({quote.deposit_percent}%)</td>
                        <td className="px-4 py-2 text-right font-medium text-blue-600">{formatCurrency(quote.deposit_amount)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Terms & Notes */}
            {(quote.terms_and_conditions || quote.cancellation_policy || quote.notes) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {quote.terms_and_conditions && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Terms & Conditions</h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quote.terms_and_conditions}</p>
                  </div>
                )}
                {quote.cancellation_policy && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cancellation Policy</h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quote.cancellation_policy}</p>
                  </div>
                )}
                {quote.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Internal Notes</h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Quote Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Valid Until</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {new Date(quote.valid_until).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Customer Type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white capitalize">
                    {quote.customer_type.replace('_', ' ')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Expected Participants</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{quote.expected_participants}</dd>
                </div>
                {quote.location && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{quote.location.name}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </dd>
                </div>
                {quote.created_by && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Created By</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{quote.created_by.name}</dd>
                  </div>
                )}
              </dl>

              {/* Public Link */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Public Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 text-sm px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
                  />
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Activity</h3>
              <div className="space-y-4">
                {quote.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleString()}
                        {activity.user && ` by ${activity.user.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Converted Booking */}
            {quote.converted_booking && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800 dark:text-green-400">Converted to Booking</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  This quote was converted to a booking on {new Date(quote.converted_at!).toLocaleDateString()}
                </p>
                <Link
                  href={`/admin/bookings/${quote.converted_booking.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  View Booking {quote.converted_booking.booking_number}
                  <ArrowRightCircle className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Customer Notes */}
            {quote.customer_notes && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Customer Notes</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{quote.customer_notes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {quote.status === 'rejected' && quote.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Rejection Reason</h3>
                <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{quote.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Quote</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this quote? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

QuoteShow.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default QuoteShow;
