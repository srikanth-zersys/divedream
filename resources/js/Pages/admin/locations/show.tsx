import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  BookOpen,
  Edit,
  Clock,
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string | null;
  is_active: boolean;
  members_count: number;
  bookings_count: number;
  schedules_count: number;
  created_at: string;
}

interface Props {
  location: Location;
}

const LocationShow: React.FC<Props> = ({ location }) => {
  const formatAddress = () => {
    const parts = [];
    if (location.address_line_1) parts.push(location.address_line_1);
    if (location.address_line_2) parts.push(location.address_line_2);
    if (location.city || location.state || location.postal_code) {
      const cityLine = [location.city, location.state, location.postal_code]
        .filter(Boolean)
        .join(', ');
      parts.push(cityLine);
    }
    if (location.country) parts.push(location.country);
    return parts;
  };

  return (
    <Layout>
      <Head title={location.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/locations"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    location.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {location.city && (
                <p className="text-gray-600">
                  {location.city}
                  {location.state && `, ${location.state}`}
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/admin/locations/${location.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Location
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{location.members_count}</p>
                  <p className="text-sm text-gray-500">Members</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{location.bookings_count}</p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{location.schedules_count}</p>
                  <p className="text-sm text-gray-500">Schedules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                {formatAddress().length > 0 ? (
                  <div className="text-gray-900 space-y-1">
                    {formatAddress().map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No address provided</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                <div className="space-y-2">
                  {location.phone ? (
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${location.phone}`} className="hover:text-blue-600">
                        {location.phone}
                      </a>
                    </div>
                  ) : null}
                  {location.email ? (
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${location.email}`} className="hover:text-blue-600">
                        {location.email}
                      </a>
                    </div>
                  ) : null}
                  {location.website ? (
                    <div className="flex items-center gap-2 text-gray-900">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {location.website}
                      </a>
                    </div>
                  ) : null}
                  {!location.phone && !location.email && !location.website && (
                    <p className="text-gray-400 italic">No contact info provided</p>
                  )}
                </div>
              </div>

              {/* Timezone */}
              {location.timezone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Timezone</h3>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {location.timezone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Link
                href={`/admin/schedules?location=${location.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">View Schedules</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href={`/admin/bookings?location=${location.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">View Bookings</span>
                <BookOpen className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href={`/admin/members?location=${location.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">View Members</span>
                <Users className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LocationShow;
