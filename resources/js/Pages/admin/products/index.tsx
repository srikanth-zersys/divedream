import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Package,
  Star,
  DollarSign,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Globe,
  GlobeLock,
} from 'lucide-react';
import { Product, Pagination } from '@/types/dive-club';

interface Props {
  products: Pagination<Product>;
  stats: {
    total: number;
    active: number;
    featured: number;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
  };
}

const ProductsIndex: React.FC<Props> = ({ products, stats, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/products', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/products', { ...filters, [key]: value }, { preserveState: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[status] || styles.draft;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fun_dive: 'Fun Dive',
      course: 'Course',
      discover_scuba: 'Discover Scuba',
      private_trip: 'Private Trip',
      boat_charter: 'Boat Charter',
      equipment_rental: 'Equipment Rental',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fun_dive: 'bg-blue-100 text-blue-800',
      course: 'bg-purple-100 text-purple-800',
      discover_scuba: 'bg-green-100 text-green-800',
      private_trip: 'bg-amber-100 text-amber-800',
      boat_charter: 'bg-cyan-100 text-cyan-800',
      equipment_rental: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const hasActiveFilters = filters.type || filters.status;

  return (
    <>
      <Head title="Products" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products & Experiences</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your dive products, courses, and experiences
            </p>
          </div>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Products</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featured}</div>
                <div className="text-sm text-gray-500">Featured</div>
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
                  placeholder="Search products..."
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
                value={filters.type || ''}
                onChange={(e) => handleFilter('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Types</option>
                <option value="fun_dive">Fun Dive</option>
                <option value="course">Course</option>
                <option value="discover_scuba">Discover Scuba</option>
                <option value="private_trip">Private Trip</option>
                <option value="boat_charter">Boat Charter</option>
                <option value="equipment_rental">Equipment Rental</option>
              </select>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.data.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No products found</p>
              <Link href="/admin/products/create" className="mt-4 inline-flex items-center gap-2 text-blue-600">
                <Plus className="w-4 h-4" /> Create your first product
              </Link>
            </div>
          ) : (
            products.data.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(product.type)}`}>
                      {getTypeLabel(product.type)}
                    </span>
                    {product.is_featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Star className="w-3 h-3 inline mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    {product.show_on_website ? (
                      <Globe className="w-4 h-4 text-green-500 flex-shrink-0" title="Published" />
                    ) : (
                      <GlobeLock className="w-4 h-4 text-gray-400 flex-shrink-0" title="Not published" />
                    )}
                  </div>

                  {product.short_description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
                      <span className="text-xs text-gray-500">
                        /{product.price_type === 'per_person' ? 'person' : product.price_type === 'per_group' ? 'group' : 'flat'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {product.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {product.duration_minutes >= 60 ? `${Math.floor(product.duration_minutes / 60)}h` : `${product.duration_minutes}m`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {product.max_participants}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
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
        {products.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {products.links.map((link, i) => (
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

ProductsIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ProductsIndex;
