import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Award,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Waves,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Instructor, Schedule } from '@/types/dive-club';

interface Props {
  instructor: Instructor & {
    locations: Array<{ id: number; name: string; pivot: { is_primary: boolean } }>;
  };
  upcomingSchedules: Schedule[];
  stats: {
    totalSchedules: number;
    completedDives: number;
    upcomingSchedules: number;
  };
}

const InstructorShow: React.FC<Props> = ({ instructor, upcomingSchedules, stats }) => {
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return styles[status] || styles.active;
  };

  const primaryLocation = instructor.locations?.find((l) => l.pivot.is_primary);
  const isExpiringSoon = instructor.instructor_cert_expiry &&
    new Date(instructor.instructor_cert_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Layout>
      <Head title={`${instructor.first_name} ${instructor.last_name}`} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/instructors"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: instructor.calendar_color || '#3b82f6' }}
              >
                {instructor.first_name[0]}{instructor.last_name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {instructor.first_name} {instructor.last_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(instructor.status)}`}>
                    {instructor.status.replace('_', ' ')}
                  </span>
                  {instructor.instructor_level && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {instructor.instructor_agency} {instructor.instructor_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/instructors/${instructor.id}/availability`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Calendar className="w-4 h-4" />
              Availability
            </Link>
            <Link
              href={`/admin/instructors/${instructor.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {isExpiringSoon && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Certification Expiring Soon</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Instructor certification expires on {formatDate(instructor.instructor_cert_expiry!)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSchedules}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Schedules</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Waves className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedDives}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingSchedules}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Schedules */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Schedules</h2>
              </div>
              {upcomingSchedules.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {upcomingSchedules.map((schedule) => (
                    <div key={schedule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{schedule.product?.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(schedule.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(schedule.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {schedule.bookings?.length || 0} / {schedule.max_participants}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/admin/schedules/${schedule.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming schedules</p>
                </div>
              )}
            </div>

            {/* Bio */}
            {instructor.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{instructor.bio}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${instructor.email}`} className="text-blue-600 hover:underline">
                    {instructor.email}
                  </a>
                </div>
                {instructor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${instructor.phone}`} className="text-blue-600 hover:underline">
                      {instructor.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Locations</h2>
              <div className="space-y-2">
                {instructor.locations?.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{location.name}</span>
                    </div>
                    {location.pivot.is_primary && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Agency</span>
                  <p className="font-medium text-gray-900 dark:text-white">{instructor.instructor_agency || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Instructor #</span>
                  <p className="font-medium text-gray-900 dark:text-white">{instructor.instructor_number || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Level</span>
                  <p className="font-medium text-gray-900 dark:text-white">{instructor.instructor_level || 'Not set'}</p>
                </div>
                {instructor.instructor_cert_expiry && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Expiry</span>
                    <p className={`font-medium ${isExpiringSoon ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(instructor.instructor_cert_expiry)}
                    </p>
                  </div>
                )}
                {instructor.teaching_certifications && instructor.teaching_certifications.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Teaching Specialties</span>
                    <div className="flex flex-wrap gap-1">
                      {instructor.teaching_certifications.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance */}
            {instructor.insurance_provider && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insurance</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Provider</span>
                    <p className="font-medium text-gray-900 dark:text-white">{instructor.insurance_provider}</p>
                  </div>
                  {instructor.insurance_policy_number && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Policy #</span>
                      <p className="font-medium text-gray-900 dark:text-white">{instructor.insurance_policy_number}</p>
                    </div>
                  )}
                  {instructor.insurance_expiry && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Expiry</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(instructor.insurance_expiry)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            {instructor.languages && instructor.languages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {instructor.languages.map((lang, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorShow;
