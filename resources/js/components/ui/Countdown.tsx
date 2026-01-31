import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: Date;
  onComplete?: () => void;
  showIcon?: boolean;
  variant?: 'inline' | 'cards' | 'compact';
  className?: string;
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  onComplete,
  showIcon = true,
  variant = 'inline',
  className = '',
  label = 'Starts in',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <div className={`inline-flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="font-medium">It's time!</span>
      </div>
    );
  }

  // Compact variant: "3d 4h 30m"
  if (variant === 'compact') {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
    parts.push(`${timeLeft.minutes}m`);

    return (
      <div className={`inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 ${className}`}>
        {showIcon && <Clock className="w-4 h-4" />}
        <span>{label} <strong className="text-gray-900 dark:text-white">{parts.join(' ')}</strong></span>
      </div>
    );
  }

  // Cards variant
  if (variant === 'cards') {
    const timeUnits = [
      { value: timeLeft.days, label: 'Days' },
      { value: timeLeft.hours, label: 'Hours' },
      { value: timeLeft.minutes, label: 'Minutes' },
      { value: timeLeft.seconds, label: 'Seconds' },
    ];

    return (
      <div className={className}>
        {label && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            {showIcon && <Clock className="w-4 h-4" />}
            {label}
          </p>
        )}
        <div className="flex gap-3">
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="flex flex-col items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[60px]"
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: inline variant
  const getTimeString = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}, ${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}`;
    }
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}, ${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`;
    }
    return `${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}, ${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showIcon && <Clock className="w-4 h-4 text-blue-500" />}
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{getTimeString()}</span>
    </div>
  );
};

export default Countdown;
