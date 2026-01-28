import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  User,
} from 'lucide-react';
import { Schedule } from '@/types/dive-club';

interface Props {
  schedule: Schedule;
  participants: number;
  pricing: {
    pricePerPerson: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  requiresWaiver: boolean;
  requiresMedical: boolean;
}

interface ParticipantInfo {
  name: string;
  email: string;
  certification_level: string;
}

const Checkout: React.FC<Props> = ({
  schedule,
  participants: initialParticipants,
  pricing,
  requiresWaiver,
  requiresMedical,
}) => {
  const [participants, setParticipants] = useState(initialParticipants);
  const [additionalParticipants, setAdditionalParticipants] = useState<ParticipantInfo[]>(
    Array(Math.max(0, initialParticipants - 1)).fill({ name: '', email: '', certification_level: '' })
  );

  const { data, setData, post, processing, errors } = useForm({
    schedule_id: schedule.id,
    participant_count: initialParticipants,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    participants: [] as ParticipantInfo[],
    special_requests: '',
    marketing_consent: false,
    terms_accepted: false,
  });

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const updateParticipantCount = (count: number) => {
    const newCount = Math.max(1, Math.min(count, schedule.max_participants - (schedule.booked_count || 0)));
    setParticipants(newCount);
    setData('participant_count', newCount);

    // Adjust additional participants array
    const additionalCount = Math.max(0, newCount - 1);
    if (additionalCount > additionalParticipants.length) {
      setAdditionalParticipants([
        ...additionalParticipants,
        ...Array(additionalCount - additionalParticipants.length).fill({ name: '', email: '', certification_level: '' }),
      ]);
    } else {
      setAdditionalParticipants(additionalParticipants.slice(0, additionalCount));
    }
  };

  const updateAdditionalParticipant = (index: number, field: keyof ParticipantInfo, value: string) => {
    const updated = [...additionalParticipants];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalParticipants(updated);
    setData('participants', updated);
  };

  const calculatedPricing = {
    pricePerPerson: pricing.pricePerPerson,
    subtotal: pricing.pricePerPerson * participants,
    tax: 0, // Calculate based on tenant settings
    total: pricing.pricePerPerson * participants,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData('participants', additionalParticipants);
    post('/book/checkout');
  };

  const available = schedule.max_participants - (schedule.booked_count || 0);

  return (
    <>
      <Head title="Complete Your Booking" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link
                href={`/book/product/${schedule.product?.slug}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                Secure Checkout
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Participants */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Number of Participants
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => updateParticipantCount(participants - 1)}
                      disabled={participants <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                      {participants}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateParticipantCount(participants + 1)}
                      disabled={participants >= available}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-500">
                      ({available} spots available)
                    </span>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={data.first_name}
                        onChange={(e) => setData('first_name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={data.last_name}
                        onChange={(e) => setData('last_name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Participants */}
                {participants > 1 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Participants
                    </h2>
                    <div className="space-y-6">
                      {additionalParticipants.map((participant, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              Participant {index + 2}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={participant.name}
                                onChange={(e) => updateAdditionalParticipant(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateAdditionalParticipant(index, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Certification Level
                              </label>
                              <select
                                value={participant.certification_level}
                                onChange={(e) => updateAdditionalParticipant(index, 'certification_level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select...</option>
                                <option value="none">No Certification</option>
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
                )}

                {/* Special Requests */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Special Requests
                  </h2>
                  <textarea
                    value={data.special_requests}
                    onChange={(e) => setData('special_requests', e.target.value)}
                    rows={3}
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.terms_accepted}
                        onChange={(e) => setData('terms_accepted', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Cancellation Policy
                        </a>
                        . *
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.marketing_consent}
                        onChange={(e) => setData('marketing_consent', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        Keep me updated about special offers and new experiences
                      </span>
                    </label>
                  </div>
                </div>

                {/* Requirements Notice */}
                {(requiresWaiver || requiresMedical || schedule.product?.minimum_certification) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-2">Before your dive:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {requiresWaiver && <li>You'll need to sign a liability waiver</li>}
                          {requiresMedical && <li>You'll need to complete a medical questionnaire</li>}
                          {schedule.product?.minimum_certification && (
                            <li>
                              Minimum certification required: {schedule.product.minimum_certification}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || !data.terms_accepted}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {processing ? 'Processing...' : `Complete Booking - ${formatCurrency(calculatedPricing.total)}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h2>

                {/* Experience Details */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">
                    {schedule.product?.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(schedule.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatTime(schedule.start_time)}
                      {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                    </div>
                    {schedule.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Instructor: {schedule.instructor.first_name} {schedule.instructor.last_name}
                      </div>
                    )}
                    {schedule.dive_site && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {schedule.dive_site.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(calculatedPricing.pricePerPerson)} x {participants} {participants === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-gray-900">
                      {formatCurrency(calculatedPricing.subtotal)}
                    </span>
                  </div>
                  {calculatedPricing.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        {formatCurrency(calculatedPricing.tax)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(calculatedPricing.total)}
                    </span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mt-4 text-xs text-gray-500">
                  <p className="font-medium mb-1">Cancellation Policy</p>
                  <p>Free cancellation up to 24 hours before the activity. After that, 50% of the booking fee applies.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Checkout;
