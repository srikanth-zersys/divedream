import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Copy,
  Eye,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Globe,
} from 'lucide-react';

interface WaiverTemplate {
  id: number;
  name: string;
  type: string;
  language: string;
  is_required: boolean;
  is_active: boolean;
  version: number;
  location_id: number | null;
  location?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface WaiverType {
  value: string;
  label: string;
  description: string;
}

interface Language {
  code: string;
  name: string;
}

interface Props {
  waivers: WaiverTemplate[];
  types: WaiverType[];
  languages: Language[];
}

const WaiversIndex: React.FC<Props> = ({ waivers, types, languages }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredWaivers = waivers.filter((waiver) => {
    if (searchQuery && !waiver.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType && waiver.type !== filterType) {
      return false;
    }
    if (filterStatus === 'active' && !waiver.is_active) {
      return false;
    }
    if (filterStatus === 'inactive' && waiver.is_active) {
      return false;
    }
    return true;
  });

  const getTypeLabel = (type: string) => {
    return types.find((t) => t.value === type)?.label || type;
  };

  const getLanguageName = (code: string) => {
    return languages.find((l) => l.code === code)?.name || code;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      liability: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      medical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      photo_release: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      rental_agreement: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type] || colors.custom;
  };

  const handleDelete = (waiver: WaiverTemplate) => {
    if (confirm(`Are you sure you want to delete "${waiver.name}"? This action cannot be undone.`)) {
      router.delete(route('admin.waivers.destroy', waiver.id));
    }
  };

  const handleDuplicate = (waiver: WaiverTemplate) => {
    router.post(route('admin.waivers.duplicate', waiver.id));
  };

  const handleToggleActive = (waiver: WaiverTemplate) => {
    router.put(route('admin.waivers.update', waiver.id), {
      ...waiver,
      is_active: !waiver.is_active,
    }, {
      preserveScroll: true,
    });
  };

  return (
    <Layout>
      <Head title="Waivers & Documents" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Waivers & Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage liability waivers, medical forms, and other documents
            </p>
          </div>
          <Link
            href={route('admin.waivers.create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Waivers List */}
        {filteredWaivers.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 font-medium">Template</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Language</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Required</th>
                  <th className="px-6 py-3 font-medium">Version</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWaivers.map((waiver) => (
                  <tr key={waiver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {waiver.name}
                        </div>
                        {waiver.location && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {waiver.location.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(waiver.type)}`}>
                        {getTypeLabel(waiver.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Globe className="w-4 h-4" />
                        {getLanguageName(waiver.language)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(waiver)}
                        className={`flex items-center gap-2 text-sm ${
                          waiver.is_active
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {waiver.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {waiver.is_required ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Required
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      v{waiver.version}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('admin.waivers.preview', waiver.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(waiver)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={route('admin.waivers.edit', waiver.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(waiver)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {waivers.length === 0 ? 'No waiver templates yet' : 'No matching templates'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {waivers.length === 0
                ? 'Create your first waiver template to collect digital signatures from customers.'
                : 'Try adjusting your search or filters.'}
            </p>
            {waivers.length === 0 && (
              <Link
                href={route('admin.waivers.create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </Link>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Liability Waiver
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Standard release of liability and assumption of risk for diving activities.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Medical Questionnaire
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  RSTC/PADI medical statement to identify diving contraindications.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Photo Release
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Consent for using photos and videos for marketing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WaiversIndex;
