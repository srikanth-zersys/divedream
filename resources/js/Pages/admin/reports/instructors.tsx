import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Users, Download, Calendar, Award } from 'lucide-react';

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  instructor_agency: string | null;
  instructor_level: string | null;
  status: string;
  schedules_count: number;
  user?: {
    name: string;
    email: string;
  };
}

interface Props {
  instructors: Instructor[];
  period: string;
}

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
];

const InstructorsReport: React.FC<Props> = ({ instructors, period }) => {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/reports/instructors', { period: newPeriod }, { preserveState: true });
  };

  const totalSchedules = instructors.reduce((sum, i) => sum + i.schedules_count, 0);
  const activeInstructors = instructors.filter((i) => i.status === 'active').length;
  const topInstructor = [...instructors].sort((a, b) => b.schedules_count - a.schedules_count)[0];

  return (
    <Layout>
      <Head title="Instructors Report" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/reports"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructors Report</h1>
              <p className="text-gray-600">Instructor activity and performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
                <p className="text-sm text-gray-500">Total Instructors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeInstructors}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
                <p className="text-sm text-gray-500">Total Schedules</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {topInstructor?.first_name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Top Performer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Instructor Performance</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agency / Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Schedules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/instructors/${instructor.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {instructor.first_name} {instructor.last_name}
                      </Link>
                      <p className="text-sm text-gray-500">{instructor.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {instructor.instructor_agency && (
                        <span className="font-medium">{instructor.instructor_agency}</span>
                      )}
                      {instructor.instructor_level && (
                        <span className="text-gray-400"> - {instructor.instructor_level}</span>
                      )}
                      {!instructor.instructor_agency && !instructor.instructor_level && (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          instructor.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : instructor.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {instructor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-gray-900">
                        {instructor.schedules_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalSchedules > 0
                                ? (instructor.schedules_count / totalSchedules) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {instructors.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No instructors found for this period.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InstructorsReport;
