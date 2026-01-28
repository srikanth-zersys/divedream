import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar,
  Plus,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Users,
  MapPin,
  User,
  Eye,
  Edit,
  Anchor,
} from 'lucide-react';
import { Schedule, Booking } from '@/types/dive-club';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    schedule: Schedule;
    bookingCount: number;
    spotsAvailable: number;
  };
}

interface Props {
  events: CalendarEvent[];
  initialDate: string;
}

const ScheduleCalendar: React.FC<Props> = ({ events, initialDate }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.toPlainObject() as CalendarEvent);
    setShowModal(true);
  };

  const handleDateClick = (info: any) => {
    router.get('/admin/schedules/create', { date: info.dateStr });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const goToToday = () => {
    calendarRef.current?.getApi().today();
  };

  const goToPrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const goToNext = () => {
    calendarRef.current?.getApi().next();
  };

  const changeView = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  return (
    <>
      <Head title="Schedule Calendar" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and manage your dive schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/schedules"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <List className="w-4 h-4" />
              List View
            </Link>
            <Link
              href="/admin/schedules/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </Link>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => changeView('dayGridMonth')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'dayGridMonth'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('timeGridWeek')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'timeGridWeek'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('timeGridDay')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'timeGridDay'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              initialDate={initialDate}
              events={events}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              headerToolbar={false}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              nowIndicator={true}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
              dayHeaderFormat={{
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
              }}
              eventContent={(eventInfo) => (
                <div className="p-1 overflow-hidden">
                  <div className="font-medium text-xs truncate">{eventInfo.event.title}</div>
                  <div className="text-xs opacity-80">
                    {eventInfo.event.extendedProps.bookingCount}/{eventInfo.event.extendedProps.spotsAvailable} booked
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Fun Dive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Course</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Discover Scuba</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Private Trip</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Boat Charter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Schedule Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {selectedEvent.title}
                  </h4>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.extendedProps.schedule.status)}`}>
                    {selectedEvent.extendedProps.schedule.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>
                      {new Date(selectedEvent.extendedProps.schedule.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>
                      {formatTime(selectedEvent.extendedProps.schedule.start_time)}
                      {selectedEvent.extendedProps.schedule.end_time && (
                        <> - {formatTime(selectedEvent.extendedProps.schedule.end_time)}</>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>
                      {selectedEvent.extendedProps.bookingCount} / {selectedEvent.extendedProps.spotsAvailable} spots booked
                    </span>
                  </div>

                  {selectedEvent.extendedProps.schedule.instructor && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{selectedEvent.extendedProps.schedule.instructor.user?.name}</span>
                    </div>
                  )}

                  {selectedEvent.extendedProps.schedule.dive_site && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{selectedEvent.extendedProps.schedule.dive_site.name}</span>
                    </div>
                  )}

                  {selectedEvent.extendedProps.schedule.boat && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <Anchor className="w-5 h-5 text-gray-400" />
                      <span>{selectedEvent.extendedProps.schedule.boat.name}</span>
                    </div>
                  )}
                </div>

                {selectedEvent.extendedProps.schedule.notes && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedEvent.extendedProps.schedule.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/admin/schedules/${selectedEvent.extendedProps.schedule.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/admin/schedules/${selectedEvent.extendedProps.schedule.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ScheduleCalendar.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ScheduleCalendar;
