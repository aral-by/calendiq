import { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, CalendarDays, Clock, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Get this week's events
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const weekEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // Get this month's events
  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && 
           eventDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b">
        <div className="flex h-16 items-center px-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span className="font-semibold text-lg">Calendiq</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div>
            {user && (
              <div className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Hi {user?.firstName}!
          </h2>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Events
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayEvents.length === 1 ? 'event scheduled' : 'events scheduled'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Week
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weekEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                events this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                events this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                all time events
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
