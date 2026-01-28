import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  UserPlus,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { DashboardStats, Schedule, Booking, ChartDataPoint } from '@/types/dive-club';

interface Props {
  stats: DashboardStats;
  todaySchedules: Schedule[];
  capacityAlerts: Schedule[];
  upcomingAttention: Booking[];
  recentBookings: Booking[];
  charts: {
    revenue: ChartDataPoint[];
    bookings: ChartDataPoint[];
  };
}

const Dashboard: React.FC<Props> = ({
  stats,
  todaySchedules,
  capacityAlerts,
  upcomingAttention,
  recentBookings,
  charts,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Today at a glance - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/admin/bookings/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            New Booking
          </Link>
        </div>

        {/* Today's Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Today's Bookings"
            value={stats.today.bookings}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Checked In"
            value={stats.today.checkIns}
            subtitle={`${stats.today.pendingCheckIns} pending`}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Missing Waivers"
            value={stats.today.missingWaivers}
            icon={<FileText className="w-5 h-5" />}
            color={stats.today.missingWaivers > 0 ? 'red' : 'gray'}
            alert={stats.today.missingWaivers > 0}
          />
          <StatCard
            title="Week Revenue"
            value={formatCurrency(stats.week.revenue)}
            subtitle={`${stats.week.bookings} bookings`}
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Month Revenue"
            value={formatCurrency(stats.month.revenue)}
            subtitle={`${stats.month.newMembers} new members`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Today's Schedule
                </h2>
                <Link
                  href="/admin/schedules/calendar"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  View Calendar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {todaySchedules.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities scheduled for today</p>
                </div>
              ) : (
                todaySchedules.map((schedule) => {
                  const bookedCount = schedule.bookings?.reduce((sum, b) => sum + b.participant_count, 0) || 0;
                  const isFull = bookedCount >= schedule.max_participants;
                  const isNearFull = bookedCount >= schedule.max_participants * 0.9;

                  return (
                    <div key={schedule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className="w-2 h-full min-h-[60px] rounded-full"
                            style={{ backgroundColor: schedule.instructor?.calendar_color || '#3B82F6' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {schedule.product?.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(schedule.start_time)}
                                  {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                                </span>
                                {schedule.instructor && (
                                  <span>{schedule.instructor.first_name} {schedule.instructor.last_name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${isFull ? 'text-red-600' : isNearFull ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                                {bookedCount} / {schedule.max_participants}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {isFull ? 'Full' : `${schedule.max_participants - bookedCount} spots left`}
                              </div>
                            </div>
                          </div>
                          {schedule.bookings && schedule.bookings.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {schedule.bookings.slice(0, 5).map((booking) => (
                                <Link
                                  key={booking.id}
                                  href={`/admin/bookings/${booking.id}`}
                                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}
                                >
                                  {booking.member?.first_name} {booking.member?.last_name}
                                  {booking.participant_count > 1 && ` +${booking.participant_count - 1}`}
                                </Link>
                              ))}
                              {schedule.bookings.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  +{schedule.bookings.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Alerts & Action Items */}
          <div className="space-y-6">
            {/* Capacity Alerts */}
            {capacityAlerts.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 mb-3">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Capacity Alerts</h3>
                </div>
                <div className="space-y-2">
                  {capacityAlerts.map((schedule) => (
                    <Link
                      key={schedule.id}
                      href={`/admin/schedules/${schedule.id}`}
                      className="block p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-sm transition-shadow"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {schedule.product?.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {formatTime(schedule.start_time)} - Nearly full
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Needs Attention */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Needs Attention
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {upcomingAttention.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    All caught up!
                  </div>
                ) : (
                  upcomingAttention.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {booking.member?.first_name} {booking.member?.last_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {booking.product?.name} - {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {!booking.waiver_signed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              No waiver
                            </span>
                          )}
                          {!booking.medical_form_completed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              No medical
                            </span>
                          )}
                          {booking.status === 'pending' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Recent Bookings
                  </h3>
                  <Link
                    href="/admin/bookings"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {booking.booking_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.member?.first_name} {booking.member?.last_name}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'gray' | 'emerald' | 'purple';
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, alert }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${alert ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Set the layout
Dashboard.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default Dashboard;
