import { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, TrendingUp, Home, MessageSquare, ChevronUp, User, Settings, LogOut, Bell, Search, Plus, Sparkles, CalendarCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
          </SidebarHeader>
          
          <SidebarContent>
            {/* Navigation Menu */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive className="h-11">
                      <Home className="h-5 w-5" />
                      <span className="text-base font-medium">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-11">
                      <Search className="h-5 w-5" />
                      <span className="text-base font-medium">Search</span>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-11">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-base font-medium">Statistics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
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
                    <CardTitle className="text-xl">Calendar</CardTitle>
                    <CardDescription className="text-base">
                      View your calendar
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
                    <CardTitle className="text-xl">AI Assistant</CardTitle>
                    <CardDescription className="text-base">
                      Manage your schedule with AI
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
                    <CardTitle className="text-xl">Today's Schedule</CardTitle>
                    <CardDescription className="text-base">
                      What's on today?
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
                    <CardTitle className="text-xl">Quick Add</CardTitle>
                    <CardDescription className="text-base">
                      Create a new event
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
