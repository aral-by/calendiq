import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Sun, Moon, CalendarDays, Clock } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/context/EventContext';
import { useUser } from '@/context/UserContext';

export function Dashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { events } = useEvents();
  const { user } = useUser();

  // Load theme from setup or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('calendiqTheme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('calendiqTheme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Get today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= today && eventDate < tomorrow;
  });

  return (
    <CursorProvider>
      <Cursor />
      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border p-6 space-y-8">
          {/* Logo */}
          <div className="space-y-2 animate-in fade-in slide-in-from-left duration-500">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              <h1 className="text-xl font-light tracking-tight">Calendiq</h1>
            </div>
            {user && (
              <p className="text-sm text-muted-foreground pl-9">
                {user.firstName} {user.lastName}
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2 animate-in fade-in slide-in-from-left duration-700 delay-100">
            <button className="w-full text-left px-4 py-3 hover:bg-accent transition-colors duration-200 border border-foreground bg-accent">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-light">Dashboard</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-accent transition-colors duration-200 border border-transparent hover:border-border">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-light text-muted-foreground">Calendar</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-accent transition-colors duration-200 border border-transparent hover:border-border">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-light text-muted-foreground">AI Chat</span>
              </div>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border p-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light">Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Theme Toggle */}
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
              
              {/* Today's Events Card */}
              <Card className="border border-border animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <CardTitle className="text-xl font-light">Today's Events</CardTitle>
                  </div>
                  <CardDescription className="font-light">
                    {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground font-light">No events scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayEvents.slice(0, 5).map((event) => (
                        <div 
                          key={event.id} 
                          className="p-4 border border-border hover:bg-accent transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-light text-foreground">{event.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(event.start).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                                {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Chat Card */}
              <Card className="border border-border animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <CardTitle className="text-xl font-light">AI Assistant</CardTitle>
                  </div>
                  <CardDescription className="font-light">
                    Get help managing your schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground font-light">
                        Ask me anything about your schedule, or let me help you plan your day.
                      </p>
                    </div>
                    <button className="w-full p-4 border border-border hover:bg-accent transition-all duration-200 text-left group">
                      <p className="font-light group-hover:text-foreground text-muted-foreground">
                        Start a conversation
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Overview Card */}
              <Card className="border border-border lg:col-span-2 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <CardTitle className="text-xl font-light">Calendar Overview</CardTitle>
                  </div>
                  <CardDescription className="font-light">
                    Quick view of your upcoming schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* This Week */}
                    <div className="p-6 border border-border hover:bg-accent transition-colors duration-200">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-light uppercase tracking-wider">
                          This Week
                        </p>
                        <p className="text-3xl font-light">
                          {events.filter(e => {
                            const eventDate = new Date(e.start);
                            const weekStart = new Date();
                            weekStart.setHours(0, 0, 0, 0);
                            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekEnd.getDate() + 7);
                            return eventDate >= weekStart && eventDate < weekEnd;
                          }).length}
                        </p>
                        <p className="text-sm text-muted-foreground font-light">
                          events
                        </p>
                      </div>
                    </div>

                    {/* This Month */}
                    <div className="p-6 border border-border hover:bg-accent transition-colors duration-200">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-light uppercase tracking-wider">
                          This Month
                        </p>
                        <p className="text-3xl font-light">
                          {events.filter(e => {
                            const eventDate = new Date(e.start);
                            const now = new Date();
                            return eventDate.getMonth() === now.getMonth() && 
                                   eventDate.getFullYear() === now.getFullYear();
                          }).length}
                        </p>
                        <p className="text-sm text-muted-foreground font-light">
                          events
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="p-6 border border-border hover:bg-accent transition-colors duration-200">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-light uppercase tracking-wider">
                          Total
                        </p>
                        <p className="text-3xl font-light">
                          {events.length}
                        </p>
                        <p className="text-sm text-muted-foreground font-light">
                          events
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </CursorProvider>
  );
}
