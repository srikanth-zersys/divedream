import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Save,
  Package,
  MapPin,
  DollarSign,
  Info,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Location {
  id: number;
  name: string;
}

interface Props {
  locations: Location[];
  categories: Category[];
}

const EquipmentCreate: React.FC<Props> = ({ locations, categories }) => {
  const { data, setData, post, processing, errors } = useForm({
    equipment_category_id: '',
    location_id: '',
    name: '',
    code: '',
    brand: '',
    model: '',
    serial_number: '',
    size: '',
    color: '',
    condition: 'new',
    purchase_date: '',
    purchase_price: '',
    is_available_for_rental: true,
    rental_price_per_dive: '',
    rental_price_per_day: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/equipment');
  };

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_service', label: 'Needs Service' },
    { value: 'retired', label: 'Retired' },
  ];

  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  return (
    <Layout>
      <Head title="Add Equipment" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/equipment"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Equipment</h1>
            <p className="text-gray-500 dark:text-gray-400">Add new equipment to your inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={data.equipment_category_id}
                  onChange={(e) => setData('equipment_category_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.equipment_category_id && <p className="mt-1 text-sm text-red-500">{errors.equipment_category_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <select
                  value={data.location_id}
                  onChange={(e) => setData('location_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select location...</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
                {errors.location_id && <p className="mt-1 text-sm text-red-500">{errors.location_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., BCD - Large"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipment Code *
                </label>
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., BCD-001"
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={data.brand}
                  onChange={(e) => setData('brand', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Scubapro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                <input
                  type="text"
                  value={data.model}
                  onChange={(e) => setData('model', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Hydros Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={data.serial_number}
                  onChange={(e) => setData('serial_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                <select
                  value={data.size}
                  onChange={(e) => setData('size', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select size...</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input
                  type="text"
                  value={data.color}
                  onChange={(e) => setData('color', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Black/Blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition *</label>
                <select
                  value={data.condition}
                  onChange={(e) => setData('condition', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase & Rental</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={data.purchase_date}
                  onChange={(e) => setData('purchase_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.purchase_price}
                  onChange={(e) => setData('purchase_price', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_available_for_rental}
                    onChange={(e) => setData('is_available_for_rental', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">Available for rental</span>
                </label>
              </div>
              {data.is_available_for_rental && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rental Price per Dive
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.rental_price_per_dive}
                      onChange={(e) => setData('rental_price_per_dive', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rental Price per Day
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.rental_price_per_day}
                      onChange={(e) => setData('rental_price_per_day', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Notes</h2>
            </div>

            <textarea
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Any additional notes about this equipment..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/equipment"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EquipmentCreate;
