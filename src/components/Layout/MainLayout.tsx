import { useState, ReactNode, useEffect } from 'react';
import { Calendar, Sun, Moon, TrendingUp, Home, Sparkles, ChevronUp, ChevronDown, User, Settings, LogOut, Bell, Search, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/context/UserContext';
import { useChatHistory } from '@/context/ChatHistoryContext';
import { NotificationDialog } from '@/components/Notifications/NotificationDialog';
import { AccountDialog } from '@/components/Account/AccountDialog';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
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
  currentPage: 'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'statistics';
  onNavigate: (page: 'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'statistics') => void;
}

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('calendiqTheme') as 'light' | 'dark' | null;
    return saved || 'light';
  });
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(true);
  const { user, logout } = useUser();
  const { sessions, currentSessionId, createNewSession, switchSession, deleteSession } = useChatHistory();

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

            {/* AI Chat History */}
            <SidebarGroup>
              <Collapsible open={aiChatOpen} onOpenChange={setAiChatOpen}>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex items-center justify-between w-full group/collapsible">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">AI Chat</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newId = createNewSession();
                          switchSession(newId);
                          onNavigate('ai-chat');
                        }}
                        className="p-1 hover:bg-accent rounded opacity-0 group-hover/collapsible:opacity-100 transition-opacity"
                        title="New chat"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      {sessions.length === 0 ? (
                        <SidebarMenuItem>
                          <button
                            onClick={() => {
                              const newId = createNewSession();
                              switchSession(newId);
                              onNavigate('ai-chat');
                            }}
                            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Start a new chat</span>
                          </button>
                        </SidebarMenuItem>
                      ) : (
                        sessions.map((session) => (
                          <SidebarMenuItem key={session.id}>
                            <div className="group/item flex items-center gap-1 hover:bg-accent rounded-md transition-colors">
                              <SidebarMenuButton
                                isActive={currentPage === 'ai-chat' && currentSessionId === session.id}
                                onClick={() => {
                                  switchSession(session.id);
                                  onNavigate('ai-chat');
                                }}
                                className="flex-1 h-9 justify-start"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm truncate">{session.title}</span>
                              </SidebarMenuButton>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this chat?')) {
                                    deleteSession(session.id);
                                  }
                                }}
                                className="p-1 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded transition-all mr-1"
                                title="Delete chat"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </SidebarMenuItem>
                        ))
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
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
    </SidebarProvider>
  );
}

