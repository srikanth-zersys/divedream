import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Calendar, Clock, Users, MapPin, Ship, User, Award, Check, AlertCircle } from 'lucide-react';

interface Schedule {
  id: number;
  date: string;
  start_time: string;
  end_time?: string;
  max_participants: number;
  notes?: string;
  product: {
    id: number;
    name: string;
    type: string;
    description?: string;
    price: number;
    duration_minutes?: number;
    minimum_certification?: string;
    included_items?: string;
    what_to_bring?: string;
  };
  instructor?: {
    id: number;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar?: string;
  };
  dive_site?: {
    id: number;
    name: string;
    max_depth?: number;
    description?: string;
  };
  boat?: {
    id: number;
    name: string;
    capacity: number;
  };
  location?: {
    id: number;
    name: string;
    address?: string;
  };
}

interface Props {
  schedule: Schedule;
  bookedCount: number;
  available: number;
  price: number;
}

const PublicSchedulePage: React.FC<Props> = ({ schedule, bookedCount, available, price }) => {
  const [participants, setParticipants] = useState(1);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const total = price * participants;

  const handleBook = () => {
    router.get('/book/checkout', {
      schedule: schedule.id,
      participants,
    });
  };

  const isSoldOut = available === 0;
  const isPastDate = new Date(schedule.date) < new Date(new Date().toDateString());

  return (
    <>
      <Head title={`${schedule.product.name} - ${formatDate(schedule.date)}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/book/product/${schedule.product.id}`} className="inline-flex items-center gap-2 text-blue-600 hover:underline">
              <ChevronLeft className="w-4 h-4" />
              Back to {schedule.product.name}
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {schedule.product.type.replace('_', ' ')}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-3">{schedule.product.name}</h1>

                {/* Date & Time */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{formatDate(schedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>
                      {formatTime(schedule.start_time)}
                      {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                    </span>
                  </div>
                </div>

                {schedule.product.duration_minutes && (
                  <p className="text-gray-500 mt-2">Duration: {formatDuration(schedule.product.duration_minutes)}</p>
                )}
              </div>

              {/* Description */}
              {schedule.product.description && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">About this experience</h2>
                  <p className="text-gray-700 whitespace-pre-line">{schedule.product.description}</p>
                </div>
              )}

              {/* Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Instructor */}
                {schedule.instructor && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Your Instructor</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {schedule.instructor.first_name[0]}{schedule.instructor.last_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {schedule.instructor.first_name} {schedule.instructor.last_name}
                        </div>
                        {schedule.instructor.bio && (
                          <p className="text-sm text-gray-500 line-clamp-2">{schedule.instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dive Site */}
                {schedule.dive_site && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold text-gray-900">Dive Site</h3>
                    </div>
                    <div className="font-medium text-gray-900">{schedule.dive_site.name}</div>
                    {schedule.dive_site.max_depth && (
                      <p className="text-sm text-gray-500">Max depth: {schedule.dive_site.max_depth}m</p>
                    )}
                    {schedule.dive_site.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{schedule.dive_site.description}</p>
                    )}
                  </div>
                )}

                {/* Boat */}
                {schedule.boat && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Ship className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Boat</h3>
                    </div>
                    <div className="font-medium text-gray-900">{schedule.boat.name}</div>
                    <p className="text-sm text-gray-500">Capacity: {schedule.boat.capacity} divers</p>
                  </div>
                )}

                {/* Meeting Point */}
                {schedule.location && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">Meeting Point</h3>
                    </div>
                    <div className="font-medium text-gray-900">{schedule.location.name}</div>
                    {schedule.location.address && (
                      <p className="text-sm text-gray-500">{schedule.location.address}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Requirements */}
              {schedule.product.minimum_certification && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">Certification Required</h3>
                  </div>
                  <p className="text-amber-800">
                    This experience requires a minimum of <strong>{schedule.product.minimum_certification}</strong> certification.
                    Please ensure all participants have valid certifications.
                  </p>
                </div>
              )}

              {/* What's Included */}
              {schedule.product.included_items && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">What's included</h2>
                  <div className="space-y-2">
                    {schedule.product.included_items.split('\n').map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {schedule.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Important Information</h3>
                  </div>
                  <p className="text-blue-800">{schedule.notes}</p>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</div>
                  <div className="text-gray-500">per person</div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className={`font-medium ${available <= 3 ? 'text-orange-600' : 'text-gray-700'}`}>
                    {available} spot{available !== 1 ? 's' : ''} left
                  </span>
                </div>

                {isPastDate ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-medium">This date has passed</p>
                  </div>
                ) : isSoldOut ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-medium">Sold out</p>
                    <Link href={`/book/product/${schedule.product.id}`} className="text-blue-600 hover:underline mt-2 inline-block">
                      Check other dates
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Guests Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of guests</label>
                      <select
                        value={participants}
                        onChange={(e) => setParticipants(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: Math.min(available, 10) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4 mb-6 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>{formatCurrency(price)} x {participants}</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={handleBook}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue to Checkout
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                      You won't be charged yet
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicSchedulePage;
