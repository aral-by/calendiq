import { useEvents } from '@/context/EventContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { EventModal } from './EventModal';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import { AnimatePresence, motion } from 'motion/react';
import { 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays, 
  format,
  startOfMonth,
  startOfWeek,
  startOfDay
} from 'date-fns';

type ViewType = 'month' | 'week' | 'day' | 'list';

export function CalendarView() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(() => 
    (localStorage.getItem('calendiqPreferredView') as ViewType) || 'month'
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  function handleViewChange(viewType: ViewType) {
    setCurrentView(viewType);
    localStorage.setItem('calendiqPreferredView', viewType);
    
    // Adjust current date to start of period for the new view
    switch(viewType) {
      case 'month':
        setCurrentDate(startOfMonth(currentDate));
        break;
      case 'week':
        setCurrentDate(startOfWeek(currentDate, { weekStartsOn: 1 }));
        break;
      case 'day':
        setCurrentDate(startOfDay(currentDate));
        break;
    }
  }

  function handlePrev() {
    switch(currentView) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  }

  function handleNext() {
    switch(currentView) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleAddEvent() {
    setSelectedEventId(null);
    setNewEventStart(new Date());
    setModalOpen(true);
  }

  function handleEventClick(eventId: string) {
    setSelectedEventId(eventId);
    setNewEventStart(null);
    setModalOpen(true);
  }

  function handleDateClick(date: Date) {
    setSelectedEventId(null);
    setNewEventStart(date);
    setModalOpen(true);
  }

  function handleTimeSlotClick(date: Date) {
    setSelectedEventId(null);
    setNewEventStart(date);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedEventId(null);
    setNewEventStart(null);
  }

  function getTitle() {
    switch(currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return format(weekStart, 'MMM d, yyyy');
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'list':
        return 'All Events';
      default:
        return '';
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Custom Toolbar */}
      <div className="border-b bg-background px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          {/* Top Row: Title + New Event Button (Mobile) / Left: Navigation (Desktop) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {/* Left: Navigation - hidden on mobile, shown on desktop */}
            {currentView !== 'list' && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToday}
                  className="ml-2"
                >
                  Today
                </Button>
              </div>
            )}

            {/* Title - centered on mobile, left on desktop */}
            <h2 className="text-lg sm:text-xl font-semibold sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              {getTitle()}
            </h2>

            {/* New Event Button - visible on mobile */}
            <Button
              onClick={handleAddEvent}
              size="sm"
              className="sm:hidden"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Row: View Switcher + Navigation (Mobile) / Right: View Switcher + Add Event (Desktop) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {/* Navigation - visible on mobile only */}
            {currentView !== 'list' && (
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-8 px-2 text-xs"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* View Switcher */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={currentView === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('month')}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Month
              </Button>
              <Button
                variant={currentView === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('week')}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Week
              </Button>
              <Button
                variant={currentView === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('day')}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Day
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                List
              </Button>
            </div>

            {/* New Event Button - hidden on mobile, visible on desktop */}
            <Button
              onClick={handleAddEvent}
              className="hidden sm:flex ml-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="h-full w-full"
          >
            {currentView === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'list' && (
              <ListView
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <EventModal
        open={modalOpen}
        onClose={handleModalClose}
        eventId={selectedEventId}
        initialStart={newEventStart}
      />
    </div>
  );
}
