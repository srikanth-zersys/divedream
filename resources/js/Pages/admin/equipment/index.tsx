import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Equipment, EquipmentCategory, Pagination } from '@/types/dive-club';

interface Props {
  equipment: Pagination<Equipment>;
  categories: EquipmentCategory[];
  stats: {
    total: number;
    available: number;
    inUse: number;
    needsService: number;
  };
  filters: {
    search?: string;
    category_id?: string;
    status?: string;
    condition?: string;
  };
}

const EquipmentIndex: React.FC<Props> = ({ equipment, categories, stats, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/equipment', { ...filters, search }, { preserveState: true });
  };

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/equipment', { ...filters, [key]: value }, { preserveState: true });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_use: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      retired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[status] || styles.available;
  };

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      new: 'bg-emerald-100 text-emerald-800',
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      needs_service: 'bg-red-100 text-red-800',
      retired: 'bg-gray-100 text-gray-800',
    };
    return styles[condition] || styles.good;
  };

  const hasActiveFilters = filters.category_id || filters.status || filters.condition;

  return (
    <>
      <Head title="Equipment" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your dive equipment inventory
            </p>
          </div>
          <Link
            href="/admin/equipment/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.available}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inUse}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">In Use</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.needsService > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.needsService > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needsService}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Needs Service</div>
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
                  placeholder="Search by name, code, or serial number..."
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
                value={filters.category_id || ''}
                onChange={(e) => handleFilter('category_id', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              <select
                value={filters.condition || ''}
                onChange={(e) => handleFilter('condition', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="needs_service">Needs Service</option>
              </select>
            </div>
          )}
        </div>

        {/* Equipment Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {equipment.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No equipment found
                    </td>
                  </tr>
                ) : (
                  equipment.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div>
                          <Link href={`/admin/equipment/${item.id}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600">
                            {item.name}
                          </Link>
                          <div className="text-sm text-gray-500 font-mono">{item.code}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.category?.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.size || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getConditionBadge(item.condition)}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.usage_count}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/equipment/${item.id}`} className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link href={`/admin/equipment/${item.id}/edit`} className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => router.get(`/admin/equipment/${item.id}`, {}, { preserveState: true })}
                            className="p-1 text-gray-400 hover:text-orange-600"
                            title="Log Maintenance"
                          >
                            <Wrench className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {equipment.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {equipment.from} to {equipment.to} of {equipment.total}
              </div>
              <div className="flex items-center gap-2">
                {equipment.links.map((link, i) => (
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

EquipmentIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default EquipmentIndex;
