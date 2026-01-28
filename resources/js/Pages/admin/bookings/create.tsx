import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  User,
  Plus,
  Trash2,
  Save,
  Search,
} from 'lucide-react';
import { Product, Schedule, Member } from '@/types/dive-club';

interface Props {
  products: Product[];
  schedules: Schedule[];
  members: Member[];
}

const CreateBooking: React.FC<Props> = ({ products, schedules, members }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    product_id: '',
    schedule_id: '',
    member_id: '',
    booking_date: '',
    participant_count: 1,
    participants: [{ name: '', email: '', phone: '' }],
    notes: '',
    status: 'confirmed',
  });

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    setSelectedProduct(product || null);
    setData('product_id', productId);

    // Filter schedules for this product
    const filtered = schedules.filter(s => s.product_id.toString() === productId);
    setAvailableSchedules(filtered);
  };

  const handleAddParticipant = () => {
    setData('participants', [...data.participants, { name: '', email: '', phone: '' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (data.participants.length > 1) {
      const updated = data.participants.filter((_, i) => i !== index);
      setData('participants', updated);
      setData('participant_count', updated.length);
    }
  };

  const handleParticipantChange = (index: number, field: string, value: string) => {
    const updated = [...data.participants];
    updated[index] = { ...updated[index], [field]: value };
    setData('participants', updated);
  };

  const handleSelectMember = (member: Member) => {
    setData('member_id', member.id.toString());
    const updated = [...data.participants];
    updated[0] = {
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      phone: member.phone || '',
    };
    setData('participants', updated);
    setShowMemberSearch(false);
    setMemberSearch('');
  };

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/bookings');
  };

  return (
    <>
      <Head title="Create Booking" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Booking</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a new booking for a customer
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer</h2>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search existing members..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberSearch(true);
                    }}
                    onFocus={() => setShowMemberSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <Link
                  href="/admin/members/create"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-5 h-5" />
                </Link>
              </div>
              {showMemberSearch && memberSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="p-3 text-gray-500">No members found</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectMember(member)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="font-medium">{member.first_name} {member.last_name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.member_id && <p className="mt-1 text-sm text-red-600">{errors.member_id}</p>}
          </div>

          {/* Product & Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product & Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product *
                </label>
                <select
                  value={data.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
                {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule
                </label>
                <select
                  value={data.schedule_id}
                  onChange={(e) => setData('schedule_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  disabled={!selectedProduct}
                >
                  <option value="">Select a schedule (optional)</option>
                  {availableSchedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.date} at {schedule.start_time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Booking Date *
                </label>
                <input
                  type="date"
                  value={data.booking_date}
                  onChange={(e) => setData('booking_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
                {errors.booking_date && <p className="mt-1 text-sm text-red-600">{errors.booking_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Participants</h2>
              <button
                type="button"
                onClick={handleAddParticipant}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Plus className="w-4 h-4" />
                Add Participant
              </button>
            </div>
            <div className="space-y-4">
              {data.participants.map((participant, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Participant {index + 1} {index === 0 && '(Primary)'}
                    </span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={participant.phone}
                      onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h2>
            <textarea
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              placeholder="Any special requests or notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/bookings"
              className="px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {processing ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

CreateBooking.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default CreateBooking;
