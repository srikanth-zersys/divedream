import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Edit, Package, DollarSign, Clock, Users, Award, Calendar, Eye, EyeOff, Star } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  type: string;
  short_description?: string;
  description?: string;
  price: number;
  price_type: string;
  duration_minutes?: number;
  max_participants?: number;
  min_participants?: number;
  minimum_certification?: string;
  included_items?: string;
  requirements?: string;
  what_to_bring?: string;
  is_featured: boolean;
  show_on_website: boolean;
  status: string;
  created_at: string;
  bookings_count?: number;
  revenue?: number;
  upcoming_schedules?: Array<{
    id: number;
    date: string;
    start_time: string;
    booked_count: number;
    max_participants: number;
  }>;
}

interface Props {
  product: Product;
  stats: {
    total_bookings: number;
    total_revenue: number;
    avg_rating?: number;
    upcoming_schedules: number;
  };
}

const ShowProduct: React.FC<Props> = ({ product, stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      fun_dive: 'bg-blue-100 text-blue-700',
      course: 'bg-purple-100 text-purple-700',
      discover_scuba: 'bg-green-100 text-green-700',
      private_trip: 'bg-orange-100 text-orange-700',
      boat_charter: 'bg-cyan-100 text-cyan-700',
      equipment_rental: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>{type.replace('_', ' ')}</span>;
  };

  return (
    <>
      <Head title={product.name} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                {product.is_featured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(product.type)}
                {product.show_on_website ? (
                  <span className="flex items-center gap-1 text-sm text-green-600"><Eye className="w-4 h-4" /> Public</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-500"><EyeOff className="w-4 h-4" /> Hidden</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(product.status)}
            <Link href={`/admin/products/${product.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_bookings}</div>
                <div className="text-sm text-gray-500">Total Bookings</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total_revenue)}</div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming_schedules}</div>
                <div className="text-sm text-gray-500">Upcoming Schedules</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_rating?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-500">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
              </div>
              {product.short_description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">{product.short_description}</p>
              )}
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description || 'No description provided.'}</p>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</div>
                  <div className="text-xs text-gray-500">{product.price_type.replace('_', ' ')}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{formatDuration(product.duration_minutes)}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500">Max Participants</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{product.max_participants || 'N/A'}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500">Min Participants</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{product.min_participants || 1}</div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {(product.minimum_certification || product.requirements) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Requirements</h2>
                </div>
                {product.minimum_certification && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Minimum Certification</div>
                    <div className="font-medium text-gray-900 dark:text-white">{product.minimum_certification}</div>
                  </div>
                )}
                {product.requirements && (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.requirements}</p>
                )}
              </div>
            )}

            {/* Included / What to Bring */}
            {(product.included_items || product.what_to_bring) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.included_items && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Included</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.included_items}</p>
                  </div>
                )}
                {product.what_to_bring && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What to Bring</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.what_to_bring}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href={`/admin/schedules/create?product_id=${product.id}`} className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Schedule
                </Link>
                <Link href={`/admin/schedules?product_id=${product.id}`} className="w-full block text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  View Schedules
                </Link>
                <Link href={`/admin/bookings?product_id=${product.id}`} className="w-full block text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  View Bookings
                </Link>
              </div>
            </div>

            {/* Upcoming Schedules */}
            {product.upcoming_schedules && product.upcoming_schedules.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Schedules</h2>
                  <Link href={`/admin/schedules?product_id=${product.id}`} className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {product.upcoming_schedules.slice(0, 5).map((schedule) => (
                    <Link key={schedule.id} href={`/admin/schedules/${schedule.id}`} className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-sm text-gray-500">{schedule.start_time}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {schedule.booked_count} / {schedule.max_participants} booked
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Slug</span>
                  <span className="font-mono text-gray-900 dark:text-white">{product.slug}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ShowProduct.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ShowProduct;
