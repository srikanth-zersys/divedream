import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  User,
  Anchor,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Schedule, Pagination } from '@/types/dive-club';

interface Props {
  schedules: Pagination<Schedule>;
  stats: {
    today: number;
    thisWeek: number;
    totalBookings: number;
  };
  filters: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
}

const SchedulesIndex: React.FC<Props> = ({ schedules, stats, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/schedules', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/schedules', { ...filters, [key]: value }, { preserveState: true });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
      scheduled: {
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Calendar className="w-3 h-3" />,
      },
      in_progress: {
        bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: <AlertCircle className="w-3 h-3" />,
      },
      completed: {
        bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      cancelled: {
        bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="w-3 h-3" />,
      },
    };
    return styles[status] || styles.scheduled;
  };

  const hasActiveFilters = filters.status || filters.date_from || filters.date_to;

  return (
    <>
      <Head title="Schedules" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedules</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your dive schedules and activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/schedules/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            <Link
              href="/admin/schedules/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisWeek}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</div>
                <div className="text-sm text-gray-500">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilter('date_from', e.target.value)}
                placeholder="From Date"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilter('date_to', e.target.value)}
                placeholder="To Date"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          )}
        </div>

        {/* Schedules List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {schedules.data.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No schedules found</p>
              <Link href="/admin/schedules/create" className="mt-4 inline-flex items-center gap-2 text-blue-600">
                <Plus className="w-4 h-4" /> Create your first schedule
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {schedules.data.map((schedule) => (
                <div key={schedule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {new Date(schedule.date).getDate()}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/admin/schedules/${schedule.id}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-blue-600"
                          >
                            {schedule.product?.name || 'Untitled Schedule'}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(schedule.start_time)}
                              {schedule.end_time && <> - {formatTime(schedule.end_time)}</>}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {schedule.bookings_count || 0} / {schedule.max_participants} booked
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(schedule.status).bg}`}>
                            {getStatusBadge(schedule.status).icon}
                            {schedule.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {schedule.instructor && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {schedule.instructor.user?.name}
                          </span>
                        )}
                        {schedule.dive_site && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {schedule.dive_site.name}
                          </span>
                        )}
                        {schedule.boat && (
                          <span className="flex items-center gap-1">
                            <Anchor className="w-4 h-4" />
                            {schedule.boat.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/schedules/${schedule.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/schedules/${schedule.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {schedules.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {schedules.links.map((link, i) => (
              link.label.includes('Previous') ? (
                <Link key={i} href={link.url || '#'} className={`p-2 rounded-lg ${link.url ? 'hover:bg-gray-100' : 'text-gray-300'}`}>
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : link.label.includes('Next') ? (
                <Link key={i} href={link.url || '#'} className={`p-2 rounded-lg ${link.url ? 'hover:bg-gray-100' : 'text-gray-300'}`}>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-lg text-sm ${link.active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                  {link.label}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </>
  );
};

SchedulesIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default SchedulesIndex;
