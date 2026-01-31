import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Edit, Calendar, Clock, Users, MapPin, Ship, User, DollarSign, AlertCircle } from 'lucide-react';

interface Schedule {
  id: number;
  date: string;
  start_time: string;
  end_time?: string;
  max_participants: number;
  min_participants?: number;
  price_override?: number;
  notes?: string;
  internal_notes?: string;
  is_private: boolean;
  allow_online_booking: boolean;
  status: string;
  product: {
    id: number;
    name: string;
    type: string;
    price: number;
  };
  instructor?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  boat?: {
    id: number;
    name: string;
    capacity: number;
  };
  dive_site?: {
    id: number;
    name: string;
  };
  location?: {
    id: number;
    name: string;
  };
  bookings: Array<{
    id: number;
    booking_number: string;
    customer_name: string;
    customer_email: string;
    participant_count: number;
    status: string;
    payment_status: string;
    member?: { first_name: string; last_name: string };
  }>;
}

interface Props {
  schedule: Schedule;
}

const ShowSchedule: React.FC<Props> = ({ schedule }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const bookedCount = schedule.bookings
    .filter(b => !['cancelled', 'no_show'].includes(b.status))
    .reduce((sum, b) => sum + b.participant_count, 0);

  const available = schedule.max_participants - bookedCount;
  const price = schedule.price_override ?? schedule.product.price;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this schedule? All associated bookings will also be cancelled.')) {
      router.post(`/admin/schedules/${schedule.id}/cancel`, {
        cancellation_reason: 'Cancelled by admin',
        notify_customers: true,
      });
    }
  };

  return (
    <>
      <Head title={`Schedule - ${formatDate(schedule.date)}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/schedules" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{schedule.product.name}</h1>
              <p className="text-gray-500 mt-1">{formatDate(schedule.date)} at {formatTime(schedule.start_time)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(schedule.status)}
            <Link href={`/admin/schedules/${schedule.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            {schedule.status === 'active' && (
              <button onClick={handleCancel} className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                Cancel Schedule
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDate(schedule.date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatTime(schedule.start_time)}
                      {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Capacity</div>
                    <div className="font-medium text-gray-900 dark:text-white">{bookedCount} / {schedule.max_participants}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium text-gray-900 dark:text-white">${price}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Instructor</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {schedule.instructor ? `${schedule.instructor.first_name} ${schedule.instructor.last_name}` : 'Not assigned'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Ship className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Boat</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {schedule.boat ? `${schedule.boat.name} (Cap: ${schedule.boat.capacity})` : 'Not assigned'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-sm text-gray-500">Dive Site</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {schedule.dive_site?.name || 'Not selected'}
                    </div>
                  </div>
                </div>
                {schedule.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium text-gray-900 dark:text-white">{schedule.location.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bookings ({schedule.bookings.length})</h2>
                <Link href={`/admin/bookings/create?schedule_id=${schedule.id}`} className="text-sm text-blue-600 hover:underline">
                  Add Booking
                </Link>
              </div>
              {schedule.bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {schedule.bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">
                            <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:underline font-medium">
                              {booking.booking_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.customer_name}</div>
                            <div className="text-sm text-gray-500">{booking.customer_email}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">{booking.participant_count}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{booking.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.payment_status === 'fully_paid' ? 'bg-green-100 text-green-700' :
                              booking.payment_status === 'deposit_paid' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>{booking.payment_status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Booked</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{bookedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Available</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maximum</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{schedule.max_participants}</span>
                </div>
                <div className="pt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${bookedCount >= schedule.max_participants ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, (bookedCount / schedule.max_participants) * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {Math.round((bookedCount / schedule.max_participants) * 100)}% booked
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Online Booking</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${schedule.allow_online_booking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {schedule.allow_online_booking ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Private Session</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${schedule.is_private ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {schedule.is_private ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(schedule.notes || schedule.internal_notes) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
                {schedule.notes && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Public Notes</div>
                    <p className="text-gray-700 dark:text-gray-300">{schedule.notes}</p>
                  </div>
                )}
                {schedule.internal_notes && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      Internal Notes
                    </div>
                    <p className="text-yellow-800 dark:text-yellow-300">{schedule.internal_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

ShowSchedule.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ShowSchedule;
