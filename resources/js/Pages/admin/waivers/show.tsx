import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Edit,
  Eye,
  Copy,
  Trash2,
  FileText,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
} from 'lucide-react';

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
  location?: Location;
  created_at: string;
  updated_at: string;
}

interface Props {
  waiver: WaiverTemplate;
}

const WaiverShow: React.FC<Props> = ({ waiver }) => {
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      liability: 'Liability Waiver',
      medical: 'Medical Questionnaire',
      photo_release: 'Photo Release',
      rental_agreement: 'Rental Agreement',
      custom: 'Custom Document',
    };
    return types[type] || type;
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

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      de: 'German',
      fr: 'French',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      th: 'Thai',
      ja: 'Japanese',
      zh: 'Chinese',
    };
    return languages[code] || code;
  };

  return (
    <>
      <Head title={`Waiver: ${waiver.name}`} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/waivers"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {waiver.name}
                </h1>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(waiver.type)}`}>
                  {getTypeLabel(waiver.type)}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Version {waiver.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/waivers/${waiver.id}/preview`}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <Link
              href={`/admin/waivers/${waiver.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waiver Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document Content
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: waiver.content }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`flex items-center gap-1.5 font-medium ${
                    waiver.is_active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {waiver.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Required</span>
                  <span className={`font-medium ${
                    waiver.is_required
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {waiver.is_required ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Language</span>
                  <span className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {getLanguageName(waiver.language)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Version</span>
                  <span className="text-gray-900 dark:text-white">v{waiver.version}</span>
                </div>

                {waiver.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Location</span>
                    <span className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {waiver.location.name}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    Created {new Date(waiver.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Updated {new Date(waiver.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  href={`/admin/waivers/${waiver.id}/edit`}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Template
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Duplicate this waiver template?')) {
                      // POST to duplicate
                    }
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this waiver template?')) {
                      // DELETE waiver
                    }
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

WaiverShow.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default WaiverShow;
