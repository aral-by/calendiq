import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import { useNotes } from '@/context/NoteContext';
import { Calendar, StickyNote, TrendingUp, Clock, BarChart3, Activity } from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval,
  subWeeks,
  subDays,
  startOfDay,
  endOfDay,
  getHours,
  getDay
} from 'date-fns';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function Statistics() {
  const { events } = useEvents();
  const { notes } = useNotes();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Event statistics
    const totalEvents = events.length;
    const eventsThisWeek = events.filter(e => 
      isWithinInterval(new Date(e.start), { start: weekStart, end: weekEnd })
    ).length;
    const eventsThisMonth = events.filter(e => 
      isWithinInterval(new Date(e.start), { start: monthStart, end: monthEnd })
    ).length;

    // Category distribution
    const categoryCount: Record<string, number> = {};
    events.forEach(e => {
      if (e.category) {
        categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
      }
    });

    const categoryLabels: Record<string, string> = {
      work: 'Work',
      personal: 'Personal',
      health: 'Health',
      social: 'Social',
      finance: 'Finance',
      education: 'Education',
    };

    const categoryColors: Record<string, string> = {
      work: 'hsl(var(--chart-1))',
      personal: 'hsl(var(--chart-2))',
      health: 'hsl(var(--chart-3))',
      social: 'hsl(var(--chart-4))',
      finance: 'hsl(var(--chart-5))',
      education: 'hsl(220, 70%, 50%)',
    };

    const categoryData = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => ({
        category: categoryLabels[cat] || cat,
        count: categoryCount[cat],
        fill: categoryColors[cat] || 'hsl(var(--chart-1))',
      }));

    // Weekly trend (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekDate = subWeeks(now, i);
      const ws = startOfWeek(weekDate);
      const we = endOfWeek(weekDate);
      const count = events.filter(e =>
        isWithinInterval(new Date(e.start), { start: ws, end: we })
      ).length;
      weeklyData.push({
        week: `Week ${4 - i}`,
        events: count,
      });
    }

    // Daily activity (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = subDays(now, i);
      const dayStart = startOfDay(dayDate);
      const dayEnd = endOfDay(dayDate);
      const count = events.filter(e =>
        isWithinInterval(new Date(e.start), { start: dayStart, end: dayEnd })
      ).length;
      dailyData.push({
        day: format(dayDate, 'EEE'),
        events: count,
      });
    }

    // Busiest hour
    const hourCounts: Record<number, number> = {};
    events.forEach(e => {
      const hour = getHours(new Date(e.start));
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const busiestHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Busiest day of week
    const dayCounts: Record<number, number> = {};
    events.forEach(e => {
      const day = getDay(new Date(e.start));
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const busiestDay = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Upcoming events (next 7 days)
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.start);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return eventDate >= now && eventDate <= sevenDaysFromNow;
    }).length;

    return {
      totalEvents,
      eventsThisWeek,
      eventsThisMonth,
      upcomingEvents,
      totalNotes: notes.length,
      categoryData,
      weeklyData,
      dailyData,
      busiestHour: busiestHour ? `${busiestHour}:00` : '-',
      busiestDay: busiestDay !== undefined ? dayNames[Number(busiestDay)] : '-',
      avgEventsPerWeek: totalEvents > 0 ? (totalEvents / 4).toFixed(1) : '0',
    };
  }, [events, notes]);

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Statistics</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Your event and productivity insights
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="text-xl md:text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">This Week</CardTitle>
              <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="text-xl md:text-2xl font-bold">{stats.eventsThisWeek}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {format(new Date(), 'MMM d')} - {format(endOfWeek(new Date()), 'MMM d')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="text-xl md:text-2xl font-bold">{stats.eventsThisMonth}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {format(new Date(), 'MMMM')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="text-xl md:text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Notes</CardTitle>
              <StickyNote className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="text-xl md:text-2xl font-bold">{stats.totalNotes}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Sticky notes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Events by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.categoryData.length > 0 ? (
                <ChartContainer
                  config={{
                    count: {
                      label: 'Events',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className="h-[200px] md:h-[300px]">
                
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="category" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[200px] md:h-[300px] flex items-center justify-center text-xs md:text-sm text-muted-foreground">
                  No events yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Weekly Trend
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Last 4 weeks activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  events: {
                    label: 'Events',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="week" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5" />
                Daily Activity
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  events: {
                    label: 'Events',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="events" 
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Quick Insights</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Your productivity patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                <div className="p-3 md:p-4 rounded-lg bg-muted/50">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                    Busiest Day
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {stats.busiestDay}
                  </div>
                </div>
                
                <div className="p-3 md:p-4 rounded-lg bg-muted/50">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                    Busiest Hour
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {stats.busiestHour}
                  </div>
                </div>

                <div className="p-3 md:p-4 rounded-lg bg-muted/50">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                    Average per Week
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {stats.avgEventsPerWeek}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    events/week
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
