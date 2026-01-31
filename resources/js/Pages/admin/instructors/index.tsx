import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar,
  Award,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Instructor, Pagination } from '@/types/dive-club';

interface Props {
  instructors: Pagination<Instructor>;
  filters: {
    search?: string;
    status?: string;
    agency?: string;
  };
}

const InstructorsIndex: React.FC<Props> = ({ instructors, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/instructors', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/instructors', { ...filters, [key]: value }, { preserveState: true });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return styles[status] || styles.active;
  };

  const hasActiveFilters = filters.status || filters.agency;

  return (
    <>
      <Head title="Instructors" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructors</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your dive instructors and staff
            </p>
          </div>
          <Link
            href="/admin/instructors/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Instructor
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or instructor number..."
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
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
              <select
                value={filters.agency || ''}
                onChange={(e) => handleFilter('agency', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Agencies</option>
                <option value="PADI">PADI</option>
                <option value="SSI">SSI</option>
                <option value="NAUI">NAUI</option>
                <option value="SDI">SDI</option>
              </select>
            </div>
          )}
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.data.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
              <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No instructors found</p>
              <Link href="/admin/instructors/create" className="mt-4 inline-flex items-center gap-2 text-blue-600">
                <Plus className="w-4 h-4" /> Add your first instructor
              </Link>
            </div>
          ) : (
            instructors.data.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: instructor.calendar_color }}
                    >
                      {instructor.first_name[0]}{instructor.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/instructors/${instructor.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 truncate"
                        >
                          {instructor.first_name} {instructor.last_name}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(instructor.status)}`}>
                          {instructor.status.replace('_', ' ')}
                        </span>
                      </div>
                      {instructor.instructor_level && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Award className="w-4 h-4" />
                          {instructor.instructor_agency} {instructor.instructor_level}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${instructor.email}`} className="hover:text-blue-600 truncate">
                        {instructor.email}
                      </a>
                    </div>
                    {instructor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${instructor.phone}`} className="hover:text-blue-600">
                          {instructor.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {instructor.teaching_certifications && instructor.teaching_certifications.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {instructor.teaching_certifications.slice(0, 4).map((cert, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {cert}
                          </span>
                        ))}
                        {instructor.teaching_certifications.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                            +{instructor.teaching_certifications.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {instructor.locations && instructor.locations.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      {instructor.locations.map(l => l.name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/instructors/${instructor.id}/availability`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Availability"
                  >
                    <Calendar className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/instructors/${instructor.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/instructors/${instructor.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {instructors.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {instructors.links.map((link, i) => (
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

InstructorsIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default InstructorsIndex;
