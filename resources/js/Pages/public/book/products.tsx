import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Search,
  Filter,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Waves,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Product, Pagination } from '@/types/dive-club';

interface Props {
  tenant: {
    name: string;
    logo: string | null;
    primary_color: string;
  };
  location: {
    name: string;
  } | null;
  products: Pagination<Product>;
  types: string[];
  categories: string[];
  filters: {
    search?: string;
    type?: string;
    category?: string;
  };
}

const ProductsListing: React.FC<Props> = ({
  tenant,
  location,
  products,
  types,
  categories,
  filters,
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fun_dive: 'Fun Dive',
      course: 'Course',
      discover_scuba: 'Try Diving',
      private_trip: 'Private',
      boat_charter: 'Charter',
      snorkeling: 'Snorkeling',
      night_dive: 'Night Dive',
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/book/products', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key as keyof typeof newFilters];
    router.get('/book/products', newFilters, { preserveState: true });
  };

  const clearFilters = () => {
    router.get('/book/products', {}, { preserveState: true });
  };

  const hasActiveFilters = filters.type || filters.category || filters.search;

  return (
    <>
      <Head title={`All Experiences - ${tenant.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/book" className="flex items-center gap-3">
                  {tenant.logo ? (
                    <img src={tenant.logo} alt={tenant.name} className="h-10 w-auto" />
                  ) : (
                    <Waves className="w-8 h-8" style={{ color: tenant.primary_color }} />
                  )}
                  <span className="text-xl font-bold text-gray-900">{tenant.name}</span>
                </Link>
              </div>
              {location && (
                <div className="hidden md:flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{location.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link href="/book" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Experiences</h1>
            <p className="text-gray-600 mt-2">
              Explore our complete range of diving activities and courses
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search experiences..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>

              {/* Filters (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilter('type', e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {getProductTypeLabel(type)}
                    </option>
                  ))}
                </select>

                {categories.length > 0 && (
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilter('category', e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2.5 text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilter('type', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {getProductTypeLabel(type)}
                    </option>
                  ))}
                </select>

                {categories.length > 0 && (
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilter('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-gray-600">
            Showing {products.from || 0}-{products.to || 0} of {products.total} experiences
          </div>

          {/* Products Grid */}
          {products.data.length === 0 ? (
            <div className="text-center py-16">
              <Waves className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.data.map((product) => (
                <Link
                  key={product.id}
                  href={`/book/product/${product.slug}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all group"
                >
                  {/* Product Image */}
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Waves className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {/* Type Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {getProductTypeLabel(product.type)}
                    </span>
                    {product.is_featured && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {product.short_description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {product.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(product.duration_minutes / 60)}h
                          {product.duration_minutes % 60 > 0 && ` ${product.duration_minutes % 60}m`}
                        </span>
                      )}
                      {product.max_participants && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Max {product.max_participants}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-gray-500 text-sm"> / person</span>
                      </div>
                      <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                        View
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {products.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous */}
              <Link
                href={products.prev_page_url || '#'}
                className={`p-2 rounded-lg border ${
                  products.prev_page_url
                    ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                preserveState
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              {/* Page Numbers */}
              {products.links
                .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                .map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      link.active
                        ? 'bg-blue-600 text-white'
                        : link.url
                        ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        : 'text-gray-400'
                    }`}
                    preserveState
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}

              {/* Next */}
              <Link
                href={products.next_page_url || '#'}
                className={`p-2 rounded-lg border ${
                  products.next_page_url
                    ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                preserveState
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ProductsListing;
