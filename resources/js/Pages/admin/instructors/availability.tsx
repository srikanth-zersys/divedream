import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  MapPin,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  locations: Location[];
}

interface Availability {
  id?: number;
  type: 'recurring' | 'override' | 'time_off';
  day_of_week: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location_id: number | null;
  is_available: boolean;
  reason: string | null;
}

interface Props {
  instructor: Instructor;
  availabilities: Availability[];
  overrides: Availability[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const InstructorAvailability: React.FC<Props> = ({
  instructor,
  availabilities,
  overrides,
}) => {
  // Separate recurring and non-recurring
  const recurringAvailabilities = availabilities.filter(a => a.type === 'recurring');

  const [weeklySchedule, setWeeklySchedule] = useState<Availability[]>(
    recurringAvailabilities.length > 0
      ? recurringAvailabilities
      : DAYS_OF_WEEK.map(day => ({
          type: 'recurring' as const,
          day_of_week: day.value,
          date: null,
          start_time: '08:00',
          end_time: '17:00',
          location_id: instructor.locations[0]?.id || null,
          is_available: day.value >= 1 && day.value <= 5, // Mon-Fri default
          reason: null,
        }))
  );

  const [timeOffDates, setTimeOffDates] = useState<Availability[]>(
    overrides.filter(a => a.type === 'time_off')
  );

  const [newTimeOff, setNewTimeOff] = useState({
    date: '',
    reason: '',
  });

  const { post, processing } = useForm({});

  const handleWeeklyChange = (dayIndex: number, field: keyof Availability, value: any) => {
    setWeeklySchedule(prev =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const addTimeOff = () => {
    if (!newTimeOff.date) return;

    setTimeOffDates(prev => [
      ...prev,
      {
        type: 'time_off' as const,
        day_of_week: null,
        date: newTimeOff.date,
        start_time: null,
        end_time: null,
        location_id: null,
        is_available: false,
        reason: newTimeOff.reason || null,
      },
    ]);
    setNewTimeOff({ date: '', reason: '' });
  };

  const removeTimeOff = (index: number) => {
    setTimeOffDates(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const allAvailabilities = [
      ...weeklySchedule.map(a => ({
        ...a,
        start_time: a.is_available ? a.start_time : null,
        end_time: a.is_available ? a.end_time : null,
      })),
      ...timeOffDates,
    ];

    router.put(
      `/admin/instructors/${instructor.id}/availability`,
      { availabilities: allAvailabilities },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <Layout>
      <Head title={`Availability - ${instructor.first_name} ${instructor.last_name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/instructors/${instructor.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Availability
              </h1>
              <p className="text-gray-600">
                {instructor.first_name} {instructor.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Weekly Schedule
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Set the instructor's regular weekly availability
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {weeklySchedule.map((schedule, index) => {
              const day = DAYS_OF_WEEK.find(d => d.value === schedule.day_of_week);
              return (
                <div
                  key={schedule.day_of_week}
                  className={`p-4 flex items-center gap-4 ${
                    !schedule.is_available ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="w-28">
                    <span className="font-medium text-gray-900">{day?.label}</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.is_available}
                      onChange={(e) =>
                        handleWeeklyChange(index, 'is_available', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Available</span>
                  </label>

                  {schedule.is_available && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={schedule.start_time || ''}
                          onChange={(e) =>
                            handleWeeklyChange(index, 'start_time', e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={schedule.end_time || ''}
                          onChange={(e) =>
                            handleWeeklyChange(index, 'end_time', e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      {instructor.locations.length > 1 && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <select
                            value={schedule.location_id || ''}
                            onChange={(e) =>
                              handleWeeklyChange(
                                index,
                                'location_id',
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Any location</option>
                            {instructor.locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {!schedule.is_available && (
                    <span className="text-sm text-gray-500 italic">Not working</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Off */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Time Off / Blocked Dates
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Mark specific dates when the instructor is unavailable
            </p>
          </div>

          <div className="p-6">
            {/* Add Time Off */}
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newTimeOff.date}
                  onChange={(e) =>
                    setNewTimeOff((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={newTimeOff.reason}
                  onChange={(e) =>
                    setNewTimeOff((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g., Vacation, Personal day"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={addTimeOff}
                disabled={!newTimeOff.date}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Time Off
              </button>
            </div>

            {/* Time Off List */}
            {timeOffDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No time off scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeOffDates.map((timeOff, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-red-600 font-medium">
                        {timeOff.date
                          ? new Date(timeOff.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Unknown date'}
                      </div>
                      {timeOff.reason && (
                        <span className="text-sm text-red-500">{timeOff.reason}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeTimeOff(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Existing Overrides Info */}
        {overrides.filter(a => a.type === 'override').length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Schedule Overrides
            </h2>
            <div className="space-y-2">
              {overrides
                .filter((a) => a.type === 'override')
                .map((override, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        override.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {override.is_available ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="font-medium">
                      {override.date
                        ? new Date(override.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Unknown'}
                    </div>
                    {override.start_time && override.end_time && (
                      <div className="text-sm text-gray-600">
                        {override.start_time} - {override.end_time}
                      </div>
                    )}
                    {override.reason && (
                      <div className="text-sm text-gray-500">{override.reason}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InstructorAvailability;
