import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Star, ThumbsUp, ThumbsDown, Send, X } from 'lucide-react';

interface ReviewRequest {
  id: number;
  token: string;
  status: string;
}

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
}

interface Product {
  name: string;
  description: string | null;
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
  booking: Booking;
  tenant: Tenant;
  product: Product;
  preSelectedRating: number | null;
  positiveTags: Record<string, string>;
  negativeTags: Record<string, string>;
  externalLinks: Record<string, ExternalLink>;
}

const ReviewForm: React.FC<Props> = ({
  reviewRequest,
  booking,
  tenant,
  product,
  preSelectedRating,
  positiveTags,
  negativeTags,
  externalLinks,
}) => {
  const [rating, setRating] = useState<number>(preSelectedRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTags = rating >= 4 ? positiveTags : negativeTags;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    router.post(
      `/review/${reviewRequest.token}`,
      {
        rating,
        feedback,
        tags: selectedTags,
      },
      {
        onFinish: () => setIsSubmitting(false),
      }
    );
  };

  const getRatingLabel = (r: number) => {
    const labels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];
    return labels[r] || '';
  };

  return (
    <>
      <Head title={`Review - ${tenant.name}`} />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            {tenant.logo ? (
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="h-16 w-auto mx-auto mb-4"
              />
            ) : (
              <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              How was your experience?
            </h1>
            <p className="text-gray-600 mt-2">
              Your feedback helps us improve and helps other divers discover
              great experiences.
            </p>
          </div>

          {/* Experience Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="text-center">
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(booking.booking_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <label className="block text-center text-lg font-medium text-gray-900 mb-4">
                Rate your experience
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(hoveredRating || rating) > 0 && (
                <p className="text-center text-lg font-medium text-gray-700">
                  {getRatingLabel(hoveredRating || rating)}
                </p>
              )}
            </div>

            {/* Tags */}
            {rating > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  {rating >= 4
                    ? 'What did you love?'
                    : 'What could be improved?'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentTags).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTagToggle(key)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(key)
                          ? rating >= 4
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-red-100 text-red-800 border-2 border-red-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {selectedTags.includes(key) ? (
                        rating >= 4 ? (
                          <ThumbsUp className="w-4 h-4" />
                        ) : (
                          <ThumbsDown className="w-4 h-4" />
                        )
                      ) : null}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Text */}
            {rating > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Tell us more (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={
                    rating >= 4
                      ? 'What made your experience great?'
                      : 'How could we improve your experience?'
                  }
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() =>
                  router.post(`/review/${reviewRequest.token}/decline`)
                }
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            </div>
          </form>

          {/* External Review Links (shown after rating is selected) */}
          {rating >= 4 && Object.keys(externalLinks).length > 0 && (
            <div className="mt-8 bg-green-50 rounded-xl border border-green-200 p-6">
              <h3 className="font-semibold text-green-800 mb-2">
                Love your experience?
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Share your review on these platforms to help other divers
                discover us!
              </p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(externalLinks).map(
                  ([platform, link]) =>
                    !link.posted && (
                      <a
                        key={platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 rounded-lg text-green-700 hover:bg-green-50"
                      >
                        Review on {link.name}
                      </a>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewForm;
