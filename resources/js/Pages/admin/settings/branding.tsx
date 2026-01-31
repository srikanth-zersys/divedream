import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Palette,
  Image,
  Type,
  Save,
  Upload,
  Eye,
  Trash2,
} from 'lucide-react';

interface Props {
  tenant: {
    id: number;
    name: string;
    logo_url?: string;
    favicon_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: string;
    custom_css?: string;
  };
  fonts: string[];
}

const BrandingSettings: React.FC<Props> = ({ tenant, fonts }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(tenant.favicon_url || null);

  const { data, setData, post, processing, errors } = useForm({
    primary_color: tenant.primary_color || '#3B82F6',
    secondary_color: tenant.secondary_color || '#1E40AF',
    accent_color: tenant.accent_color || '#F59E0B',
    font_family: tenant.font_family || 'Inter',
    custom_css: tenant.custom_css || '',
    logo: null as File | null,
    favicon: null as File | null,
    remove_logo: false,
    remove_favicon: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/settings/branding', {
      forceFormData: true,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('logo', file);
      setData('remove_logo', false);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('favicon', file);
      setData('remove_favicon', false);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setData('logo', null);
    setData('remove_logo', true);
    setLogoPreview(null);
  };

  const removeFavicon = () => {
    setData('favicon', null);
    setData('remove_favicon', true);
    setFaviconPreview(null);
  };

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF' },
    { name: 'Green', primary: '#10B981', secondary: '#047857' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#6D28D9' },
    { name: 'Red', primary: '#EF4444', secondary: '#B91C1C' },
    { name: 'Orange', primary: '#F97316', secondary: '#C2410C' },
    { name: 'Teal', primary: '#14B8A6', secondary: '#0D9488' },
  ];

  return (
    <>
      <Head title="Branding Settings" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branding</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Customize your brand appearance for customers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo & Favicon */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Logo & Favicon</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Image className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                      <p className="text-xs text-gray-500">PNG, JPG, SVG. Max 2MB. Recommended: 400x100px</p>
                    </div>
                  </div>
                  {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favicon
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Favicon</span>
                        <input
                          type="file"
                          accept="image/*,.ico"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                      </label>
                      {faviconPreview && (
                        <button
                          type="button"
                          onClick={removeFavicon}
                          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                      <p className="text-xs text-gray-500">ICO, PNG. Max 500KB. Recommended: 32x32px</p>
                    </div>
                  </div>
                  {errors.favicon && <p className="mt-1 text-sm text-red-600">{errors.favicon}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brand Colors</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setData('primary_color', preset.primary);
                        setData('secondary_color', preset.secondary);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} />
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }} />
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.primary_color}
                      onChange={(e) => setData('primary_color', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.primary_color}
                      onChange={(e) => setData('primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.secondary_color}
                      onChange={(e) => setData('secondary_color', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.secondary_color}
                      onChange={(e) => setData('secondary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.accent_color}
                      onChange={(e) => setData('accent_color', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.accent_color}
                      onChange={(e) => setData('accent_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      style={{ backgroundColor: data.primary_color }}
                      className="px-4 py-2 text-white rounded-lg"
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: data.secondary_color }}
                      className="px-4 py-2 text-white rounded-lg"
                    >
                      Secondary
                    </button>
                    <span style={{ color: data.accent_color }} className="font-semibold">
                      Accent Text
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Type className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Typography</h2>
              </div>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Family
                </label>
                <select
                  value={data.font_family}
                  onChange={(e) => setData('font_family', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {(fonts || ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro']).map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Custom CSS (Advanced)</h2>
            </div>
            <div className="p-6">
              <textarea
                value={data.custom_css}
                onChange={(e) => setData('custom_css', e.target.value)}
                placeholder={`/* Add custom styles here */\n.booking-button {\n  border-radius: 8px;\n}`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                rows={8}
              />
              <p className="mt-2 text-xs text-gray-500">
                Custom CSS will be applied to your public booking pages. Use with caution.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

BrandingSettings.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default BrandingSettings;
