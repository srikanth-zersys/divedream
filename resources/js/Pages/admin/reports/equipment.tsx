import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import { ArrowLeft, Package, Download, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  serial_number: string | null;
  status: string;
  condition: string;
  next_maintenance_date: string | null;
  category?: {
    name: string;
  };
}

interface Props {
  equipment: Record<string, Equipment[]>;
  maintenanceDue: Equipment[];
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  in_use: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  retired: 'bg-gray-100 text-gray-700',
};

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  needs_service: 'bg-orange-100 text-orange-700',
  retired: 'bg-gray-100 text-gray-700',
};

const EquipmentReport: React.FC<Props> = ({ equipment, maintenanceDue }) => {
  const allEquipment = Object.values(equipment).flat();
  const totalCount = allEquipment.length;
  const availableCount = (equipment['available'] || []).length;
  const inUseCount = (equipment['in_use'] || []).length;
  const maintenanceCount = (equipment['maintenance'] || []).length;

  const formatDate = (date: string | null) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <Head title="Equipment Report" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/reports"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipment Report</h1>
              <p className="text-gray-600">Equipment status and maintenance tracking</p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inUseCount}</p>
                <p className="text-sm text-gray-500">In Use</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{maintenanceCount}</p>
                <p className="text-sm text-gray-500">In Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Alerts */}
        {maintenanceDue.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-800">
                Maintenance Due ({maintenanceDue.length} items)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceDue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/admin/equipment/${item.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      {item.serial_number && (
                        <p className="text-sm text-gray-500">SN: {item.serial_number}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        CONDITION_COLORS[item.condition] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.condition}
                    </span>
                  </div>
                  <p className="text-sm text-amber-600 mt-2">
                    Due: {formatDate(item.next_maintenance_date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(equipment).map(([status, items]) => (
            <div
              key={status}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      status === 'available'
                        ? 'bg-green-500'
                        : status === 'in_use'
                        ? 'bg-blue-500'
                        : status === 'maintenance'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  {status.replace('_', ' ')}
                </h2>
                <span className="text-sm text-gray-500">{items.length} items</span>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No equipment in this status
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/admin/equipment/${item.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {item.category && (
                              <span className="text-xs text-gray-500">
                                {item.category.name}
                              </span>
                            )}
                            {item.serial_number && (
                              <span className="text-xs text-gray-400">
                                SN: {item.serial_number}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            CONDITION_COLORS[item.condition] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.condition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default EquipmentReport;
