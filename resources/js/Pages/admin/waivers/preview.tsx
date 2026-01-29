import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Edit,
  Printer,
  FileText,
  CheckCircle,
  Pen,
} from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  logo_url?: string;
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
}

interface Props {
  waiver: WaiverTemplate;
  tenant: Tenant;
}

const WaiverPreview: React.FC<Props> = ({ waiver, tenant }) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <>
      <Head title={`Preview: ${waiver.name}`} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/waivers/${waiver.id}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Waiver Preview
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Preview how the waiver will appear to customers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              href={`/admin/waivers/${waiver.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Preview Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Preview Mode
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This is how customers will see the waiver. The signature below is for demonstration only.
              </p>
            </div>
          </div>
        </div>

        {/* Waiver Document */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border-0 print:shadow-none">
          {/* Document Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center print:border-b-2">
            {tenant.logo_url && (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-12 mx-auto mb-4"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {waiver.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {getTypeLabel(waiver.type)} - Version {waiver.version}
            </p>
          </div>

          {/* Document Content */}
          <div className="p-6 print:p-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none print:text-sm"
              dangerouslySetInnerHTML={{ __html: waiver.content }}
            />
          </div>

          {/* Signature Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 print:bg-white">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acknowledgement & Signature
            </h3>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                I have read and understand the above terms. I acknowledge that I am voluntarily
                participating in the activities described and accept all associated risks.
              </span>
            </label>

            {/* Signature Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="Type your full name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString()}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Signature Preview */}
            {signature && (
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Signature Preview:</p>
                <p className="text-2xl font-script text-gray-900 dark:text-white" style={{ fontFamily: 'cursive' }}>
                  {signature}
                </p>
              </div>
            )}

            {/* Submit Button (Demo) */}
            <div className="mt-6 print:hidden">
              <button
                disabled={!agreed || !signature}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  agreed && signature
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {agreed && signature ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Sign Waiver
                  </>
                ) : (
                  <>
                    <Pen className="w-5 h-5" />
                    Complete all fields to sign
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                This is a preview. No actual signature will be recorded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

WaiverPreview.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default WaiverPreview;
