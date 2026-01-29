import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { MapPin, Building2, Check, ArrowRight } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  is_primary: boolean;
}

interface Props {
  locations: Location[];
  currentLocationId?: number;
}

const SelectLocation: React.FC<Props> = ({ locations, currentLocationId }) => {
  const [selectedId, setSelectedId] = useState<number | null>(currentLocationId || null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (locationId: number) => {
    setLoading(true);
    router.post('/admin/select-location', { location_id: locationId }, {
      onFinish: () => setLoading(false),
    });
  };

  return (
    <>
      <Head title="Select Location" />

      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Location
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Choose which location you want to manage
            </p>
          </div>

          <div className="space-y-3">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelect(location.id)}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedId === location.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {location.name}
                    </h3>
                    {location.is_primary && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {location.address}, {location.city}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {location.country}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {currentLocationId === location.id ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {locations.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No locations found</p>
              <Link
                href="/admin/locations/create"
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
              >
                Create your first location
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

SelectLocation.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default SelectLocation;
