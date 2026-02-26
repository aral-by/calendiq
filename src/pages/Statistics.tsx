import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import { useNotes } from '@/context/NoteContext';
import { Calendar, StickyNote, TrendingUp, Clock, Tag, Palette } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

export function Statistics() {
  const { events } = useEvents();
  const { notes } = useNotes();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: tr });
    const weekEnd = endOfWeek(now, { locale: tr });
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
      work: 'İş',
      personal: 'Kişisel',
      health: 'Sağlık',
      social: 'Sosyal',
      finance: 'Finans',
      education: 'Eğitim',
    };

    const sortedCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => ({
        category: categoryLabels[cat] || cat,
        count,
      }));

    // Note statistics
    const totalNotes = notes.length;
    const colorCount: Record<string, number> = {};
    notes.forEach(n => {
      colorCount[n.color] = (colorCount[n.color] || 0) + 1;
    });

    const colorLabels: Record<string, string> = {
      yellow: 'Sarı',
      pink: 'Pembe',
      blue: 'Mavi',
      green: 'Yeşil',
      purple: 'Mor',
      orange: 'Turuncu',
    };

    const sortedColors = Object.entries(colorCount)
      .sort(([, a], [, b]) => b - a)
      .map(([color, count]) => ({
        color: colorLabels[color] || color,
        colorKey: color,
        count,
      }));

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
      sortedCategories,
      totalNotes,
      sortedColors,
    };
  }, [events, notes]);

  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-300',
    pink: 'bg-pink-300',
    blue: 'bg-blue-300',
    green: 'bg-green-300',
    purple: 'bg-purple-300',
    orange: 'bg-orange-300',
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">İstatistikler</h1>
          <p className="text-muted-foreground">
            Etkinlik ve not kullanım istatistikleriniz
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Etkinlik</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.eventsThisWeek} bu hafta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.eventsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), 'MMMM', { locale: tr })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Sonraki 7 gün
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Not</CardTitle>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotes}</div>
              <p className="text-xs text-muted-foreground">
                Sticky notlar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori Dağılımı
              </CardTitle>
              <CardDescription>
                Etkinliklerinizin kategorilere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.sortedCategories.length > 0 ? (
                <div className="space-y-3">
                  {stats.sortedCategories.map(({ category, count }) => {
                    const percentage = stats.totalEvents > 0 
                      ? Math.round((count / stats.totalEvents) * 100) 
                      : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz kategori bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note Color Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Not Renk Dağılımı
              </CardTitle>
              <CardDescription>
                Notlarınızın renklere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.sortedColors.length > 0 ? (
                <div className="space-y-3">
                  {stats.sortedColors.map(({ color, colorKey, count }) => {
                    const percentage = stats.totalNotes > 0 
                      ? Math.round((count / stats.totalNotes) * 100) 
                      : 0;
                    return (
                      <div key={colorKey} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colorClasses[colorKey]}`} />
                            <span className="font-medium">{color}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${colorClasses[colorKey]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz not bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        {stats.totalEvents > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Özetler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="font-medium mb-1">En Çok Kullanılan Kategori</div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.sortedCategories[0]?.category || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.sortedCategories[0]?.count || 0} etkinlik
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="font-medium mb-1">Haftalık Ortalama</div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalEvents > 0 ? Math.round(stats.eventsThisWeek) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    etkinlik/hafta
                  </div>
                </div>

                {stats.totalNotes > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="font-medium mb-1">En Sevilen Not Rengi</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${colorClasses[stats.sortedColors[0]?.colorKey]}`} />
                      <div className="text-2xl font-bold text-primary">
                        {stats.sortedColors[0]?.color || '-'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.sortedColors[0]?.count || 0} not
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
