import { useState, useEffect, useMemo } from 'react';
import { useEvents } from '@/context/EventContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShimmeringText } from '@/components/ui/shimmering-text';
import { Search as SearchIcon, Calendar as CalendarIcon, Clock, MapPin, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SEARCH_PLACEHOLDERS = [
  "What's looking for?",
  "Search your events...",
  "Find meetings, appointments...",
  "What are you planning?",
  "Search by title, location...",
  "Looking for something?",
  "Find your schedule...",
];

export function Search() {
  const { events } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [aiSearch, setAiSearch] = useState(false);

  // Rotate placeholder every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    
    return events.filter(event => {
      // Text search
      const matchesText = 
        event.title.toLowerCase().includes(query) ||
        (event.description?.toLowerCase().includes(query)) ||
        (event.location?.toLowerCase().includes(query)) ||
        (event.tags?.some(tag => tag.toLowerCase().includes(query)));

      // Date filter
      const matchesDate = dateFilter
        ? format(new Date(event.start), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd')
        : true;

      return matchesText && matchesDate;
    });
  }, [searchQuery, events, dateFilter]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDateFilter(undefined);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start pt-20 sm:pt-32 px-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header with AI toggle */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Search</h1>
          <Button
            variant={aiSearch ? "default" : "ghost"}
            size="sm"
            onClick={() => setAiSearch(!aiSearch)}
            className="gap-2"
          >
            <Sparkles className={cn("h-4 w-4", aiSearch && "animate-pulse")} />
            AI Search {aiSearch ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="pl-12 pr-32 h-14 text-lg bg-muted/30 border-2 focus-visible:ring-2 focus-visible:ring-primary"
              placeholder=""
            />
            
            {/* Shimmering Placeholder */}
            {!searchQuery && !isFocused && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none">
                <ShimmeringText 
                  text={SEARCH_PLACEHOLDERS[placeholderIndex]}
                  className="text-lg text-muted-foreground/70"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant={dateFilter ? "default" : "ghost"} 
                    size="sm"
                    className="h-9"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                  {dateFilter && (
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateFilter(undefined)}
                        className="w-full"
                      >
                        Clear filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Clear Button */}
              {(searchQuery || dateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {dateFilter && (
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(dateFilter, 'PPP')}
                <button
                  onClick={() => setDateFilter(undefined)}
                  className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Results Panel - Glassmorphism */}
        {(isFocused || searchQuery) && (
          <Card className="bg-muted/40 backdrop-blur-xl border-muted shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {searchResults.length > 0 ? (
                <div className="divide-y">
                  {/* Results Header */}
                  <div className="p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Found {searchResults.length} event{searchResults.length !== 1 ? 's' : ''}
                      </h3>
                      {aiSearch && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Enhanced
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {searchResults.map((event, index) => (
                      <div
                        key={event.id}
                        className={cn(
                          "p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                          index !== 0 && "border-t border-border/50"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Color indicator */}
                          <div
                            className="w-1 h-16 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: event.categoryColor || event.color || '#6366f1' }}
                          />

                          {/* Event details */}
                          <div className="flex-1 space-y-2">
                            {/* Title */}
                            <h4 className="font-semibold text-base">
                              {event.title}
                            </h4>

                            {/* Date & Time */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4" />
                                {format(new Date(event.start), 'EEE, MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {event.allDay ? 'All day' : `${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end || event.start), 'HH:mm')}`}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {event.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Category badge */}
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery ? (
                <div className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No results found</h3>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    Try different keywords or adjust filters
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Start typing to search</h3>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    Search by title, location, description, or tags
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Search Info (when enabled) */}
        {aiSearch && !searchQuery && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">AI Search Active</h4>
                  <p className="text-sm text-muted-foreground">
                    Try natural language queries like "meetings next week" or "events with John"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
