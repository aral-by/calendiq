import { Plus, Sparkles, CalendarCheck, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';

interface DashboardProps {
  onNavigate: (page: 'calendar' | 'ai-chat' | 'today' | 'quick-add') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useUser();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Greeting */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Hello, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            What would you like to do today?
          </p>
        </div>
        
        {/* Quick Action Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Card */}
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => onNavigate('calendar')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-muted rounded-2xl">
                  <Calendar className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Calendar</h3>
              <p className="text-muted-foreground">
                View and manage all your events in calendar view
              </p>
            </CardContent>
          </Card>

          {/* AI Assistant Card */}
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => onNavigate('ai-chat')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-muted rounded-2xl">
                  <Sparkles className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">
                Manage your schedule with AI-powered assistant
              </p>
            </CardContent>
          </Card>

          {/* Today's Schedule Card */}
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => onNavigate('today')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-muted rounded-2xl">
                  <CalendarCheck className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Today's Schedule</h3>
              <p className="text-muted-foreground">
                View your scheduled events for today
              </p>
            </CardContent>
          </Card>

          {/* Quick Add Card */}
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => onNavigate('quick-add')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-muted rounded-2xl">
                  <Plus className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Quick Add</h3>
              <p className="text-muted-foreground">
                Create a new event or reminder instantly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
