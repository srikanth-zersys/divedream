import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  AlertCircle,
  Shield,
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
}

interface Props {
  locations: Location[];
}

const InstructorCreate: React.FC<Props> = ({ locations }) => {
  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    languages: [] as string[],
    employment_type: 'full_time',
    hire_date: '',
    hourly_rate: '',
    daily_rate: '',
    instructor_agency: 'PADI',
    instructor_number: '',
    instructor_level: '',
    instructor_cert_expiry: '',
    teaching_certifications: [] as string[],
    insurance_provider: '',
    insurance_policy_number: '',
    insurance_expiry: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    calendar_color: '#3b82f6',
    location_ids: [] as number[],
    primary_location_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/instructors');
  };

  const handleLocationToggle = (locationId: number) => {
    const newLocationIds = data.location_ids.includes(locationId)
      ? data.location_ids.filter((id) => id !== locationId)
      : [...data.location_ids, locationId];
    setData('location_ids', newLocationIds);

    // Clear primary if unselected
    if (!newLocationIds.includes(Number(data.primary_location_id))) {
      setData('primary_location_id', '');
    }
  };

  const agencies = ['PADI', 'SSI', 'NAUI', 'SDI/TDI', 'RAID', 'BSAC', 'CMAS', 'Other'];
  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'freelance', label: 'Freelance' },
  ];
  const certifications = [
    'Open Water Instructor',
    'Advanced Open Water Instructor',
    'Master Scuba Diver Trainer',
    'IDC Staff Instructor',
    'Course Director',
    'Specialty Instructor',
    'Technical Instructor',
    'Freediving Instructor',
    'Nitrox Instructor',
  ];
  const languageOptions = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Dutch', 'Japanese', 'Chinese', 'Thai'];

  return (
    <Layout>
      <Head title="Add New Instructor" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/instructors"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Instructor</h1>
            <p className="text-gray-500 dark:text-gray-400">Create a new instructor profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  value={data.bio}
                  onChange={(e) => setData('bio', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief bio for customer-facing pages..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        const newLangs = data.languages.includes(lang)
                          ? data.languages.filter((l) => l !== lang)
                          : [...data.languages, lang];
                        setData('languages', newLangs);
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        data.languages.includes(lang)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certification Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Certification Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certifying Agency
                </label>
                <select
                  value={data.instructor_agency}
                  onChange={(e) => setData('instructor_agency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {agencies.map((agency) => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructor Number
                </label>
                <input
                  type="text"
                  value={data.instructor_number}
                  onChange={(e) => setData('instructor_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructor Level
                </label>
                <input
                  type="text"
                  value={data.instructor_level}
                  onChange={(e) => setData('instructor_level', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., MSDT, Course Director"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certification Expiry
                </label>
                <input
                  type="date"
                  value={data.instructor_cert_expiry}
                  onChange={(e) => setData('instructor_cert_expiry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teaching Certifications
                </label>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => {
                        const newCerts = data.teaching_certifications.includes(cert)
                          ? data.teaching_certifications.filter((c) => c !== cert)
                          : [...data.teaching_certifications, cert];
                        setData('teaching_certifications', newCerts);
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        data.teaching_certifications.includes(cert)
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employment Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type *
                </label>
                <select
                  value={data.employment_type}
                  onChange={(e) => setData('employment_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {employmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Hire Date
                </label>
                <input
                  type="date"
                  value={data.hire_date}
                  onChange={(e) => setData('hire_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.hourly_rate}
                  onChange={(e) => setData('hourly_rate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.daily_rate}
                  onChange={(e) => setData('daily_rate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calendar Color
                </label>
                <input
                  type="color"
                  value={data.calendar_color}
                  onChange={(e) => setData('calendar_color', e.target.value)}
                  className="w-full h-10 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Locations *</h2>
            </div>

            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={data.location_ids.includes(location.id)}
                      onChange={() => handleLocationToggle(location.id)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{location.name}</span>
                  </label>
                  {data.location_ids.includes(location.id) && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="primary_location"
                        value={location.id}
                        checked={Number(data.primary_location_id) === location.id}
                        onChange={(e) => setData('primary_location_id', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-600 dark:text-gray-400">Primary</span>
                    </label>
                  )}
                </div>
              ))}
              {errors.location_ids && <p className="mt-1 text-sm text-red-500">{errors.location_ids}</p>}
              {errors.primary_location_id && <p className="mt-1 text-sm text-red-500">{errors.primary_location_id}</p>}
            </div>
          </div>

          {/* Insurance & Emergency */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insurance & Emergency Contact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={data.insurance_provider}
                  onChange={(e) => setData('insurance_provider', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={data.insurance_policy_number}
                  onChange={(e) => setData('insurance_policy_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  value={data.insurance_expiry}
                  onChange={(e) => setData('insurance_expiry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={data.emergency_contact_name}
                      onChange={(e) => setData('emergency_contact_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={data.emergency_contact_phone}
                      onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/instructors"
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
              {processing ? 'Creating...' : 'Create Instructor'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default InstructorCreate;
