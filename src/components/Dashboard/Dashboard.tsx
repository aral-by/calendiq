import { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, CalendarDays, Clock, TrendingUp, Activity, Home, MessageSquare, ChevronUp, User, Settings, LogOut, Bell, Search, Plus, Sparkles, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useEvents } from '@/context/EventContext';
import { useUser } from '@/context/UserContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Request notification permission on first load
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = Notification.permission;
        
        if (permission === 'default') {
          // Wait a bit for better UX, then ask for permission
          setTimeout(async () => {
            try {
              const result = await Notification.requestPermission();
              if (result === 'granted') {
                console.log('Notification permission granted');
                // Register service worker
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js').catch((error) => {
                    console.error('Service Worker registration failed:', error);
                  });
                }
              }
            } catch (error) {
              console.error('Error requesting notification permission:', error);
            }
          }, 2000);
        } else if (permission === 'granted') {
          // Register service worker if permission already granted
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
          }
        }
      }
    };

    requestNotificationPermission();
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold text-lg">Calendiq</span>
            </div>
            
            {/* Search Bar */}
            <div className="px-2 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {/* Navigation Menu */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive className="h-11">
                      <Home className="h-5 w-5" />
                      <span className="text-base font-medium">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-11">
                      <Calendar className="h-5 w-5" />
                      <span className="text-base font-medium">Calendar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-11">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-base font-medium">AI Chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Stats Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs">Statistics</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-3 px-2">
                  <Card className="border-none bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Today</p>
                          <p className="text-lg font-bold">{todayEvents.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                          <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">This Week</p>
                          <p className="text-lg font-bold">{weekEvents.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">This Month</p>
                          <p className="text-lg font-bold">{monthEvents.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                          <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{events.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 w-full rounded-lg hover:bg-accent transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 text-left text-sm">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.firstName.toLowerCase()}@example.com</p>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <div className="border-b">
            <div className="flex h-16 items-center px-8 gap-4">
              <SidebarTrigger />
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl space-y-8">
              {/* Greeting */}
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                  👋 Hi {user?.firstName}!
                </h1>
              </div>
              
              {/* Quick Action Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-xl">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">Takvim</CardTitle>
                    <CardDescription className="text-base">
                      Takviminize göz atın
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl">
                        <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">Yapay Zeka</CardTitle>
                    <CardDescription className="text-base">
                      Yapay zeka ile takviminizi yönetin
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-green-100 dark:bg-green-950 rounded-xl">
                        <CalendarCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">Bugünün Programı</CardTitle>
                    <CardDescription className="text-base">
                      Bugün ne yapacaksınız?
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-xl">
                        <Plus className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">Hızlı Ekle</CardTitle>
                    <CardDescription className="text-base">
                      Yeni etkinlik oluşturun
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
