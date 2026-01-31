import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}

interface AddToCalendarProps {
  event: CalendarEvent;
  className?: string;
  variant?: 'button' | 'dropdown' | 'links';
}

const AddToCalendar: React.FC<AddToCalendarProps> = ({
  event,
  className = '',
  variant = 'dropdown',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const formatDateGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Generate .ics file content
  const generateICS = (): string => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DiveDream//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      `UID:${Date.now()}@divedream.com`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  // Google Calendar URL
  const getGoogleCalendarUrl = (): string => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateGoogle(event.startDate)}/${formatDateGoogle(event.endDate)}`,
      details: event.description || '',
      location: event.location || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Outlook Web URL
  const getOutlookUrl = (): string => {
    const params = new URLSearchParams({
      subject: event.title,
      body: event.description || '',
      location: event.location || '',
      startdt: event.startDate.toISOString(),
      enddt: event.endDate.toISOString(),
      path: '/calendar/action/compose',
      rru: 'addevent',
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  // Yahoo Calendar URL
  const getYahooUrl = (): string => {
    const duration = Math.round((event.endDate.getTime() - event.startDate.getTime()) / 60000);
    const hours = Math.floor(duration / 60).toString().padStart(2, '0');
    const minutes = (duration % 60).toString().padStart(2, '0');

    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      st: formatDate(event.startDate).slice(0, 15),
      dur: `${hours}${minutes}`,
      desc: event.description || '',
      in_loc: event.location || '',
    });
    return `https://calendar.yahoo.com/?${params.toString()}`;
  };

  const calendarLinks = [
    { name: 'Google Calendar', icon: '📅', url: getGoogleCalendarUrl(), external: true },
    { name: 'Apple Calendar', icon: '🍎', action: downloadICS, external: false },
    { name: 'Outlook', icon: '📧', url: getOutlookUrl(), external: true },
    { name: 'Yahoo Calendar', icon: '🟣', url: getYahooUrl(), external: true },
    { name: 'Download .ics', icon: '📥', action: downloadICS, external: false },
  ];

  if (variant === 'links') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {calendarLinks.map((cal) => (
          cal.url ? (
            <a
              key={cal.name}
              href={cal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>{cal.icon}</span>
              {cal.name}
            </a>
          ) : (
            <button
              key={cal.name}
              onClick={cal.action}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>{cal.icon}</span>
              {cal.name}
            </button>
          )
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={downloadICS}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
      </button>
    );
  }

  // Default: dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {calendarLinks.map((cal) => (
            cal.url ? (
              <a
                key={cal.name}
                href={cal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">{cal.icon}</span>
                <span>{cal.name}</span>
              </a>
            ) : (
              <button
                key={cal.name}
                onClick={cal.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">{cal.icon}</span>
                <span>{cal.name}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default AddToCalendar;
