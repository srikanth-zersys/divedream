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

interface Props {
  types: WaiverType[];
  languages: Language[];
  locations: Location[];
}

const WaiverCreate: React.FC<Props> = ({ types, languages, locations }) => {
  const [showPreview, setShowPreview] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: 'liability',
    language: 'en',
    content: '',
    is_required: true,
    is_active: true,
    location_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.waivers.store'));
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

  return (
    <Layout>
      <Head title="Create Waiver Template" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.waivers.index')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Waiver Template
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create a new waiver or document template for customer signatures
            </p>
          </div>
        </div>

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
                      placeholder="Enter the waiver content here...

You can use these placeholders:
{{customer_name}} - Customer's full name
{{date}} - Current date
{{company_name}} - Your business name"
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

              {/* Type Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Document Types
                </h2>
                <div className="space-y-3">
                  {types.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 rounded-lg border ${
                        data.type === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(
                            type.value
                          )}`}
                        >
                          {type.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  ))}
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
              {processing ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default WaiverCreate;
