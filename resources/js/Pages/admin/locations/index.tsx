import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  MapPin,
  Plus,
  Users,
  Calendar,
  BookOpen,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string | null;
  is_active: boolean;
  members_count: number;
  bookings_count: number;
  schedules_count: number;
}

interface Props {
  locations: Location[];
}

const LocationsIndex: React.FC<Props> = ({ locations }) => {
  const handleSwitch = (locationId: number) => {
    router.post('/admin/switch-location', { location_id: locationId });
  };

  return (
    <Layout>
      <Head title="Locations" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
            <p className="text-gray-600">Manage your dive center locations</p>
          </div>
          <Link
            href="/admin/locations/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </Link>
        </div>

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
            <p className="text-gray-600 mb-4">Add your first dive center location to get started.</p>
            <Link
              href="/admin/locations/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        {location.city && (
                          <p className="text-sm text-gray-500">
                            {location.city}
                            {location.state && `, ${location.state}`}
                          </p>
                        )}
                      </div>
                    </div>
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

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Users className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-semibold text-gray-900">
                        {location.members_count}
                      </p>
                      <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <BookOpen className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-semibold text-gray-900">
                        {location.bookings_count}
                      </p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-semibold text-gray-900">
                        {location.schedules_count}
                      </p>
                      <p className="text-xs text-gray-500">Schedules</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {location.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {location.phone}
                      </div>
                    )}
                    {location.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {location.email}
                      </div>
                    )}
                    {location.timezone && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {location.timezone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handleSwitch(location.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Switch to this location
                  </button>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/locations/${location.id}`}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/locations/${location.id}/edit`}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LocationsIndex;
