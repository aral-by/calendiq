import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Sun, Moon, CalendarDays, Clock, TrendingUp, Users } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/context/EventContext';
import { useUser } from '@/context/UserContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/animate-ui/components/radix/sidebar';

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
    <CursorProvider>
      <Cursor />
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                <h1 className="text-xl font-medium tracking-tight">Calendiq</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <CalendarDays className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-medium">Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Calendar className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-medium">Calendar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-medium">AI Chat</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-border p-6">
              {user && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-xs mt-1">Personal Calendar</p>
                </div>
              )}
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="border-b border-border p-8 animate-in fade-in slide-in-from-top duration-500">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div>
                  <h2 className="text-4xl font-semibold mb-2">
                    👋 Hi {user?.firstName}!
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                {/* Theme Toggle */}
                <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full">
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
            <div className="flex-1 p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Today's Events Card */}
                  <Card className="border-2 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-2xl">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold">Today's Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">{todayEvents.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {todayEvents.length === 1 ? 'event scheduled' : 'events scheduled'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* This Week Card */}
                  <Card className="border-2 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-2xl">
                          <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">{weekEvents.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          events this week
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* This Month Card */}
                  <Card className="border-2 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-950 rounded-2xl">
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">{monthEvents.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          events this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Events Card */}
                  <Card className="border-2 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-2xl">
                          <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold">Total Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">{events.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          all time events
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </CursorProvider>
  );
}
