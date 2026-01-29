import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Users, Award, Calendar, ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  type: string;
  short_description?: string;
  description?: string;
  price: number;
  price_type: string;
  duration_minutes?: number;
  max_participants?: number;
  minimum_certification?: string;
  included_items?: string;
  what_to_bring?: string;
  images?: string[];
}

interface ScheduleItem {
  id: number;
  date: string;
  start_time: string;
  end_time?: string;
  instructor?: { name: string; avatar?: string };
  dive_site?: string;
  boat?: string;
  max_participants: number;
  booked_count: number;
  available: number;
  price: number;
}

interface Props {
  product: Product;
  schedules: ScheduleItem[];
  schedulesByDate: Record<string, ScheduleItem[]>;
  relatedProducts: Product[];
}

const PublicProductPage: React.FC<Props> = ({ product, schedules, schedulesByDate, relatedProducts }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const hasAvailability = (date: Date) => {
    const dateKey = getDateKey(date);
    const daySchedules = schedulesByDate[dateKey];
    return daySchedules && daySchedules.some(s => s.available >= participants);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectedSchedules = selectedDate ? (schedulesByDate[selectedDate] || []).filter(s => s.available >= participants) : [];

  const handleBook = (scheduleId: number) => {
    router.get('/book/checkout', {
      schedule: scheduleId,
      participants,
    });
  };

  return (
    <>
      <Head title={product.name} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/book/products" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
              <ChevronLeft className="w-4 h-4" />
              Back to all experiences
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {product.type.replace('_', ' ')}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</div>
                    <div className="text-sm text-gray-500">{product.price_type.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {product.duration_minutes && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{formatDuration(product.duration_minutes)}</span>
                    </div>
                  )}
                  {product.max_participants && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>Max {product.max_participants} guests</span>
                    </div>
                  )}
                  {product.minimum_certification && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-5 h-5" />
                      <span>{product.minimum_certification} required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this experience</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.description || product.short_description}</p>
              </div>

              {/* What's Included */}
              {product.included_items && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">What's included</h2>
                  <div className="space-y-2">
                    {product.included_items.split('\n').map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to Bring */}
              {product.what_to_bring && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">What to bring</h2>
                  <p className="text-gray-700 whitespace-pre-line">{product.what_to_bring}</p>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select date & time</h2>

                {/* Participants */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of guests</label>
                  <select
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-gray-500 font-medium py-2">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((date, i) => {
                      if (!date) {
                        return <div key={i} className="p-2" />;
                      }
                      const dateKey = getDateKey(date);
                      const available = hasAvailability(date);
                      const past = isPast(date);
                      const today = isToday(date);
                      const selected = selectedDate === dateKey;

                      return (
                        <button
                          key={i}
                          onClick={() => !past && available && setSelectedDate(dateKey)}
                          disabled={past || !available}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            selected ? 'bg-blue-600 text-white' :
                            past ? 'text-gray-300 cursor-not-allowed' :
                            !available ? 'text-gray-400 cursor-not-allowed' :
                            today ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {date.getDate()}
                          {available && !past && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Available times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    {selectedSchedules.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available times for {participants} guest{participants > 1 ? 's' : ''}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedSchedules.map((schedule) => (
                          <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{formatTime(schedule.start_time)}</span>
                              <span className="text-sm text-gray-500">{schedule.available} spots left</span>
                            </div>
                            {schedule.instructor && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Users className="w-4 h-4" />
                                <span>with {schedule.instructor.name}</span>
                              </div>
                            )}
                            {schedule.dive_site && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.dive_site}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(schedule.price * participants)}
                                <span className="text-sm font-normal text-gray-500"> total</span>
                              </span>
                              <button
                                onClick={() => handleBook(schedule.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!selectedDate && schedules.length > 0 && (
                  <p className="text-center text-gray-500 py-4">Select a date to see available times</p>
                )}

                {schedules.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No schedules available at this time</p>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <Link key={related.id} href={`/book/product/${related.slug || related.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600" />
                    <div className="p-4">
                      <span className="text-xs text-blue-600 font-medium">{related.type.replace('_', ' ')}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{related.name}</h3>
                      <div className="text-blue-600 font-medium mt-2">{formatCurrency(related.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProductPage;
