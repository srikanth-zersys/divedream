import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Edit,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Wrench,
  History,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  code: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  size: string | null;
  color: string | null;
  condition: string;
  status: string;
  purchase_date: string | null;
  purchase_price: number | null;
  last_service_date: string | null;
  next_service_date: string | null;
  is_available_for_rental: boolean;
  rental_price_per_dive: number | null;
  rental_price_per_day: number | null;
  notes: string | null;
  category: { id: number; name: string; icon: string };
  location: { id: number; name: string };
  maintenance_logs: Array<{
    id: number;
    type: string;
    description: string;
    cost: number | null;
    performed_by: string | null;
    service_date: string;
  }>;
}

interface UsageRecord {
  id: number;
  checked_out_at: string;
  returned_at: string | null;
  booking: {
    id: number;
    booking_number: string;
    member: { first_name: string; last_name: string } | null;
    product: { name: string } | null;
  };
}

interface Props {
  equipment: Equipment;
  usageHistory: UsageRecord[];
}

const EquipmentShow: React.FC<Props> = ({ equipment, usageHistory }) => {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const maintenanceForm = useForm({
    type: 'service',
    description: '',
    cost: '',
    performed_by: '',
    next_service_date: '',
  });

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    maintenanceForm.post(`/admin/equipment/${equipment.id}/maintenance`, {
      onSuccess: () => {
        setShowMaintenanceModal(false);
        maintenanceForm.reset();
      },
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      needs_service: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      retired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    };
    return styles[condition] || styles.good;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_use: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      reserved: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      maintenance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      retired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    };
    return styles[status] || styles.available;
  };

  const needsService = equipment.condition === 'needs_service' ||
    (equipment.next_service_date && new Date(equipment.next_service_date) <= new Date());

  return (
    <Layout>
      <Head title={`${equipment.name} - ${equipment.code}`} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/equipment"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{equipment.name}</h1>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-sm">
                  {equipment.code}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(equipment.status)}`}>
                  {equipment.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getConditionBadge(equipment.condition)}`}>
                  {equipment.condition.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Wrench className="w-4 h-4" />
              Log Maintenance
            </button>
            <Link
              href={`/admin/equipment/${equipment.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Alert */}
        {needsService && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Service Required</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This equipment needs maintenance. Please schedule a service.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Equipment Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.category?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {equipment.location?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Brand</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.brand || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Model</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.model || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Serial Number</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Size</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.size || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Color</span>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.color || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance History</h2>
              </div>
              {equipment.maintenance_logs && equipment.maintenance_logs.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {equipment.maintenance_logs.map((log) => (
                    <div key={log.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                            {log.type}
                          </span>
                          <p className="mt-2 text-gray-900 dark:text-white">{log.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(log.service_date)} {log.performed_by && `by ${log.performed_by}`}
                          </p>
                        </div>
                        {log.cost && (
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatCurrency(log.cost)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No maintenance records</p>
                </div>
              )}
            </div>

            {/* Usage History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usage History</h2>
              </div>
              {usageHistory.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {usageHistory.map((usage) => (
                    <div key={usage.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/admin/bookings/${usage.booking.id}`}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {usage.booking.booking_number}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {usage.booking.member?.first_name} {usage.booking.member?.last_name} - {usage.booking.product?.name}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-900 dark:text-white">{formatDate(usage.checked_out_at)}</p>
                          {usage.returned_at ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Returned
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">In use</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No usage records</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Info</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Purchase Date</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(equipment.purchase_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Purchase Price</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(equipment.purchase_price)}</span>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Info</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Service</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(equipment.last_service_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Next Service</span>
                  <span className={needsService ? 'text-red-600' : 'text-gray-900 dark:text-white'}>
                    {formatDate(equipment.next_service_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Info */}
            {equipment.is_available_for_rental && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rental Pricing</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Per Dive</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(equipment.rental_price_per_dive)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Per Day</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(equipment.rental_price_per_day)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {equipment.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{equipment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Maintenance</h3>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  value={maintenanceForm.data.type}
                  onChange={(e) => maintenanceForm.setData('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="inspection">Inspection</option>
                  <option value="service">Service</option>
                  <option value="repair">Repair</option>
                  <option value="replacement">Part Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={maintenanceForm.data.description}
                  onChange={(e) => maintenanceForm.setData('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the work performed..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintenanceForm.data.cost}
                    onChange={(e) => maintenanceForm.setData('cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Performed By</label>
                  <input
                    type="text"
                    value={maintenanceForm.data.performed_by}
                    onChange={(e) => maintenanceForm.setData('performed_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Service Date
                </label>
                <input
                  type="date"
                  value={maintenanceForm.data.next_service_date}
                  onChange={(e) => maintenanceForm.setData('next_service_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={maintenanceForm.processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {maintenanceForm.processing ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EquipmentShow;
