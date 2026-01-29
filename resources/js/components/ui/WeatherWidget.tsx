import React, { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface WeatherData {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy';
  description: string;
  humidity: number;
  windSpeed: number;
  waveHeight?: number;
  visibility?: number;
}

interface WeatherWidgetProps {
  location?: { lat: number; lng: number };
  locationName?: string;
  targetDate?: Date;
  className?: string;
  variant?: 'compact' | 'detailed' | 'forecast';
}

// Mock weather data (in production, fetch from OpenWeatherMap/WeatherAPI)
const getMockWeather = (targetDate?: Date): WeatherData[] => {
  const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'sunny', 'rainy', 'cloudy'];
  const forecast: WeatherData[] = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    forecast.push({
      date: date.toISOString().split('T')[0],
      temp: Math.round(26 + Math.random() * 6),
      tempMin: Math.round(22 + Math.random() * 4),
      tempMax: Math.round(28 + Math.random() * 6),
      condition: conditions[i],
      description: conditions[i] === 'sunny' ? 'Clear skies' : conditions[i] === 'rainy' ? 'Light rain' : 'Partly cloudy',
      humidity: Math.round(60 + Math.random() * 30),
      windSpeed: Math.round(5 + Math.random() * 15),
      waveHeight: Math.round((0.5 + Math.random() * 1.5) * 10) / 10,
      visibility: Math.round(8 + Math.random() * 7),
    });
  }

  return forecast;
};

const WeatherIcon: React.FC<{ condition: WeatherData['condition']; className?: string }> = ({
  condition,
  className = 'w-8 h-8',
}) => {
  const icons = {
    sunny: <Sun className={`${className} text-yellow-500`} />,
    cloudy: <Cloud className={`${className} text-gray-400`} />,
    rainy: <CloudRain className={`${className} text-blue-500`} />,
    stormy: <CloudLightning className={`${className} text-purple-500`} />,
    snowy: <CloudSnow className={`${className} text-blue-300`} />,
    windy: <Wind className={`${className} text-teal-500`} />,
  };
  return icons[condition] || icons.cloudy;
};

const getDiveCondition = (weather: WeatherData): { status: 'excellent' | 'good' | 'fair' | 'poor'; message: string } => {
  if (weather.condition === 'stormy' || weather.windSpeed > 25) {
    return { status: 'poor', message: 'Not recommended for diving' };
  }
  if (weather.condition === 'rainy' || weather.windSpeed > 18) {
    return { status: 'fair', message: 'Check with dive center' };
  }
  if (weather.condition === 'sunny' && weather.windSpeed < 10) {
    return { status: 'excellent', message: 'Perfect diving conditions!' };
  }
  return { status: 'good', message: 'Good conditions expected' };
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location,
  locationName = 'Dive Site',
  targetDate,
  className = '',
  variant = 'detailed',
}) => {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setForecast(getMockWeather(targetDate));
      setLoading(false);
    }, 500);
  }, [location, targetDate]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || forecast.length === 0) {
    return null;
  }

  const today = forecast[0];
  const diveCondition = getDiveCondition(today);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <WeatherIcon condition={today.condition} className="w-6 h-6" />
        <div>
          <span className="font-medium text-gray-900 dark:text-white">{today.temp}°C</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">{today.description}</span>
        </div>
      </div>
    );
  }

  // Forecast variant
  if (variant === 'forecast') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">5-Day Forecast</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {forecast.map((day, idx) => {
            const date = new Date(day.date);
            const isToday = idx === 0;
            return (
              <div
                key={day.date}
                className={`flex-shrink-0 text-center p-3 rounded-lg ${
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <WeatherIcon condition={day.condition} className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{day.tempMax}°</p>
                <p className="text-xs text-gray-400">{day.tempMin}°</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">{locationName}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-4xl font-bold">{today.temp}°C</span>
              <WeatherIcon condition={today.condition} className="w-10 h-10 text-white" />
            </div>
            <p className="text-sm mt-1">{today.description}</p>
          </div>
        </div>
      </div>

      {/* Dive Conditions */}
      <div className={`px-4 py-3 flex items-center gap-3 ${
        diveCondition.status === 'excellent' ? 'bg-green-50 dark:bg-green-900/20' :
        diveCondition.status === 'good' ? 'bg-blue-50 dark:bg-blue-900/20' :
        diveCondition.status === 'fair' ? 'bg-amber-50 dark:bg-amber-900/20' :
        'bg-red-50 dark:bg-red-900/20'
      }`}>
        {diveCondition.status === 'poor' || diveCondition.status === 'fair' ? (
          <AlertTriangle className={`w-5 h-5 ${
            diveCondition.status === 'poor' ? 'text-red-500' : 'text-amber-500'
          }`} />
        ) : null}
        <div>
          <span className={`text-sm font-medium ${
            diveCondition.status === 'excellent' ? 'text-green-700 dark:text-green-400' :
            diveCondition.status === 'good' ? 'text-blue-700 dark:text-blue-400' :
            diveCondition.status === 'fair' ? 'text-amber-700 dark:text-amber-400' :
            'text-red-700 dark:text-red-400'
          }`}>
            Dive Conditions: {diveCondition.status.charAt(0).toUpperCase() + diveCondition.status.slice(1)}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400">{diveCondition.message}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{today.windSpeed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{today.humidity}%</p>
          </div>
        </div>
        {today.waveHeight && (
          <div className="flex items-center gap-3">
            <span className="text-xl">🌊</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Waves</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{today.waveHeight}m</p>
            </div>
          </div>
        )}
        {today.visibility && (
          <div className="flex items-center gap-3">
            <span className="text-xl">👁️</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{today.visibility}+ km</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
