import React, { useState } from 'react';
import { RefreshCw, Calendar, Check, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface RebookButtonProps {
  productId: number;
  productSlug: string;
  productName: string;
  participantCount?: number;
  className?: string;
  variant?: 'button' | 'card' | 'link';
}

const RebookButton: React.FC<RebookButtonProps> = ({
  productId,
  productSlug,
  productName,
  participantCount = 1,
  className = '',
  variant = 'button',
}) => {
  const [loading, setLoading] = useState(false);

  const handleRebook = () => {
    setLoading(true);
    // Navigate to product page with pre-filled participant count
    router.visit(`/book/product/${productSlug}`, {
      data: {
        participants: participantCount,
        rebook: true,
      },
      onFinish: () => setLoading(false),
    });
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleRebook}
        disabled={loading}
        className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Book Again
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">Loved your experience?</p>
            <h3 className="font-semibold mt-1">Book {productName} again!</h3>
          </div>
          <button
            onClick={handleRebook}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Rebook
          </button>
        </div>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleRebook}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Book Again
    </button>
  );
};

export default RebookButton;
