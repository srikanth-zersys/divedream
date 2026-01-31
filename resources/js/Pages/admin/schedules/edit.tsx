import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Save, Calendar, Users, Ship, MapPin, Trash2 } from 'lucide-react';

interface Schedule {
  id: number;
  product_id: number;
  instructor_id?: number;
  boat_id?: number;
  dive_site_id?: number;
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
}

interface Props {
  schedule: Schedule;
  products: Array<{ id: number; name: string; type: string; duration_minutes?: number }>;
  instructors: Array<{ id: number; first_name: string; last_name: string }>;
  boats: Array<{ id: number; name: string; capacity: number }>;
  diveSites: Array<{ id: number; name: string }>;
}

const EditSchedule: React.FC<Props> = ({ schedule, products, instructors, boats, diveSites }) => {
  const { data, setData, put, processing, errors, delete: destroy } = useForm({
    product_id: schedule.product_id.toString(),
    instructor_id: schedule.instructor_id?.toString() || '',
    boat_id: schedule.boat_id?.toString() || '',
    dive_site_id: schedule.dive_site_id?.toString() || '',
    date: schedule.date,
    start_time: schedule.start_time,
    end_time: schedule.end_time || '',
    max_participants: schedule.max_participants.toString(),
    min_participants: schedule.min_participants?.toString() || '0',
    price_override: schedule.price_override?.toString() || '',
    notes: schedule.notes || '',
    internal_notes: schedule.internal_notes || '',
    is_private: schedule.is_private,
    allow_online_booking: schedule.allow_online_booking,
    status: schedule.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/schedules/${schedule.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this schedule? This cannot be undone if there are bookings.')) {
      destroy(`/admin/schedules/${schedule.id}`);
    }
  };

  return (
    <>
      <Head title="Edit Schedule" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/schedules" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Schedule</h1>
              <p className="text-gray-500 mt-1">{schedule.date} at {schedule.start_time}</p>
            </div>
          </div>
          <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Activity *</label>
                <select
                  value={data.product_id}
                  onChange={(e) => setData('product_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                >
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} ({product.type})</option>
                  ))}
                </select>
                {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={data.start_time}
                    onChange={(e) => setData('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={data.end_time}
                    onChange={(e) => setData('end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                <select
                  value={data.instructor_id}
                  onChange={(e) => setData('instructor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">No instructor assigned</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boat</label>
                <select
                  value={data.boat_id}
                  onChange={(e) => setData('boat_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">No boat assigned</option>
                  {boats.map((boat) => (
                    <option key={boat.id} value={boat.id}>{boat.name} (Cap: {boat.capacity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dive Site</label>
                <select
                  value={data.dive_site_id}
                  onChange={(e) => setData('dive_site_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">No dive site selected</option>
                  {diveSites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Participants *</label>
                <input
                  type="number"
                  value={data.max_participants}
                  onChange={(e) => setData('max_participants', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  min="1"
                  required
                />
                {errors.max_participants && <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Participants</label>
                <input
                  type="number"
                  value={data.min_participants}
                  onChange={(e) => setData('min_participants', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Override</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={data.price_override}
                    onChange={(e) => setData('price_override', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="0"
                    step="0.01"
                    placeholder="Use product price"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Allow Online Booking</div>
                  <div className="text-sm text-gray-500">Customers can book this online</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.allow_online_booking}
                    onChange={(e) => setData('allow_online_booking', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Private Session</div>
                  <div className="text-sm text-gray-500">Reserved for a single group</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_private}
                    onChange={(e) => setData('is_private', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Public Notes</label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Visible to customers..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Notes</label>
                <textarea
                  value={data.internal_notes}
                  onChange={(e) => setData('internal_notes', e.target.value)}
                  placeholder="Staff only..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/schedules" className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

EditSchedule.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default EditSchedule;
