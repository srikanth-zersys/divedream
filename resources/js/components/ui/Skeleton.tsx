import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
        height="0.875rem"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height="1rem" className="mb-2" />
        <Skeleton variant="text" width="60%" height="0.75rem" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = ''
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === 0 ? '30%' : '20%'} height="0.875rem" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} variant="text" width={colIdx === 0 ? '30%' : '20%'} height="0.875rem" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonProductCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden ${className}`}>
    <Skeleton variant="rectangular" width="100%" height={200} />
    <div className="p-4">
      <Skeleton variant="text" width="70%" height="1.25rem" className="mb-2" />
      <Skeleton variant="text" width="40%" height="0.875rem" className="mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="30%" height="1.5rem" />
        <Skeleton variant="rounded" width={100} height={36} />
      </div>
    </div>
  </div>
);

export const SkeletonBookingCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <Skeleton variant="text" width={120} height="1.25rem" className="mb-2" />
        <Skeleton variant="text" width={80} height="0.75rem" />
      </div>
      <Skeleton variant="rounded" width={80} height={24} />
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width="60%" height="0.875rem" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width="40%" height="0.875rem" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width="50%" height="0.875rem" />
      </div>
    </div>
  </div>
);

export default Skeleton;
