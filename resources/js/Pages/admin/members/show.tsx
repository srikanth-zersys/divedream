import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar, Award, Clock, CreditCard } from 'lucide-react';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  certification_number?: string;
  certification_agency?: string;
  certification_date?: string;
  notes?: string;
  status?: string;
  created_at?: string;
  total_bookings?: number;
  total_spent?: number;
  last_visit?: string;
  certification_type?: { name: string };
  bookings?: Array<{
    id: number;
    booking_number: string;
    booking_date: string;
    status: string;
  }>;
}

interface Props {
  member: Member;
}

const ShowMember: React.FC<Props> = ({ member }) => {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status?: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status || 'active']}`}>
        {status || 'active'}
      </span>
    );
  };

  return (
    <>
      <Head title={`${member.first_name} ${member.last_name}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/members" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {member.first_name} {member.last_name}
              </h1>
              <p className="text-gray-500 mt-1">Member since {formatDate(member.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(member.status)}
            <Link href={`/admin/members/${member.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900 dark:text-white">{member.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(member.date_of_birth)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {(member.address_line_1 || member.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h2>
                </div>
                <div className="text-gray-900 dark:text-white">
                  {member.address_line_1 && <div>{member.address_line_1}</div>}
                  {member.address_line_2 && <div>{member.address_line_2}</div>}
                  <div>{[member.city, member.state, member.postal_code].filter(Boolean).join(', ')}</div>
                  {member.country && <div>{member.country}</div>}
                </div>
              </div>
            )}

            {/* Certification */}
            {(member.certification_type || member.certification_number) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dive Certification</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Level</div>
                    <div className="text-gray-900 dark:text-white">{member.certification_type?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Number</div>
                    <div className="text-gray-900 dark:text-white">{member.certification_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Agency</div>
                    <div className="text-gray-900 dark:text-white">{member.certification_agency || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(member.certification_date)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.total_bookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(member.total_spent || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Last Visit</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.last_visit ? formatDate(member.last_visit) : 'Never'}</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            {member.bookings && member.bookings.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
                  <Link href={`/admin/bookings?member_id=${member.id}`} className="text-sm text-blue-600 hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {member.bookings.slice(0, 5).map((booking) => (
                    <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{booking.booking_number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{booking.status}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{formatDate(booking.booking_date)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href={`/admin/bookings/create?member_id=${member.id}`} className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Booking
                </Link>
                <Link href={`/admin/members/${member.id}/edit`} className="w-full block text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ShowMember.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ShowMember;
