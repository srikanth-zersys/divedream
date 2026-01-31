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
  User,
  Eye,
  DollarSign,
  GripVertical,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    instructor: string | null;
    booked: number;
    capacity: number;
    status: string;
  };
}

interface Props {
  events: CalendarEvent[];
}

interface RescheduleInfo {
  event: CalendarEvent;
  oldStart: string;
  oldEnd: string;
  newStart: string;
  newEnd: string;
  revert: () => void;
}

const BookingsCalendar: React.FC<Props> = ({ events }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');
  const [rescheduleInfo, setRescheduleInfo] = useState<RescheduleInfo | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      color: info.event.backgroundColor,
      extendedProps: info.event.extendedProps,
    });
    setShowModal(true);
  };

  const handleDateClick = (info: any) => {
    router.get('/admin/bookings/create', { date: info.dateStr });
  };

  // Handle drag-drop event
  const handleEventDrop = (info: any) => {
    const event = info.event;
    setRescheduleInfo({
      event: {
        id: event.id,
        title: event.title,
        start: info.oldEvent.startStr,
        end: info.oldEvent.endStr,
        color: event.backgroundColor,
        extendedProps: event.extendedProps,
      },
      oldStart: info.oldEvent.startStr,
      oldEnd: info.oldEvent.endStr,
      newStart: event.startStr,
      newEnd: event.endStr,
      revert: info.revert,
    });
    setShowRescheduleModal(true);
  };

  // Handle event resize
  const handleEventResize = (info: any) => {
    const event = info.event;
    setRescheduleInfo({
      event: {
        id: event.id,
        title: event.title,
        start: info.oldEvent.startStr,
        end: info.oldEvent.endStr,
        color: event.backgroundColor,
        extendedProps: event.extendedProps,
      },
      oldStart: info.oldEvent.startStr,
      oldEnd: info.oldEvent.endStr,
      newStart: event.startStr,
      newEnd: event.endStr,
      revert: info.revert,
    });
    setShowRescheduleModal(true);
  };

  // Confirm reschedule
  const confirmReschedule = async () => {
    if (!rescheduleInfo) return;

    setIsRescheduling(true);
    try {
      const response = await fetch(`/admin/schedules/${rescheduleInfo.event.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          new_start: rescheduleInfo.newStart,
          new_end: rescheduleInfo.newEnd,
          notify_customers: true,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Schedule Updated', 'The schedule has been rescheduled and customers notified.');
        setShowRescheduleModal(false);
        setRescheduleInfo(null);
      } else {
        throw new Error(result.message || 'Failed to reschedule');
      }
    } catch (error: any) {
      toast.error('Reschedule Failed', error.message || 'Unable to reschedule this event.');
      rescheduleInfo.revert();
    } finally {
      setIsRescheduling(false);
    }
  };

  // Cancel reschedule
  const cancelReschedule = () => {
    if (rescheduleInfo) {
      rescheduleInfo.revert();
    }
    setShowRescheduleModal(false);
    setRescheduleInfo(null);
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

  const getAvailabilityColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      <Head title="Bookings Calendar" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View bookings by schedule across your dive activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <List className="w-4 h-4" />
              List View
            </Link>
            <Link
              href="/admin/bookings/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Booking
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
              events={events}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              editable={true}
              droppable={true}
              headerToolbar={false}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              nowIndicator={true}
              snapDuration="00:15:00"
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
                <div className="p-1 overflow-hidden group cursor-move">
                  <div className="flex items-center gap-1">
                    <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                    <div className="font-medium text-xs truncate">{eventInfo.event.title}</div>
                  </div>
                  <div className="text-xs opacity-80 flex items-center gap-1 ml-4">
                    <Users className="w-3 h-3" />
                    {eventInfo.event.extendedProps.booked}/{eventInfo.event.extendedProps.capacity}
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Capacity Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Available (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Filling Up (50-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Almost Full (75-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Full</span>
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
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.extendedProps.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedEvent.extendedProps.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>
                      {new Date(selectedEvent.start).toLocaleDateString('en-US', {
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
                      {new Date(selectedEvent.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {selectedEvent.end && (
                        <> - {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}</>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>
                      {selectedEvent.extendedProps.booked} / {selectedEvent.extendedProps.capacity} spots booked
                    </span>
                    <span className={`ml-2 w-3 h-3 rounded-full ${getAvailabilityColor(
                      selectedEvent.extendedProps.booked,
                      selectedEvent.extendedProps.capacity
                    )}`} />
                  </div>

                  {selectedEvent.extendedProps.instructor && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{selectedEvent.extendedProps.instructor}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/admin/schedules/${selectedEvent.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Schedule
                </Link>
                <Link
                  href={`/admin/bookings?schedule=${selectedEvent.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  View Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {showRescheduleModal && rescheduleInfo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={cancelReschedule} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirm Reschedule
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will notify all booked customers
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="font-medium text-gray-900 dark:text-white">
                  {rescheduleInfo.event.title}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">From</p>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      {new Date(rescheduleInfo.oldStart).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      {new Date(rescheduleInfo.oldStart).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">To</p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {new Date(rescheduleInfo.newStart).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {new Date(rescheduleInfo.newStart).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {rescheduleInfo.event.extendedProps.booked > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                      {rescheduleInfo.event.extendedProps.booked} customer(s) will be notified via email
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={cancelReschedule}
                  disabled={isRescheduling}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReschedule}
                  disabled={isRescheduling}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isRescheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Reschedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

BookingsCalendar.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default BookingsCalendar;
