import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Save, Package, DollarSign, Users, Trash2 } from 'lucide-react';

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
}

interface Props {
  product: Product;
}

const EditProduct: React.FC<Props> = ({ product }) => {
  const { data, setData, put, processing, errors, delete: destroy } = useForm({
    name: product.name || '',
    slug: product.slug || '',
    type: product.type || 'fun_dive',
    short_description: product.short_description || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    price_type: product.price_type || 'per_person',
    duration_minutes: product.duration_minutes?.toString() || '',
    max_participants: product.max_participants?.toString() || '',
    min_participants: product.min_participants?.toString() || '1',
    minimum_certification: product.minimum_certification || '',
    included_items: product.included_items || '',
    what_to_bring: product.what_to_bring || '',
    is_featured: product.is_featured || false,
    show_on_website: product.show_on_website ?? true,
    status: product.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/products/${product.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      destroy(`/admin/products/${product.id}`);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <>
      <Head title={`Edit Product - ${product.name}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
              <p className="text-gray-500 mt-1">{product.name}</p>
            </div>
          </div>
          <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => {
                    setData('name', e.target.value);
                    if (!data.slug || data.slug === generateSlug(product.name)) {
                      setData('slug', generateSlug(e.target.value));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', generateSlug(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                <select
                  value={data.type}
                  onChange={(e) => setData('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="fun_dive">Fun Dive</option>
                  <option value="course">Course</option>
                  <option value="discover_scuba">Discover Scuba</option>
                  <option value="private_trip">Private Trip</option>
                  <option value="boat_charter">Boat Charter</option>
                  <option value="equipment_rental">Equipment Rental</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
                <input
                  type="text"
                  value={data.short_description}
                  onChange={(e) => setData('short_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  maxLength={200}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Type</label>
                <select
                  value={data.price_type}
                  onChange={(e) => setData('price_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="per_person">Per Person</option>
                  <option value="per_group">Per Group</option>
                  <option value="flat">Flat Rate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Capacity & Duration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={data.duration_minutes}
                  onChange={(e) => setData('duration_minutes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Participants</label>
                <input
                  type="number"
                  value={data.min_participants}
                  onChange={(e) => setData('min_participants', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Participants *</label>
                <input
                  type="number"
                  value={data.max_participants}
                  onChange={(e) => setData('max_participants', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Show on Website</div>
                  <div className="text-sm text-gray-500">Visible on public booking page</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.show_on_website}
                    onChange={(e) => setData('show_on_website', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Featured</div>
                  <div className="text-sm text-gray-500">Highlight on homepage</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/products" className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

EditProduct.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default EditProduct;
