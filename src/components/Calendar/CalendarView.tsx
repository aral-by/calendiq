import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from '@/context/EventContext';
import { useState, useRef, useEffect } from 'react';
import { EventModal } from './EventModal';

export function CalendarView() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  
  // Load user's preferred view from localStorage
  const [initialView] = useState(() => 
    localStorage.getItem('calendiqPreferredView') || 'timeGridWeek'
  );

  // Save current view to localStorage
  function handleViewChange(viewType: string) {
    localStorage.setItem('calendiqPreferredView', viewType);
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
    <div className="h-full p-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin
        ]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        views={{
          dayGridMonth: { buttonText: 'Month' },
          timeGridWeek: { buttonText: 'Week' },
          timeGridDay: { buttonText: 'Day' },
          listWeek: { buttonText: 'List' }
        }}
        viewDidMount={(info) => handleViewChange(info.view.type)}
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
      
      <EventModal
        open={modalOpen}
        onClose={handleModalClose}
        eventId={selectedEventId}
        initialStart={newEventStart}
      />
    </div>
  );
}
