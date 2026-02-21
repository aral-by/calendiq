import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from '@/context/EventContext';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { EventModal } from './EventModal';

export function CalendarView() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState(() => 
    localStorage.getItem('calendiqPreferredView') || 'timeGridWeek'
  );
  const [calendarTitle, setCalendarTitle] = useState('');
  const calendarRef = useRef<FullCalendar>(null);
  
  const initialView = currentView;

  // Update title when calendar changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCalendarTitle(calendarApi.view.title);
    }
  }, [currentView]);

  function handleViewChange(viewType: string) {
    setCurrentView(viewType);
    localStorage.setItem('calendiqPreferredView', viewType);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(viewType);
      setCalendarTitle(calendarApi.view.title);
    }
  }

  function handlePrev() {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      setCalendarTitle(calendarApi.view.title);
    }
  }

  function handleNext() {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      setCalendarTitle(calendarApi.view.title);
    }
  }

  function handleToday() {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setCalendarTitle(calendarApi.view.title);
    }
  }

  function handleAddEvent() {
    setSelectedEventId(null);
    setNewEventStart(new Date());
    setModalOpen(true);
  }

  function handleEventClick(info: any) {
    setSelectedEventId(info.event.id);
    setNewEventStart(null);
    setModalOpen(true);
  }

  function handleDateClick(info: any) {
    setSelectedEventId(null);
    setNewEventStart(info.date);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedEventId(null);
    setNewEventStart(null);
  }

  // Keyboard shortcuts for view switching
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        switch(e.key) {
          case '1':
            e.preventDefault();
            calendarApi.changeView('timeGridDay');
            break;
          case '2':
            e.preventDefault();
            calendarApi.changeView('timeGridWeek');
            break;
          case '3':
            e.preventDefault();
            calendarApi.changeView('dayGridMonth');
            break;
          case '4':
            e.preventDefault();
            calendarApi.changeView('listWeek');
            break;
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Custom Toolbar */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
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

          {/* Center: Title */}
          <h2 className="text-xl font-semibold">
            {calendarTitle}
          </h2>

          {/* Right: View Switcher + Add Event */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={currentView === 'dayGridMonth' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('dayGridMonth')}
                className="h-8"
              >
                Month
              </Button>
              <Button
                variant={currentView === 'timeGridWeek' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('timeGridWeek')}
                className="h-8"
              >
                Week
              </Button>
              <Button
                variant={currentView === 'timeGridDay' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('timeGridDay')}
                className="h-8"
              >
                Day
              </Button>
              <Button
                variant={currentView === 'listWeek' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('listWeek')}
                className="h-8"
              >
                List
              </Button>
            </div>
            <Button
              onClick={handleAddEvent}
              className="ml-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin
          ]}
          initialView={initialView}
          headerToolbar={false}
          viewDidMount={(info) => setCalendarTitle(info.view.title)}
          datesSet={(info) => setCalendarTitle(info.view.title)}
          events={events.map(e => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
            allDay: e.allDay,
            backgroundColor: e.categoryColor || e.color || '#6366f1',
            borderColor: e.categoryColor || e.color || '#6366f1',
          }))}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="100%"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          scrollTime="08:00:00"
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          firstDay={1}
          themeSystem="standard"
        />
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
