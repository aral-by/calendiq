import { useState, ReactNode, useEffect } from 'react';
import { Calendar, Sun, Moon, TrendingUp, Home, Sparkles, ChevronUp, ChevronDown, User, Settings, LogOut, Bell, Search, MessageSquare, Trash2, NotebookPen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/context/UserContext';
import { useChatHistory } from '@/context/ChatHistoryContext';
import { NotificationDialog } from '@/components/Notifications/NotificationDialog';
import { AccountDialog } from '@/components/Account/AccountDialog';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainLayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'notes' | 'statistics';
  onNavigate: (page: 'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'notes' | 'statistics') => void;
}

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('calendiqTheme') as 'light' | 'dark' | null;
    return saved || 'light';
  });
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const { user, logout } = useUser();
  const { sessions, currentSessionId, createNewSession, switchSession, deleteSession } = useChatHistory();

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

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
          
          <SidebarContent className="scrollbar-hide">
            {/* Navigation Menu */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'dashboard'}
                      onClick={() => onNavigate('dashboard')}
                      className="h-11"
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-base font-medium">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'search'}
                      onClick={() => onNavigate('search')}
                      className="h-11"
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-base font-medium">Search</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'calendar'}
                      onClick={() => onNavigate('calendar')}
                      className="h-11"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="text-base font-medium">Calendar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'ai-chat' && !currentSessionId}
                      onClick={() => onNavigate('ai-chat')}
                      className="h-11"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="text-base font-medium">AI Chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'notes'}
                      onClick={() => onNavigate('notes')}
                      className="h-11"
                    >
                      <NotebookPen className="h-5 w-5" />
                      <span className="text-base font-medium">Notes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentPage === 'statistics'}
                      onClick={() => onNavigate('statistics')}
                      className="h-11"
                    >
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-base font-medium">Statistics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Recent Chats - Always Open */}
            {sessions.length > 0 && (
              <SidebarGroup>
                <Collapsible defaultOpen={true} className="group/collapsible">
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <span>Recent Chats</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {sessions.map((session) => (
                          <SidebarMenuItem key={session.id}>
                            <div className="group/item flex items-center w-full">
                              <SidebarMenuButton
                                isActive={currentPage === 'ai-chat' && currentSessionId === session.id}
                                onClick={() => {
                                  switchSession(session.id);
                                  onNavigate('ai-chat');
                                }}
                                className="flex-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span className="truncate text-sm">{session.title}</span>
                              </SidebarMenuButton>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(session.id);
                                }}
                                className="p-1.5 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded transition-all shrink-0 mr-2"
                                title="Delete chat"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            )}
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
                  <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNotificationDialogOpen(true)}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
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

          {/* Content Area */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <NotificationDialog 
        open={notificationDialogOpen} 
        onOpenChange={setNotificationDialogOpen}
      />
      <AccountDialog 
        open={accountDialogOpen} 
        onOpenChange={setAccountDialogOpen}
      />
      <SettingsDialog 
        open={settingsDialogOpen} 
        onOpenChange={setSettingsDialogOpen}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

