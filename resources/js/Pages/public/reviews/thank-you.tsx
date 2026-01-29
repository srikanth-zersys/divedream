import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Star, ExternalLink, Heart } from 'lucide-react';

interface ReviewRequest {
  id: number;
  token: string;
  rating: number | null;
  posted_google: boolean;
  posted_tripadvisor: boolean;
  posted_facebook: boolean;
}

interface Tenant {
  name: string;
  logo: string | null;
}

interface ExternalLink {
  name: string;
  url: string;
  posted: boolean;
}

interface Props {
  reviewRequest: ReviewRequest;
  tenant: Tenant;
  isPositive?: boolean;
  alreadyCompleted?: boolean;
  externalLinks: Record<string, ExternalLink>;
}

const ThankYou: React.FC<Props> = ({
  reviewRequest,
  tenant,
  isPositive = true,
  alreadyCompleted = false,
  externalLinks,
}) => {
  const availableExternalLinks = Object.entries(externalLinks).filter(
    ([_, link]) => !link.posted
  );

  return (
    <>
      <Head title={`Thank You - ${tenant.name}`} />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Message */}
          {alreadyCompleted ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Review Already Submitted
              </h1>
              <p className="text-gray-600 mb-8">
                You've already shared your feedback for this experience. Thank
                you!
              </p>
            </>
          ) : isPositive ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thank You for Your Review!
              </h1>
              <p className="text-gray-600 mb-8">
                We're thrilled you had a great experience! Your feedback means
                the world to us.
              </p>

              {/* External Review Request */}
              {availableExternalLinks.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h2 className="font-semibold text-gray-900">
                      Spread the Love!
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Help other divers find us by sharing your experience:
                  </p>
                  <div className="flex flex-col gap-3">
                    {availableExternalLinks.map(([platform, link]) => (
                      <a
                        key={platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Star className="w-5 h-5" />
                        Review us on {link.name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thank You for Your Feedback
              </h1>
              <p className="text-gray-600 mb-8">
                We're sorry your experience wasn't perfect. Your feedback helps
                us improve, and a member of our team will reach out to you soon.
              </p>
            </>
          )}

          {/* Rating Display */}
          {reviewRequest.rating && (
            <div className="flex justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= reviewRequest.rating!
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Back to Booking */}
          <div className="space-y-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Book Another Dive
            </Link>
            <p className="text-sm text-gray-500">
              We hope to see you underwater again soon!
            </p>
          </div>

          {/* Brand */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {tenant.logo ? (
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="h-10 w-auto mx-auto opacity-50"
              />
            ) : (
              <p className="text-gray-400 font-medium">{tenant.name}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYou;
