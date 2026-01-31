import React from 'react';
import { Shield, Lock, CreditCard, Star, Award, CheckCircle } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'compact' | 'checkout';
  showReviews?: boolean;
  reviewCount?: number;
  rating?: number;
  certifications?: ('padi' | 'ssi' | 'naui' | 'sdi')[];
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'horizontal',
  showReviews = true,
  reviewCount = 150,
  rating = 4.8,
  certifications = ['padi'],
  className = '',
}) => {
  const badges = [
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      text: 'Verified Business',
      subtext: 'Licensed & Insured',
    },
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      text: 'Secure Checkout',
      subtext: '256-bit SSL',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-purple-600" />,
      text: 'Safe Payment',
      subtext: 'Powered by Stripe',
    },
  ];

  // Checkout variant - minimal, for payment pages
  if (variant === 'checkout') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Lock className="w-4 h-4 text-green-500" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
        </div>
        {certifications.includes('padi') && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Award className="w-4 h-4 text-blue-500" />
            <span>PADI Certified</span>
          </div>
        )}
        {showReviews && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-gray-900 dark:text-white">{rating}</span>
            <span className="text-gray-500">({reviewCount})</span>
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Verified
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Lock className="w-4 h-4 text-blue-500" />
          Secure
        </div>
        {showReviews && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{rating}</span>
          </div>
        )}
      </div>
    );
  }

  // Vertical variant
  if (variant === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Award className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {certifications.map(c => c.toUpperCase()).join(' & ')} Certified
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Professional dive center</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        {showReviews && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{rating}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Excellent</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">{reviewCount} verified reviews</p>
            </div>
          </div>
        )}

        {/* Security badges */}
        {badges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {badge.icon}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{badge.text}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{badge.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`${className}`}>
      {/* Main badges row */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-y border-gray-200 dark:border-gray-700">
        {/* Reviews */}
        {showReviews && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{rating}</span>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>
        )}

        {/* Certifications */}
        {certifications.map((cert) => (
          <div key={cert} className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {cert.toUpperCase()} Certified
            </span>
          </div>
        ))}

        {/* Security */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Verified & Insured
          </span>
        </div>
      </div>

      {/* Payment security */}
      <div className="flex items-center justify-center gap-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          256-bit SSL
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          Secure payments
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
