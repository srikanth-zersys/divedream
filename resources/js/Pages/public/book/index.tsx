import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Star,
  Waves,
  Award,
  Shield,
} from 'lucide-react';
import { Product, Schedule } from '@/types/dive-club';

interface Props {
  tenant: {
    name: string;
    logo: string | null;
    description: string | null;
    primary_color: string;
  };
  location: {
    name: string;
    address: string;
  } | null;
  featuredProducts: Product[];
  upcomingSchedules: (Schedule & { available_spots: number })[];
}

const BookingLanding: React.FC<Props> = ({
  tenant,
  location,
  featuredProducts,
  upcomingSchedules,
}) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fun_dive: 'Fun Dive',
      course: 'Course',
      discover_scuba: 'Try Diving',
      private_trip: 'Private',
      boat_charter: 'Charter',
    };
    return labels[type] || type;
  };

  return (
    <>
      <Head title={`Book Online - ${tenant.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {tenant.logo ? (
                  <img src={tenant.logo} alt={tenant.name} className="h-10 w-auto" />
                ) : (
                  <Waves className="w-8 h-8" style={{ color: tenant.primary_color }} />
                )}
                <span className="text-xl font-bold text-gray-900">{tenant.name}</span>
              </div>
              {location && (
                <div className="hidden md:flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{location.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          className="relative py-20 px-4"
          style={{
            background: `linear-gradient(135deg, ${tenant.primary_color}15, ${tenant.primary_color}05)`,
          }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book Your Dive Adventure
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {tenant.description || 'Explore the underwater world with our professional team. Book your dive experience online in just a few clicks.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: tenant.primary_color }}
              >
                Browse All Experiences
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#upcoming"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Available Dates
              </a>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Safe Diving</div>
                  <div className="text-sm text-gray-500">Safety first always</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Certified</div>
                  <div className="text-sm text-gray-500">Professional instructors</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Top Rated</div>
                  <div className="text-sm text-gray-500">5-star experiences</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Small Groups</div>
                  <div className="text-sm text-gray-500">Personal attention</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Popular Experiences</h2>
                  <p className="text-gray-600 mt-1">Our most booked diving adventures</p>
                </div>
                <Link
                  href="/book/products"
                  className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: tenant.primary_color }}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/book/product/${product.slug}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Waves className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                          {getProductTypeLabel(product.type)}
                        </span>
                      </div>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                            Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.short_description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            / {product.price_type === 'per_person' ? 'person' : 'group'}
                          </span>
                        </div>
                        {product.duration_minutes && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {product.duration_minutes >= 60
                              ? `${Math.floor(product.duration_minutes / 60)}h${product.duration_minutes % 60 > 0 ? ` ${product.duration_minutes % 60}m` : ''}`
                              : `${product.duration_minutes}m`}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <section id="upcoming" className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Available Dates</h2>
                <p className="text-gray-600 mt-1">Book your spot on one of our upcoming dives</p>
              </div>

              <div className="space-y-4">
                {upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-4 mb-4 md:mb-0">
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white"
                        style={{ backgroundColor: tenant.primary_color }}
                      >
                        <span className="text-xs font-medium">
                          {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold">
                          {new Date(schedule.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {schedule.product?.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(schedule.start_time)}
                          </span>
                          {schedule.instructor && (
                            <span>with {schedule.instructor.first_name}</span>
                          )}
                          {schedule.dive_site && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {schedule.dive_site.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {schedule.available_spots} spots left
                        </div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(schedule.price_override || schedule.product?.price || 0)}
                        </div>
                      </div>
                      <Link
                        href={`/book/checkout?schedule=${schedule.id}&participants=1`}
                        className="px-4 py-2 text-white rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: tenant.primary_color }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/book/products"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  Don't see a date that works?
                  <span className="font-medium" style={{ color: tenant.primary_color }}>
                    Browse all experiences
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {tenant.logo ? (
                    <img src={tenant.logo} alt={tenant.name} className="h-8 w-auto brightness-0 invert" />
                  ) : (
                    <Waves className="w-8 h-8 text-blue-400" />
                  )}
                  <span className="text-xl font-bold">{tenant.name}</span>
                </div>
                {location && (
                  <p className="text-gray-400">{location.address}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/book/products" className="hover:text-white">
                      All Experiences
                    </Link>
                  </li>
                  <li>
                    <Link href="/booking/lookup" className="hover:text-white">
                      Manage Booking
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <p className="text-gray-400">
                  Questions about your booking?<br />
                  We're here to help.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BookingLanding;
