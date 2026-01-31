import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Save,
  FileText,
  Globe,
  MapPin,
  AlertCircle,
  Eye,
  History,
} from 'lucide-react';

interface WaiverType {
  value: string;
  label: string;
  description: string;
}

interface Language {
  code: string;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface WaiverTemplate {
  id: number;
  name: string;
  type: string;
  language: string;
  content: string;
  is_required: boolean;
  is_active: boolean;
  version: number;
  location_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  waiver: WaiverTemplate;
  types: WaiverType[];
  languages: Language[];
  locations: Location[];
}

const WaiverEdit: React.FC<Props> = ({ waiver, types, languages, locations }) => {
  const [showPreview, setShowPreview] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    name: waiver.name,
    type: waiver.type,
    language: waiver.language,
    content: waiver.content,
    is_required: waiver.is_required,
    is_active: waiver.is_active,
    location_id: waiver.location_id?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.waivers.update', waiver.id));
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

  const selectedType = types.find((t) => t.value === data.type);
  const contentChanged = data.content !== waiver.content;

  return (
    <Layout>
      <Head title={`Edit: ${waiver.name}`} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.waivers.index')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Waiver Template
              </h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(waiver.type)}`}>
                {types.find(t => t.value === waiver.type)?.label}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {waiver.name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <History className="w-4 h-4" />
            Version {waiver.version}
          </div>
        </div>

        {contentChanged && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200">
                  Content Modified
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Changing the document content will increment the version number. Previously signed waivers will retain their original version.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Template Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Standard Liability Waiver"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Document Type *
                      </label>
                      <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {types.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {selectedType && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {selectedType.description}
                        </p>
                      )}
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Language *
                      </label>
                      <select
                        value={data.language}
                        onChange={(e) => setData('language', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      {errors.language && (
                        <p className="mt-1 text-sm text-red-500">{errors.language}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location (Optional)
                    </label>
                    <select
                      value={data.location_id}
                      onChange={(e) => setData('location_id', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Leave empty to use this template at all locations
                    </p>
                    {errors.location_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.location_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document Content
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[400px]"
                    dangerouslySetInnerHTML={{
                      __html: data.content
                        .replace(/\n/g, '<br>')
                        .replace(/{{customer_name}}/g, '<strong>[Customer Name]</strong>')
                        .replace(/{{date}}/g, '<strong>[Date]</strong>')
                        .replace(/{{company_name}}/g, '<strong>[Company Name]</strong>'),
                    }}
                  />
                ) : (
                  <>
                    <textarea
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Enter the waiver content here..."
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Tip: Use placeholders like {'{{customer_name}}'}, {'{{date}}'}, {'{{company_name}}'} for dynamic content.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Active
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable this template for customer use
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Required
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customers must sign before booking
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={data.is_required}
                      onChange={(e) => setData('is_required', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Version Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Version History
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Current Version
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated {new Date(waiver.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      v{waiver.version}
                    </span>
                  </div>
                  {contentChanged && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div>
                        <span className="font-medium text-amber-800 dark:text-amber-200">
                          After Save
                        </span>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Content changes detected
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        v{waiver.version + 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Placeholders */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Placeholders
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <code className="text-blue-600 dark:text-blue-400">{'{{customer_name}}'}</code>
                    <span className="text-gray-500 dark:text-gray-400">Full name</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <code className="text-blue-600 dark:text-blue-400">{'{{date}}'}</code>
                    <span className="text-gray-500 dark:text-gray-400">Current date</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <code className="text-blue-600 dark:text-blue-400">{'{{company_name}}'}</code>
                    <span className="text-gray-500 dark:text-gray-400">Business name</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <code className="text-blue-600 dark:text-blue-400">{'{{activity_name}}'}</code>
                    <span className="text-gray-500 dark:text-gray-400">Booked activity</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Template Info
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(waiver.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(waiver.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Template ID</span>
                    <span className="text-gray-900 dark:text-white">#{waiver.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={route('admin.waivers.index')}
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
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default WaiverEdit;
