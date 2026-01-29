import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Save, Calendar, Users, Clock, MapPin } from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  status: string;
  booking_date: string;
  booking_time: string;
  participant_count: number;
  special_requests: string | null;
  internal_notes: string | null;
  member: {
    id: number;
    first_name: string;
    last_name: string;
  };
  product: {
    id: number;
    name: string;
  };
  schedule: {
    id: number;
    date: string;
    start_time: string;
  } | null;
  participants: Array<{
    id: number;
    name: string;
    email: string | null;
    certification_level: string | null;
    is_primary: boolean;
  }>;
}

interface Schedule {
  id: number;
  date: string;
  start_time: string;
  product: { name: string };
  available_spots: number;
}

interface Props {
  booking: Booking;
  schedules: Schedule[];
  statuses: string[];
}

const BookingEdit: React.FC<Props> = ({ booking, schedules, statuses }) => {
  const { data, setData, put, processing, errors } = useForm({
    status: booking.status,
    schedule_id: booking.schedule?.id || '',
    participant_count: booking.participant_count,
    special_requests: booking.special_requests || '',
    internal_notes: booking.internal_notes || '',
    participants: booking.participants.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email || '',
      certification_level: p.certification_level || '',
    })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/bookings/${booking.id}`);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...data.participants];
    updated[index] = { ...updated[index], [field]: value };
    setData('participants', updated);
  };

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

  return (
    <Layout>
      <Head title={`Edit Booking ${booking.booking_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Booking {booking.booking_number}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {booking.member.first_name} {booking.member.last_name} - {booking.product.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Participants
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.participant_count}
                  onChange={(e) => setData('participant_count', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.participant_count && <p className="mt-1 text-sm text-red-500">{errors.participant_count}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule
                </label>
                <select
                  value={data.schedule_id}
                  onChange={(e) => setData('schedule_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a schedule...</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {formatDate(schedule.date)} at {formatTime(schedule.start_time)} - {schedule.product.name} ({schedule.available_spots} spots)
                    </option>
                  ))}
                </select>
                {errors.schedule_id && <p className="mt-1 text-sm text-red-500">{errors.schedule_id}</p>}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Participant Information
            </h2>
            <div className="space-y-4">
              {data.participants.map((participant, index) => (
                <div key={participant.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Participant {index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={participant.email}
                        onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Certification</label>
                      <select
                        value={participant.certification_level}
                        onChange={(e) => updateParticipant(index, 'certification_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">None</option>
                        <option value="OWD">Open Water Diver</option>
                        <option value="AOWD">Advanced Open Water</option>
                        <option value="RD">Rescue Diver</option>
                        <option value="DM">Divemaster</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Requests (visible to customer)
                </label>
                <textarea
                  value={data.special_requests}
                  onChange={(e) => setData('special_requests', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Internal Notes (staff only)
                </label>
                <textarea
                  value={data.internal_notes}
                  onChange={(e) => setData('internal_notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BookingEdit;
